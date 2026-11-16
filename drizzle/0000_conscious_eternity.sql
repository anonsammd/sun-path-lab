CREATE TABLE "admins" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"details" jsonb,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"url" text NOT NULL,
	"format" text,
	"width" integer,
	"height" integer,
	"bytes" integer,
	"alt_text" text,
	"caption" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"regular_price" numeric(10, 2),
	"discount_price" numeric(10, 2),
	"tests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"category_id" text,
	"image_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"sample_type" text DEFAULT 'Blood Sample',
	"fasting_required" text DEFAULT 'Fasting not required',
	"report_time" text DEFAULT 'Same Day / 24 Hours',
	"seo_title" text,
	"seo_description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "packages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"site_name" text DEFAULT 'Sun Path Lab' NOT NULL,
	"site_tagline" text DEFAULT 'Pathology & Diagnostic Testing Centre' NOT NULL,
	"primary_phone" text DEFAULT '09300755303' NOT NULL,
	"secondary_phone" text DEFAULT '7000719306',
	"landline" text DEFAULT '0761-3562885',
	"whatsapp_number" text DEFAULT '9300755303' NOT NULL,
	"address" text DEFAULT 'Shop No. 2, Sidhhi Vinayak Plaza, in front of Jabalpur Hospital Old Gate, Russell Chowk, Jabalpur, MP - 482001' NOT NULL,
	"landmark" text DEFAULT 'Opposite Jabalpur Hospital Old Gate, Russell Chowk' NOT NULL,
	"plus_code" text DEFAULT '5W6P+XC, Jabalpur, Madhya Pradesh' NOT NULL,
	"google_maps_url" text DEFAULT 'https://maps.google.com/?q=Shop+2+Sidhhi+Vinayak+Plaza+Russell+Chowk+Jabalpur',
	"operating_hours" text DEFAULT 'Open until 10:00 PM' NOT NULL,
	"notice_banner" text DEFAULT 'Home sample collection available across Jabalpur. Call or WhatsApp to schedule.',
	"is_notice_banner_active" boolean DEFAULT true NOT NULL,
	"hero_headline" text DEFAULT 'Reliable Pathology & Blood Testing in Jabalpur' NOT NULL,
	"hero_subheadline" text DEFAULT 'Serving Russell Chowk & Jabalpur with accurate blood tests, thyroid & iron panels, health packages, and convenient doorstep home sample collection.' NOT NULL,
	"about_overview" text DEFAULT 'Sun Path Lab is a dedicated pathology and diagnostic testing centre situated at Russell Chowk, Jabalpur. We offer a comprehensive range of clinical pathology examinations, blood testing, and prompt home collection services designed for patient comfort and diagnostic reliability.' NOT NULL,
	"home_collection_info" text DEFAULT 'Our trained phlebotomists follow strict hygienic collection standards and visit your doorstep punctually across Jabalpur.' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;