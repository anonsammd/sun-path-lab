import { hash, verify } from '@node-rs/argon2';
import crypto from 'node:crypto';
import { db } from '../db';
import { admins, sessions } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';

export const SESSION_COOKIE_NAME = 'spl_admin_session';
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// Secure Argon2id password hashing
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

// Secure Argon2id password verification
export async function verifyPassword(password: string, hashStr: string): Promise<boolean> {
  try {
    return await verify(hashStr, password);
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

// Generate cryptographically secure random session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create new authenticated session in PostgreSQL
export async function createSession(
  adminId: string,
  ipAddress: string = 'unknown',
  userAgent: string = 'unknown'
): Promise<string> {
  const sessionId = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: sessionId,
    adminId,
    ipAddress,
    userAgent,
    expiresAt,
    createdAt: new Date(),
  });

  return sessionId;
}

// Validate session from incoming request
export async function validateSession(sessionId: string | null | undefined) {
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length !== 64) {
    return null;
  }

  const now = new Date();
  const rows = await db
    .select({
      session: sessions,
      admin: {
        id: admins.id,
        email: admins.email,
        name: admins.name,
        role: admins.role,
        createdAt: admins.createdAt,
      },
    })
    .from(sessions)
    .innerJoin(admins, eq(sessions.adminId, admins.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

// Invalidate / Destroy session upon logout
export async function destroySession(sessionId: string) {
  if (!sessionId) return;
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
