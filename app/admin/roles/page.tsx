'use client';

import { useState } from 'react';
import Link from 'next/link';

type RoleRow = {
  id: string;
  name: string;
  userCount?: number;
};

export default function Page() {
  const [rows] = useState<RoleRow[]>([
    { id: 'admin', name: 'Administrator', userCount: 2 },
    { id: 'cashier', name: 'Cashier', userCount: 8 },
  ]);
  const [q, setQ] = useState('');
  const [view, setView] = useState<'table' | 'board'>('table');

  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(q.toLowerCase().trim())
  );

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Roles</h1>
        <Link href="/admin/roles-rights" className="underline">
          Role rights →
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search roles…"
          className="border rounded px-3 py-2"
        />
        <div className="inline-flex rounded overflow-hidden border">
          <button
            className={`px-3 py-2 ${view === 'table' ? 'bg-gray-100' : ''}`}
            onClick={() => setView('table')}
          >
            Table
          </button>
          <button
            className={`px-3 py-2 ${view === 'board' ? 'bg-gray-100' : ''}`}
            onClick={() => setView('board')}
          >
            Board
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <section className="overflow-x-auto">
          <table className="min-w-[600px] w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 border-b">Role</th>
                <th className="text-left p-2 border-b">Users</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.userCount ?? 0}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={2}>
                    No roles match “{q}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="rounded border p-4">
              <h3 className="font-medium">{r.name}</h3>
              <p className="text-sm opacity-70">{r.userCount ?? 0} users</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-gray-500">No roles to show.</div>
          )}
        </section>
      )}
    </main>
  );
}