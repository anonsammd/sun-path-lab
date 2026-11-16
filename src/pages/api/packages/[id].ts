import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { packages, auditLogs } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '../../../lib/admin-guard';
import { slugify } from '../../../lib/utils';
import { nanoid } from 'nanoid';

export const prerender = false;

// PUT /api/packages/[id] - Update existing package
export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const auth = await requireAdmin(cookies, request);
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Package ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    // Check if package exists
    const existingRows = await db
      .select()
      .from(packages)
      .where(and(eq(packages.id, id), eq(packages.isDeleted, false)))
      .limit(1);

    if (existingRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Package not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const current = existingRows[0];
    let slug = body.slug ? slugify(body.slug) : current.slug;

    // Check if new slug conflicts with another package
    if (slug !== current.slug) {
      const conflict = await db
        .select({ id: packages.id })
        .from(packages)
        .where(and(eq(packages.slug, slug), eq(packages.isDeleted, false)))
        .limit(1);

      if (conflict.length > 0 && conflict[0].id !== id) {
        slug = `${slug}-${nanoid(4).toLowerCase()}`;
      }
    }

    const testsArray = Array.isArray(body.tests)
      ? body.tests.map((t: any) => String(t).trim()).filter(Boolean)
      : current.tests;

    const updateData = {
      name: body.name !== undefined ? String(body.name).trim() : current.name,
      slug,
      description:
        body.description !== undefined ? String(body.description).trim() : current.description,
      regularPrice: body.regularPrice !== undefined ? (body.regularPrice ? String(body.regularPrice) : null) : current.regularPrice,
      discountPrice: body.discountPrice !== undefined ? (body.discountPrice ? String(body.discountPrice) : null) : current.discountPrice,
      tests: testsArray,
      categoryId: body.categoryId !== undefined ? body.categoryId : current.categoryId,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl : current.imageUrl,
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : current.isFeatured,
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : current.isPublished,
      sampleType: body.sampleType !== undefined ? body.sampleType : current.sampleType,
      fastingRequired: body.fastingRequired !== undefined ? body.fastingRequired : current.fastingRequired,
      reportTime: body.reportTime !== undefined ? body.reportTime : current.reportTime,
      seoTitle: body.seoTitle !== undefined ? body.seoTitle : current.seoTitle,
      seoDescription:
        body.seoDescription !== undefined ? body.seoDescription : current.seoDescription,
      sortOrder:
        body.sortOrder !== undefined ? parseInt(body.sortOrder, 10) || 0 : current.sortOrder,
      updatedAt: new Date(),
    };

    await db.update(packages).set(updateData).where(eq(packages.id, id));

    // Audit log
    await db.insert(auditLogs).values({
      id: 'log_' + nanoid(12),
      adminId: auth.admin.id,
      action: 'UPDATE_PACKAGE',
      entityType: 'package',
      entityId: id,
      details: { changes: Object.keys(body) },
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ success: true, package: { id, ...updateData } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Update package error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update package' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/packages/[id] - Soft delete package
export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  try {
    const auth = await requireAdmin(cookies, request);
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Package ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Soft-delete package
    await db
      .update(packages)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(packages.id, id));

    // Audit log
    await db.insert(auditLogs).values({
      id: 'log_' + nanoid(12),
      adminId: auth.admin.id,
      action: 'DELETE_PACKAGE',
      entityType: 'package',
      entityId: id,
      details: { softDeleted: true },
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ success: true, message: 'Package safely deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Delete package error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete package' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
