import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// CORS Configuration
const allowedOrigins = process.env.NODE_ENV === 'development' 
  ? ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://localhost:3000']
  : [process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'];

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-CSRF-Token',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400'
};

export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') ?? '';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  // Handle CORS for API routes
  if (isApiRoute) {
    const isAllowedOrigin = allowedOrigins.includes(origin);
    const isPreflight = request.method === 'OPTIONS';
    
    // Handle preflight requests
    if (isPreflight) {
      const preflightHeaders = {
        ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
        ...corsOptions,
      };
      return NextResponse.json({}, { headers: preflightHeaders });
    }
    
    // Handle simple requests - first update auth session
    const response = await updateSession(request);
    
    // Add CORS headers to response
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    Object.entries(corsOptions).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Add security headers
    response.headers.set('Vary', 'Origin');
    
    return response;
  }
  
  // Handle non-API routes (auth pages, etc.)
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
  // Use Node.js runtime to avoid Supabase Edge Runtime warnings
  runtime: 'nodejs',
};
