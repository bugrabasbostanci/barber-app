/**
 * Error sanitization utilities to prevent information disclosure
 */

export interface SanitizedError {
  message: string;
  code?: string;
}

export interface SanitizedValidationError extends SanitizedError {
  issues: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Sanitizes error messages to prevent information disclosure
 */
export function sanitizeError(error: unknown): SanitizedError {
  if (!error) {
    return { message: 'Unknown error occurred' };
  }

  // Handle custom application errors
  if (error && typeof error === 'object' && 'message' in error && 'code' in error) {
    return {
      message: String(error.message),
      code: String(error.code)
    };
  }

  // Handle Prisma errors with safe messages
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaCode = (error as { code: string }).code;
    
    switch (prismaCode) {
      case 'P2002':
        return { message: 'Duplicate entry', code: 'DUPLICATE_ENTRY' };
      case 'P2025':
        return { message: 'Resource not found', code: 'NOT_FOUND' };
      case 'P2003':
        return { message: 'Invalid reference', code: 'INVALID_REFERENCE' };
      case 'P2014':
        return { message: 'Invalid data provided', code: 'INVALID_DATA' };
      default:
        return { message: 'Database operation failed', code: 'DATABASE_ERROR' };
    }
  }

  // For unknown errors, return generic message
  return { message: 'Internal server error' };
}

/**
 * Sanitizes validation error issues to prevent information disclosure
 */
export function sanitizeValidationError(issues: unknown[]): SanitizedValidationError {
  const sanitizedIssues = issues
    .filter((issue): issue is Record<string, unknown> => Boolean(issue && typeof issue === 'object'))
    .map((issue) => ({
      path: Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path || 'unknown'),
      message: sanitizeValidationMessage(String(issue.message || 'Invalid value'))
    }));

  return {
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    issues: sanitizedIssues
  };
}

/**
 * Sanitizes validation messages to remove sensitive information
 */
function sanitizeValidationMessage(message: string): string {
  // Remove file paths and system information
  return message
    .replace(/\/[^\s]*\/[^\s]*/g, '[path]') // Remove file paths
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[ip]') // Remove IP addresses
    .replace(/\b[A-Za-z]:\\[^\s]*/g, '[path]') // Remove Windows paths
    .replace(/\bError: /g, '') // Remove "Error: " prefix
    .replace(/\bat line \d+/g, '') // Remove line numbers
    .replace(/\bin file [^\s]*/g, ''); // Remove file references
}

/**
 * Determines if detailed error information should be included
 */
export function shouldIncludeDetailedErrors(): boolean {
  return process.env.NODE_ENV === 'development' && 
         process.env.SHOW_DETAILED_ERRORS === 'true';
}