import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';

// CSRF error class
export class CSRFError extends Error {
  constructor(message: string = 'CSRF token validation failed') {
    super(message);
    this.name = 'CSRFError';
  }
}

// CSRF token management
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly COOKIE_NAME = 'csrf-token';
  private static readonly HEADER_NAME = 'x-csrf-token';
  
  // Generate a secure random token
  static generateToken(): string {
    return randomBytes(this.TOKEN_LENGTH).toString('hex');
  }
  
  // Create hash of token for comparison
  static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
  
  // Set CSRF token in cookie
  static setTokenCookie(response: NextResponse, token: string): void {
    response.cookies.set(this.COOKIE_NAME, this.hashToken(token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 * 24, // 24 hours
      path: '/',
    });
  }
  
  // Get CSRF token from request
  static getTokenFromRequest(request: NextRequest): string | null {
    // First try header
    const token = request.headers.get(this.HEADER_NAME);
    
    // Then try body for form submissions
    if (!token) {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        // For form data, we'd need to parse the body
        // This is a simplified version - you might want to implement full form parsing
      }
    }
    
    return token;
  }
  
  // Get stored token from cookie
  static getStoredToken(request: NextRequest): string | null {
    const tokenHash = request.cookies.get(this.COOKIE_NAME)?.value;
    return tokenHash || null;
  }
  
  // Validate CSRF token
  static validateToken(request: NextRequest): boolean {
    const providedToken = this.getTokenFromRequest(request);
    const storedTokenHash = this.getStoredToken(request);
    
    if (!providedToken || !storedTokenHash) {
      return false;
    }
    
    const providedTokenHash = this.hashToken(providedToken);
    return providedTokenHash === storedTokenHash;
  }
}

// CSRF middleware for API routes
export function withCSRF() {
  return <T extends unknown[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        const response = await handler(request, ...args);
        
        // For GET requests, generate and set CSRF token for future use
        if (request.method === 'GET') {
          const token = CSRFProtection.generateToken();
          CSRFProtection.setTokenCookie(response, token);
        }
        
        return response;
      }
      
      // For state-changing methods (POST, PUT, PATCH, DELETE), validate CSRF
      if (!CSRFProtection.validateToken(request)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'CSRF token validation failed',
            code: 'CSRF_ERROR' 
          },
          { status: 403 }
        );
      }
      
      return handler(request, ...args);
    };
  };
}

// Origin validation middleware
export function withOriginValidation(allowedOrigins: string[] = []) {
  return <T extends unknown[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      
      // For state-changing methods, validate origin
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        const requestOrigin = origin || (referer ? new URL(referer).origin : null);
        const currentHost = request.headers.get('host');
        const expectedOrigin = `${request.headers.get('x-forwarded-proto') || 'https'}://${currentHost}`;
        
        // Add expected origin to allowed origins
        const validOrigins = [expectedOrigin, ...allowedOrigins];
        
        if (!requestOrigin || !validOrigins.includes(requestOrigin)) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Invalid origin',
              code: 'ORIGIN_ERROR' 
            },
            { status: 403 }
          );
        }
      }
      
      return handler(request, ...args);
    };
  };
}

// Combined CSRF and Origin protection
export function withCSRFProtection(allowedOrigins: string[] = []) {
  return <T extends unknown[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) => {
    return withOriginValidation(allowedOrigins)(
      withCSRF()(handler)
    );
  };
}