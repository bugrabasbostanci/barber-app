import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login?error=Bu sayfayı görüntülemek için giriş yapmanız gerekiyor')
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
      redirect('/auth/login?error=Kullanıcı bulunamadı')
    }

    if (!dbUser.isActive) {
      redirect('/auth/login?error=Hesabınız deaktif durumda')
    }

    if (dbUser.role !== 'CUSTOMER') {
      redirect('/?error=Bu sayfaya erişim yetkiniz bulunmuyor')
    }

    return { user, role: dbUser.role }
  } catch (error) {
    console.error('Database error in requireCustomer:', error)
    redirect('/auth/login?error=Veritabanı hatası oluştu')
  } finally {
    await prisma.$disconnect()
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
      redirect('/auth/login?error=Kullanıcı bulunamadı')
    }

    if (!dbUser.isActive) {
      redirect('/auth/login?error=Hesabınız deaktif durumda')
    }

    if (dbUser.role !== 'BARBER' && dbUser.role !== 'ADMIN') {
      redirect('/?error=Bu sayfaya erişim yetkiniz bulunmuyor')
    }

    return { user, role: dbUser.role }
  } catch (error) {
    console.error('Database error in requireBarber:', error)
    redirect('/auth/login?error=Veritabanı hatası oluştu')
  } finally {
    await prisma.$disconnect()
  }
}