import { pgTable, text, timestamp, boolean, integer, numeric, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Admins table (No public registration, created strictly via CLI bootstrap)
export const admins = pgTable('admins', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('owner'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Admin Sessions (Server-side session management with HttpOnly cookies)
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  adminId: text('admin_id').notNull().references(() => admins.id, { onDelete: 'cascade' }),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Diagnostic Package Categories
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Diagnostic Packages
export const packages = pgTable('packages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  regularPrice: numeric('regular_price', { precision: 10, scale: 2 }),
  discountPrice: numeric('discount_price', { precision: 10, scale: 2 }),
  tests: jsonb('tests').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  imageUrl: text('image_url'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  sampleType: text('sample_type').default('Blood Sample'),
  fastingRequired: text('fasting_required').default('Fasting not required'),
  reportTime: text('report_time').default('Same Day / 24 Hours'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Site Settings & CMS Content
export const siteSettings = pgTable('site_settings', {
  id: text('id').primaryKey().default('default'),
  siteName: text('site_name').notNull().default('Sun Path Lab'),
  siteTagline: text('site_tagline').notNull().default('Pathology & Diagnostic Testing Centre'),
  primaryPhone: text('primary_phone').notNull().default('09300755303'),
  secondaryPhone: text('secondary_phone').default('7000719306'),
  landline: text('landline').default('0761-3562885'),
  whatsappNumber: text('whatsapp_number').notNull().default('9300755303'),
  address: text('address').notNull().default('Shop No. 2, Sidhhi Vinayak Plaza, in front of Jabalpur Hospital Old Gate, Russell Chowk, Jabalpur, MP - 482001'),
  landmark: text('landmark').notNull().default('Opposite Jabalpur Hospital Old Gate, Russell Chowk'),
  plusCode: text('plus_code').notNull().default('5W6P+XC, Jabalpur, Madhya Pradesh'),
  googleMapsUrl: text('google_maps_url').default('https://maps.google.com/?q=Shop+2+Sidhhi+Vinayak+Plaza+Russell+Chowk+Jabalpur'),
  operatingHours: text('operating_hours').notNull().default('Open until 10:00 PM'),
  noticeBanner: text('notice_banner').default('Home sample collection available across Jabalpur. Call or WhatsApp to schedule.'),
  isNoticeBannerActive: boolean('is_notice_banner_active').default(true).notNull(),
  heroHeadline: text('hero_headline').notNull().default('Reliable Pathology & Blood Testing in Jabalpur'),
  heroSubheadline: text('hero_subheadline').notNull().default('Serving Russell Chowk & Jabalpur with accurate blood tests, thyroid & iron panels, health packages, and convenient doorstep home sample collection.'),
  aboutOverview: text('about_overview').notNull().default('Sun Path Lab is a dedicated pathology and diagnostic testing centre situated at Russell Chowk, Jabalpur. We offer a comprehensive range of clinical pathology examinations, blood testing, and prompt home collection services designed for patient comfort and diagnostic reliability.'),
  homeCollectionInfo: text('home_collection_info').notNull().default('Our trained phlebotomists follow strict hygienic collection standards and visit your doorstep punctually across Jabalpur.'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Media Assets (Cloudinary & Local Asset Registry)
export const mediaAssets = pgTable('media_assets', {
  id: text('id').primaryKey(),
  publicId: text('public_id').notNull().unique(),
  url: text('url').notNull(),
  format: text('format'),
  width: integer('width'),
  height: integer('height'),
  bytes: integer('bytes'),
  altText: text('alt_text'),
  caption: text('caption'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Audit Logs for Admin Actions
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  adminId: text('admin_id').references(() => admins.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
