import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_TEAL, METRIC_LABELS, type CovidCountry, type Metric } from '../types';
import { getMetricValue } from '../utils/classify';
import { compactFmt, numberFmt } from '../utils/format';

type TopCountriesBarChartProps = {
  countries: CovidCountry[];
  metric: Metric;
};

export function TopCountriesBarChart({
  countries,
  metric,
}: TopCountriesBarChartProps) {
  const data = [...countries]
    .sort((a, b) => getMetricValue(b, metric) - getMetricValue(a, metric))
    .slice(0, 10)
    .map((country) => ({
      name:
        country.country.length > 16
          ? `${country.country.slice(0, 14)}…`
          : country.country,
      fullName: country.country,
      value: getMetricValue(country, metric),
    }));

  if (data.length === 0) {
    return <p className="chart-placeholder">No country data</p>;
  }

  return (
    <div className="chart-fill">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 48, left: 4, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => compactFmt.format(Number(value))}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={108}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value) => numberFmt.format(Number(value))}
            labelFormatter={(_, payload) =>
              String(payload?.[0]?.payload?.fullName ?? '')
            }
          />
          <Bar dataKey="value" name={METRIC_LABELS[metric]} fill={CHART_TEAL} radius={[0, 2, 2, 0]}>
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value) => compactFmt.format(Number(value))}
              style={{ fontSize: 11, fill: '#475569' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
