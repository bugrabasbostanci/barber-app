import { NextRequest, NextResponse } from "next/server";

// CSRF token generation and validation
export class CSRFProtection {
  private static readonly TOKEN_NAME = 'csrf-token';
  private static readonly HEADER_NAME = 'x-csrf-token';
  
  // Generate a new CSRF token using Web Crypto API (Edge Runtime compatible)
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Set CSRF token in cookie
  static setToken(response: NextResponse, token: string): void {
    response.cookies.set(this.TOKEN_NAME, token, {
      httpOnly: false, // Client needs to read this for forms
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  // Get CSRF token from cookie
  static getTokenFromCookie(request: NextRequest): string | undefined {
    return request.cookies.get(this.TOKEN_NAME)?.value;
  }

  // Get CSRF token from header
  static getTokenFromHeader(request: NextRequest): string | undefined {
    return request.headers.get(this.HEADER_NAME) || undefined;
  }

  // Validate CSRF token
  static validateToken(request: NextRequest): boolean {
    const cookieToken = this.getTokenFromCookie(request);
    const headerToken = this.getTokenFromHeader(request);

    // Both tokens must exist and match
    if (!cookieToken || !headerToken) {
      return false;
    }

    return cookieToken === headerToken;
  }

  // Check if request needs CSRF protection
  static needsProtection(request: NextRequest): boolean {
    const method = request.method.toLowerCase();
    const pathname = request.nextUrl.pathname;

    // Only protect state-changing operations
    if (!['post', 'put', 'patch', 'delete'].includes(method)) {
      return false;
    }

    // Skip CSRF for certain paths (like auth callbacks)
    const skipPaths = [
      '/auth/callback',
      '/api/health',
      // Temporarily disable CSRF for development
      '/api/'
    ];

    return !skipPaths.some(path => pathname.startsWith(path));
  }
}

// Middleware function to handle CSRF
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  const response = NextResponse.next();

  // Generate token for GET requests (to set initial token)
  if (request.method === 'GET') {
    const existingToken = CSRFProtection.getTokenFromCookie(request);
    if (!existingToken) {
      const newToken = CSRFProtection.generateToken();
      CSRFProtection.setToken(response, newToken);
    }
    return response;
  }

  // Validate token for protected requests
  if (CSRFProtection.needsProtection(request)) {
    if (!CSRFProtection.validateToken(request)) {
      return new NextResponse('CSRF token mismatch', { 
        status: 403,
        statusText: 'Forbidden' 
      });
    }
  }

  return response;
}