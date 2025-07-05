import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/services/organization';
import { ProjectService } from '@/services/project';

/**
 * GET /api/organizations/[id]
 * Retrieve a single organization by ID
 */
// Proper typing according to Next.js documentation.
export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();
  try {

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const organization = await OrganizationService.getOrganization(id);
    
    // Fetch associated projects if organization exists
    if (organization) {
      const { projects } = await ProjectService.listProjects({ organizationId: id });
      // Create a new object with projects
      return NextResponse.json({
        success: true,
        data: { ...organization, projects },
        timestamp: new Date().toISOString()
      });
    }

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching organization:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organization',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizations/[id]
 * Update an organization
 */
export async function PUT(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();
  try {
    const updateData = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Remove protected fields
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const organization = await OrganizationService.updateOrganization(id, updateData);

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error updating organization:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    if (error.message === 'Organization with this slug already exists') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update organization',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]
 * Delete an organization and its related projects
 */
export async function DELETE(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const id = request.nextUrl.pathname.split('/').pop();
  
  try {
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Organization ID is required',
        timestamp
      }, { status: 400 });
    }

    const success = await OrganizationService.deleteOrganization(id);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: `Organization with ID '${id}' not found`,
        timestamp
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { id },
      timestamp
    });
    
  } catch (error) {
    console.error('Error deleting organization:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to delete organization',
      timestamp
    }, { status: 500 });
  }
}
