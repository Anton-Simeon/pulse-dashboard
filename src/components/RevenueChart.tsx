import { useState } from 'react';
import type { DayPoint } from '../data';
import { euro, linePath, num } from '../analytics';

const W = 760, H = 240, PAD = 8;

export function RevenueChart({ data }: { data: DayPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const values = data.map((d) => d.revenue);
  const path = linePath(values, W, H, PAD);
  const max = Math.max(...values), min = Math.min(...values), span = max - min || 1;
  const step = (W - PAD * 2) / Math.max(1, data.length - 1);
  const x = (i: number) => PAD + i * step;
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const p = hover !== null ? data[hover] : null;

  return (
    <section className="panel">
      <header className="panel__head">
        <h2>Revenue</h2>
        <span className="muted">{euro(values.reduce((a, b) => a + b, 0))} total</span>
      </header>
      <div className="chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue per day"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const rel = ((e.clientX - rect.left) / rect.width) * W;
            setHover(Math.max(0, Math.min(data.length - 1, Math.round((rel - PAD) / step))));
          }}>
          <defs>
            <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity=".28" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} className="gridline" />)}
          <path d={`${path} L${x(data.length - 1)},${H} L${x(0)},${H} Z`} fill="url(#area)" />
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
          {p && hover !== null && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} className="cursor" />
              <circle cx={x(hover)} cy={y(p.revenue)} r="5" fill="var(--accent)" />
            </>
          )}
        </svg>
        {p && hover !== null && (
          <div className="tooltip" style={{ left: `${(x(hover) / W) * 100}%` }}>
            <strong>{p.date}</strong>
            <span>{euro(p.revenue)}</span>
            <span className="muted">{num(p.orders)} orders · {num(p.visitors)} visitors</span>
          </div>
        )}
      </div>
    </section>
  );
}
