import * as dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_POOL || process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL;
  console.log('Connecting to Neon URL starting with:', url ? url.substring(0, 20) + '...' : 'NONE');
  if (!url) {
    throw new Error('No DB URL');
  }
  const sql = neon(url);
  const rows = await sql`SELECT 1 as connected, current_database() as db_name`;
  console.log('Connected successfully:', rows);
  process.exit(0);
}

main().catch(err => {
  console.error('Connection failed:', err);
  process.exit(1);
});
