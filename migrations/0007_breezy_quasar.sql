CREATE TABLE "instagram_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"channel_id" varchar,
	"username" text NOT NULL,
	"instagram_business_id" text NOT NULL,
	"facebook_page_id" text NOT NULL,
	"access_token" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"connection_status" varchar(20) DEFAULT 'connected',
	"webhook_status" varchar(20) DEFAULT 'unknown',
	"access_token_status" varchar(20) DEFAULT 'valid',
	"permissions_status" varchar(20) DEFAULT 'granted',
	"permissions" jsonb DEFAULT '[]',
	"enabled_features" jsonb DEFAULT '[]',
	"health_error" text,
	"last_health_check" timestamp with time zone,
	"connected_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "instagram_accounts_business_id_unique" UNIQUE("instagram_business_id")
);
--> statement-breakpoint
ALTER TABLE "instagram_accounts" ADD CONSTRAINT "instagram_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_accounts" ADD CONSTRAINT "instagram_accounts_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "instagram_accounts_user_idx" ON "instagram_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "instagram_accounts_channel_idx" ON "instagram_accounts" USING btree ("channel_id");