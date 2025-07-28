import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // E-posta doğrulandı, giriş sayfasına yönlendir
      return NextResponse.redirect(new URL('/auth/login?message=E-posta adresiniz doğrulandı! Giriş yapabilirsiniz.', request.url))
    }
  }

  // Hata durumunda ana sayfaya yönlendir
  return NextResponse.redirect(new URL('/auth/login?error=E-posta doğrulanamadı. Lütfen tekrar deneyin.', request.url))
}