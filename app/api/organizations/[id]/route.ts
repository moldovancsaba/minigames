import { NextRequest, NextResponse } from 'next/server';
import { OrganizationModel } from '@/lib/mongodb/organizationModel';
import { ProjectService } from '@/services/project';
import { OrganizationService } from '@/services/organization';
import {
  publicApiMiddleware,
  formatApiResponse,
  applyCorsHeaders,
  createRequestMetadata,
  checkRateLimit
} from '@/middleware/api';

/**
 * GET /api/organizations/[id]
 * Retrieve a single organization by ID
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
    const id = searchParams.get('id');

    if (!id) {
return NextResponse.json(applyCorsHeaders(
        formatApiResponse(
          null,
          'Organization ID is required',
          400,
          rateLimitInfo
        )
      ));
    }

    const organization = await OrganizationService.getOrganization(id);
    if (!organization) {
return NextResponse.json(applyCorsHeaders(
        formatApiResponse(
          null,
          'Organization not found',
          404,
          rateLimitInfo
        )
      ));
    }

    // Fetch associated projects
    const { projects } = await ProjectService.listProjects({ organizationId: id });
    
    return NextResponse.json(
      applyCorsHeaders(
        formatApiResponse(
          { ...organization, projects },
          null,
          200,
          rateLimitInfo
        )
      )
    );
  } catch (error: any) {
    console.error('Failed to fetch organization:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'get_organization'
    });

return NextResponse.json(applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to fetch organization',
        500,
        rateLimitInfo
      )
 )
    );
  }
}

/**
 * PUT /api/organizations/[id]
 * Update an organization
 */
export async function PUT(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
    const id = request.nextUrl.pathname.split('/')[3]; // Extract ID from /api/organizations/[id]
    const updateData = await request.json();

    if (!id) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Organization ID is required',
          400,
          rateLimitInfo
        )
      );
    }

    // Remove protected fields
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const organization = await OrganizationService.updateOrganization(id, updateData);

    if (!organization) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Organization not found',
          404,
          rateLimitInfo
        )
      );
    }

    return applyCorsHeaders(
      formatApiResponse(organization, null, 200, rateLimitInfo)
    );
  } catch (error: any) {
    console.error('Failed to update organization:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'update_organization'
    });

    if (error.message === 'Organization with this slug already exists') {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          error.message,
          409,
          rateLimitInfo
        )
      );
    }

    return applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to update organization',
        500,
        rateLimitInfo
      )
    );
  }
}

/**
 * DELETE /api/organizations/[id]
 * Delete an organization and its related projects
 */
export async function DELETE(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
    const id = request.nextUrl.pathname.split('/')[3]; // Extract ID from /api/organizations/[id]
    
    if (!id) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Organization ID is required',
          400,
          rateLimitInfo
        )
      );
    }

    const deleted = await OrganizationModel.delete(id);

    if (!deleted) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          `Organization with ID '${id}' not found`,
          404,
          rateLimitInfo
        )
      );
    }

    return applyCorsHeaders(
      formatApiResponse(
        { id },
        null,
        200,
        rateLimitInfo
      )
    );
  } catch (error: any) {
    console.error('Failed to delete organization:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      operation: 'delete_organization'
    });

    if (error instanceof Error && error.message.includes('not found')) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          `Organization with ID '${request.nextUrl.pathname.split('/')[3]}' not found`,
          404,
          rateLimitInfo
        )
      );
    }

    return applyCorsHeaders(
      formatApiResponse(
        null,
        error instanceof Error ? error.message : 'Failed to delete organization',
        500,
        rateLimitInfo
      )
    );
  }
}
