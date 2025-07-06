import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Applies CORS headers to the response
 * @param request The incoming request
 * @param response The response to add headers to
 * @returns The response with CORS headers applied
 */
export function applyCorsHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  // Get origin from request headers
  const origin = request.headers.get('origin') || '*';

  // Clone the response to modify headers
  const responseWithCors = new NextResponse(response.body, response);

  // Set CORS headers
  responseWithCors.headers.set('Access-Control-Allow-Origin', origin);
  responseWithCors.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  responseWithCors.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  responseWithCors.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return responseWithCors;
}
