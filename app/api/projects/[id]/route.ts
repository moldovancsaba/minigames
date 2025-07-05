import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/project';
import { OrganizationService } from '@/services/organization';
import { validateIdParam } from '@/middleware/validation';
import type { RouteSegment } from '@/app/types/route';

/**
 * GET /api/projects/[id]
 * Retrieve a single project by ID
 */
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    const organizationId = request.nextUrl.searchParams.get('organizationId');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const project = await ProjectService.getProject(id, organizationId || undefined);
    
    // Fetch associated organization if project exists
    if (project) {
      const organization = await OrganizationService.getOrganization(project.organizationId.toString());
      // Create a new object with organization
      return NextResponse.json({
        success: true,
        data: { ...project, organization },
        timestamp: new Date().toISOString()
      });
    }

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching project:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    const updateData = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Remove protected fields
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const project = await ProjectService.updateProject(id, updateData);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error updating project:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    if (error.message === 'Project with this slug already exists in the organization') {
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
        error: 'Failed to update project',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */


export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    const validationError = validateIdParam(id);
    if (validationError) {
      return validationError;
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const success = await ProjectService.deleteProject(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error deleting project:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
