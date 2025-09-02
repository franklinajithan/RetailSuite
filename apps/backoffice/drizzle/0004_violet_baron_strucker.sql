ALTER TABLE "api_keys" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "auth_logs" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "user_group_members" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "user_id" SET DATA TYPE integer;