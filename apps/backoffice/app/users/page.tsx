"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

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
  createdAt?: string | null;
  lastSeenAt?: string | null;
  emailVerified?: boolean;
};

type SortKey = "email" | "name" | "status" | "mfaEnabled" | "lastLoginAt";

/* -------------------------------------------------------------------------- */
/*                              Style injector                                */
/* -------------------------------------------------------------------------- */

function ClassBase() {
  const base = `
  .btn{ @apply inline-flex items-center justify-center px-3 py-2 rounded-xl bg-brand-600 text-white text-sm hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed; }
  .btn-secondary{ @apply inline-flex items-center justify-center px-3 py-2 rounded-xl border text-sm border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40; }
  .btn-ghost{ @apply inline-flex items-center justify-center px-2 py-1 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800; }
  .input{ @apply px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none focus:ring-1 ring-brand-400; }
  .pill{ @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border; }
  `;
  return <style dangerouslySetInnerHTML={{ __html: base }} />;
}

/* -------------------------------------------------------------------------- */
/*                                Main page                                   */
/* -------------------------------------------------------------------------- */

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "suspended" | "invited">("all");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UserRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [creating, setCreating] = useState(false);

  // NEW: pagination & sorting
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortKey, setSortKey] = useState<SortKey>("lastLoginAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<string[]>([]);

  // debounce search
  const debouncedQ = useDebounce(q, 300);

  const allSelected = useMemo(() => items.length > 0 && selected.length === items.length, [items, selected]);

  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(items.map((u) => u.id));
  };

  const toggleSelectOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.concat(id)));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedQ,
        status,
        page: String(page),
        pageSize: String(pageSize),
        sortKey,
        sortDir,
      });
      const r = await fetch(`/api/users?${params.toString()}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setItems(data.items || []);
      setCounts(data.counts || {});
      setSelected([]); // reset selection when list changes
    } catch (e) {
      console.error("Failed to fetch users", e);
      setItems([]);
      setCounts({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, status, page, pageSize, sortKey, sortDir]);

  const exportCSV = async (ids?: string[]) => {
    const params = new URLSearchParams({
      q: debouncedQ,
      status,
      sortKey,
      sortDir,
      // if ids provided, ignore pagination & export exactly those
      ids: ids && ids.length ? ids.join(",") : "",
      page: String(page),
      pageSize: String(pageSize),
    });
    const r = await fetch(`/api/users?${params.toString()}`);
    const data = await r.json();
    const csv = ["email,name,status,roles"].concat((data.items || []).map((x: Partial<UserRow>) => `${safeCSV(x.email)},${safeCSV(x.name)},${safeCSV(x.status || "")},"${((x.roles || []) as string[]).join("|")}"`)).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <ClassBase />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="text-sm text-neutral-500">Manage people, roles, MFA, access & security.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setCreating(true)}>
            New user
          </button>
          <button className="btn-secondary" onClick={() => exportCSV()}>
            Export CSV
          </button>
        </div>
      </header>

      {/* Counters */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Counter
          title="Total"
          value={counts.total || 0}
          active={status === "all"}
          onClick={() => {
            setStatus("all");
            setPage(1);
          }}
        />
        <Counter
          title="Active"
          value={counts.active || 0}
          active={status === "active"}
          onClick={() => {
            setStatus("active");
            setPage(1);
          }}
        />
        <Counter
          title="Suspended"
          value={counts.suspended || 0}
          active={status === "suspended"}
          onClick={() => {
            setStatus("suspended");
            setPage(1);
          }}
        />
        <Counter
          title="Invited"
          value={counts.invited || 0}
          active={status === "invited"}
          onClick={() => {
            setStatus("invited");
            setPage(1);
          }}
        />
        <Counter title="MFA On" value={counts.mfaOn || 0} />
      </section>

      {/* Search & page size */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="flex gap-2 flex-1">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email, name, phone…" className="input flex-1" />
          <button className="btn-secondary" onClick={() => setQ("")}>
            Clear
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-500">Rows</label>
          <select
            className="input"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
          <div className="text-sm">
            <strong>{selected.length}</strong> selected
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-secondary"
              onClick={async () => {
                await fetch(`/api/users/bulk/lock`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: selected }) });
                fetchData();
              }}
            >
              Lock
            </button>
            <button
              className="btn-secondary"
              onClick={async () => {
                await fetch(`/api/users/bulk/unlock`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: selected }) });
                fetchData();
              }}
            >
              Unlock
            </button>
            <button
              className="btn-secondary"
              onClick={async () => {
                await fetch(`/api/users/bulk/mfa`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: selected, enabled: true }) });
                fetchData();
              }}
            >
              Enable MFA
            </button>
            <button
              className="btn-secondary"
              onClick={async () => {
                await fetch(`/api/users/bulk/mfa`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: selected, enabled: false }) });
                fetchData();
              }}
            >
              Disable MFA
            </button>
            <button className="btn-secondary" onClick={() => exportCSV(selected)}>
              Export CSV
            </button>
            <button className="btn-ghost" onClick={() => setSelected([])}>
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/60">
            <tr>
              <Th>
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all" />
              </Th>
              <SortableTh
                label="Email"
                sortKey="email"
                currentKey={sortKey}
                dir={sortDir}
                onSort={(k, d) => {
                  setSortKey(k);
                  setSortDir(d);
                }}
              />
              <SortableTh
                label="Name"
                sortKey="name"
                currentKey={sortKey}
                dir={sortDir}
                onSort={(k, d) => {
                  setSortKey(k);
                  setSortDir(d);
                }}
              />
              <SortableTh
                label="Status"
                sortKey="status"
                currentKey={sortKey}
                dir={sortDir}
                onSort={(k, d) => {
                  setSortKey(k);
                  setSortDir(d);
                }}
              />
              <SortableTh
                label="MFA"
                sortKey="mfaEnabled"
                currentKey={sortKey}
                dir={sortDir}
                onSort={(k, d) => {
                  setSortKey(k);
                  setSortDir(d);
                }}
              />
              <SortableTh
                label="Last login"
                sortKey="lastLoginAt"
                currentKey={sortKey}
                dir={sortDir}
                onSort={(k, d) => {
                  setSortKey(k);
                  setSortDir(d);
                }}
              />
              <Th>Roles</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {loading && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-neutral-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-neutral-500">
                  No users
                </td>
              </tr>
            )}
            {items.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40">
                <td className="p-3">
                  <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelectOne(u.id)} aria-label={`Select ${u.email}`} />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar url={u.avatarUrl} name={u.name || u.email} />
                    <div className="truncate">{u.email}</div>
                    {!u.emailVerified && <span className="pill border-amber-200 text-amber-700">unverified</span>}
                  </div>
                </td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">
                  <StatusPill status={u.status || "active"} />
                </td>
                <td className="p-3">{u.mfaEnabled ? "On" : "Off"}</td>
                <td className="p-3">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {(u.roles || []).map((r) => (
                      <span key={r} className="pill border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
                        {r}
                      </span>
                    ))}
                    {(u.roles || []).length === 0 && <span className="text-neutral-400">—</span>}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    {u.status === "invited" && (
                      <button
                        className="btn-ghost"
                        onClick={async () => {
                          await fetch(`/api/users/${u.id}/resend-invite`, { method: "POST" });
                          alert("Invite sent.");
                        }}
                      >
                        Resend Invite
                      </button>
                    )}
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
                        await fetch(`/api/users/${u.id}/mfa`, {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ enabled }),
                        });
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

      {/* Pagination */}
      <Pagination page={page} pageSize={pageSize} total={counts[status === "all" ? "total" : status] ?? counts.total ?? 0} onPageChange={setPage} />

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

/* -------------------------------------------------------------------------- */
/*                              Reusable pieces                               */
/* -------------------------------------------------------------------------- */

function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function safeCSV(s: unknown) {
  const v = String(s ?? "");
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function Counter({ title, value, active, onClick }: { title: string; value: number; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={clsx("text-left rounded-2xl p-4 border transition", active ? "border-brand-300 bg-brand-50/70" : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40")}>
      <div className="text-xs text-neutral-500 uppercase">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </button>
  );
}
function Th({ children }: { children?: React.ReactNode }) {
  return <th className="text-left font-medium text-neutral-600 dark:text-neutral-300 p-3">{children}</th>;
}
function SortableTh({ label, sortKey, currentKey, dir, onSort }: { label: string; sortKey: SortKey; currentKey: SortKey; dir: "asc" | "desc"; onSort: (k: SortKey, d: "asc" | "desc") => void }) {
  const active = currentKey === sortKey;
  const nextDir = active && dir === "asc" ? "desc" : "asc";
  return (
    <Th>
      <button className={clsx("inline-flex items-center gap-1", active ? "text-brand-700" : "text-inherit")} onClick={() => onSort(sortKey, nextDir)} title={`Sort by ${label} ${nextDir}`}>
        <span>{label}</span>
        {active ? (
          <span aria-hidden>{dir === "asc" ? "▲" : "▼"}</span>
        ) : (
          <span className="opacity-40" aria-hidden>
            ↕
          </span>
        )}
      </button>
    </Th>
  );
}
function StatusPill({ status }: { status: "active" | "suspended" | "invited" }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    suspended: "bg-rose-50 text-rose-700",
    invited: "bg-amber-50 text-amber-700",
  };
  return <span className={clsx("px-2 py-1 rounded-full text-xs", map[status])}>{status}</span>;
}
function Avatar({ url, name }: { url?: string | null; name: string }) {
  if (url) return <img src={url} className="w-6 h-6 rounded-full object-cover" alt="" />;
  const letter = (name || "U").trim().charAt(0).toUpperCase();
  return <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 grid place-items-center text-xs">{letter}</div>;
}

function Pagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-neutral-500">
        Page <strong>{page}</strong> of <strong>{pages}</strong> • Total <strong>{total}</strong>
      </div>
      <div className="flex gap-2">
        <button className="btn-secondary" disabled={page <= 1} onClick={() => onPageChange(1)}>
          First
        </button>
        <button className="btn-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </button>
        <button className="btn-secondary" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
        <button className="btn-secondary" disabled={page >= pages} onClick={() => onPageChange(pages)}>
          Last
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Create modal                                */
/* -------------------------------------------------------------------------- */

function CreateModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("Admin@123");
  const [sendInvite, setSendInvite] = useState(true); // NEW: invite flow
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [roles, setRoles] = useState("retailer_admin");
  const [status, setStatus] = useState<"active" | "suspended" | "invited">("active");
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-[520px] bg-white dark:bg-neutral-900 shadow-2xl p-6 overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Create user</h3>
        <div className="space-y-3">
          <input className="input w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input w-full" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} />
            Send invite email (password not required)
          </label>
          {!sendInvite && <input className="input w-full" placeholder="Temporary password" value={password} onChange={(e) => setPassword(e.target.value)} />}
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
                  password: sendInvite ? undefined : password,
                  phone,
                  avatarUrl,
                  roles: roles
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  status: sendInvite ? "invited" : status,
                  invite: sendInvite,
                }),
              });
              setSaving(false);
              if (r.ok) onClose();
              else alert("Failed to create");
            }}
          >
            {sendInvite ? "Send Invite" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Edit drawer                                */
/* -------------------------------------------------------------------------- */

function EditDrawer({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [status, setStatus] = useState<"active" | "suspended" | "invited">(user.status || "active");
  const [roleKeys, setRoleKeys] = useState<string>((user.roles || []).join(","));
  const [mfa, setMfa] = useState(!!user.mfaEnabled);
  const [saving, setSaving] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-[560px] bg-white dark:bg-neutral-900 shadow-2xl p-6 overflow-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit user</h3>
          <button
            className="btn-ghost"
            onClick={async () => {
              if (!confirm("Delete (anonymize/suspend) this user?")) return;
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

        <div className="mt-6 flex flex-wrap gap-2">
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
          {user.status === "invited" && (
            <button
              className="btn-ghost"
              onClick={async () => {
                await fetch(`/api/users/${user.id}/resend-invite`, { method: "POST" });
                alert("Invite sent.");
              }}
            >
              Resend invite
            </button>
          )}
          <button className="btn-ghost" onClick={() => setSessionsOpen(true)}>
            Sessions
          </button>
          <button className="btn-ghost" onClick={() => setAuditOpen(true)}>
            Audit
          </button>
          <button
            className="btn-ghost"
            onClick={async () => {
              const r = await fetch(`/api/users/${user.id}/export`, { method: "POST" });
              const { downloadUrl } = await r.json();
              window.location.href = downloadUrl;
            }}
          >
            Export data (GDPR)
          </button>
          <button
            className="btn-ghost"
            onClick={async () => {
              if (!confirm("Permanently anonymize this user? This cannot be undone.")) return;
              await fetch(`/api/users/${user.id}/anonymize`, { method: "POST" });
              onClose();
            }}
          >
            Anonymize
          </button>
        </div>

        <div className="mt-4 flex justify-between">
          <div className="flex gap-2">
            {user.status === "suspended" ? (
              <button
                className="btn-secondary"
                onClick={async () => {
                  await fetch(`/api/users/${user.id}/unlock`, { method: "POST" });
                  onClose();
                }}
              >
                Unlock
              </button>
            ) : (
              <button
                className="btn-secondary"
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

        {auditOpen && <AuditModal userId={user.id} onClose={() => setAuditOpen(false)} />}
        {sessionsOpen && <SessionsModal userId={user.id} onClose={() => setSessionsOpen(false)} />}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Extra modals                                 */
/* -------------------------------------------------------------------------- */

function AuditModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  type AuditRow = { event: string; at: string; ip?: string | null; actor?: string | null };
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/users/${userId}/audit`);
      const data = await r.json();
      setRows(data.items || []);
    })();
  }, [userId]);
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-[560px] bg-white dark:bg-neutral-900 shadow-2xl p-6 overflow-auto">
        <h4 className="text-lg font-semibold mb-3">Audit log</h4>
        {!rows && <div className="text-neutral-500">Loading…</div>}
        {rows && rows.length === 0 && <div className="text-neutral-500">No activity.</div>}
        {rows && rows.length > 0 && (
          <div className="space-y-2">
            {rows.map((a, i) => (
              <div key={i} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div className="text-sm">{a.event}</div>
                <div className="text-xs text-neutral-500">
                  {new Date(a.at).toLocaleString()} • IP {a.ip || "—"} • By {a.actor || "system"}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-right">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionsModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  type SessionRow = { id: string; ua?: string; city?: string; country?: string; ip?: string; lastSeenAt?: string; createdAt?: string };
  const [rows, setRows] = useState<SessionRow[] | null>(null);
  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/users/${userId}/sessions`);
      const data = await r.json();
      setRows(data.items || []);
    })();
  }, [userId]);
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-[560px] bg-white dark:bg-neutral-900 shadow-2xl p-6 overflow-auto">
        <h4 className="text-lg font-semibold mb-3">Active sessions</h4>
        {!rows && <div className="text-neutral-500">Loading…</div>}
        {rows && rows.length === 0 && <div className="text-neutral-500">No active sessions.</div>}
        {rows && rows.length > 0 && (
          <div className="space-y-2">
            {rows.map((s, i) => (
              <div key={i} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div className="text-sm">
                  {s.ua || "Session"} • {s.city || "Unknown"} {s.country || ""} • {s.ip || "—"}
                  <div className="text-xs text-neutral-500">{new Date(s.lastSeenAt || s.createdAt).toLocaleString()}</div>
                </div>
                <button
                  className="btn-ghost"
                  onClick={async () => {
                    await fetch(`/api/users/${userId}/sessions/${s.id}`, { method: "DELETE" });
                    setRows((prev) => (prev || []).filter((x) => x.id !== s.id));
                  }}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-between">
          <button
            className="btn-secondary"
            onClick={async () => {
              await fetch(`/api/users/${userId}/sessions`, { method: "DELETE" });
              setRows([]);
            }}
          >
            Revoke all
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
