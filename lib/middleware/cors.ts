import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS configuration for the barber appointment system
 * Restricts cross-origin requests to enhance security
 */
export interface CORSConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge?: number;
}

// Default config removed - using environment-specific configs instead

/**
 * Production CORS configuration
 * Add your production domains here
 */
const productionConfig: CORSConfig = {
  origin: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    // TODO: Replace with your actual production domains before deployment
    // Examples:
    // 'https://berber-randevu.com',
    // 'https://www.berber-randevu.com',
    // 'https://yourdomain.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-CSRF-Token'
  ],
  credentials: true,
  maxAge: 86400,
};

/**
 * Development CORS configuration
 * More permissive for development
 */
const developmentConfig: CORSConfig = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3000',
    'http://localhost:3001', // For testing different ports
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-CSRF-Token'
  ],
  credentials: true,
  maxAge: 86400,
};

/**
 * Get CORS configuration based on environment
 */
function getCORSConfig(): CORSConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? developmentConfig : productionConfig;
}

/**
 * Check if origin is allowed based on CORS configuration
 */
function isOriginAllowed(origin: string | null, config: CORSConfig): boolean {
  if (!origin) return false;
  
  if (config.origin === true) return true;
  if (config.origin === false) return false;
  
  if (typeof config.origin === 'string') {
    return origin === config.origin;
  }
  
  if (Array.isArray(config.origin)) {
    return config.origin.includes(origin);
  }
  
  return false;
}

/**
 * CORS middleware wrapper for API routes
 */
export function withCORS(
  handler: (request: NextRequest) => Promise<Response> | Response,
  customConfig?: Partial<CORSConfig>
) {
  return async function corsHandler(request: NextRequest): Promise<Response> {
    const config = { ...getCORSConfig(), ...customConfig };
    const origin = request.headers.get('origin');
    
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      
      // Set CORS headers for preflight
      if (origin && isOriginAllowed(origin, config)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      
      response.headers.set('Access-Control-Allow-Methods', config.methods.join(', '));
      response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
      
      if (config.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      if (config.maxAge) {
        response.headers.set('Access-Control-Max-Age', config.maxAge.toString());
      }
      
      return response;
    }
    
    // Execute the actual handler
    const response = await handler(request);
    
    // Apply CORS headers to the response
    if (origin && isOriginAllowed(origin, config)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    if (config.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    // Add security headers
    response.headers.set('Vary', 'Origin');
    
    return response;
  };
}

/**
 * Stricter CORS for sensitive endpoints (auth, payments, etc.)
 */
export function withStrictCORS(
  handler: (request: NextRequest) => Promise<Response> | Response
) {
  return withCORS(handler, {
    origin: process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'https://localhost:3000']
      : [process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'], // TODO: Replace with actual domain
    credentials: true,
  });
}

/**
 * Public CORS for public endpoints (health checks, etc.)
 */
export function withPublicCORS(
  handler: (request: NextRequest) => Promise<Response> | Response
) {
  return withCORS(handler, {
    origin: true, // Allow all origins for public endpoints
    credentials: false,
  });
}