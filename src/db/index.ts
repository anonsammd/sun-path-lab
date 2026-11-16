import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString =
  process.env.DATABASE_POOL ||
  process.env.DATABASE_URL ||
  process.env.DIRECT_DATABASE_URL ||
  '';

if (!connectionString) {
  console.warn('⚠️ Neon PostgreSQL connection string is missing from environment.');
}

const client = neon(connectionString);
export const db = drizzle(client, { schema });
export { schema };
