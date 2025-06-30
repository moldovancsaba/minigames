import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/project';

/**
 * GET /api/projects
 * List all projects with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const options = {
      organizationId: searchParams.get('organizationId') || undefined,
      visibility: searchParams.get('visibility') as 'public' | 'private' | undefined,
      status: searchParams.get('status') as 'active' | 'archived' | undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
      tags: searchParams.get('tags')?.split(',') || undefined
    };

    // Validate numeric parameters
    if (options.page !== undefined && isNaN(options.page)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid page parameter',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (options.limit !== undefined && isNaN(options.limit)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid limit parameter',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const result = await ProjectService.listProjects(options);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error listing projects:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list projects',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'slug', 'organizationId', 'visibility', 'status'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          details: {
            required: requiredFields,
            missing: missingFields
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Remove protected fields if present
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;

    // Initialize metadata if not provided
    if (!data.metadata) {
      data.metadata = {
        totalImages: 0,
        lastActivity: new Date(),
        tags: [],
        contributors: []
      };
    }

    // Set default settings if not provided
    if (!data.settings) {
      data.settings = {
        allowComments: true,
        moderateComments: false,
        enableSharing: true,
        allowDownloads: true,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif']
      };
    }

    const project = await ProjectService.createProject(data);

    return NextResponse.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', {
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
        error: 'Failed to create project',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
