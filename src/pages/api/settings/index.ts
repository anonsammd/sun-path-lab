import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { siteSettings, auditLogs } from '../../../db/schema';
import { requireAdmin } from '../../../lib/admin-guard';
import { nanoid } from 'nanoid';

export const prerender = false;

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await requireAdmin(cookies, request);
    const body = await request.json();

    const updateData: any = {
      updatedAt: new Date(),
    };

    const allowedFields = [
      'siteName',
      'siteTagline',
      'primaryPhone',
      'secondaryPhone',
      'landline',
      'whatsappNumber',
      'address',
      'landmark',
      'plusCode',
      'googleMapsUrl',
      'operatingHours',
      'noticeBanner',
      'isNoticeBannerActive',
      'heroHeadline',
      'heroSubheadline',
      'aboutOverview',
      'homeCollectionInfo',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    await db
      .insert(siteSettings)
      .values({
        id: 'default',
        ...updateData,
      })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: updateData,
      });

    // Audit log
    await db.insert(auditLogs).values({
      id: 'log_' + nanoid(12),
      adminId: auth.admin.id,
      action: 'UPDATE_SETTINGS',
      entityType: 'settings',
      entityId: 'default',
      details: { updatedFields: Object.keys(updateData) },
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ success: true, settings: updateData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Update settings error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
