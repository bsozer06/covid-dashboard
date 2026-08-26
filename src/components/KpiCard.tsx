import { numberFmt } from '../utils/format';

type KpiCardProps = {
  label: string;
  value: number;
  loading: boolean;
};

export function KpiCard({ label, value, loading }: KpiCardProps) {
  return (
    <section className="card kpi-card">
      <h3 className="card-title">{label}</h3>
      <p className="kpi-value">{loading ? '—' : numberFmt.format(value)}</p>
    </section>
  );
}
