import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/lib/mongodb/projectModel';
import { OrganizationModel } from '@/lib/mongodb/organizationModel';
import { 
  publicApiMiddleware,
  createRequestMetadata,
  checkRateLimit,
  applyCorsHeaders,
  formatApiResponse
} from '@/middleware/api';
import { validateObjectId } from '@/lib/utils/validation';

/**
 * GET /api/projects
 * List all projects with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    
    // If organizationId is provided, get projects for that organization
    const projects = organizationId
      ? await ProjectModel.findByOrganization(organizationId)
      : await ProjectModel.findAll();
    
    return NextResponse.json({
      success: true,
      data: projects
    });
  } catch (error: any) {
    console.error('Failed to list projects:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to list projects'
    }, { status: 500 });
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
    const data = await request.json();

    // Validate data directly since we already have it
    const { name, slug, organizationId, visibility, status } = data;
    if (!name || !slug || !organizationId || !visibility || !status) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Missing required fields',
          400,
          rateLimitInfo
        )
      );
    }

    // Validate ObjectId format
    if (!validateObjectId(organizationId)) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Invalid organizationId format',
          400,
          rateLimitInfo
        )
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Invalid slug format. Must contain only lowercase letters, numbers, and hyphens',
          400,
          rateLimitInfo
        )
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
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Organization not found',
          404,
          rateLimitInfo
        )
      );
    }

    // Validate slug uniqueness within organization
    const isSlugUnique = await ProjectModel.validateSlug(data.organizationId, data.slug);
    if (!isSlugUnique) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Project with this slug already exists in the organization',
          409,
          rateLimitInfo
        )
      );
    }

    const project = await ProjectModel.create(data);

    return applyCorsHeaders(
      formatApiResponse(project, null, 201, rateLimitInfo)
    );
  } catch (error: any) {
    console.error('Failed to create project:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'create_project'
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
        error.message || 'Failed to create project',
        500,
        rateLimitInfo
      )
    );
  }
}
