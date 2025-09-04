"use client";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  type Role = { id: string | number; key: string; name?: string | null };
  const [rows, setRows] = useState<Role[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/roles?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: unknown = await r.json();
      const items = (data as { items?: Role[] })?.items;
      setRows(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error("Failed to load roles", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [q]);

  const canCreate = useMemo(() => newKey.trim().length >= 2, [newKey]);

  return (
    <div className="space-y-4">
      <PageHeader title="Roles & Rights" subtitle="RBAC, permissions, feature flags" />
      <Card>
        <div className="flex gap-2 mb-3">
          <Input placeholder="Search…" value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} />
          <Button onClick={() => setQ("")}>Clear</Button>
          <Button onClick={() => setCreating(true)}>New</Button>
        </div>
        <div className="overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Name</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="text-neutral-500 py-8 text-center">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-neutral-500 py-8 text-center">
                    No roles
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r: Role) => (
                  <tr key={r.id} className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/40" onClick={() => location.assign(`/admin/roles/${r.id}`)}>
                    <td>{r.key}</td>
                    <td>{r.name}</td>
                    <td className="text-right">
                      <button
                        className="btn-ghost"
                        onClick={async () => {
                          if (!confirm("Delete this role?")) return;
                          await fetch(`/api/roles/${r.id}`, { method: "DELETE" });
                          fetchData();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {creating && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCreating(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[480px] bg-white dark:bg-neutral-900 shadow-2xl p-6 overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Create role</h3>
            <div className="space-y-3">
              <Input placeholder="Key (e.g. store_manager)" value={newKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKey(e.target.value)} />
              <Input placeholder="Name (optional)" value={newName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <button
                className="btn"
                disabled={!canCreate}
                onClick={async () => {
                  const body: { key: string; name?: string } = { key: newKey.trim() };
                  if (newName.trim()) body.name = newName.trim();
                  const r = await fetch("/api/roles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
                  if (r.ok) {
                    setCreating(false);
                    setNewKey("");
                    setNewName("");
                    fetchData();
                  } else alert("Failed to create");
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
