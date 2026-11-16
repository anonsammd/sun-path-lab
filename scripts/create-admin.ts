import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { hashPassword } from '../src/lib/auth';
import { db } from '../src/db';
import { admins } from '../src/db/schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('\n======================================================');
  console.log('   SUN PATH LAB — SECURE OWNER ACCOUNT BOOTSTRAP');
  console.log('======================================================\n');

  // Parse any command line flags: --email=... --password=... --name=...
  const args = process.argv.slice(2);
  let name = '';
  let email = '';
  let password = '';

  for (const arg of args) {
    if (arg.startsWith('--name=')) name = arg.split('=')[1].trim();
    if (arg.startsWith('--email=')) email = arg.split('=')[1].trim().toLowerCase();
    if (arg.startsWith('--password=')) password = arg.split('=')[1].trim();
  }

  const rl = readline.createInterface({ input, output });

  try {
    if (!name) {
      name = (await rl.question('Enter Owner Full Name: ')).trim();
    }
    if (!name) {
      console.error('❌ Name cannot be empty.');
      process.exit(1);
    }

    if (!email) {
      email = (await rl.question('Enter Owner Email: ')).trim().toLowerCase();
    }
    if (!email || !email.includes('@')) {
      console.error('❌ Valid email address is required.');
      process.exit(1);
    }

    // Check if admin already exists
    const existing = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (existing.length > 0) {
      console.log(`ℹ️ An administrator with email "${email}" already exists.`);
      process.exit(0);
    }

    if (!password) {
      password = (await rl.question('Enter Secure Master Password (min 8 chars): ')).trim();
      const confirmPassword = (await rl.question('Confirm Master Password: ')).trim();
      if (password !== confirmPassword) {
        console.error('❌ Passwords do not match.');
        process.exit(1);
      }
    }

    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters long.');
      process.exit(1);
    }

    console.log('\n⏳ Hashing password with Argon2id and generating credentials in PostgreSQL...');
    const passwordHash = await hashPassword(password);
    const adminId = 'adm_' + nanoid(12);

    await db.insert(admins).values({
      id: adminId,
      name,
      email,
      passwordHash,
      role: 'owner',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('\n✅ Owner account created successfully in Neon PostgreSQL!');
    console.log(`   Admin ID : ${adminId}`);
    console.log(`   Name     : ${name}`);
    console.log(`   Email    : ${email}`);
    console.log(`   Role     : owner`);
    console.log('\nYou can now log in at /admin/login');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Failed to create owner account:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
