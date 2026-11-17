import type { Channel } from '../data';
import { num } from '../analytics';

export function ChannelBars({ data }: { data: Record<Channel, number> }) {
  const entries = Object.entries(data) as [Channel, number][];
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const max = Math.max(...entries.map(([, v]) => v));
  return (
    <section className="panel">
      <header className="panel__head"><h2>Orders by channel</h2><span className="muted">{num(total)} orders</span></header>
      <ul className="bars">
        {entries.map(([name, v]) => (
          <li key={name}>
            <span className="bars__label">{name}</span>
            <span className="bars__track"><span className="bars__fill" style={{ width: `${(v / max) * 100}%` }} /></span>
            <span className="bars__value">{((v / total) * 100).toFixed(0)} %</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
