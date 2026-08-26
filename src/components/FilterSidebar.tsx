import type { ClassificationTier, Metric } from '../types';
import { METRIC_LABELS, TIER_LABELS } from '../types';

const TIERS: ClassificationTier[] = [
  'low',
  'moderate',
  'high',
  'critical',
];

type FilterSidebarProps = {
  continents: string[];
  selectedContinents: string[];
  onContinentsChange: (continents: string[]) => void;
  metric: Metric;
  onMetricChange: (metric: Metric) => void;
  tier: ClassificationTier | 'all';
  onTierChange: (tier: ClassificationTier | 'all') => void;
  continentQuery: string;
  onContinentQueryChange: (query: string) => void;
  onRefresh: () => void;
  loading: boolean;
};

export function FilterSidebar({
  continents,
  selectedContinents,
  onContinentsChange,
  metric,
  onMetricChange,
  tier,
  onTierChange,
  continentQuery,
  onContinentQueryChange,
  onRefresh,
  loading,
}: FilterSidebarProps) {
  const query = continentQuery.trim().toLowerCase();
  const visibleContinents = continents.filter((name) =>
    name.toLowerCase().includes(query),
  );
  const allSelected =
    continents.length > 0 && selectedContinents.length === continents.length;

  function toggleContinent(name: string) {
    if (selectedContinents.includes(name)) {
      onContinentsChange(selectedContinents.filter((item) => item !== name));
    } else {
      onContinentsChange([...selectedContinents, name]);
    }
  }

  return (
    <aside className="filters">
      <div className="filters-body">
      <h2>Filters</h2>

      <div className="filter-section">
        <p className="filter-label">Continent</p>
        <label className="filter-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder="Filter"
            value={continentQuery}
            onChange={(event) => onContinentQueryChange(event.target.value)}
          />
        </label>
        <ul className="filter-list">
          {visibleContinents.map((name) => (
            <li key={name}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedContinents.includes(name)}
                  onChange={() => toggleContinent(name)}
                />
                <span>{name}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="filter-actions">
          <button type="button" onClick={() => onContinentsChange([])}>
            Reset
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => onContinentsChange(continents)}
          >
            Select all
          </button>
        </div>
      </div>

      <label className="filter-dropdown">
        <span>Metric</span>
        <select
          value={metric}
          onChange={(event) => onMetricChange(event.target.value as Metric)}
        >
          {Object.entries(METRIC_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-dropdown">
        <span>Risk tier</span>
        <select
          value={tier}
          onChange={(event) =>
            onTierChange(event.target.value as ClassificationTier | 'all')
          }
        >
          <option value="all">All</option>
          {TIERS.map((item) => (
            <option key={item} value={item}>
              {TIER_LABELS[item]}
            </option>
          ))}
        </select>
      </label>

      <p className="filter-status">
        {allSelected ? 'All continents' : `${selectedContinents.length} selected`}
      </p>
      </div>

      <button
        type="button"
        className="refresh-btn"
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? 'Refreshing…' : 'Refresh data'}
      </button>
    </aside>
  );
}
