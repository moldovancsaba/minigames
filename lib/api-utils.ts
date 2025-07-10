import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates that the HTTP method used in the request is allowed
 * @param request The incoming request
 * @param allowedMethods Array of allowed HTTP methods
 * @returns NextResponse with 405 status if method not allowed, null if method is allowed
 */
export function validateHttpMethod(request: NextRequest, allowedMethods: string[]): NextResponse | null {
  const method = request.method.toUpperCase();
  
  if (!allowedMethods.includes(method)) {
    return NextResponse.json(
      { 
        error: 'Method Not Allowed',
        allowedMethods: allowedMethods,
        timestamp: new Date().toISOString()
      },
      { 
        status: 405,
        headers: {
          'Allow': allowedMethods.join(', ')
        }
      }
    );
  }
  
  return null;
}
