import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            // Add CSRF protection with SameSite cookies
            const secureOptions = {
              ...options,
              sameSite: 'lax' as const,
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
            };
            supabaseResponse.cookies.set(name, value, secureOptions);
          });
        },
      },
    }
  );

  // refreshing the auth token and get user info
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is trying to access auth pages while logged in
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isPasswordResetPage = request.nextUrl.pathname === '/auth/reset-password';
  
  if (isAuthPage && user && !isPasswordResetPage) {
    // User is authenticated but trying to access auth pages (except password reset), redirect to home
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
