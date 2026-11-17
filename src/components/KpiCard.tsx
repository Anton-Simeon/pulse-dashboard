import { linePath } from '../analytics';

interface Props { label: string; value: string; change: number; trend: number[] }

export function KpiCard({ label, value, change, trend }: Props) {
  const up = change >= 0;
  return (
    <article className="kpi">
      <p className="kpi__label">{label}</p>
      <p className="kpi__value">{value}</p>
      <p className={`kpi__change ${up ? 'up' : 'down'}`}>
        {up ? '▲' : '▼'} {Math.abs(change * 100).toFixed(1)} % <span className="muted">vs. previous period</span>
      </p>
      <svg className="spark" viewBox="0 0 120 32" aria-hidden>
        <path d={linePath(trend, 120, 32)} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </article>
  );
}
