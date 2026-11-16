import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { packages, auditLogs } from '../../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAdmin } from '../../../lib/admin-guard';
import { slugify } from '../../../lib/utils';
import { nanoid } from 'nanoid';

export const prerender = false;

// GET /api/packages - List published (or all for admin)
export const GET: APIRoute = async ({ url }) => {
  try {
    const categoryId = url.searchParams.get('category');
    const includeUnpublished = url.searchParams.get('all') === 'true';

    const conditions = [eq(packages.isDeleted, false)];
    if (!includeUnpublished) {
      conditions.push(eq(packages.isPublished, true));
    }
    if (categoryId) {
      conditions.push(eq(packages.categoryId, categoryId));
    }

    const rows = await db
      .select()
      .from(packages)
      .where(and(...conditions))
      .orderBy(desc(packages.isFeatured), packages.sortOrder, desc(packages.createdAt));

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Fetch packages error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch packages' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/packages - Create package (Admin only)
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await requireAdmin(cookies, request);
    const body = await request.json();

    const name = (body.name || '').trim();
    if (!name) {
      return new Response(JSON.stringify({ error: 'Package name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const description = (body.description || '').trim();
    if (!description) {
      return new Response(JSON.stringify({ error: 'Package description is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Auto-generate slug if not provided
    let slug = slugify(body.slug || name);
    if (!slug) slug = 'pkg-' + nanoid(8);

    // Ensure unique slug
    const existing = await db
      .select({ id: packages.id })
      .from(packages)
      .where(and(eq(packages.slug, slug), eq(packages.isDeleted, false)))
      .limit(1);

    if (existing.length > 0) {
      slug = `${slug}-${nanoid(4).toLowerCase()}`;
    }

    const packageId = 'pkg_' + nanoid(12);
    const testsArray = Array.isArray(body.tests)
      ? body.tests.map((t: any) => String(t).trim()).filter(Boolean)
      : [];

    const newPackage = {
      id: packageId,
      name,
      slug,
      description,
      regularPrice: body.regularPrice ? String(body.regularPrice) : null,
      discountPrice: body.discountPrice ? String(body.discountPrice) : null,
      tests: testsArray,
      categoryId: body.categoryId || null,
      imageUrl: body.imageUrl || null,
      isFeatured: Boolean(body.isFeatured),
      isPublished: body.isPublished !== false,
      sampleType: body.sampleType || 'Blood Sample',
      fastingRequired: body.fastingRequired || 'Fasting not required',
      reportTime: body.reportTime || 'Same Day / 24 Hours',
      seoTitle: body.seoTitle || `${name} in Jabalpur | Sun Path Lab`,
      seoDescription:
        body.seoDescription ||
        `Book ${name} at Sun Path Lab, Russell Chowk, Jabalpur. Accurate pathology testing and doorstep sample collection.`,
      sortOrder: parseInt(body.sortOrder, 10) || 0,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(packages).values(newPackage);

    // Audit log
    await db.insert(auditLogs).values({
      id: 'log_' + nanoid(12),
      adminId: auth.admin.id,
      action: 'CREATE_PACKAGE',
      entityType: 'package',
      entityId: packageId,
      details: { name, slug },
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ success: true, package: newPackage }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Create package error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create package' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
