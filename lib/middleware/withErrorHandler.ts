import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/lib/errors/ValidationError';
import { Logger } from '@/lib/logging/logger';
import { ApiResponse } from '@/lib/types/api';

const logger = new Logger('ErrorHandler');

/**
 * Error handler middleware that provides consistent error formatting
 * and proper error logging across the application
 * 
 * @param handler - The route handler to wrap with error handling
 * @returns A handler with standardized error handling
 */
export function withErrorHandler<T>(
  handler: (req: NextRequest) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      return await handler(req);
    } catch (error: unknown) {
      logger.error('Request failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.nextUrl.pathname
      });

      const timestamp = new Date().toISOString();
      const isDevelopment = process.env.NODE_ENV === 'development';

      // Handle known error types
      if (error instanceof ValidationError) {
        return NextResponse.json<ApiResponse<T>>({
          success: false,
          error: {
            message: error.message,
            code: 'VALIDATION_ERROR',
            timestamp,
            details: isDevelopment ? (error as any).details : undefined
          }
        }, { status: 400 });
      }

      // Handle MongoDB errors
      if ((error as any).name === 'MongoServerError') {
        if ((error as any).code === 11000) {
          return NextResponse.json<ApiResponse<T>>({
            success: false,
            error: {
              message: 'Duplicate resource detected',
              code: 'DUPLICATE_ERROR',
              timestamp
            }
          }, { status: 409 });
        }
        
        return NextResponse.json<ApiResponse<T>>({
          success: false,
          error: {
            message: 'Database operation failed',
            code: 'DATABASE_ERROR',
            timestamp,
            details: isDevelopment ? (error as any).message : undefined
          }
        }, { status: 500 });
      }

      // Generic error response
      return NextResponse.json<ApiResponse<T>>({
        success: false,
        error: {
          message: isDevelopment ? (error as any).message : 'Internal server error',
          code: 'INTERNAL_ERROR',
          timestamp,
          details: isDevelopment ? {
            message: (error as any).message,
            stack: (error as any).stack
          } : undefined
        }
      }, { status: 500 });
    }
  };
}
