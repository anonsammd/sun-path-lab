import type { APIRoute } from 'astro';
import { db } from '../db';
import { packages } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { siteConfig } from '../config/site';

export const prerender = false;

export const GET: APIRoute = async () => {
  const siteUrl = siteConfig.url;

  // Static site routes
  const staticRoutes = [
    { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${siteUrl}/about`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${siteUrl}/packages`, changefreq: 'daily', priority: '0.9' },
    { loc: `${siteUrl}/services`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${siteUrl}/home-collection`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${siteUrl}/contact`, changefreq: 'monthly', priority: '0.7' },
  ];

  // Dynamic package routes from PostgreSQL
  const dbPackages = await db
    .select({ slug: packages.slug, updatedAt: packages.updatedAt })
    .from(packages)
    .where(and(eq(packages.isDeleted, false), eq(packages.isPublished, true)));

  const packageRoutes = dbPackages.map((p) => ({
    loc: `${siteUrl}/packages/${p.slug}`,
    lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const allUrls = [...staticRoutes, ...packageRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${'lastmod' in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
