import { NextResponse } from "next/server";
import { PermissionMap, ALL_SCREENS } from "@/lib/rbac.types";

const STORE = new Map<string, PermissionMap>();

function seed(roleId: string): PermissionMap {
  if (STORE.has(roleId)) return STORE.get(roleId)!;
  const base: PermissionMap = {} as any;
  for (const s of ALL_SCREENS) base[s.key] = {};
  // sensible defaults
  if (roleId === "role-admin") {
    for (const s of ALL_SCREENS) base[s.key] = { view: true, create: true, edit: true, delete: true, export: true, approve: true };
  } else if (roleId === "role-manager") {
    for (const s of ALL_SCREENS) base[s.key] = { view: true, create: true, edit: true, export: true };
    base["settings"] = { view: true };
    base["roles"] = { view: true };
  } else {
    for (const s of ALL_SCREENS) base[s.key] = { view: s.key !== "settings" && s.key !== "roles" };
    base["orders"].create = true;
  }
  STORE.set(roleId, base);
  return base;
}

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;
  const perms = seed(id);
  return NextResponse.json({ roleId: id, permissions: perms });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;
  const body = await req.json().catch(() => ({}));
  const next = (body?.permissions ?? null) as PermissionMap | null;
  if (!next) return NextResponse.json({ error: "permissions required" }, { status: 400 });
  STORE.set(id, next);
  return NextResponse.json({ ok: true });
}