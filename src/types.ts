export type Metric = 'cases' | 'deaths' | 'active';

export type ClassificationTier =
  | 'no_data'
  | 'low'
  | 'moderate'
  | 'high'
  | 'critical';

export type DateRangeDays = 30 | 90 | 365;

export type GlobalStats = {
  cases: number;
  deaths: number;
  recovered: number;
  active: number;
  todayCases: number;
  todayDeaths: number;
  updated: number;
};

export type CovidCountry = {
  country: string;
  iso2: string;
  continent: string;
  cases: number;
  deaths: number;
  recovered: number;
  active: number;
  casesPerOneMillion: number;
  deathsPerOneMillion: number;
  activePerOneMillion: number;
  population: number;
};

export type SelectedCountry = CovidCountry & {
  tier: ClassificationTier;
  adminName: string;
};

export type HistoricalTimeline = {
  cases: Record<string, number>;
  deaths: Record<string, number>;
  recovered: Record<string, number>;
};

export type TimelinePoint = {
  date: string;
  value: number;
};

export const TIER_LABELS: Record<ClassificationTier, string> = {
  no_data: 'No data',
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  critical: 'Critical',
};

export const TIER_COLORS: Record<ClassificationTier, string> = {
  no_data: '#e5e7eb',
  low: '#fef9c3',
  moderate: '#fdba74',
  high: '#f87171',
  critical: '#991b1b',
};

export const METRIC_LABELS: Record<Metric, string> = {
  cases: 'Cases',
  deaths: 'Deaths',
  active: 'Active',
};

export const DATE_RANGE_OPTIONS: { value: DateRangeDays; label: string }[] = [
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last year' },
];

export const CHART_TEAL = '#5b9aa8';
export const PIE_TEALS = ['#3d7a88', '#5b9aa8', '#8fbfc9'];
