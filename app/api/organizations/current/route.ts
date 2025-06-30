import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/services/organization';

export async function GET(request: NextRequest) {
  try {
    const organizations = await OrganizationService.listOrganizations({
      limit: 1,
      page: 1
    });

    if (organizations.organizations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No organizations found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: organizations.organizations[0],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching current organization:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch current organization',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
