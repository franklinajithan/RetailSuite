"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role?: string;
  status?: "active" | "suspended" | "invited";
  phone?: string;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  failedLogins?: number;
  mfaEnabled?: boolean;
  mustChangePassword?: boolean;
  roles?: string[];
};

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "suspended" | "invited">("all");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UserRow[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [creating, setCreating] = useState(false);

  // const fetchData = async ()=>{
  //   setLoading(true);
  //   const r = await fetch(`/api/users?q=${encodeURIComponent(q)}&status=${status}`, { cache: "no-store" });
  //   const data = await r.json();
  //   setItems(data.items || []);
  //   setCounts(data.counts || {});
  //   setLoading(false);
  // };

  useEffect(() => {
   // fetchData();
  }, [q, status]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="text-sm text-neutral-500">Manage people, roles, MFA, access & security.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setCreating(true)}>
            New user
          </button>
          <button
            className="btn-secondary"
            onClick={async () => {
              const r = await fetch(`/api/users?q=${encodeURIComponent(q)}&status=${status}`);
              const data = await r.json();
              const csv = ["email,name,status,roles"].concat((data.items || []).map((x: any) => `${x.email},${x.name},${x.status || ""},"${(x.roles || []).join("|")}"`)).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "users.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV
          </button>
        </div>
      </header>

      {/* Counters */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Counter title="Total" value={counts.total || 0} active={status === "all"} onClick={() => setStatus("all")} />
        <Counter title="Active" value={counts.active || 0} active={status === "active"} onClick={() => setStatus("active")} />
        <Counter title="Suspended" value={counts.suspended || 0} active={status === "suspended"} onClick={() => setStatus("suspended")} />
        <Counter title="Invited" value={counts.invited || 0} active={status === "invited"} onClick={() => setStatus("invited")} />
      </section>

      {/* Search */}
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or name…" className="input flex-1" />
        <button className="btn-secondary" onClick={() => setQ("")}>
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/60">
            <tr>
              <Th>Email</Th>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>MFA</Th>
              <Th>Last login</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-neutral-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-neutral-500">
                  No users
                </td>
              </tr>
            )}
            {items.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar url={u.avatarUrl} name={u.name || u.email} />
                    <div className="truncate">{u.email}</div>
                  </div>
                </td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">
                  <StatusPill status={u.status || "active"} />
                </td>
                <td className="p-3">{u.mfaEnabled ? "On" : "Off"}</td>
                <td className="p-3">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button className="btn-ghost" onClick={() => setEditing(u)}>
                      Edit
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={async () => {
                        if (!confirm("Reset password for this user?")) return;
                        const r = await fetch(`/api/users/${u.id}/reset-password`, { method: "POST" });
                        const data = await r.json();
                        alert("Temporary password:\n" + data.temporaryPassword);
                      }}
                    >
                      Reset PW
                    </button>
                    {u.status === "suspended" ? (
                      <button
                        className="btn-ghost"
                        onClick={async () => {
                          await fetch(`/api/users/${u.id}/unlock`, { method: "POST" });
                          fetchData();
                        }}
                      >
                        Unlock
                      </button>
                    ) : (
                      <button
                        className="btn-ghost"
                        onClick={async () => {
                          await fetch(`/api/users/${u.id}/lock`, { method: "POST" });
                          fetchData();
                        }}
                      >
                        Lock
                      </button>
                    )}
                    <button
                      className="btn-ghost"
                      onClick={async () => {
                        const enabled = !u.mfaEnabled;
                        await fetch(`/api/users/${u.id}/mfa`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled }) });
                        fetchData();
                      }}
                    >
                      {u.mfaEnabled ? "Disable MFA" : "Enable MFA"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <CreateModal
          onClose={() => {
            setCreating(false);
            fetchData();
          }}
        />
      )}
      {editing && (
        <EditDrawer
          user={editing}
          onClose={() => {
            setEditing(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function Counter({ title, value, active, onClick }: { title: string; value: number; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={clsx("text-left rounded-2xl p-4 border transition", active ? "border-brand-300 bg-brand-50/70" : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40")}>
      <div className="text-xs text-neutral-500 uppercase">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </button>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-medium text-neutral-600 dark:text-neutral-300 p-3">{children}</th>;
}
function StatusPill({ status }: { status: "active" | "suspended" | "invited" }) {
  const map: any = { active: "bg-emerald-50 text-emerald-700", suspended: "bg-rose-50 text-rose-700", invited: "bg-amber-50 text-amber-700" };
  return <span className={clsx("px-2 py-1 rounded-full text-xs", map[status])}>{status}</span>;
}
function Avatar({ url, name }: { url?: string | null; name: string }) {
  if (url) return <img src={url} className="w-6 h-6 rounded-full object-cover" alt="" />;
  const letter = (name || "U").trim().charAt(0).toUpperCase();
  return <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 grid place-items-center text-xs">{letter}</div>;
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("Admin@123");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [roles, setRoles] = useState("retailer_admin");
  const [status, setStatus] = useState<"active" | "suspended" | "invited">("active");
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-[480px] bg-white dark:bg-neutral-900 shadow-2xl p-6 overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Create user</h3>
        <div className="space-y-3">
          <input className="input w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input w-full" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input w-full" placeholder="Temporary password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="input" placeholder="Avatar URL (optional)" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Roles (comma keys)" value={roles} onChange={(e) => setRoles(e.target.value)} />
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="invited">Invited</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              const r = await fetch("/api/users", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  email,
                  name,
                  password,
                  phone,
                  avatarUrl,
                  roles: roles
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  status,
                }),
              });
              setSaving(false);
              if (r.ok) onClose();
              else alert("Failed to create");
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function EditDrawer({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [status, setStatus] = useState<"active" | "suspended" | "invited">(user.status || "active");
  const [roleKeys, setRoleKeys] = useState<string>((user.roles || []).join(","));
  const [mfa, setMfa] = useState(!!user.mfaEnabled);
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-[540px] bg-white dark:bg-neutral-900 shadow-2xl p-6 overflow-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit user</h3>
          <button
            className="btn-ghost"
            onClick={async () => {
              if (!confirm("Delete (suspend) this user?")) return;
              await fetch(`/api/users/${user.id}`, { method: "DELETE" });
              onClose();
            }}
          >
            Suspend
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar url={avatarUrl} name={name || user.email} />
            <input className="input flex-1" placeholder="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          </div>
          <input className="input w-full" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="invited">Invited</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <label className="text-sm">Roles (comma keys)</label>
            <input className="input" placeholder="e.g. retailer_admin,store_manager" value={roleKeys} onChange={(e) => setRoleKeys(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={mfa} onChange={(e) => setMfa(e.target.checked)} /> MFA enabled
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <div className="flex gap-2">
            <button
              className="btn-ghost"
              onClick={async () => {
                const r = await fetch(`/api/users/${user.id}/reset-password`, { method: "POST" });
                const data = await r.json();
                alert("Temporary password:\n" + data.temporaryPassword);
              }}
            >
              Reset password
            </button>
            {user.status === "suspended" ? (
              <button
                className="btn-ghost"
                onClick={async () => {
                  await fetch(`/api/users/${user.id}/unlock`, { method: "POST" });
                  onClose();
                }}
              >
                Unlock
              </button>
            ) : (
              <button
                className="btn-ghost"
                onClick={async () => {
                  await fetch(`/api/users/${user.id}/lock`, { method: "POST" });
                  onClose();
                }}
              >
                Lock
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                const res = await fetch(`/api/users/${user.id}`, {
                  method: "PUT",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    name,
                    phone,
                    avatarUrl,
                    status,
                    roles: roleKeys
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    mfaEnabled: mfa,
                  }),
                });
                setSaving(false);
                if (res.ok) onClose();
                else alert("Failed to save");
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* small UI kit */
function classBase() {
  const base = `
  .btn{ @apply inline-flex items-center justify-center px-3 py-2 rounded-xl bg-brand-600 text-white text-sm hover:brightness-110; }
  .btn-secondary{ @apply inline-flex items-center justify-center px-3 py-2 rounded-xl border text-sm border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40; }
  .btn-ghost{ @apply inline-flex items-center justify-center px-2 py-1 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800; }
  .input{ @apply px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none focus:ring-1 ring-brand-400; }
  `;
  return <style dangerouslySetInnerHTML={{ __html: base }} />;
}
(() => classBase())();
