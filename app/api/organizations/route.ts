import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/services/organization';
import { validateHttpMethod } from '@/lib/api-utils';

// Define allowed HTTP methods
const ALLOWED_METHODS = ['GET', 'POST'];

// GET /api/organizations
export async function GET(request: NextRequest) {
  const methodCheck = validateHttpMethod(request, ALLOWED_METHODS);
  if (methodCheck) return methodCheck;
  try {
    const searchParams = request.nextUrl.searchParams;
const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const status = searchParams.get('status') as 'active' | 'inactive' | 'archived' | undefined;

    if (page && isNaN(parseInt(page, 10))) {
      return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 });
    }
    if (limit && isNaN(parseInt(limit, 10))) {
      return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
    }

    const options = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status
    };

const result = await OrganizationService.listOrganizations(options);
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in GET /api/organizations:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'list_organizations'
    });
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch organizations',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /api/organizations
export async function POST(request: NextRequest) {
  const methodCheck = validateHttpMethod(request, ALLOWED_METHODS);
  if (methodCheck) return methodCheck;
  try {
    const data = await request.json();
    
    // Comprehensive validation
    const requiredFields = ['name', 'slug'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: {
            requiredFields,
            missingFields
          }
        },
        { status: 400 }
      );
    }
    
    // Remove protected fields if present
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;

    const organization = await OrganizationService.createOrganization(data);
    
    return NextResponse.json({
      success: true,
      data: organization,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/organizations:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'create_organization'
    });
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create organization',
      timestamp: new Date().toISOString()
    }, {
      status: error instanceof Error && error.message === 'Organization with this slug already exists' ? 409 : 500
    });
  }
}
