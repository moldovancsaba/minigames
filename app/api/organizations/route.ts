import { NextRequest } from 'next/server';
import { OrganizationModel } from '@/lib/mongodb/organizationModel';
import {
  publicApiMiddleware,
  formatApiResponse,
  applyCorsHeaders,
  createRequestMetadata,
  checkRateLimit
} from '@/middleware/api';

// GET /api/organizations
export async function GET(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
    const organizations = await OrganizationModel.findAll();
    return applyCorsHeaders(
      formatApiResponse(organizations, null, 200, rateLimitInfo)
    );
  } catch (error: any) {
    console.error('Failed to fetch organizations:', error);
    return applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to fetch organizations',
        500,
        rateLimitInfo
      )
    );
  }
}

// POST /api/organizations
export async function POST(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
    const data = await request.json();
    
    if (!data.name) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Organization name is required',
          400,
          rateLimitInfo
        )
      );
    }

    // Auto-generate slug if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    // Create organization with defaults
    const organization = await OrganizationModel.create({
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      status: 'active',
      settings: {
        allowPublicProjects: true,
        defaultProjectVisibility: 'public'
      }
    });

    return applyCorsHeaders(
      formatApiResponse(organization, null, 201, rateLimitInfo)
    );
  } catch (error: any) {
    console.error('Organization creation error:', error);
    return applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to create organization',
        500,
        rateLimitInfo
      )
    );
  }
}
