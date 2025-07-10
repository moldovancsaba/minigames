import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/lib/errors/ValidationError';
import { Logger } from '@/lib/logging/logger';
import type { ApiErrorResponse } from '@/app/api/organizations/types';

const logger = new Logger('ApiMiddleware');

/**
 * Middleware to validate and parse organization ID from request
 */
export async function validateOrganizationId(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/')[3];
  
  if (!id) {
    throw new ValidationError('Organization ID is required');
  }
  
  return id;
}

/**
 * Middleware to validate update organization request body
 */
export async function validateUpdateOrganizationRequest(request: NextRequest) {
  const body = await request.json();
  
  // Validate required fields
  if (body.name !== undefined && (!body.name || typeof body.name !== 'string' || !body.name.trim())) {
    throw new ValidationError('Name must be a non-empty string');
  }

  // Validate optional fields
  if (body.maxMembers !== undefined) {
    if (typeof body.maxMembers !== 'number' || body.maxMembers < 1) {
      throw new ValidationError('maxMembers must be a positive number');
    }
  }

  if (body.customDomain !== undefined && body.customDomain !== null) {
    const domainRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(body.customDomain)) {
      throw new ValidationError('Invalid custom domain format');
    }
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    throw new ValidationError('Description must be a string');
  }

  return {
    name: body.name?.trim(),
    description: body.description?.trim(),
    maxMembers: body.maxMembers,
    customDomain: body.customDomain
  };
}

/**
 * Error handler middleware
 */
export function handleApiError(error: any) {
  logger.error('API Error:', { error });

  const timestamp = new Date().toISOString();

  let status = 500;
  let errorMessage = 'Internal server error';

  if (error instanceof ValidationError) {
    status = 400;
    errorMessage = error.message;
  } else if (error.code === 11000) { // MongoDB duplicate key error
    status = 409;
    errorMessage = 'Resource already exists';
  }

  return NextResponse.json({
    success: false,
    error: errorMessage
  } as ApiErrorResponse, { status });
}
