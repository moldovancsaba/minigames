import { NextRequest, NextResponse } from 'next/server';
import { AssociationService } from '@/services/association';
import {
  publicApiMiddleware,
  formatApiResponse,
  applyCorsHeaders,
  createRequestMetadata,
  checkRateLimit
} from '@/middleware/api';

/**
 * GET /api/organizations/[id]/projects
 * List all projects for an organization with filtering and pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) {
    return NextResponse.json(middlewareResponse);
  }

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
const { searchParams } = request.nextUrl;
    const organizationId = searchParams.get('id');

    if (!organizationId) {
      return NextResponse.json(
        applyCorsHeaders(
          formatApiResponse(
            null,
            'Organization ID is required',
            400,
            rateLimitInfo
          )
        )
      );
    }

    // Parse and validate query parameters
    const options = {
      status: searchParams.get('status') as 'active' | 'archived' | undefined,
      visibility: searchParams.get('visibility') as 'public' | 'private' | undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
      sort: searchParams.get('sort') as 'createdAt' | 'updatedAt' | 'name' | undefined,
      order: searchParams.get('order') as 'asc' | 'desc' | undefined
    };

    // Validate numeric parameters
    if (options.page !== undefined && (isNaN(options.page) || options.page < 1)) {
      return NextResponse.json(
        applyCorsHeaders(
          formatApiResponse(
            null,
            'Invalid page parameter',
            400,
            rateLimitInfo
          )
        )
      );
    }

    if (options.limit !== undefined && (isNaN(options.limit) || options.limit < 1)) {
      return NextResponse.json(
        applyCorsHeaders(
          formatApiResponse(
            null,
            'Invalid limit parameter',
            400,
            rateLimitInfo
          )
        )
      );
    }

    const result = await AssociationService.listOrganizationProjects(
      organizationId,
      options
    );

    return NextResponse.json(
      applyCorsHeaders(
        formatApiResponse(result, null, 200, rateLimitInfo)
      )
    );
  } catch (error: any) {
    console.error('Failed to list organization projects:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'list_organization_projects'
    });

    return NextResponse.json(
      applyCorsHeaders(
        formatApiResponse(
          null,
          error.message || 'Failed to list organization projects',
          500,
          rateLimitInfo
        )
      )
    );
    }
  }

/**
 * PATCH /api/organizations/[id]/projects
 * Bulk update projects in an organization (archive all, update visibility)
 */
export async function PATCH(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
    const organizationId = request.nextUrl.pathname.split('/')[3]; // Extract ID from /api/organizations/[id]/projects

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
    const data = await request.json();
    
    if (!data.action) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Action is required',
          400,
          rateLimitInfo
        )
      );
    }

    let result: number;

    switch (data.action) {
      case 'archive_all':
        result = await AssociationService.archiveOrganizationProjects(
          organizationId
        );
        break;

      case 'update_visibility':
        if (!data.visibility || !['public', 'private'].includes(data.visibility)) {
          return applyCorsHeaders(
            formatApiResponse(
              null,
              'Invalid visibility value',
              400,
              rateLimitInfo
            )
          );
        }
        result = await AssociationService.updateOrganizationProjectsVisibility(
          organizationId,
          data.visibility
        );
        break;

      default:
        return applyCorsHeaders(
          formatApiResponse(
            null,
            'Invalid action',
            400,
            rateLimitInfo
          )
        );
    }

    return applyCorsHeaders(
      formatApiResponse(
        { modifiedCount: result },
        null,
        200,
        rateLimitInfo
      )
    );
  } catch (error: any) {
    console.error('Failed to update organization projects:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'update_organization_projects'
    });

    return applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to update organization projects',
        500,
        rateLimitInfo
      )
    );
  }
}
