import type { APIRoute } from 'astro';
import { requireAdmin } from '../../../lib/admin-guard';
import { generateSignedUploadParams, isCloudinaryConfigured } from '../../../lib/cloudinary';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    await requireAdmin(cookies, request);

    if (!isCloudinaryConfigured()) {
      return new Response(
        JSON.stringify({
          error:
            'Cloudinary is not fully configured on the server. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_SECRET_KEY in .env.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const folder = body.folder || 'sunpathlab';
    const params = generateSignedUploadParams(folder);

    return new Response(JSON.stringify(params), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Sign upload error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate upload signature' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
