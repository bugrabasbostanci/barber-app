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
  const isUpdateRolePage = request.nextUrl.pathname === '/update-role';
  const isBarberPage = request.nextUrl.pathname.startsWith('/barber');
  
  if (isAuthPage && user && !isPasswordResetPage) {
    // User is authenticated but trying to access auth pages (except password reset), redirect to home
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Protect barber pages - only authenticated users can access (role check on page level)
  if (isBarberPage) {
    if (!user) {
      // Not authenticated, redirect to login
      const redirectUrl = new URL('/auth/login?error=Bu sayfayı görüntülemek için giriş yapmanız gerekiyor', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Protect update-role page - only admins can access
  if (isUpdateRolePage) {
    if (!user) {
      // Not authenticated, redirect to login
      const redirectUrl = new URL('/auth/login?error=Bu sayfayı görüntülemek için giriş yapmanız gerekiyor', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Temporary: Allow authenticated users to access update-role page
    // Role checking will be done on the page level
  }

  return supabaseResponse;
}
