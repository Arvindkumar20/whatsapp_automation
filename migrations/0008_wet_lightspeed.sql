CREATE TABLE "instagram_app_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" text NOT NULL,
	"app_secret" text NOT NULL,
	"redirect_uri" text NOT NULL,
	"webhook_verify_token" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_by" varchar DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "instagram_accounts" ALTER COLUMN "facebook_page_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "instagram_accounts" ADD COLUMN "instagram_user_id" text;--> statement-breakpoint
ALTER TABLE "instagram_accounts" ADD COLUMN "auth_method" varchar(20) DEFAULT 'instagram_login' NOT NULL;--> statement-breakpoint
ALTER TABLE "instagram_accounts" ADD COLUMN "token_expires_at" timestamp with time zone;