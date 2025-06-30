import { NextRequest, NextResponse } from 'next/server';
import { AssociationService } from '@/services/association';

/**
 * GET /api/organizations/[id]/projects
 * List all projects for an organization with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const organizationId = request.nextUrl.pathname.split('/')[3];
    const searchParams = request.nextUrl.searchParams;

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
        {
          success: false,
          error: 'Invalid page parameter',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (options.limit !== undefined && (isNaN(options.limit) || options.limit < 1)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid limit parameter',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const result = await AssociationService.listOrganizationProjects(
      organizationId,
      options
    );

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error listing organization projects:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list organization projects',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizations/[id]/projects
 * Bulk update projects in an organization (archive all, update visibility)
 */
export async function PATCH(request: NextRequest) {
  try {
    const organizationId = request.nextUrl.pathname.split('/')[3];
    const data = await request.json();
    
    if (!data.action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Action is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
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
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid visibility value',
              timestamp: new Date().toISOString()
            },
            { status: 400 }
          );
        }
        result = await AssociationService.updateOrganizationProjectsVisibility(
          organizationId,
          data.visibility
        );
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: { modifiedCount: result },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error updating organization projects:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update organization projects',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
