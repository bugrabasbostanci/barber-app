import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const redirect = searchParams.get('redirect') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      try {
        // Check if user exists in our database by ID or email
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: data.user.id },
              { email: data.user.email! }
            ]
          }
        })

        // If user doesn't exist, create them with Google OAuth data
        if (!existingUser) {
          const userMetadata = data.user.user_metadata
          
          await prisma.user.create({
            data: {
              id: data.user.id,
              email: data.user.email!,
              firstName: userMetadata.given_name || userMetadata.full_name?.split(' ')[0] || '',
              lastName: userMetadata.family_name || userMetadata.full_name?.split(' ')[1] || '',
              role: 'CUSTOMER', // Default role for Google OAuth users
              isActive: true
            }
          })
        } else if (existingUser.id !== data.user.id) {
          // If email exists but with different ID, update the existing user's ID to match Supabase
          await prisma.user.update({
            where: { email: data.user.email! },
            data: { id: data.user.id }
          })
        }
      } catch (dbError) {
        console.error('Database error in OAuth callback:', dbError)
        return NextResponse.redirect(`${origin}/auth/login?error=Veritabanı hatası oluştu`)
      }

      // Use redirect parameter if available, otherwise fall back to next
      const finalRedirect = redirect !== '/' ? redirect : next
      return NextResponse.redirect(`${origin}${finalRedirect}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Google giriş işlemi başarısız oldu`)
}