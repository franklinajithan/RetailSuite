"use client";
import { useEffect, useState } from "react";
import { PermissionMap } from "./rbac.types";

const STORAGE_KEY = (roleId: string) => bac-perms:\;

export function useRolePermissions(roleId: string) {
  const [perms, setPerms] = useState<PermissionMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(/api/roles/\/permissions, { cache: "no-store" });
        const data = await res.json();
        if (mounted) setPerms(data?.permissions ?? null);
      } catch {
        const fromStore = sessionStorage.getItem(STORAGE_KEY(roleId));
        if (fromStore && mounted) setPerms(JSON.parse(fromStore));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [roleId]);

  const save = async (next: PermissionMap) => {
    setPerms(next);
    sessionStorage.setItem(STORAGE_KEY(roleId), JSON.stringify(next));
    await fetch(/api/roles/\/permissions, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: next }),
    }).catch(() => {});
  };

  return { perms, setPerms: save, loading };
}