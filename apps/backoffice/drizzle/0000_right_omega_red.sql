CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"retailer_id" integer,
	"actor_user_id" integer,
	"entity" varchar(50) NOT NULL,
	"entity_id" integer,
	"action" varchar(50) NOT NULL,
	"at" timestamp DEFAULT now(),
	"data" varchar(4000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"retailer_id" integer NOT NULL,
	"sku" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"barcode" varchar(64),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "retailers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"retailer_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"effective_from" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"retailer_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'retailer_admin' NOT NULL,
	"retailer_id" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_retailer_idx" ON "products" USING btree ("retailer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_barcode_idx" ON "products" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "store_prices_store_idx" ON "store_prices" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "store_prices_product_idx" ON "store_prices" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stores_retailer_idx" ON "stores" USING btree ("retailer_id");