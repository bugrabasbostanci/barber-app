import { prisma } from "@/lib/prisma";

export async function resetDatabase() {
  try {
    console.log('🧹 Cleaning database...');
    
    // Delete in order to respect foreign key constraints
    await prisma.appointment.deleteMany({});
    console.log('✓ Appointments deleted');
    
    await prisma.employeeUnavailableTime.deleteMany({});
    console.log('✓ Employee unavailable times deleted');
    
    await prisma.user.deleteMany({});
    console.log('✓ Users deleted');
    
    await prisma.shop.deleteMany({});
    console.log('✓ Shops deleted');
    
    console.log('✅ Database cleaned successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Database cleaning failed:', error);
    return { success: false, error };
  }
}