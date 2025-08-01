import { NextRequest } from 'next/server';
import { AuthenticatedUser } from './api-auth';

/**
 * Debug environment middleware
 * Only allows debug endpoints in development or with explicit override
 */
export function requireDebugAccess() {
  return async (req: NextRequest, user?: AuthenticatedUser): Promise<void> => {
    // Always allow in development
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    // In production, require admin role AND explicit debug flag
    if (process.env.NODE_ENV === 'production') {
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Debug endpoints require admin access in production');
      }
      
      // Additional security: require explicit environment variable
      if (process.env.ENABLE_DEBUG_ENDPOINTS !== 'true') {
        throw new Error('Debug endpoints are disabled in production. Set ENABLE_DEBUG_ENDPOINTS=true to enable.');
      }
    }
  };
}

/**
 * Sanitize sensitive data for debug output
 */
export function sanitizeForDebug<T extends Record<string, unknown>>(
  data: T,
  sensitiveFields: (keyof T)[] = ['email', 'phone', 'firstName', 'lastName']
): T {
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      const value = sanitized[field] as string;
      if (field === 'email') {
        sanitized[field] = value.replace(/(.{2}).*@/, '$1***@') as T[keyof T];
      } else if (field === 'phone') {
        sanitized[field] = value.replace(/(.{3}).*(.{2})/, '$1***$2') as T[keyof T];
      } else {
        sanitized[field] = (value.charAt(0) + '***') as T[keyof T];
      }
    }
  }
  
  return sanitized;
}

/**
 * Limit array size for debug output
 */
export function limitArrayForDebug<T>(array: T[], maxSize: number = 10): T[] {
  return array.slice(0, maxSize);
}

/**
 * Create debug response with metadata
 */
export function createDebugResponse(data: unknown, context?: string) {
  return {
    success: true,
    debug: true,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    context: context || 'debug',
    data,
    warning: 'This is debug data. Do not use in production.',
  };
}