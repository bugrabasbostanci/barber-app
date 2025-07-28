import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'

const prisma = new PrismaClient()

export async function createUserInDatabase(authUserId: string, userData: {
  email: string
  firstName: string
  lastName: string
  phone?: string
}) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: authUserId }
    })

    if (existingUser) {
      return { success: true, user: existingUser }
    }

    // Create user in our database
    const user = await prisma.user.create({
      data: {
        id: authUserId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: 'CUSTOMER'
      }
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error creating user in database:', error)
    return { success: false, error: 'Failed to create user in database' }
  } finally {
    await prisma.$disconnect()
  }
}

export async function syncExistingUsers() {
  try {
    const supabase = await createClient()
    
    // Get all Supabase auth users (admin function - requires service role key)
    // This is a one-time sync function
    console.log('Sync function called - implement admin sync if needed')
    
    return { success: true }
  } catch (error) {
    console.error('Error syncing users:', error)
    return { success: false, error: 'Failed to sync users' }
  }
}

export async function getUserFromDatabase(authUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: authUserId }
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error getting user from database:', error)
    return { success: false, error: 'Failed to get user from database' }
  } finally {
    await prisma.$disconnect()
  }
}