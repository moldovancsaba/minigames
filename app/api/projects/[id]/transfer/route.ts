import { NextRequest, NextResponse } from 'next/server';
import { AssociationService } from '@/services/association';

/**
 * POST /api/projects/[id]/transfer
 * Transfer a project to a different organization
 */
export async function POST(request: NextRequest) {
  try {
    const projectId = request.nextUrl.pathname.split('/')[3];
    const data = await request.json();

    // Validate request body
    if (!data.fromOrganizationId || !data.toOrganizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Both source and target organization IDs are required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
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
        {
          success: false,
          error: 'Failed to transfer project',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Project transferred successfully' },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error transferring project:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Handle specific error cases
    if (error.message === 'Project does not belong to the source organization') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 403 }
      );
    }

    if (error.message === 'Target organization does not exist') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to transfer project',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
