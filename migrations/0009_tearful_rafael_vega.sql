CREATE TABLE "instagram_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" varchar,
	"account_id" varchar,
	"created_by" varchar,
	"caption" text,
	"media_type" varchar(20) NOT NULL,
	"media_urls" jsonb DEFAULT '[]'::jsonb,
	"thumbnail_url" text,
	"hashtags" jsonb DEFAULT '[]'::jsonb,
	"first_comment" text,
	"location_id" text,
	"collaborators" jsonb DEFAULT '[]'::jsonb,
	"publish_type" varchar(20) DEFAULT 'draft',
	"scheduled_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft',
	"instagram_media_id" text,
	"instagram_post_id" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "instagram_posts" ADD CONSTRAINT "instagram_posts_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_posts" ADD CONSTRAINT "instagram_posts_account_id_instagram_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."instagram_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_posts" ADD CONSTRAINT "instagram_posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "instagram_posts_channel_idx" ON "instagram_posts" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "instagram_posts_account_idx" ON "instagram_posts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "instagram_posts_status_idx" ON "instagram_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "instagram_posts_schedule_idx" ON "instagram_posts" USING btree ("scheduled_at");