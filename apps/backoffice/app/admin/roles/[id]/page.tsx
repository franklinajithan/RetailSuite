"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ALL_SCREENS, PermissionBits, PermissionMap, ScreenKey } from "../../../../../../lib/rbac.types";

type RolePermsResponse = { roleId: string; permissions: PermissionMap };

export default function RolePermissionsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roleId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perms, setPerms] = useState<PermissionMap | null>(null);

  const bits: (keyof PermissionBits)[] = ["view", "create", "edit", "delete", "export", "approve"];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/roles/${roleId}/permissions`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data: RolePermsResponse = await r.json();
        setPerms(data.permissions);
      } catch (e) {
        console.error("Failed to load permissions", e);
        setPerms(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [roleId]);

  const allOn = useMemo(() => {
    if (!perms) return false;
    return ALL_SCREENS.every((s: { key: ScreenKey }) => bits.every((b) => Boolean(perms[s.key]?.[b])));
  }, [perms]);

  const toggleAll = (on: boolean) => {
    if (!perms) return;
    const next: PermissionMap = { ...perms } as PermissionMap;
    for (const s of ALL_SCREENS) {
      next[s.key] = { ...(next[s.key] || {}) };
      for (const b of bits) next[s.key][b] = on;
    }
    setPerms(next);
  };

  const toggle = (screen: ScreenKey, bit: keyof PermissionBits) => {
    if (!perms) return;
    setPerms((prev: PermissionMap | null) => {
      const current = { ...((prev || {}) as PermissionMap) } as PermissionMap;
      const row = { ...(current[screen] || {}) } as PermissionBits;
      row[bit] = !row[bit];
      current[screen] = row;
      return current;
    });
  };

  const save = async () => {
    if (!perms) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ permissions: perms }),
      });
      if (!r.ok) throw new Error("Failed to save");
      alert("Saved");
    } catch (e) {
      console.error(e);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link className="btn-secondary" href="/admin/roles-rights">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold">Permissions for role: {roleId}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => toggleAll(true)} disabled={!perms}>
            Grant all
          </button>
          <button className="btn-secondary" onClick={() => toggleAll(false)} disabled={!perms}>
            Revoke all
          </button>
          <button className="btn" disabled={!perms || saving} onClick={save}>
            Save
          </button>
        </div>
      </div>

      {loading && <div className="text-neutral-500">Loading…</div>}
      {!loading && !perms && <div className="text-neutral-500">No permissions found.</div>}

      {perms && (
        <div className="overflow-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900/60">
              <tr>
                <th className="text-left p-3">Screen</th>
                {bits.map((b) => (
                  <th key={String(b)} className="text-left p-3 capitalize">
                    {String(b)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {ALL_SCREENS.map((s: { key: ScreenKey; label: string }) => (
                <tr key={s.key} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40">
                  <td className="p-3 font-medium">{s.label}</td>
                  {bits.map((b) => (
                    <td key={String(b)} className="p-3">
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={Boolean(perms?.[s.key]?.[b])} onChange={() => toggle(s.key, b)} />
                        <span className="hidden md:inline capitalize">{String(b)}</span>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
