import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/lib/errors/ValidationError';
import { verifyJWT } from '@/lib/auth/jwt';
import { getUserFromDatabase } from '@/lib/auth/userService';
import { Logger } from '@/lib/logging/logger';
import { ApiResponse } from '@/lib/types/api';

/* interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  timestamp: string;
  };
} */

export interface AuthContext {
  userId: string;
  roles: string[];
  permissions: string[];
}

export interface WithAuthConfig {
  /** Required roles for accessing the endpoint */
  requiredRoles?: string[];
  /** Required permissions for accessing the endpoint */
  requiredPermissions?: string[];
}

/**
 * Higher-order middleware that validates authentication and authorization
 * Ensures users have proper access rights before processing requests
 * 
 * @param handler - The route handler to wrap with authentication
 * @param config - Configuration options for authentication requirements
 * @returns A handler with authentication and authorization checks
 */
export function withAuth<T>(
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse<ApiResponse<T>>>,
  config: WithAuthConfig = {}
) {
  return async (req: NextRequest): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      // Get auth token from headers
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        throw new ValidationError('Missing or invalid authorization header');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new ValidationError('Missing auth token');
      }

      // Verify and decode token (implement your token verification logic)
      const authContext = await verifyAuthToken(token);

      // Check role requirements
      if (config.requiredRoles?.length && 
          !config.requiredRoles.some(role => authContext.roles.includes(role))) {
        throw new ValidationError('Insufficient role permissions', 403);
      }

      // Check permission requirements
      if (config.requiredPermissions?.length && 
          !config.requiredPermissions.every(perm => authContext.permissions.includes(perm))) {
        throw new ValidationError('Insufficient permissions', 403);
      }

      // Proceed with handler if all checks pass
      return await handler(req, authContext);
    } catch (error) {
      if (error instanceof ValidationError) {
return NextResponse.json<ApiResponse<T>>({
          success: false,
          error: {
            message: error.message,
            code: 'AUTH_ERROR',
            timestamp: new Date().toISOString()
          }
        }, { status: error.statusCode || 401 });
      }

return NextResponse.json<ApiResponse<T>>({
        success: false,
        error: {
          message: 'Authentication failed',
          code: 'AUTH_ERROR',
          timestamp: new Date().toISOString()
        }
      }, { status: 401 });
    }
  };
}

async function verifyAuthToken(token: string): Promise<AuthContext> {
  try {
    // First check basic token format
    if (!token || typeof token !== 'string') {
      throw new ValidationError('Invalid token format');
    }

    // Verify the JWT token
    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      throw new ValidationError('Invalid or expired token');
    }

    // Get user data from database including roles and permissions
    const user = await getUserFromDatabase(decoded.userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Return authenticated context
    return {
      userId: user.id,
      roles: user.roles || [],
      permissions: user.permissions || []
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
