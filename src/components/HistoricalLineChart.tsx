import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_TEAL, type TimelinePoint } from '../types';
import { compactFmt, formatAxisDate, numberFmt } from '../utils/format';

type HistoricalLineChartProps = {
  data: TimelinePoint[];
  loading: boolean;
};

export function HistoricalLineChart({ data, loading }: HistoricalLineChartProps) {
  if (loading) {
    return (
      <div className="chart-fill">
        <p className="chart-placeholder">Loading timeline…</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="chart-fill">
        <p className="chart-placeholder">No historical data</p>
      </div>
    );
  }

  return (
    <div className="chart-fill">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#edf1f3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={formatAxisDate}
            minTickGap={28}
          />
          <YAxis
            width={40}
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => compactFmt.format(Number(value))}
          />
          <Tooltip
            formatter={(value) => numberFmt.format(Number(value))}
            labelFormatter={(label) => formatAxisDate(String(label))}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={CHART_TEAL}
            strokeWidth={2}
            dot={{ r: 2, fill: CHART_TEAL }}
            name="Total"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
