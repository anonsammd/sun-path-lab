import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { packages, categories, siteSettings } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '../../../lib/admin-guard';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    await requireAdmin(cookies);
    const format = url.searchParams.get('format') || 'json';

    const [allPackages, allCategories, settings] = await Promise.all([
      db.select().from(packages).where(eq(packages.isDeleted, false)),
      db.select().from(categories),
      db.select().from(siteSettings).where(eq(siteSettings.id, 'default')),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      siteName: 'Sun Path Lab',
      settings: settings[0] || null,
      categories: allCategories,
      packages: allPackages,
    };

    if (format === 'csv') {
      // Export packages as CSV
      const headers = ['id', 'name', 'slug', 'regularPrice', 'discountPrice', 'sampleType', 'isPublished', 'isFeatured', 'tests'];
      const csvRows = [headers.join(',')];

      for (const p of allPackages) {
        const testsStr = Array.isArray(p.tests) ? p.tests.join('; ') : '';
        const row = [
          `"${p.id}"`,
          `"${(p.name || '').replace(/"/g, '""')}"`,
          `"${p.slug}"`,
          `"${p.regularPrice || ''}"`,
          `"${p.discountPrice || ''}"`,
          `"${p.sampleType || ''}"`,
          p.isPublished ? 'true' : 'false',
          p.isFeatured ? 'true' : 'false',
          `"${testsStr.replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(','));
      }

      return new Response(csvRows.join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="sunpathlab-packages-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default JSON export
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="sunpathlab-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: 'Failed to export database content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
