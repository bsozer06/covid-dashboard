import type {
  ClassificationTier,
  CovidCountry,
  GlobalStats,
  Metric,
} from '../types';
import { classifyCountry, getMetricValue } from './classify';

export function continentOf(country: CovidCountry): string {
  return country.continent || 'Other';
}

export function uniqueContinents(countries: CovidCountry[]): string[] {
  return [...new Set(countries.map(continentOf))].sort();
}

export function applyFilters(
  countries: CovidCountry[],
  metric: Metric,
  continents: string[],
  tier: ClassificationTier | 'all',
): CovidCountry[] {
  return countries.filter((country) => {
    if (!continents.includes(continentOf(country))) {
      return false;
    }
    if (tier !== 'all' && classifyCountry(country, metric) !== tier) {
      return false;
    }
    return true;
  });
}

export function sumMetric(countries: CovidCountry[], metric: Metric): number {
  return countries.reduce((sum, country) => sum + getMetricValue(country, metric), 0);
}

export function aggregateStats(countries: CovidCountry[]): Pick<
  GlobalStats,
  'cases' | 'deaths' | 'recovered' | 'active'
> {
  return countries.reduce(
    (acc, country) => {
      acc.cases += country.cases;
      acc.deaths += country.deaths;
      acc.recovered += country.recovered;
      acc.active += country.active;
      return acc;
    },
    { cases: 0, deaths: 0, recovered: 0, active: 0 },
  );
}

export function groupByContinent(
  countries: CovidCountry[],
  metric: Metric,
): { name: string; value: number }[] {
  const totals = new Map<string, number>();
  for (const country of countries) {
    const name = continentOf(country);
    totals.set(name, (totals.get(name) ?? 0) + getMetricValue(country, metric));
  }
  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
