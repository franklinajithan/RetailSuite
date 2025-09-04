import type { NextApiRequest, NextApiResponse } from 'next';
import { PermissionMap, ALL_SCREENS } from '@/lib/rbac.types';

const STORE = new Map<string, PermissionMap>();

function seed(roleId: string): PermissionMap {
  if (STORE.has(roleId)) return STORE.get(roleId)!;
  const base: PermissionMap = {} as any;
  for (const s of ALL_SCREENS) base[s.key] = {};
  if (roleId === 'role-admin') {
    for (const s of ALL_SCREENS) base[s.key] = { view: true, create: true, edit: true, delete: true, export: true, approve: true };
  } else if (roleId === 'role-manager') {
    for (const s of ALL_SCREENS) base[s.key] = { view: true, create: true, edit: true, export: true };
    base['settings'] = { view: true };
    base['roles'] = { view: true };
  } else {
    for (const s of ALL_SCREENS) base[s.key] = { view: s.key !== 'settings' && s.key !== 'roles' };
    (base['orders'] as any).create = true;
  }
  STORE.set(roleId, base);
  return base;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'id required' });

  if (req.method === 'GET') {
    const perms = seed(id);
    return res.status(200).json({ roleId: id, permissions: perms });
  }
  if (req.method === 'PUT') {
    const next = (req.body?.permissions ?? null) as PermissionMap | null;
    if (!next) return res.status(400).json({ error: 'permissions required' });
    STORE.set(id, next);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}