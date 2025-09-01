import { createAuthUsers } from '../lib/create-auth-users';

async function main() {
  console.log('🚀 Starting auth users creation...');
  
  const result = await createAuthUsers();
  
  if (result.success) {
    console.log('✅ Auth users creation completed successfully!');
  } else {
    console.error('❌ Auth users creation failed:', result.error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Auth users script failed:', e);
    process.exit(1);
  });