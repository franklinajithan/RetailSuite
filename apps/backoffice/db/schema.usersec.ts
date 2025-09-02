import { pgTable, serial, integer, text, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./schema";

/** Profile per user */
export const userProfiles = pgTable("user_profiles", {
  userId: integer("user_id").notNull().references(()=>users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  failedLogins: integer("failed_logins").notNull().default(0),
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t)=>({ pk: primaryKey({ columns: [t.userId] }) }));

/** Roles + user_roles (many-to-many) */
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const userRoles = pgTable("user_roles", {
  userId: integer("user_id").notNull().references(()=>users.id, { onDelete: "cascade" }),
  roleId: integer("role_id").notNull().references(()=>roles.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
}, (t)=>({ pk: primaryKey({ columns: [t.userId, t.roleId] }) }));

/** Auth / security events */
export const authLogs = pgTable("auth_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(()=>users.id, { onDelete: "set null" }),
  event: text("event").notNull(),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** UI Preferences (what /api/me/prefs uses) */
export const userPrefs = pgTable("user_prefs", {
  userId: integer("user_id").primaryKey().references(()=>users.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("light"),              // light | dark | system
  navCollapsed: boolean("nav_collapsed").notNull().default(false),
  density: text("density").notNull().default("comfortable"),   // compact | comfortable
  analyticsOptIn: boolean("analytics_opt_in").notNull().default(false),
  widgets: jsonb("widgets").notNull().default({}),              // dashboard cards layout, etc.
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});