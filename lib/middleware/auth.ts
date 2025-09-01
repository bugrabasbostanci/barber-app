import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login?error=You need to log in to view this page')
  }

  return user
}

export async function requireCustomer() {
  const user = await requireAuth()
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, isActive: true }
    })

    if (!dbUser) {
      redirect('/auth/login?error=User not found')
    }

    if (!dbUser.isActive) {
      redirect('/auth/login?error=Your account is deactivated')
    }

    if (dbUser.role !== 'CUSTOMER') {
      redirect('/?error=You do not have permission to access this page')
    }

    return { user, role: dbUser.role }
  } catch (error) {
    console.error('Database error in requireCustomer:', error)
    redirect('/auth/login?error=Database error occurred')
  }
}

export async function requireBarber() {
  const user = await requireAuth()
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, isActive: true }
    })

    if (!dbUser) {
      redirect('/auth/login?error=User not found')
    }

    if (!dbUser.isActive) {
      redirect('/auth/login?error=Your account is deactivated')
    }

    if (dbUser.role !== 'BARBER' && dbUser.role !== 'ADMIN') {
      redirect('/?error=You do not have permission to access this page')
    }

    return { user, role: dbUser.role }
  } catch (error) {
    console.error('Database error in requireBarber:', error)
    redirect('/auth/login?error=Database error occurred')
  }
}