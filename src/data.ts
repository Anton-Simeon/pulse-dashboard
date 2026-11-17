export type Range = 7 | 30 | 90;
export type Channel = 'Organic' | 'Paid' | 'Referral' | 'Email';
export type Status = 'active' | 'invited' | 'suspended';
export type Role = 'Admin' | 'Editor' | 'Viewer';

export interface DayPoint { date: string; revenue: number; orders: number; visitors: number }
export interface User { id: number; name: string; email: string; role: Role; status: Status; country: string; spend: number; lastSeen: string }

/** Small deterministic PRNG so the demo looks the same on every load and in tests. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const TODAY = new Date('2026-11-17T00:00:00Z');

export function series(days: Range): DayPoint[] {
  const r = rng(42);
  const all: DayPoint[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(TODAY); d.setUTCDate(d.getUTCDate() - i);
    const weekday = d.getUTCDay();
    const trend = 1 + (89 - i) * 0.006;
    const weekend = weekday === 0 || weekday === 6 ? 0.78 : 1;
    const visitors = Math.round((1800 + r() * 600) * trend * weekend);
    const orders = Math.round(visitors * (0.028 + r() * 0.01));
    all.push({ date: d.toISOString().slice(0, 10), visitors, orders, revenue: Math.round(orders * (58 + r() * 24)) });
  }
  return all.slice(-days);
}

export function channels(days: Range): Record<Channel, number> {
  const r = rng(days);
  const base = series(days).reduce((s, p) => s + p.orders, 0);
  const w = [0.42 + r() * 0.05, 0.27 + r() * 0.04, 0.16 + r() * 0.03];
  const organic = Math.round(base * w[0]); const paid = Math.round(base * w[1]); const referral = Math.round(base * w[2]);
  return { Organic: organic, Paid: paid, Referral: referral, Email: base - organic - paid - referral };
}

const first = ['Anna', 'Lukas', 'Sofia', 'Jonas', 'Mia', 'Felix', 'Lea', 'Paul', 'Emma', 'Noah', 'Lena', 'Elias', 'Marie', 'David', 'Clara', 'Max', 'Nina', 'Tom', 'Sara', 'Jan'];
const last = ['Gruber', 'Huber', 'Bauer', 'Wagner', 'Müller', 'Pichler', 'Steiner', 'Moser', 'Mayer', 'Hofer', 'Leitner', 'Berger'];
const countries = ['AT', 'DE', 'CH', 'NL', 'IT'];
const roles: Role[] = ['Admin', 'Editor', 'Viewer', 'Viewer', 'Editor'];
const statuses: Status[] = ['active', 'active', 'active', 'invited', 'suspended'];

export function users(count = 57): User[] {
  const r = rng(7);
  return Array.from({ length: count }, (_, i) => {
    const fn = first[Math.floor(r() * first.length)]; const ln = last[Math.floor(r() * last.length)];
    const d = new Date(TODAY); d.setUTCDate(d.getUTCDate() - Math.floor(r() * 40));
    return {
      id: i + 1, name: `${fn} ${ln}`, email: `${fn}.${ln}${i}@example.com`.toLowerCase().replace('ü', 'ue'),
      role: roles[Math.floor(r() * roles.length)], status: statuses[Math.floor(r() * statuses.length)],
      country: countries[Math.floor(r() * countries.length)], spend: Math.round(r() * 4800), lastSeen: d.toISOString().slice(0, 10),
    };
  });
}
