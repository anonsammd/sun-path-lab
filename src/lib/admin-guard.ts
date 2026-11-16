import type { AstroCookies } from 'astro';
import { validateSession, SESSION_COOKIE_NAME } from './auth';
import { verifyCsrfToken } from './csrf';

export async function requireAdmin(cookies: AstroCookies, request?: Request) {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) {
    throw new Response(JSON.stringify({ error: 'Unauthorized: Session missing' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const authData = await validateSession(sessionId);
  if (!authData) {
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    throw new Response(JSON.stringify({ error: 'Unauthorized: Session expired or invalid' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate CSRF token for state-changing methods (POST, PUT, DELETE, PATCH)
  if (request && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token');
    const isValidCsrf = verifyCsrfToken(sessionId, csrfToken);
    if (!isValidCsrf) {
      throw new Response(
        JSON.stringify({ error: 'Forbidden: Invalid or missing CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return authData;
}
