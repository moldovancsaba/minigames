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
 * POST /api/projects/[id]/transfer
 * Transfer a project to a different organization
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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
    const projectId = searchParams.get('id');
    const data = await request.json();

    // Validate request body
    if (!projectId) {
      return NextResponse.json(
        applyCorsHeaders(
          formatApiResponse(
            null,
            'Project ID is required',
            400,
            rateLimitInfo
          )
        )
      );
    }

    if (!data.fromOrganizationId || !data.toOrganizationId) {
      return NextResponse.json(
        applyCorsHeaders(
          formatApiResponse(
            null,
            'Both source and target organization IDs are required',
            400,
            rateLimitInfo
          )
        )
      );
    }

    // Attempt to transfer the project
    const success = await AssociationService.transferProject(
      projectId,
      data.fromOrganizationId,
      data.toOrganizationId
    );

    if (!success) {
      return NextResponse.json(
        applyCorsHeaders(
          formatApiResponse(
            null,
            'Failed to transfer project',
            400,
            rateLimitInfo
          )
        )
      );
    }

    return NextResponse.json(
      applyCorsHeaders(
        formatApiResponse(
          { message: 'Project transferred successfully' },
          null,
          200,
          rateLimitInfo
        )
      )
    );
  } catch (error: any) {
    console.error('Failed to transfer project:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'transfer_project'
    });

    // Handle specific error cases
    if (error.message === 'Project does not belong to the source organization') {
      return NextResponse.json(
        applyCorsHeaders(
          formatApiResponse(
            null,
            error.message,
            403,
            rateLimitInfo
          )
        )
      );
    }

    if (error.message === 'Target organization does not exist') {
      return NextResponse.json(
        applyCorsHeaders(
          formatApiResponse(
            null,
            error.message,
            404,
            rateLimitInfo
          )
        )
      );
    }

    return NextResponse.json(
      applyCorsHeaders(
        formatApiResponse(
          null,
          error.message || 'Failed to transfer project',
          500,
          rateLimitInfo
        )
      )
    );
  }
}
