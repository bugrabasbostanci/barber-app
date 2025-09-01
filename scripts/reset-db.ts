import { resetDatabase } from '../lib/reset-database';

async function main() {
  console.log('🚀 Starting database reset...');
  
  const result = await resetDatabase();
  
  if (result.success) {
    console.log('✅ Database reset completed successfully!');
  } else {
    console.error('❌ Database reset failed:', result.error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Reset script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import('../lib/prisma');
    await prisma.$disconnect();
  });