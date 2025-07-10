import { NextRequest } from 'next/server';
import { AssociationService } from '@/services/association';
import {
  publicApiMiddleware,
  formatApiResponse,
  applyCorsHeaders,
  createRequestMetadata,
  checkRateLimit
} from '@/middleware/api';

/**
 * GET /api/organizations/[id]/projects/stats
 * Get statistics about projects in an organization
 */
export async function GET(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
    const organizationId = request.nextUrl.pathname.split('/')[3]; // Extract ID from /api/organizations/[id]/projects/stats

    if (!organizationId) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Organization ID is required',
          400,
          rateLimitInfo
        )
      );
    }

    const stats = await AssociationService.getOrganizationProjectStats(
      organizationId
    );

    return applyCorsHeaders(
      formatApiResponse(stats, null, 200, rateLimitInfo)
    );
  } catch (error: any) {
    console.error('Failed to fetch organization project stats:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'get_organization_project_stats'
    });

    return applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to fetch organization project statistics',
        500,
        rateLimitInfo
      )
    );
  }
}
