import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PIE_TEALS } from '../types';
import { numberFmt } from '../utils/format';

type CaseloadPieChartProps = {
  active: number;
  recovered: number;
  deaths: number;
};

export function CaseloadPieChart({
  active,
  recovered,
  deaths,
}: CaseloadPieChartProps) {
  const data = [
    { name: 'Active', value: active },
    { name: 'Recovered', value: recovered },
    { name: 'Deaths', value: deaths },
  ].filter((item) => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return <p className="chart-placeholder">No caseload data</p>;
  }

  return (
    <div className="pie-layout">
      <div className="pie-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
            >
              {data.map((_, index) => (
                <Cell key={data[index].name} fill={PIE_TEALS[index % PIE_TEALS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => numberFmt.format(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="pie-legend">
        {data.map((item, index) => (
          <li key={item.name}>
            <span
              className="pie-swatch"
              style={{ backgroundColor: PIE_TEALS[index % PIE_TEALS.length] }}
            />
            <span>{item.name}</span>
            <strong>{Math.round((item.value / total) * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
