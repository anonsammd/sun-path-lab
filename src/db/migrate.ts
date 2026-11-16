import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './index';

async function runMigration() {
  console.log('⏳ Running database migrations on Neon PostgreSQL...');
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
