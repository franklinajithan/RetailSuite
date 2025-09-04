"use client";
import { RoleRow } from "@/lib/rbac.types";
import Link from "next/link";

export default function RolesBoard({ items }: { items: RoleRow[] }) {
  const groups = [
    { key: "core",  title: "Core Roles",   filter: (r: RoleRow) => /admin|manager/i.test(r.id) },
    { key: "ops",   title: "Operations",   filter: (r: RoleRow) => /cashier|picker|stock|ops/i.test(r.id) },
    { key: "other", title: "Other",        filter: (_: RoleRow) => true },
  ];
  const remaining = new Set(items.map(i=>i.id));
  const cols = groups.map(g => {
    const rows = items.filter(r => g.filter(r) && remaining.has(r.id));
    rows.forEach(r => remaining.delete(r.id));
    return { ...g, rows };
  });
  cols[2].rows = [...cols[2].rows, ...items.filter(r => remaining.has(r.id))];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {cols.map(col => (
        <div key={col.key} className="rounded-2xl border p-3 bg-white/50 dark:bg-neutral-900/40">
          <div className="font-semibold mb-2">{col.title}</div>
          <div className="flex flex-wrap gap-2">
            {col.rows.length === 0 && <div className="text-sm text-neutral-500">No roles</div>}
            {col.rows.map(r => (
              <Link key={r.id} href={/admin/roles/} className={
                inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm
                hover:shadow-sm transition
                bg--50 border--200
                dark:bg--900/20 dark:border--900/40
              }>
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-current opacity-70"></span>
                <span className="font-medium">{r.name}</span>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-600 dark:text-neutral-300 text-xs">{r.usersCount ?? 0} users</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}