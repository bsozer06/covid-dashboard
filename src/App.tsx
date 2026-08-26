import { useMemo, useState } from 'react';
import { CaseloadPieChart } from './components/CaseloadPieChart';
import { ContinentBarChart } from './components/ContinentBarChart';
import { DailyNewCasesChart } from './components/DailyNewCasesChart';
import { DashboardCard } from './components/DashboardCard';
import { FilterSidebar } from './components/FilterSidebar';
import { HistoricalLineChart } from './components/HistoricalLineChart';
import { KpiCard } from './components/KpiCard';
import { TopCountriesBarChart } from './components/TopCountriesBarChart';
import { useCovidData } from './hooks/useCovidData';
import { useHistorical } from './hooks/useHistorical';
import { MapView } from './map/MapView';
import type {
  ClassificationTier,
  DateRangeDays,
  Metric,
  SelectedCountry,
} from './types';
import { DATE_RANGE_OPTIONS, METRIC_LABELS } from './types';
import {
  aggregateStats,
  applyFilters,
  groupByContinent,
  sumMetric,
  uniqueContinents,
} from './utils/filters';
import { pickTimeline, timelineToSeries, toDailyNew } from './utils/timeline';

function App() {
  const { global, countries, loading, error, refresh } = useCovidData();
  const [metric, setMetric] = useState<Metric>('cases');
  const [selected, setSelected] = useState<SelectedCountry | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeDays>(30);
  const [tier, setTier] = useState<ClassificationTier | 'all'>('all');
  const [continentSelection, setContinentSelection] = useState<string[] | null>(
    null,
  );
  const [continentQuery, setContinentQuery] = useState('');

  const continents = useMemo(() => uniqueContinents(countries), [countries]);
  const selectedContinents = continentSelection ?? continents;

  const { timeline, scopeLabel, loading: historyLoading } = useHistorical(
    dateRange,
    selected?.country ?? null,
  );

  const filtered = useMemo(
    () => applyFilters(countries, metric, selectedContinents, tier),
    [countries, metric, selectedContinents, tier],
  );

  const unfiltered =
    selectedContinents.length === continents.length &&
    continents.length > 0 &&
    tier === 'all';

  const kpiValue = unfiltered && global
    ? metric === 'deaths'
      ? global.deaths
      : metric === 'active'
        ? global.active
        : global.cases
    : sumMetric(filtered, metric);

  const pieStats = selected
    ? selected
    : unfiltered && global
      ? global
      : aggregateStats(filtered);

  const continentData = useMemo(
    () => groupByContinent(filtered, metric),
    [filtered, metric],
  );

  const visibleIso2 = useMemo(
    () => (unfiltered ? null : filtered.map((country) => country.iso2)),
    [filtered, unfiltered],
  );

  const series = useMemo(() => {
    if (!timeline) return [];
    return timelineToSeries(pickTimeline(timeline, metric));
  }, [timeline, metric]);

  const dailySeries = useMemo(() => toDailyNew(series), [series]);

  const pieTitle = selected ? `${selected.country} caseload` : 'Caseload';
  const dailyName = metric === 'deaths' ? 'Daily new deaths' : 'Daily new cases';
  const trendTitle =
    metric === 'deaths' ? 'Deaths over time' : 'Cases over time';

  return (
    <div className="dashboard">
      <header className="header">
        <h1>COVID-19 Dashboard</h1>
        <label className="date-range">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          <span>Date Range</span>
          <select
            value={dateRange}
            onChange={(event) =>
              setDateRange(Number(event.target.value) as DateRangeDays)
            }
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="body">
        <FilterSidebar
          continents={continents}
          selectedContinents={selectedContinents}
          onContinentsChange={setContinentSelection}
          metric={metric}
          onMetricChange={setMetric}
          tier={tier}
          onTierChange={setTier}
          continentQuery={continentQuery}
          onContinentQueryChange={setContinentQuery}
          onRefresh={refresh}
          loading={loading}
        />

        <main className="main-grid">
          {error ? <p className="error banner">{error}</p> : null}

          <div className="col col-left">
            <KpiCard
              label={METRIC_LABELS[metric]}
              value={kpiValue}
              loading={loading}
            />
            <DashboardCard title={`${METRIC_LABELS[metric]} by continent`} className="card-chart">
              <ContinentBarChart data={continentData} metric={metric} />
            </DashboardCard>
            <DashboardCard
              title={trendTitle}
              className="card-chart"
            >
              <HistoricalLineChart data={series} loading={historyLoading} />
              <p className="chart-caption">{scopeLabel}</p>
            </DashboardCard>
          </div>

          <div className="col col-center">
            <section className="card card-flush card-map">
              <MapView
                countries={countries}
                metric={metric}
                selected={selected}
                onSelect={setSelected}
                visibleIso2={visibleIso2}
              />
            </section>
            <DashboardCard title={dailyName} className="card-chart card-daily">
              <DailyNewCasesChart
                data={dailySeries}
                loading={historyLoading}
                seriesName={dailyName}
              />
              <p className="chart-caption">{scopeLabel}</p>
            </DashboardCard>
          </div>

          <div className="col col-right">
            <DashboardCard title={pieTitle} className="card-pie">
              <CaseloadPieChart
                active={pieStats.active}
                recovered={pieStats.recovered}
                deaths={pieStats.deaths}
              />
            </DashboardCard>
            <DashboardCard
              title={`Top 10 countries — ${METRIC_LABELS[metric]}`}
              className="card-chart card-top"
            >
              <TopCountriesBarChart countries={filtered} metric={metric} />
            </DashboardCard>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
