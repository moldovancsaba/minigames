import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/services/organizationService';
import { UserService } from '@/lib/userService';
import { getSession } from '@/lib/auth';

// GET /api/organizations
export async function GET(request: NextRequest) {
  const organizations = await OrganizationService.getOrganizations();

  return NextResponse.json({
    success: true,
    data: organizations,
    timestamp: new Date().toISOString()
  });
}

// POST /api/organizations
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Create organization
    const organization = await OrganizationService.createOrganization({
      name: data.name,
      slug: data.slug,
      description: data.description
    });

    return NextResponse.json({
      success: true,
      data: organization,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error: any) {
    console.error('Organization creation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create organization',
      timestamp: new Date().toISOString()
    }, {
      status: error.code === 11000 ? 409 : 500
    });
  }
}
