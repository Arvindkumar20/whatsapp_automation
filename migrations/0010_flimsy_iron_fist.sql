CREATE TABLE "instagram_automation_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"automation_id" varchar NOT NULL,
	"comment_id" text NOT NULL,
	"instagram_user_id" text NOT NULL,
	"username" text,
	"comment_text" text,
	"execution_status" varchar(30) NOT NULL,
	"error" text,
	"executed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "instagram_automations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"channel_id" varchar NOT NULL,
	"account_id" varchar NOT NULL,
	"trigger_type" varchar(30) DEFAULT 'new_comment' NOT NULL,
	"keywords" jsonb DEFAULT '[]',
	"match_type" varchar(20) DEFAULT 'contains' NOT NULL,
	"case_insensitive" boolean DEFAULT true NOT NULL,
	"reply_comment" boolean DEFAULT false NOT NULL,
	"reply_comment_message" text,
	"send_dm" boolean DEFAULT false NOT NULL,
	"dm_message" text,
	"delay_seconds" integer DEFAULT 0 NOT NULL,
	"run_once" boolean DEFAULT true NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_by" varchar,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "instagram_automation_logs" ADD CONSTRAINT "instagram_automation_logs_automation_id_instagram_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."instagram_automations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_automations" ADD CONSTRAINT "instagram_automations_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_automations" ADD CONSTRAINT "instagram_automations_account_id_instagram_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."instagram_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_automations" ADD CONSTRAINT "instagram_automations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "instagram_automation_logs_automation_idx" ON "instagram_automation_logs" USING btree ("automation_id");--> statement-breakpoint
CREATE INDEX "instagram_automation_logs_comment_idx" ON "instagram_automation_logs" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "instagram_automation_logs_user_idx" ON "instagram_automation_logs" USING btree ("instagram_user_id");--> statement-breakpoint
CREATE INDEX "instagram_automations_channel_idx" ON "instagram_automations" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "instagram_automations_account_idx" ON "instagram_automations" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "instagram_automations_status_idx" ON "instagram_automations" USING btree ("status");