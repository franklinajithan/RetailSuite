CREATE TABLE "user_prefs" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"favorites" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"emoji_map" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sidebar_mode" varchar(20) DEFAULT 'compact' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_prefs" ADD CONSTRAINT "user_prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;