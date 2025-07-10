import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types/api';
import { connectToDatabase } from '@/lib/database';

export interface WithDatabaseContext {
  db: Awaited<ReturnType<typeof connectToDatabase>>;
}

/**
 * Higher-order middleware that injects database connection into the request context
 * Ensures database connection is available and properly managed
 * 
 * @param handler - The route handler to wrap with database connectivity
 * @returns A handler with database connection injected
 */
export function withDatabase<T>(
  handler: (req: NextRequest, ctx: WithDatabaseContext) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      // Establish database connection
      const db = await connectToDatabase();

      // Call handler with database context
      return await handler(req, { db });
    } catch (error) {
      console.error('[Database Middleware] Connection error:', error);
      return NextResponse.json<ApiResponse<T>>({
        success: false,
        error: {
          message: 'Database connection failed',
          code: 'DB_ERROR',
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }
  };
}
