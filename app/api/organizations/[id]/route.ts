import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/services/organization';

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
 * Delete an organization
 */
export async function DELETE(request: NextRequest) {
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

    const success = await OrganizationService.deleteOrganization(id);

    if (!success) {
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
      message: 'Organization deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error deleting organization:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete organization',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
