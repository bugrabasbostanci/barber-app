import { NextRequest, NextResponse } from 'next/server';
import { AppError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { sanitizeError, sanitizeValidationError, shouldIncludeDetailedErrors } from '@/lib/utils/error-sanitizer';

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
        const response = { 
          success: false, 
          error: error.message, 
          code: error.code,
          stack: undefined as string | undefined
        };
        
        // Only include stack trace in development with explicit flag
        if (shouldIncludeDetailedErrors()) {
          response.stack = error.stack;
        }
        
        return NextResponse.json(response, { status: error.statusCode });
      }
      
      if (error instanceof ValidationError) {
        const sanitizedValidation = sanitizeValidationError(error.issues);
        const response = {
          success: false,
          error: sanitizedValidation.message,
          code: sanitizedValidation.code,
          issues: sanitizedValidation.issues,
          stack: undefined as string | undefined
        };
        
        // Only include stack trace in development with explicit flag
        if (shouldIncludeDetailedErrors()) {
          response.stack = error.stack;
        }
        
        return NextResponse.json(response, { status: 400 });
      }
      
      // Handle all other errors with sanitization
      const sanitizedError = sanitizeError(error);
      const response = {
        success: false,
        error: sanitizedError.message,
        code: sanitizedError.code,
        originalError: undefined as string | undefined,
        stack: undefined as string | undefined
      };
      
      // Only include detailed error info in development with explicit flag
      if (shouldIncludeDetailedErrors()) {
        response.originalError = error instanceof Error ? error.message : String(error);
        response.stack = error instanceof Error ? error.stack : undefined;
      }
      
      // Determine status code based on error type
      let statusCode = 500;
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaCode = (error as { code: string }).code;
        if (prismaCode === 'P2002') statusCode = 409;
        else if (prismaCode === 'P2025') statusCode = 404;
        else if (prismaCode === 'P2003' || prismaCode === 'P2014') statusCode = 400;
      }
      
      return NextResponse.json(response, { status: statusCode });
    }
  }) as T;
}