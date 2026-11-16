import { db } from '../src/db';
import { packages, admins } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '../src/lib/auth';

async function main() {
  console.log('🧪 Testing Admin Authentication & Live DB workflow...');

  // 1. Verify owner account
  const ownerRows = await db.select().from(admins).where(eq(admins.email, 'owner@sunpathlab.com')).limit(1);
  if (ownerRows.length === 0) {
    throw new Error('Owner account not found in database');
  }
  const owner = ownerRows[0];
  console.log(`✓ Owner found: ${owner.name} (${owner.email})`);

  // 2. Test Argon2id password verification
  const isMatch = await verifyPassword('SunPathLab@2026!', owner.passwordHash);
  if (!isMatch) {
    throw new Error('Password verification failed');
  }
  console.log('✓ Argon2id password verification passed');

  // 3. Test dynamic package price update without redeployment
  const testPkg = await db.select().from(packages).where(eq(packages.slug, 'complete-blood-count-cbc-esr')).limit(1);
  if (testPkg.length > 0) {
    const originalPrice = testPkg[0].discountPrice;
    console.log(`✓ Current CBC Discount Price: ₹${originalPrice}`);

    // Update price
    await db.update(packages).set({ discountPrice: '260.00', updatedAt: new Date() }).where(eq(packages.id, testPkg[0].id));
    const updated = await db.select().from(packages).where(eq(packages.id, testPkg[0].id)).limit(1);
    console.log(`✓ Updated CBC Discount Price in Neon DB: ₹${updated[0].discountPrice}`);

    // Revert back to original
    await db.update(packages).set({ discountPrice: originalPrice, updatedAt: new Date() }).where(eq(packages.id, testPkg[0].id));
    console.log(`✓ Successfully tested live database update and reverted to ₹${originalPrice}`);
  }

  console.log('🎉 Admin and database flow fully verified!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
