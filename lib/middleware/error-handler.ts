import { NextRequest, NextResponse } from 'next/server';
import { AppError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

// Type for handlers that support context (middleware chain)
type ContextHandler = (req: NextRequest, context: Record<string, unknown>) => Promise<NextResponse>;
// Type for standard Next.js API handlers
type StandardHandler = (req: NextRequest) => Promise<NextResponse>;

export function withErrorHandler<T extends StandardHandler | ContextHandler>(
  handler: T
): T {
  return (async (req: NextRequest, context?: Record<string, unknown>) => {
    const startTime = Date.now();
    
    try {
      // Check if handler expects context parameter
      if (handler.length > 1 && context !== undefined) {
        return await (handler as ContextHandler)(req, context);
      } else {
        return await (handler as StandardHandler)(req);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log the error with context
      logger.api('API Error', {
        method: req.method,
        path: req.nextUrl.pathname,
        responseTime,
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      // Handle different error types
      if (error instanceof AppError) {
        return NextResponse.json(
          { 
            success: false, 
            error: error.message, 
            code: error.code,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          },
          { status: error.statusCode }
        );
      }
      
      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            issues: error.issues,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          },
          { status: 400 }
        );
      }
      
      // Handle Prisma errors
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { success: false, error: 'Duplicate entry', code: 'DUPLICATE_ENTRY' },
            { status: 409 }
          );
        }
        
        if (error.code === 'P2025') {
          return NextResponse.json(
            { success: false, error: 'Resource not found', code: 'NOT_FOUND' },
            { status: 404 }
          );
        }
      }
      
      // Default error response
      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error',
          ...(process.env.NODE_ENV === 'development' && { 
            originalError: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          })
        },
        { status: 500 }
      );
    }
  }) as T;
}