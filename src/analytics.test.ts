import { describe, expect, it } from 'vitest';
import { series, users } from './data';
import { kpis, linePath, queryUsers } from './analytics';

describe('data', () => {
  it('is deterministic and returns the requested range', () => {
    expect(series(30)).toEqual(series(30));
    expect(series(7).length).toBe(7);
    expect(series(90).length).toBe(90);
  });
});

describe('kpis', () => {
  it('calculates totals and relative change', () => {
    const now = [{ date: 'a', revenue: 200, orders: 4, visitors: 100 }];
    const before = [{ date: 'b', revenue: 100, orders: 2, visitors: 100 }];
    const k = kpis(now, before);
    expect(k.revenue).toEqual({ value: 200, change: 1 });
    expect(k.conversion.value).toBe(0.04);
    expect(k.aov.value).toBe(50);
  });
});

describe('queryUsers', () => {
  const list = users();
  it('filters, sorts and paginates', () => {
    const res = queryUsers(list, { query: '', status: 'active', sort: 'spend', dir: 'desc', page: 1, pageSize: 10 });
    expect(res.rows.length).toBeLessThanOrEqual(10);
    expect(res.rows.every((u) => u.status === 'active')).toBe(true);
    const spends = res.rows.map((u) => u.spend);
    expect(spends).toEqual([...spends].sort((a, b) => b - a));
  });
  it('clamps the page number to the last page', () => {
    const res = queryUsers(list, { query: '', status: 'all', sort: 'name', dir: 'asc', page: 999, pageSize: 10 });
    expect(res.page).toBe(res.pages);
  });
});

describe('linePath', () => {
  it('draws a path through every point', () => {
    expect(linePath([1, 2, 3], 100, 50).split(' ').length).toBe(3);
    expect(linePath([], 100, 50)).toBe('');
  });
});
