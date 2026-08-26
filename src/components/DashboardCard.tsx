import type { ReactNode } from 'react';

type DashboardCardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  flush?: boolean;
};

export function DashboardCard({
  title,
  children,
  className = '',
  flush = false,
}: DashboardCardProps) {
  return (
    <section className={`card ${flush ? 'card-flush' : ''} ${className}`.trim()}>
      {title ? <h3 className="card-title">{title}</h3> : null}
      <div className="card-body">{children}</div>
    </section>
  );
}
