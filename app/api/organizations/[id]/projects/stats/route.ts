import { NextRequest, NextResponse } from 'next/server';
import { AssociationService } from '@/services/association';

/**
 * GET /api/organizations/[id]/projects/stats
 * Get statistics about projects in an organization
 */
export async function GET(request: NextRequest) {
  try {
    const organizationId = request.nextUrl.pathname.split('/')[3];

    const stats = await AssociationService.getOrganizationProjectStats(
      organizationId
    );

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching organization project stats:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organization project statistics',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
