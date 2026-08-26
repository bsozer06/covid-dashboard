import type { ClassificationTier } from '../types';
import { TIER_COLORS, TIER_LABELS } from '../types';

const TIERS: ClassificationTier[] = [
  'critical',
  'high',
  'moderate',
  'low',
  'no_data',
];

type MapLegendProps = {
  counts: Record<ClassificationTier, number>;
};

export function MapLegend({ counts }: MapLegendProps) {
  return (
    <div className="map-legend">
      <h4>Classification</h4>
      <ul>
        {TIERS.map((tier) => (
          <li key={tier}>
            <span
              className="swatch"
              style={{ backgroundColor: TIER_COLORS[tier] }}
            />
            <span className="label">{TIER_LABELS[tier]}</span>
            <span className="count">{counts[tier]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
