CREATE TABLE "ecommerce_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" varchar NOT NULL,
	"channel_id" varchar NOT NULL,
	"platform" varchar(20) NOT NULL,
	"external_product_id" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" numeric(12, 2),
	"currency" varchar(10),
	"image_url" text,
	"product_url" text,
	"status" varchar(20) DEFAULT 'active',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"last_synced_at" timestamp with time zone,
	CONSTRAINT "ecommerce_products_external_id_unique" UNIQUE("store_id","external_product_id")
);
--> statement-breakpoint
ALTER TABLE "ecommerce_products" ADD CONSTRAINT "ecommerce_products_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ecommerce_products_store_idx" ON "ecommerce_products" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "ecommerce_products_channel_idx" ON "ecommerce_products" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "ecommerce_products_platform_idx" ON "ecommerce_products" USING btree ("platform");