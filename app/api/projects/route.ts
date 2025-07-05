import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/lib/mongodb/projectModel';
import { OrganizationModel } from '@/lib/mongodb/organizationModel';
import { validateObjectId } from '@/middleware/validation';

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

    // If organizationId is provided, get projects for that organization
    const projects = options.organizationId
      ? await ProjectModel.findByOrganization(options.organizationId)
      : [];
    
    const result = {
      projects,
      total: projects.length,
      page: options.page || 1,
      limit: options.limit || 10
    };

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
    console.log('Received project data:', data);

    // Validate data directly since we already have it
    const { name, slug, organizationId, visibility, status } = data;
    if (!name || !slug || !organizationId || !visibility || !status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    // Validate ObjectId format
    if (!validateObjectId(organizationId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid organizationId format',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid slug format. Must contain only lowercase letters, numbers, and hyphens',
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

    // Verify organization exists
    const organization = await OrganizationModel.findById(data.organizationId);
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

    // Validate slug uniqueness within organization
    const isSlugUnique = await ProjectModel.validateSlug(data.organizationId, data.slug);
    if (!isSlugUnique) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project with this slug already exists in the organization',
          timestamp: new Date().toISOString()
        },
        { status: 409 }
      );
    }

    const project = await ProjectModel.create(data);

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
