import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { mediaAssets, packages } from '../../../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAdmin } from '../../../lib/admin-guard';
import { deleteCloudinaryImage } from '../../../lib/cloudinary';
import { nanoid } from 'nanoid';

export const prerender = false;

// GET /api/media - List media assets
export const GET: APIRoute = async () => {
  try {
    const assets = await db
      .select()
      .from(mediaAssets)
      .orderBy(desc(mediaAssets.createdAt));
    return new Response(JSON.stringify(assets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('List media error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch media assets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/media - Register new media asset
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    await requireAdmin(cookies, request);
    const body = await request.json();

    if (!body.url || !body.publicId) {
      return new Response(JSON.stringify({ error: 'url and publicId are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const assetId = 'ast_' + nanoid(12);
    const newAsset = {
      id: assetId,
      publicId: body.publicId,
      url: body.url,
      format: body.format || 'jpg',
      width: body.width ? parseInt(body.width, 10) : null,
      height: body.height ? parseInt(body.height, 10) : null,
      bytes: body.bytes ? parseInt(body.bytes, 10) : null,
      altText: body.altText || 'Sun Path Lab asset',
      caption: body.caption || '',
      createdAt: new Date(),
    };

    await db.insert(mediaAssets).values(newAsset);

    return new Response(JSON.stringify({ success: true, asset: newAsset }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Save media asset error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save media asset' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/media - Delete media asset if not in use
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    await requireAdmin(cookies, request);
    const body = await request.json();
    const { id, publicId } = body;

    if (!id && !publicId) {
      return new Response(JSON.stringify({ error: 'id or publicId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if asset is used by any package
    const assetRows = await db
      .select()
      .from(mediaAssets)
      .where(id ? eq(mediaAssets.id, id) : eq(mediaAssets.publicId, publicId))
      .limit(1);

    if (assetRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Asset not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const asset = assetRows[0];

    // Check if referenced by active package
    const packageUses = await db
      .select({ id: packages.id, name: packages.name })
      .from(packages)
      .where(and(eq(packages.imageUrl, asset.url), eq(packages.isDeleted, false)))
      .limit(1);

    if (packageUses.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Cannot delete image: It is currently assigned to package "${packageUses[0].name}". Please reassign the package image first.`,
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Attempt Cloudinary deletion if it's a Cloudinary asset
    if (!asset.publicId.startsWith('local:')) {
      try {
        await deleteCloudinaryImage(asset.publicId);
      } catch (err) {
        console.warn('Cloudinary remote deletion warning:', err);
      }
    }

    await db.delete(mediaAssets).where(eq(mediaAssets.id, asset.id));

    return new Response(JSON.stringify({ success: true, message: 'Asset deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Delete media error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete asset' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
