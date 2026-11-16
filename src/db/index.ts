import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';
dotenv.config();

function getConnectionString(): string {
  const envMeta = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
  const conn =
    process.env.DATABASE_POOL ||
    process.env.DATABASE_URL ||
    process.env.DIRECT_DATABASE_URL ||
    envMeta?.DATABASE_POOL ||
    envMeta?.DATABASE_URL ||
    envMeta?.DIRECT_DATABASE_URL ||
    '';
  return (conn || '').trim();
}

const connectionString = getConnectionString();

// Safe fallback connection URL to prevent module initialization crashes when env vars are late or missing
const safeConnectionString =
  connectionString || 'postgresql://placeholder:placeholder@ep-placeholder.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

if (!connectionString) {
  console.warn('⚠️ Neon PostgreSQL connection string is missing from environment. Using resilient fallback.');
}

const client = neon(safeConnectionString);
export const db = drizzle(client, { schema });
export { schema };
