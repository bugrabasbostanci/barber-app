import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { currentPassword } = await request.json();

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Mevcut şifre gerekli' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the current user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user?.email) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    // Create a new client instance for password verification
    // This won't affect the current session
    const verificationSupabase = await createClient();
    
    const { error: signInError } = await verificationSupabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: 'Mevcut şifre yanlış' },
        { status: 400 }
      );
    }

    // Immediately sign out the verification session to prevent session conflicts
    await verificationSupabase.auth.signOut();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Şifre doğrulama hatası' },
      { status: 500 }
    );
  }
}