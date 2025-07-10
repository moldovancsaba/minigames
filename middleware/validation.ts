import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

import { ValidationError } from './error';

/**
 * Validate MongoDB ObjectId
 */
export function validateObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

// Project data interface
export interface ProjectData {
  name: string;
  slug: string;
  organizationId: string;
  visibility: 'public' | 'private';
  status: 'active' | 'archived';
  description?: string;
}

/**
 * Validates project data against schema requirements
 */
export function validateProjectData(data: Partial<ProjectData>): void {
  if (!data) {
    throw new ValidationError('Project data is required');
  }

  // Required fields validation
  const requiredFields = ['name', 'slug', 'organizationId', 'visibility', 'status'];
  const missingFields = requiredFields.filter(field => !(data as Record<string, unknown>)[field]);
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Name validation
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      throw new ValidationError('Project name must be a string');
    }
    if (data.name.trim().length < 1) {
      throw new ValidationError('Project name must be at least 1 character long');
    }
    if (data.name.trim().length > 100) {
      throw new ValidationError('Project name cannot exceed 100 characters');
    }
  }

  // Slug validation
  if (data.slug !== undefined) {
    if (typeof data.slug !== 'string') {
      throw new ValidationError('Slug must be a string');
    }
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(data.slug)) {
      throw new ValidationError('Invalid slug format. Must contain only lowercase letters, numbers, and hyphens');
    }
  }

  // Organization ID validation
  if (data.organizationId !== undefined) {
    if (typeof data.organizationId !== 'string') {
      throw new ValidationError('Organization ID must be a string');
    }
    if (!validateObjectId(data.organizationId)) {
      throw new ValidationError('Invalid organization ID format');
    }
  }

  // Visibility validation
  if (data.visibility !== undefined) {
    if (!['public', 'private'].includes(data.visibility)) {
      throw new ValidationError('Visibility must be either "public" or "private"');
    }
  }

  // Status validation
  if (data.status !== undefined) {
    if (!['active', 'archived'].includes(data.status)) {
      throw new ValidationError('Status must be either "active" or "archived"');
    }
  }

  // Optional description validation
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      throw new ValidationError('Description must be a string');
    }
    if (data.description.length > 1000) {
      throw new ValidationError('Description cannot exceed 1000 characters');
    }
  }
}

/**
 * Middleware to validate project data in request
 */
export async function validateProjectRequest(req: NextRequest) {
  try {
    const data = await req.json();
    validateProjectData(data);
    return null; // Validation passed
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: error.status || 400 });
    }
    return NextResponse.json({
      success: false,
      error: 'Invalid request data',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}

// Organization data interface
export interface OrganizationData {
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'archived';
  description?: string;
  email?: string;
  website?: string;
}

/**
 * Validates organization data against schema requirements
 */
export function validateOrganizationData(data: Partial<OrganizationData>): void {
  if (!data) {
    throw new ValidationError('Organization data is required');
  }

  // Required fields validation
  const requiredFields = ['name', 'slug', 'status'];
  const missingFields = requiredFields.filter(field => !(data as Record<string, unknown>)[field]);
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Name validation
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      throw new ValidationError('Organization name must be a string');
    }
    if (data.name.trim().length < 2) {
      throw new ValidationError('Organization name must be at least 2 characters long');
    }
    if (data.name.trim().length > 100) {
      throw new ValidationError('Organization name cannot exceed 100 characters');
    }
  }

  // Slug validation
  if (data.slug !== undefined) {
    if (typeof data.slug !== 'string') {
      throw new ValidationError('Slug must be a string');
    }
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(data.slug)) {
      throw new ValidationError('Invalid slug format. Must contain only lowercase letters, numbers, and hyphens');
    }
  }

  // Status validation
  if (data.status !== undefined) {
    if (!['active', 'inactive', 'archived'].includes(data.status)) {
      throw new ValidationError('Status must be either "active", "inactive", or "archived"');
    }
  }

  // Optional description validation
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      throw new ValidationError('Description must be a string');
    }
    if (data.description.length > 1000) {
      throw new ValidationError('Description cannot exceed 1000 characters');
    }
  }

  // Optional email validation
  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      throw new ValidationError('Email must be a string');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  // Optional website validation
  if (data.website !== undefined) {
    if (typeof data.website !== 'string') {
      throw new ValidationError('Website must be a string');
    }
    try {
      new URL(data.website);
    } catch {
      throw new ValidationError('Invalid website URL format');
    }
  }
}

/**
 * Middleware to validate organization data in request
 */
export async function validateOrganizationRequest(req: NextRequest) {
  try {
    const data = await req.json();
    validateOrganizationData(data);
    return null; // Validation passed
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: error.status || 400 });
    }
    return NextResponse.json({
      success: false,
      error: 'Invalid request data',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}

/**
 * Validates MongoDB ObjectId parameter
 * @throws {ValidationError} if ID is invalid or missing
 */
export function validateIdParam(id: string | undefined): void {
  if (!id) {
    throw new ValidationError('ID parameter is required');
  }

  if (!validateObjectId(id)) {
    throw new ValidationError('Invalid ID format');
  }
}

/**
 * Middleware to validate request ID parameter
 */
export function validateIdParamRequest(id: string | undefined) {
  try {
    validateIdParam(id);
    return null; // Validation passed
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: error.status || 400 });
    }
    return NextResponse.json({
      success: false,
      error: 'Invalid ID parameter',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}
