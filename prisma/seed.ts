import { seedTestData } from '../lib/seed-data';

async function main() {
  console.log('🌱 Seeding database...');
  
  const result = await seedTestData();
  
  if (result.success) {
    console.log('✅ Database seeded successfully!');
  } else {
    console.error('❌ Database seeding failed:', result.error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  });