import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { admins } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '../../../lib/auth';
import { checkLoginRateLimit, recordFailedLogin, clearLoginRateLimit } from '../../../lib/rate-limit';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const ip = clientAddress || request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. Check Rate Limit
  const rateLimit = checkLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: `Too many login attempts. Please try again after ${rateLimit.retryAfterSeconds} seconds.`,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch admin user from PostgreSQL
    const rows = await db.select().from(admins).where(eq(admins.email, email)).limit(1);

    if (rows.length === 0) {
      recordFailedLogin(ip);
      return new Response(
        JSON.stringify({ error: 'Invalid email or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const admin = rows[0];

    // 3. Verify Argon2id Password Hash
    const isMatch = await verifyPassword(password, admin.passwordHash);
    if (!isMatch) {
      recordFailedLogin(ip);
      return new Response(
        JSON.stringify({ error: 'Invalid email or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Clear Rate Limit & Create Session
    clearLoginRateLimit(ip);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const sessionId = await createSession(admin.id, ip, userAgent);

    // 5. Set Secure HTTP-only Cookie
    cookies.set(SESSION_COOKIE_NAME, sessionId, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD || process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Authentication successful',
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error during authentication.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
