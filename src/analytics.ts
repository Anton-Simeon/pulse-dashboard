import type { DayPoint, Status, User } from './data';

export function kpis(current: DayPoint[], previous: DayPoint[]) {
  const sum = (a: DayPoint[], k: keyof Omit<DayPoint, 'date'>) => a.reduce((s, p) => s + p[k], 0);
  const make = (now: number, before: number) => ({ value: now, change: before ? (now - before) / before : 0 });
  const conv = (a: DayPoint[]) => (sum(a, 'visitors') ? sum(a, 'orders') / sum(a, 'visitors') : 0);
  const aov = (a: DayPoint[]) => (sum(a, 'orders') ? sum(a, 'revenue') / sum(a, 'orders') : 0);
  return {
    revenue: make(sum(current, 'revenue'), sum(previous, 'revenue')),
    orders: make(sum(current, 'orders'), sum(previous, 'orders')),
    conversion: make(conv(current), conv(previous)),
    aov: make(aov(current), aov(previous)),
  };
}

export type SortKey = 'name' | 'role' | 'status' | 'spend' | 'lastSeen';
export interface TableState { query: string; status: Status | 'all'; sort: SortKey; dir: 'asc' | 'desc'; page: number; pageSize: number }

export function queryUsers(list: User[], s: TableState) {
  const q = s.query.trim().toLowerCase();
  const filtered = list.filter((u) => (s.status === 'all' || u.status === s.status) && (!q || u.name.toLowerCase().includes(q) || u.email.includes(q)));
  const sorted = [...filtered].sort((a, b) => {
    const av = a[s.sort]; const bv = b[s.sort];
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return s.dir === 'asc' ? cmp : -cmp;
  });
  const pages = Math.max(1, Math.ceil(sorted.length / s.pageSize));
  const page = Math.min(s.page, pages);
  return { rows: sorted.slice((page - 1) * s.pageSize, page * s.pageSize), total: sorted.length, pages, page };
}

/** Build an SVG path for a line chart. */
export function linePath(values: number[], width: number, height: number, pad = 4) {
  if (values.length === 0) return '';
  const max = Math.max(...values); const min = Math.min(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  return values
    .map((v, i) => `${i ? 'L' : 'M'}${(pad + i * step).toFixed(1)},${(height - pad - ((v - min) / span) * (height - pad * 2)).toFixed(1)}`)
    .join(' ');
}

export const euro = (v: number) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
export const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)} %`;
export const num = (v: number) => new Intl.NumberFormat('de-AT').format(v);
