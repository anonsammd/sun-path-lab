import { db } from '../db';
import { siteSettings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { siteConfig } from '../config/site';

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function formatCurrency(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return 'Contact Lab';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return 'Contact Lab';
  return `₹${numeric.toLocaleString('en-IN')}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export async function getCachedSiteSettings() {
  try {
    const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default')).limit(1);
    if (rows.length > 0) {
      return rows[0];
    }
  } catch (error) {
    console.error('Error fetching site settings from DB:', error);
  }

  // Fallback default
  return {
    id: 'default',
    siteName: siteConfig.name,
    siteTagline: siteConfig.tagline,
    primaryPhone: siteConfig.contact.primaryPhone,
    secondaryPhone: siteConfig.contact.secondaryPhone,
    landline: siteConfig.contact.landline,
    whatsappNumber: siteConfig.contact.whatsappNumber,
    address: siteConfig.address.street + ', ' + siteConfig.address.area + ', ' + siteConfig.address.city,
    landmark: siteConfig.address.landmark,
    plusCode: siteConfig.address.plusCode,
    googleMapsUrl: 'https://maps.google.com/?q=Shop+2+Sidhhi+Vinayak+Plaza+Russell+Chowk+Jabalpur',
    operatingHours: siteConfig.hours.status,
    noticeBanner: 'Doorstep home sample collection available across Jabalpur. Call or WhatsApp to schedule.',
    isNoticeBannerActive: true,
    heroHeadline: 'Reliable Pathology & Blood Testing in Jabalpur',
    heroSubheadline: 'Serving Russell Chowk & Jabalpur with accurate blood tests, thyroid & iron panels, health packages, and doorstep collection.',
    aboutOverview: siteConfig.description,
    homeCollectionInfo: 'Our trained phlebotomists follow strict hygienic collection standards across Jabalpur.',
    updatedAt: new Date(),
  };
}
