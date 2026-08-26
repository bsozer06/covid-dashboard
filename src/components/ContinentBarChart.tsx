import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_TEAL, METRIC_LABELS, type Metric } from '../types';
import { compactFmt, numberFmt } from '../utils/format';

const SHORT_NAMES: Record<string, string> = {
  'North America': 'N. America',
  'South America': 'S. America',
  'Australia-Oceania': 'Oceania',
};

type ContinentBarChartProps = {
  data: { name: string; value: number }[];
  metric: Metric;
};

export function ContinentBarChart({ data, metric }: ContinentBarChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: SHORT_NAMES[item.name] ?? item.name,
  }));

  return (
    <div className="chart-fill">
      {chartData.length === 0 ? (
        <p className="chart-placeholder">No continent data</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
            <YAxis
              width={36}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => compactFmt.format(Number(value))}
            />
            <Tooltip
              formatter={(value) => numberFmt.format(Number(value))}
              labelFormatter={(_, payload) =>
                String(payload?.[0]?.payload?.name ?? '')
              }
            />
            <Bar dataKey="value" name={METRIC_LABELS[metric]} fill={CHART_TEAL} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
