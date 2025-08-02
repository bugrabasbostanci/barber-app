import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export class ApiResponseBuilder {
  static success<T>(data: T, meta?: Record<string, unknown>): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      meta
    });
  }
  
  static error(message: string, statusCode = 500, code?: string): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      code
    }, { status: statusCode });
  }
  
  static paginated<T>(data: T[], total: number, page: number, limit: number): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  }
  
  static validation(issues: unknown[]): NextResponse {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      issues
    }, { status: 400 });
  }
  
  static unauthorized(message = 'Unauthorized'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'UNAUTHORIZED'
    }, { status: 401 });
  }
  
  static forbidden(message = 'Forbidden'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'FORBIDDEN'
    }, { status: 403 });
  }
  
  static notFound(message = 'Resource not found'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'NOT_FOUND'
    }, { status: 404 });
  }
  
  static conflict(message = 'Resource conflict'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'CONFLICT'
    }, { status: 409 });
  }
}