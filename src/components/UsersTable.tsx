import { useMemo, useState } from 'react';
import type { Role, Status, User } from '../data';
import { euro, queryUsers, type SortKey, type TableState } from '../analytics';

interface Props { users: User[]; viewerRole: Role; onChange: (u: User[]) => void; notify: (msg: string, undo?: () => void) => void }

const columns: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'User' }, { key: 'role', label: 'Role' }, { key: 'status', label: 'Status' },
  { key: 'spend', label: 'Spend' }, { key: 'lastSeen', label: 'Last seen' },
];

export function UsersTable({ users, viewerRole, onChange, notify }: Props) {
  const [s, setS] = useState<TableState>({ query: '', status: 'all', sort: 'lastSeen', dir: 'desc', page: 1, pageSize: 8 });
  const res = useMemo(() => queryUsers(users, s), [users, s]);
  const canEdit = viewerRole === 'Admin';

  const sortBy = (key: SortKey) => setS((p) => ({ ...p, sort: key, dir: p.sort === key && p.dir === 'asc' ? 'desc' : 'asc' }));
  const toggle = (u: User) => {
    const next: Status = u.status === 'suspended' ? 'active' : 'suspended';
    onChange(users.map((x) => (x.id === u.id ? { ...x, status: next } : x)));
    notify(`${u.name} ${next === 'active' ? 'reactivated' : 'suspended'}`);
  };
  const remove = (u: User) => {
    const before = users;
    onChange(users.filter((x) => x.id !== u.id));
    notify(`${u.name} removed`, () => onChange(before));
  };

  return (
    <section className="panel panel--wide">
      <header className="panel__head">
        <h2>Customers</h2>
        <div className="table-tools">
          <input type="search" placeholder="Search name or e-mail" value={s.query} aria-label="Search customers"
            onChange={(e) => setS({ ...s, query: e.target.value, page: 1 })} />
          <select value={s.status} aria-label="Status filter" onChange={(e) => setS({ ...s, status: e.target.value as TableState['status'], page: 1 })}>
            <option value="all">All statuses</option><option value="active">Active</option><option value="invited">Invited</option><option value="suspended">Suspended</option>
          </select>
        </div>
      </header>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} aria-sort={s.sort === c.key ? (s.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button className="th-btn" onClick={() => sortBy(c.key)}>
                    {c.label} {s.sort === c.key ? (s.dir === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </th>
              ))}
              {canEdit && <th><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {res.rows.map((u) => (
              <tr key={u.id}>
                <td><div className="user"><span className="avatar" aria-hidden>{u.name.split(' ').map((p) => p[0]).join('')}</span><div><strong>{u.name}</strong><small className="muted">{u.email}</small></div></div></td>
                <td>{u.role}</td>
                <td><span className={`pill pill--${u.status}`}>{u.status}</span></td>
                <td className="num">{euro(u.spend)}</td>
                <td>{u.lastSeen}</td>
                {canEdit && (
                  <td className="actions">
                    <button className="btn btn--ghost" onClick={() => toggle(u)}>{u.status === 'suspended' ? 'Activate' : 'Suspend'}</button>
                    <button className="btn btn--ghost danger" onClick={() => remove(u)}>Remove</button>
                  </td>
                )}
              </tr>
            ))}
            {res.rows.length === 0 && <tr><td colSpan={6} className="empty">No customers match your filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <footer className="pager">
        <span className="muted">{res.total} customers · page {res.page} of {res.pages}</span>
        <div>
          <button className="btn" disabled={res.page <= 1} onClick={() => setS({ ...s, page: res.page - 1 })}>Previous</button>
          <button className="btn" disabled={res.page >= res.pages} onClick={() => setS({ ...s, page: res.page + 1 })}>Next</button>
        </div>
      </footer>
    </section>
  );
}
