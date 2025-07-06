import { NextRequest, NextResponse } from 'next/server';
import { formatApiResponse } from '@/middleware/api';
import { applyCorsHeaders } from '@/middleware/api';
import { RateLimitInfo } from '@/types/api';
import { applySecurityChecks } from './security';

export async function publicApiMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<Response>
) {
  try {
    // Apply rate limit check
    const rateLimitInfo: RateLimitInfo = {
      limit: 100,
      remaining: 99,
      reset: new Date(Date.now() + 3600000).toISOString()
    };

    // Apply all security checks
    const securityResponse = applySecurityChecks(req, rateLimitInfo);
    if (securityResponse) return securityResponse;

    // Continue with the handler
    return handler(req);
  } catch (error) {
    // Handle errors appropriately
    const rateLimitInfo: RateLimitInfo = {
      limit: 100,
      remaining: 99,
      reset: new Date(Date.now() + 3600000).toISOString()
    };
    return applyCorsHeaders(
      formatApiResponse(
        null,
        error instanceof Error ? error.message : 'Unknown error',
        500,
        rateLimitInfo
      )
    );
  }
}
