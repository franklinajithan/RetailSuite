import { pgTable, uuid, text, jsonb, varchar, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./schema";

export const userPrefs = pgTable("user_prefs", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  favorites: text("favorites").array().notNull().default(sql`ARRAY[]::text[]`),
  emojiMap: jsonb("emoji_map").$type<Record<string, string>>().notNull().default(sql`'{}'::jsonb`),
  sidebarMode: varchar("sidebar_mode", { length: 20 }).notNull().default("compact"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});