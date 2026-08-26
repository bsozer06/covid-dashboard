import type { CovidCountry, GlobalStats, HistoricalTimeline } from '../types';

const BASE = 'https://disease.sh/v3/covid-19';

type ApiCountry = {
  country: string;
  continent?: string;
  cases: number;
  deaths: number;
  recovered: number;
  active: number;
  casesPerOneMillion: number;
  deathsPerOneMillion: number;
  population: number;
  countryInfo: {
    iso2: string;
  };
};

function normalizeCountry(raw: ApiCountry): CovidCountry | null {
  const iso2 = raw.countryInfo?.iso2;
  if (!iso2) return null;

  const population = raw.population || 1;
  const activePerOneMillion = (raw.active / population) * 1_000_000;

  return {
    country: raw.country,
    iso2: iso2.toUpperCase(),
    continent: raw.continent || 'Other',
    cases: raw.cases,
    deaths: raw.deaths,
    recovered: raw.recovered,
    active: raw.active,
    casesPerOneMillion: raw.casesPerOneMillion,
    deathsPerOneMillion: raw.deathsPerOneMillion,
    activePerOneMillion,
    population,
  };
}

export async function fetchGlobalStats(): Promise<GlobalStats> {
  const res = await fetch(`${BASE}/all`);
  if (!res.ok) throw new Error('Failed to fetch global COVID stats');
  const data = await res.json();
  return {
    cases: data.cases,
    deaths: data.deaths,
    recovered: data.recovered,
    active: data.active,
    todayCases: data.todayCases,
    todayDeaths: data.todayDeaths,
    updated: data.updated,
  };
}

export async function fetchCountries(): Promise<CovidCountry[]> {
  const res = await fetch(`${BASE}/countries`);
  if (!res.ok) throw new Error('Failed to fetch country COVID stats');
  const data: ApiCountry[] = await res.json();
  return data
    .map(normalizeCountry)
    .filter((c): c is CovidCountry => c !== null);
}

export async function fetchHistoricalGlobal(
  lastdays: number,
): Promise<HistoricalTimeline> {
  const res = await fetch(`${BASE}/historical/all?lastdays=${lastdays}`);
  if (!res.ok) throw new Error('Failed to fetch historical COVID stats');
  return res.json() as Promise<HistoricalTimeline>;
}

export async function fetchHistoricalCountry(
  country: string,
  lastdays: number,
): Promise<HistoricalTimeline> {
  const res = await fetch(
    `${BASE}/historical/${encodeURIComponent(country)}?lastdays=${lastdays}`,
  );
  if (!res.ok) throw new Error('Failed to fetch country historical stats');
  const data = await res.json();
  return data.timeline as HistoricalTimeline;
}

export const COUNTRIES_GEOJSON_URL =
  'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
