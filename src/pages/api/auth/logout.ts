import type { APIRoute } from 'astro';
import { destroySession, SESSION_COOKIE_NAME } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await destroySession(sessionId);
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await destroySession(sessionId);
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
  }
  return redirect('/admin/login', 302);
};
