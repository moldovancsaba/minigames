import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

/**
 * Validate MongoDB ObjectId
 */
export function validateObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

/**
 * Middleware to validate project creation/update data
 */
export async function validateProjectData(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Required fields
    const requiredFields = ['name', 'slug', 'organizationId', 'visibility', 'status'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate organizationId
    if (!validateObjectId(data.organizationId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid organizationId format',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(data.slug)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid slug format. Must contain only lowercase letters, numbers, and hyphens',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate name length
    if (data.name.length < 1 || data.name.length > 100) {
      return NextResponse.json({
        success: false,
        error: 'Name must be between 1 and 100 characters',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate visibility
    if (!['public', 'private'].includes(data.visibility)) {
      return NextResponse.json({
        success: false,
        error: 'Visibility must be either "public" or "private"',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate status
    if (!['active', 'archived'].includes(data.status)) {
      return NextResponse.json({
        success: false,
        error: 'Status must be either "active" or "archived"',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    return null; // Validation passed
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request data',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}

/**
 * Middleware to validate organization creation/update data
 */
export async function validateOrganizationData(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Required fields
    const requiredFields = ['name', 'slug', 'status'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(data.slug)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid slug format. Must contain only lowercase letters, numbers, and hyphens',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate name length
    if (data.name.length < 2 || data.name.length > 100) {
      return NextResponse.json({
        success: false,
        error: 'Name must be between 2 and 100 characters',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate description length if provided
    if (data.description && data.description.length > 1000) {
      return NextResponse.json({
        success: false,
        error: 'Description must not exceed 1000 characters',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate status
    if (!['active', 'inactive', 'archived'].includes(data.status)) {
      return NextResponse.json({
        success: false,
        error: 'Status must be either "active", "inactive", or "archived"',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    return null; // Validation passed
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request data',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}

/**
 * Middleware to validate ID parameters
 */
export function validateIdParam(id: string | undefined) {
  if (!id) {
    return NextResponse.json({
      success: false,
      error: 'ID parameter is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  if (!validateObjectId(id)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid ID format',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  return null; // Validation passed
}
