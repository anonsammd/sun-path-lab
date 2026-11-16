import crypto from 'node:crypto';
import * as dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.SESSION_SECRET || 'spl-fallback-session-secret-change-in-prod';

export function generateCsrfToken(sessionId: string): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${sessionId}:${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

export function verifyCsrfToken(sessionId: string, token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, clientSignature] = parts;
  const time = parseInt(timestamp, 10);

  // Expire CSRF token after 24 hours
  if (isNaN(time) || Date.now() - time > 1000 * 60 * 60 * 24) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', SECRET)
    .update(`${sessionId}:${timestamp}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(clientSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}
