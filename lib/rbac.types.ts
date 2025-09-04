export type RoleRow = {
  id: string;
  name: string;
  description?: string;
  updatedAt: string; // ISO
  usersCount?: number;
  color?: string;
};

export type PermissionBits = {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  export?: boolean;
  approve?: boolean;
};

export type ScreenKey =
  | "dashboard"
  | "users"
  | "roles"
  | "inventory"
  | "orders"
  | "suppliers"
  | "pricing"
  | "promotions"
  | "reports"
  | "settings";

export type PermissionMap = Record<ScreenKey, PermissionBits>;

export const ALL_SCREENS: { key: ScreenKey; label: string }[] = [
  { key: "dashboard",  label: "Dashboard" },
  { key: "users",      label: "Users" },
  { key: "roles",      label: "Roles & Rights" },
  { key: "inventory",  label: "Inventory" },
  { key: "orders",     label: "Orders" },
  { key: "suppliers",  label: "Suppliers" },
  { key: "pricing",    label: "Pricing" },
  { key: "promotions", label: "Promotions" },
  { key: "reports",    label: "Reports" },
  { key: "settings",   label: "Settings" },
];

export function emptyPermissionMap(): PermissionMap {
  const p: PermissionMap = {} as any;
  for (const s of ALL_SCREENS) p[s.key] = {};
  return p;
}

export function hasPermission(
  perms: PermissionMap | null | undefined,
  screen: ScreenKey,
  action: keyof PermissionBits = "view",
) {
  return Boolean(perms?.[screen]?.[action]);
}