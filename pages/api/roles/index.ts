import type { NextApiRequest, NextApiResponse } from 'next';
import { RoleRow } from '@/lib/rbac.types';

let ROLES: RoleRow[] = [
  { id: 'role-admin',   name: 'Admin',   description: 'Full access',           updatedAt: new Date().toISOString(), usersCount: 4,  color: 'rose' },
  { id: 'role-manager', name: 'Manager', description: 'Manage ops & reports',  updatedAt: new Date().toISOString(), usersCount: 9,  color: 'amber' },
  { id: 'role-cashier', name: 'Cashier', description: 'POS & orders',          updatedAt: new Date().toISOString(), usersCount: 22, color: 'emerald' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ items: ROLES, total: ROLES.length });
  }
  if (req.method === 'POST') {
    const name = String((req.body?.name ?? '')).trim();
    if (!name) return res.status(400).json({ error: 'Name required' });
    const id = 'role-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const now = new Date().toISOString();
    const row: RoleRow = { id, name, updatedAt: now, description: req.body?.description ?? '', usersCount: 0, color: req.body?.color ?? 'sky' };
    ROLES.unshift(row);
    return res.status(201).json({ ok: true, item: row });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}