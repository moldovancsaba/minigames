import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiHandler } from 'next';

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Global error handler middleware to standardize error responses across the API
 * 
 * @param handler - The API route handler function
 * @returns Wrapped handler with error handling
 */
export function withErrorHandler(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error: unknown) {
      let status = 500;
      let message = 'Internal Server Error';
      let stack: string | undefined;

      if (error instanceof Error) {
        const errorWithStatus = error as ErrorWithStatus;
        status = errorWithStatus.status || errorWithStatus.statusCode || 500;
        message = errorWithStatus.message;
        stack = process.env.NODE_ENV === 'development' ? errorWithStatus.stack : undefined;
      }

      // Log server errors
      if (status >= 500) {
        console.error('Server error:', error);
      }

      res.status(status).json({
        success: false,
        error: {
          message,
          status,
          stack
        }
      });
    }
  };
}

// Custom error class for validation errors
export class ValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ValidationError';
    this.status = status;
  }
}
