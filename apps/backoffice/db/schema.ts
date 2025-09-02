import { pgTable, serial, varchar, integer, timestamp, boolean, numeric, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("retailer_admin"),
  retailerId: integer("retailer_id") // null for software_admin
});

export const retailers = pgTable("retailers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  retailerId: integer("retailer_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull()
}, t => ({
  byRetailer: index("stores_retailer_idx").on(t.retailerId)
}));

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  retailerId: integer("retailer_id").notNull(),
  sku: varchar("sku", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  barcode: varchar("barcode", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow()
}, t => ({
  byRetailer: index("products_retailer_idx").on(t.retailerId),
  byBarcode: index("products_barcode_idx").on(t.barcode)
}));

export const storePrices = pgTable("store_prices", {
  id: serial("id").primaryKey(),
  retailerId: integer("retailer_id").notNull(),
  storeId: integer("store_id").notNull(),
  productId: integer("product_id").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  effectiveFrom: timestamp("effective_from").defaultNow()
}, t => ({
  byStore: index("store_prices_store_idx").on(t.storeId),
  byProduct: index("store_prices_product_idx").on(t.productId)
}));

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  retailerId: integer("retailer_id"),
  actorUserId: integer("actor_user_id"),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: integer("entity_id"),
  action: varchar("action", { length: 50 }).notNull(), // create/update/delete
  at: timestamp("at").defaultNow(),
  data: varchar("data", { length: 4000 })
});