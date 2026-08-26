import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import type {
  ClassificationTier,
  CovidCountry,
  Metric,
  SelectedCountry,
} from '../types';

const ISO_ALIASES: Record<string, string> = {
  UK: 'GB',
};

type CountryGeometry = Polygon | MultiPolygon;

export type ClassifiedProperties = {
  tier: ClassificationTier;
  iso2: string;
  adminName: string;
  countryName: string;
  cases: number;
  deaths: number;
  recovered: number;
  active: number;
};

const THRESHOLDS: Record<
  Metric,
  { low: number; moderate: number; high: number }
> = {
  cases: { low: 1000, moderate: 10000, high: 50000 },
  deaths: { low: 10, moderate: 100, high: 500 },
  active: { low: 1000, moderate: 10000, high: 50000 },
};

function perMillion(country: CovidCountry, metric: Metric): number {
  if (metric === 'cases') return country.casesPerOneMillion;
  if (metric === 'deaths') return country.deathsPerOneMillion;
  return country.activePerOneMillion;
}

export function classifyCountry(
  country: CovidCountry | null,
  metric: Metric,
): ClassificationTier {
  if (!country) return 'no_data';

  const value = perMillion(country, metric);
  const { low, moderate, high } = THRESHOLDS[metric];

  if (value < low) return 'low';
  if (value < moderate) return 'moderate';
  if (value < high) return 'high';
  return 'critical';
}

function normalizeIso(iso: string | undefined): string {
  if (!iso) return '';
  const upper = iso.toUpperCase();
  return ISO_ALIASES[upper] ?? upper;
}

export function buildCountryLookup(
  countries: CovidCountry[],
): Map<string, CovidCountry> {
  const lookup = new Map<string, CovidCountry>();
  for (const country of countries) {
    lookup.set(country.iso2, country);
  }
  return lookup;
}

export function mergeAndClassify(
  geojson: FeatureCollection<CountryGeometry>,
  countries: CovidCountry[],
  metric: Metric,
): FeatureCollection<CountryGeometry, ClassifiedProperties> {
  const lookup = buildCountryLookup(countries);

  return {
    type: 'FeatureCollection',
    features: geojson.features.map((feature) => {
      const iso2 = normalizeIso(
        (feature.properties?.['ISO3166-1-Alpha-2'] ??
          feature.properties?.ISO_A2_EH) as string | undefined,
      );
      const adminName =
        (feature.properties?.name as string) ??
        (feature.properties?.ADMIN as string) ??
        iso2;
      const match = lookup.get(iso2) ?? null;
      const tier = classifyCountry(match, metric);

      return {
        ...feature,
        properties: {
          tier,
          iso2,
          adminName,
          countryName: match?.country ?? adminName,
          cases: match?.cases ?? 0,
          deaths: match?.deaths ?? 0,
          recovered: match?.recovered ?? 0,
          active: match?.active ?? 0,
        },
      };
    }),
  };
}

export function countTiers(
  geojson: FeatureCollection<CountryGeometry, ClassifiedProperties>,
): Record<ClassificationTier, number> {
  const counts: Record<ClassificationTier, number> = {
    no_data: 0,
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0,
  };

  for (const feature of geojson.features) {
    counts[feature.properties.tier] += 1;
  }

  return counts;
}

export function toSelectedCountry(
  props: ClassifiedProperties,
  metric: Metric,
  lookup: Map<string, CovidCountry>,
): SelectedCountry | null {
  const match = lookup.get(props.iso2);
  if (!match) return null;

  return {
    ...match,
    tier: classifyCountry(match, metric),
    adminName: props.adminName,
  };
}

export function getMetricValue(country: CovidCountry, metric: Metric): number {
  if (metric === 'cases') return country.cases;
  if (metric === 'deaths') return country.deaths;
  return country.active;
}
