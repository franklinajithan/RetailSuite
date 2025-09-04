import { NextResponse } from "next/server";
import { RoleRow } from "@/lib/rbac.types";

let ROLES: RoleRow[] = [
  { id: "role-admin", name: "Admin", description: "Full access", updatedAt: new Date().toISOString(), usersCount: 4, color: "rose" },
  { id: "role-manager", name: "Manager", description: "Manage ops & reports", updatedAt: new Date().toISOString(), usersCount: 9, color: "amber" },
  { id: "role-cashier", name: "Cashier", description: "POS & orders", updatedAt: new Date().toISOString(), usersCount: 22, color: "emerald" },
];

export async function GET() {
  return NextResponse.json({ items: ROLES, total: ROLES.length });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const id = "role-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const now = new Date().toISOString();
  const row: RoleRow = { id, name, updatedAt: now, description: body?.description ?? "", usersCount: 0, color: body?.color ?? "sky" };
  ROLES.unshift(row);
  return NextResponse.json({ ok: true, item: row }, { status: 201 });
}