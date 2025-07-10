import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidationError } from '@/lib/errors/ValidationError';

export interface ValidationContext<T> {
  data: T;
}

/**
 * Higher-order middleware that validates request data against a zod schema
 * Provides type-safe request data to route handlers
 * 
 * @param schema - Zod schema to validate request against
 * @param source - Request source to validate ('body' | 'query' | 'params')
 * @returns A handler with validated request data
 */
export function withValidation<T extends z.ZodTypeAny>(
  schema: T,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return function withValidationHandler<R>(
    handler: (
      req: NextRequest,
      ctx: ValidationContext<z.infer<T>>
    ) => Promise<NextResponse<R>>
  ) {
    return async (req: NextRequest): Promise<NextResponse<R>> => {
      try {
        let data: unknown;

        // Extract data from specified source
        switch (source) {
          case 'body':
            data = await req.json();
            break;
          case 'query':
            data = Object.fromEntries(req.nextUrl.searchParams);
            break;
          case 'params':
            // Extract params from dynamic route segments
            const segments = req.nextUrl.pathname.split('/');
            const params: { [key: string]: string } = {};
            segments.forEach((segment, index) => {
              if (segment.startsWith('[') && segment.endsWith(']')) {
                const key = segment.slice(1, -1);
                params[key] = segments[index + 1];
              }
            });
            data = params;
            break;
        }

        // Validate data against schema
        const validatedData = await schema.parseAsync(data);

        // Call handler with validated data
        return await handler(req, { data: validatedData });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors = error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }));

          throw new ValidationError('Validation failed', 400, {
            errors: validationErrors
          });
        }

        throw error;
      }
    };
  };
}

/**
 * Helper function to create a validation schema for pagination parameters
 * @returns Zod schema for pagination
 */
export function createPaginationSchema() {
  return z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10)
  });
}

/**
 * Helper function to create a validation schema for common ID parameters
 * @returns Zod schema for MongoDB ObjectId
 */
export function createIdSchema() {
  return z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
}

/**
 * Helper function to create a validation schema for search parameters
 * @returns Zod schema for search query
 */
export function createSearchSchema() {
  return z.object({
    query: z.string().trim().min(1).max(100),
    fields: z.array(z.string()).optional()
  });
}
