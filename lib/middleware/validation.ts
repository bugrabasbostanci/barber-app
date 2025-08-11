/**
 * Input validation middleware using Zod
 * Provides request body, query params, and URL params validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema, ZodError } from 'zod';
import { logger } from '@/lib/utils';

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends Error {
  constructor(
    public errors: ValidationError[],
    message: string = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationException';
  }
}

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (req: NextRequest): Promise<T> => {
    try {
      const body = await req.json();
      return schema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn('Request body validation failed', {
          component: 'Validation',
          action: 'validateBody',
          metadata: { errors: validationErrors }
        });
        
        throw new ValidationException(validationErrors, 'Invalid request body');
      }
      
      if (error instanceof SyntaxError) {
        throw new ValidationException(
          [{ field: 'body', message: 'Invalid JSON format' }],
          'Invalid JSON in request body'
        );
      }
      
      throw error;
    }
  };
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: NextRequest): T => {
    try {
      const { searchParams } = new URL(req.url);
      const query = Object.fromEntries(searchParams.entries());
      return schema.parse(query);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn('Query parameters validation failed', {
          component: 'Validation',
          action: 'validateQuery',
          metadata: { errors: validationErrors }
        });
        
        throw new ValidationException(validationErrors, 'Invalid query parameters');
      }
      throw error;
    }
  };
}

/**
 * Validate URL parameters against a Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (params: Record<string, unknown>): T => {
    try {
      return schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn('URL parameters validation failed', {
          component: 'Validation',
          action: 'validateParams',
          metadata: { errors: validationErrors }
        });
        
        throw new ValidationException(validationErrors, 'Invalid URL parameters');
      }
      throw error;
    }
  };
}

/**
 * Higher-order function to wrap API handlers with validation
 */
export function withValidation<TBody = unknown, TQuery = unknown, TParams = unknown>(
  options: {
    body?: ZodSchema<TBody>;
    query?: ZodSchema<TQuery>;
    params?: ZodSchema<TParams>;
  }
) {
  return function(
    handler: (req: NextRequest, context: Record<string, unknown>) => Promise<NextResponse>
  ) {
    return async (
      req: NextRequest,
      context?: { params?: Record<string, unknown>; [key: string]: unknown }
    ): Promise<NextResponse> => {
      try {
        let validatedBody: TBody | undefined;
        let validatedQuery: TQuery | undefined;
        let validatedParams: TParams | undefined;

        // Validate body if schema provided and method requires body
        if (options.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
          validatedBody = await validateBody(options.body)(req);
        }

        // Validate query parameters
        if (options.query) {
          validatedQuery = validateQuery(options.query)(req);
        }

        // Validate URL parameters
        if (options.params && context?.params) {
          validatedParams = validateParams(options.params)(context.params);
        }

        // Call the original handler with validated data
        return await handler(req, {
          ...context,
          validatedBody,
          validatedQuery,
          validatedParams,
        });
      } catch (error) {
        if (error instanceof ValidationException) {
          return NextResponse.json(
            {
              success: false,
              error: 'Validation failed',
              details: error.errors,
            },
            { status: 400 }
          );
        }

        // Re-throw non-validation errors
        throw error;
      }
    };
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Date validation (YYYY-MM-DD format)
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  // Time validation (HH:MM format)
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  
  // Phone validation (Turkish format)
  phone: z.string().regex(/^(\+90|0)?[0-9]{10}$/, 'Invalid Turkish phone number'),
  
  // Email validation
  email: z.string().email('Invalid email format'),
  
  // Pagination
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional(),
  }),
  
  // Date range
  dateRange: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  }).refine(
    (data) => data.startDate <= data.endDate,
    { message: 'Start date must be before or equal to end date' }
  ),
};

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value as Record<string, unknown>) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }
  
  return sanitized;
}