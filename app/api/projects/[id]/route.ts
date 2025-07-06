import { NextRequest, NextResponse } from 'next/server';
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
 * GET /api/projects/[id]
 * Retrieve a single project by ID
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
    const organizationId = request.nextUrl.searchParams.get('organizationId');

    if (!id) {
return NextResponse.json(applyCorsHeaders(
        formatApiResponse(
          null,
          'Project ID is required',
          400,
          rateLimitInfo
        )
      ));
    }

    const project = await ProjectService.getProject(id, organizationId || undefined);
    if (!project) {
return NextResponse.json(applyCorsHeaders(
        formatApiResponse(
          null,
          'Project not found',
          404,
          rateLimitInfo
        )
      ));
    }

    // Fetch associated organization if project exists
    const organization = await OrganizationService.getOrganization(project.organizationId.toString());
    
    return NextResponse.json(
      applyCorsHeaders(
        formatApiResponse(
          { ...project, organization },
          null,
          200,
          rateLimitInfo
        )
      )
    );
  } catch (error: any) {
    console.error('Failed to fetch project:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'get_project'
    });

return NextResponse.json(applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to fetch project',
        500,
        rateLimitInfo
      )
 )
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
    const id = request.nextUrl.pathname.split('/')[3]; // Extract ID from /api/projects/[id]
    const updateData = await request.json();

    if (!id) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Project ID is required',
          400,
          rateLimitInfo
        )
      );
    }

    // Remove protected fields
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const project = await ProjectService.updateProject(id, updateData);

    if (!project) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Project not found',
          404,
          rateLimitInfo
        )
      );
    }

    return applyCorsHeaders(
      formatApiResponse(project, null, 200, rateLimitInfo)
    );
  } catch (error: any) {
    console.error('Failed to update project:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'update_project'
    });

    if (error.message === 'Project with this slug already exists in the organization') {
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
        error.message || 'Failed to update project',
        500,
        rateLimitInfo
      )
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
    const id = request.nextUrl.pathname.split('/')[3]; // Extract ID from /api/projects/[id]

    if (!id) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Project ID is required',
          400,
          rateLimitInfo
        )
      );
    }

    const success = await ProjectService.deleteProject(id);

    if (!success) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Project not found',
          404,
          rateLimitInfo
        )
      );
    }

    return applyCorsHeaders(
      formatApiResponse(
        { message: 'Project deleted successfully' },
        null,
        200,
        rateLimitInfo
      )
    );
  } catch (error: any) {
    console.error('Failed to delete project:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'delete_project'
    });

    return applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to delete project',
        500,
        rateLimitInfo
      )
    );
  }
}
