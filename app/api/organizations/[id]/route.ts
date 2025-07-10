import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OrganizationService } from '@/services/organization';
import { validateOrganizationId, validateUpdateOrganizationRequest, handleApiError } from '@/lib/middleware/apiMiddleware';
import { ValidationError } from '@/lib/errors/ValidationError';
import { Logger } from '@/lib/logging/logger';
import type { OrganizationResponse, DeleteOrganizationResponse, ApiErrorResponse } from '../types';

const logger = new Logger('OrganizationAPI');

/**
 * GET /api/organizations/[id]
 * Retrieve a single organization by ID
 */
export async function GET(request: NextRequest): Promise<NextResponse<OrganizationResponse | ApiErrorResponse>> {
  try {
    logger.debug('Processing GET request');
    
    // Validate and get organization ID
    const id = await validateOrganizationId(request);
    
    // Fetch organization
    const organization = await OrganizationService.getOrganization(id);
    if (!organization) {
      console.warn('Organization not found', { id });
      return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 404 });
    }

    logger.debug('Successfully retrieved organization', { id });
    return NextResponse.json({
      success: true,
      data: organization
    } as OrganizationResponse);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/organizations/[id]
 * Update an organization
 */
export async function PUT(request: NextRequest): Promise<NextResponse<OrganizationResponse | ApiErrorResponse>> {
  try {
    logger.debug('Processing PUT request');
    
    // Validate organization ID
    const id = await validateOrganizationId(request);
    
    // Parse request
    const { name, description } = await request.json();
    const organization = await OrganizationService.updateOrganization(id, { name, description });
    if (!organization) {
      console.warn('Failed to update', { id });
      throw new Error('Organization not found');
    }
    
    logger.debug('Organization updated successfully:', { id });
    return NextResponse.json({ success: true, data: organization });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/organizations/[id]
 * Delete an organization and its dependent resources
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<DeleteOrganizationResponse | ApiErrorResponse>> {
  try {
    logger.debug('Processing DELETE request');
    
    // Validate organization ID
    const id = await validateOrganizationId(request);
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      logger.warn('Unauthorized deletion attempt', { id });
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access'
      } as ApiErrorResponse, { status: 401 });
    }
    
// Delete organization
    const success = await OrganizationService.deleteOrganization(id);
    if (!success) {
      logger.warn('Failed to delete', { id });
      throw new Error('Failed to delete organization');
    }

    logger.info('Organization deleted successfully', { id });
    return NextResponse.json({
      success: true,
      data: {
        message: 'Organization successfully deleted'
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
