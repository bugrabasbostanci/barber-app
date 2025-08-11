/**
 * Rate limiting middleware
 * Implements in-memory rate limiting with sliding window algorithm
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

interface RequestRecord {
  count: number;
  resetTime: number;
  timestamps: number[];
}

// In-memory store for rate limiting
// In production, consider using Redis for distributed rate limiting
class MemoryStore {
  private store = new Map<string, RequestRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (record.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  get(key: string): RequestRecord | undefined {
    const record = this.store.get(key);
    if (record && record.resetTime < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return record;
  }

  set(key: string, record: RequestRecord): void {
    this.store.set(key, record);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Global store instance
const store = new MemoryStore();

/**
 * Default key generator using IP address
 */
function defaultKeyGenerator(req: NextRequest): string {
  // Get IP from various headers (useful behind proxies)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const clientIp = req.headers.get('x-client-ip');
  
  let ip = forwarded?.split(',')[0] || realIp || clientIp || 'unknown';
  
  // Clean up the IP
  ip = ip.trim();
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  return `rateLimit:${ip}`;
}

/**
 * Create rate limiter middleware
 */
export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async (req: NextRequest): Promise<NextResponse | null> => {
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get or create record
      let record = store.get(key);
      if (!record) {
        record = {
          count: 0,
          resetTime: now + windowMs,
          timestamps: [],
        };
      }

      // Remove timestamps outside the window (sliding window)
      record.timestamps = record.timestamps.filter(timestamp => timestamp > windowStart);
      record.count = record.timestamps.length;

      // Check if limit exceeded
      if (record.count >= maxRequests) {
        logger.warn('Rate limit exceeded', {
          component: 'RateLimit',
          action: 'limitExceeded',
          metadata: {
            key: key.replace(/\d+\.\d+\.\d+\.\d+/, '[IP]'), // Mask IP for privacy
            count: record.count,
            maxRequests,
            windowMs,
            path: req.nextUrl.pathname,
            method: req.method,
          }
        });

        return NextResponse.json(
          {
            success: false,
            error: message,
            retryAfter: Math.ceil((record.resetTime - now) / 1000),
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString(),
              'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
            },
          }
        );
      }

      // Add current request timestamp
      record.timestamps.push(now);
      record.count = record.timestamps.length;

      // Update reset time if needed
      if (record.resetTime < now) {
        record.resetTime = now + windowMs;
      }

      // Save record
      store.set(key, record);

      // Add rate limit headers to response (will be added later)
      const remaining = Math.max(0, maxRequests - record.count);
      
      // Return null to continue processing, but store headers for later
      (req as { rateLimitHeaders?: Record<string, string> }).rateLimitHeaders = {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString(),
      };

      return null; // Continue processing
    } catch (error) {
      logger.error('Rate limiting error', {
        component: 'RateLimit',
        action: 'middleware',
        metadata: { 
          path: req.nextUrl.pathname,
          method: req.method 
        }
      }, error instanceof Error ? error : new Error(String(error)));

      // On error, allow the request to continue
      return null;
    }
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict rate limit for authentication endpoints
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again in 15 minutes',
  }),

  // General API rate limit
  api: createRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: 'API rate limit exceeded, please slow down',
  }),

  // Booking creation rate limit (RELAXED FOR TESTING)
  booking: createRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 50, // 50 bookings per minute (very generous for testing)
    message: 'Too many booking attempts, please wait before trying again',
  }),

  // Search endpoints rate limit
  search: createRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 20, // 20 searches per minute
    message: 'Search rate limit exceeded, please slow down',
  }),

  // Upload rate limit
  upload: createRateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 10, // 10 uploads per 10 minutes
    message: 'Upload rate limit exceeded, please wait before uploading again',
  }),
};

/**
 * Middleware wrapper to apply rate limiting to API handlers
 */
export function withRateLimit(rateLimiter: (req: NextRequest) => Promise<NextResponse | null>) {
  return function<THandler extends (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>>(
    handler: THandler
  ) {
    return async (req: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
      // Apply rate limiting
      const rateLimitResponse = await rateLimiter(req);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }

      // Continue with original handler
      const response = await handler(req, ...args);

      // Add rate limit headers to successful responses
      const rateLimitHeaders = (req as { rateLimitHeaders?: Record<string, string> }).rateLimitHeaders;
      if (rateLimitHeaders && response.status < 400) {
        Object.entries(rateLimitHeaders).forEach(([key, value]) => {
          response.headers.set(key, value as string);
        });
      }

      return response;
    };
  };
}

/**
 * Get rate limit store statistics (for monitoring)
 */
export function getRateLimitStats() {
  return {
    storeSize: store.size(),
    timestamp: Date.now(),
  };
}

/**
 * Clear rate limit store (for testing)
 */
export function clearRateLimit() {
  store.clear();
}

/**
 * Destroy rate limit store (cleanup)
 */
export function destroyRateLimit() {
  store.destroy();
}