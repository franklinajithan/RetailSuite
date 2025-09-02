CREATE TABLE "user_prefs" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"nav_collapsed" boolean DEFAULT false NOT NULL,
	"density" text DEFAULT 'comfortable' NOT NULL,
	"analytics_opt_in" boolean DEFAULT false NOT NULL,
	"widgets" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_keys" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invitations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "permissions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "role_permissions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_group_members" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_groups" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "api_keys" CASCADE;--> statement-breakpoint
DROP TABLE "invitations" CASCADE;--> statement-breakpoint
DROP TABLE "permissions" CASCADE;--> statement-breakpoint
DROP TABLE "role_permissions" CASCADE;--> statement-breakpoint
DROP TABLE "user_group_members" CASCADE;--> statement-breakpoint
DROP TABLE "user_groups" CASCADE;--> statement-breakpoint
ALTER TABLE "auth_logs" DROP CONSTRAINT "auth_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_logs" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "auth_logs" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "auth_logs" ALTER COLUMN "event" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "key" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'user_profiles'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "user_profiles" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "phone" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "role_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_pk" PRIMARY KEY("user_id");--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "assigned_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_prefs" ADD CONSTRAINT "user_prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_logs" ADD CONSTRAINT "auth_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_logs" DROP COLUMN "ip";--> statement-breakpoint
ALTER TABLE "auth_logs" DROP COLUMN "ua";