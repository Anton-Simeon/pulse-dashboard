import { useEffect, useMemo, useState } from 'react';
import { channels, series, users as seedUsers, type Range, type Role, type User } from './data';
import { euro, kpis, num, pct } from './analytics';
import { KpiCard } from './components/KpiCard';
import { RevenueChart } from './components/RevenueChart';
import { ChannelBars } from './components/ChannelBars';
import { UsersTable } from './components/UsersTable';

interface Toast { msg: string; undo?: () => void }

export default function App() {
  const [range, setRange] = useState<Range>(30);
  const [role, setRole] = useState<Role>('Admin');
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  const [users, setUsers] = useState<User[]>(() => seedUsers());
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 4000); return () => clearTimeout(id); }, [toast]);

  const all = useMemo(() => series(90), []);
  const current = useMemo(() => series(range), [range]);
  const previous = useMemo(() => all.slice(Math.max(0, all.length - range * 2), all.length - range), [all, range]);
  const k = kpis(current, previous);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">◆ Pulse</div>
        <nav aria-label="Main">
          {['Overview', 'Customers', 'Orders', 'Products', 'Settings'].map((n, i) => (
            <a key={n} href="#" className={i === 0 ? 'active' : ''} aria-current={i === 0 ? 'page' : undefined}>{n}</a>
          ))}
        </nav>
        <p className="sidebar__note">Demo data · no backend</p>
      </aside>

      <main className="main">
        <header className="toolbar">
          <div>
            <h1>Overview</h1>
            <p className="muted">Shop performance for the last {range} days</p>
          </div>
          <div className="toolbar__controls">
            <div className="segmented" role="group" aria-label="Date range">
              {([7, 30, 90] as Range[]).map((r) => (
                <button key={r} aria-pressed={range === r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}d</button>
              ))}
            </div>
            <label className="role">
              <span className="muted">View as</span>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option>Admin</option><option>Editor</option><option>Viewer</option>
              </select>
            </label>
            <button className="btn" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? '☀︎' : '☾'}</button>
          </div>
        </header>

        <section className="kpis">
          <KpiCard label="Revenue" value={euro(k.revenue.value)} change={k.revenue.change} trend={current.map((d) => d.revenue)} />
          <KpiCard label="Orders" value={num(k.orders.value)} change={k.orders.change} trend={current.map((d) => d.orders)} />
          <KpiCard label="Conversion rate" value={pct(k.conversion.value, 2)} change={k.conversion.change} trend={current.map((d) => d.orders / d.visitors)} />
          <KpiCard label="Avg. order value" value={euro(k.aov.value)} change={k.aov.change} trend={current.map((d) => d.revenue / d.orders)} />
        </section>

        <div className="row">
          <RevenueChart data={current} />
          <ChannelBars data={channels(range)} />
        </div>

        {role !== 'Admin' && <p className="notice">You are viewing as <strong>{role}</strong> – editing actions are hidden.</p>}
        <UsersTable users={users} viewerRole={role} onChange={setUsers} notify={(msg, undo) => setToast({ msg, undo })} />
      </main>

      {toast && (
        <div className="toast" role="status">
          {toast.msg}
          {toast.undo && <button className="link" onClick={() => { toast.undo!(); setToast(null); }}>Undo</button>}
        </div>
      )}
    </div>
  );
}
