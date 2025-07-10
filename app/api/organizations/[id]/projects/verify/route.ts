import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/lib/mongodb/projectModel';
import { OrganizationModel } from '@/lib/mongodb/organizationModel';
import {
  publicApiMiddleware,
  formatApiResponse,
  applyCorsHeaders,
  createRequestMetadata,
  checkRateLimit
} from '@/middleware/api';

/**
 * GET /api/organizations/[id]/projects/verify
 * Verify if a project belongs to an organization
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) {
    return NextResponse.json(middlewareResponse);
  }

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
    const { id: organizationId } = params;
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(applyCorsHeaders(
        formatApiResponse(
          null,
          'Project ID is required',
          400,
          rateLimitInfo
        )
      ));
    }

    // First verify organization exists
    const organization = await OrganizationModel.findById(organizationId);
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

    // Then verify project exists and belongs to organization
    const project = await ProjectModel.findById(projectId);
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

    const verified = project.organizationId === organizationId;

    return NextResponse.json(applyCorsHeaders(
      formatApiResponse(
        { verified },
        null,
        200,
        rateLimitInfo
      )
    ));
  } catch (error: any) {
    console.error('Failed to verify project organization:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'verify_project_organization'
    });

    return NextResponse.json(applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to verify project organization',
        500,
        rateLimitInfo
      )
    ));
  }
}
