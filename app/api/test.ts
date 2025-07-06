import { NextRequest, NextResponse } from 'next/server';
import {
  publicApiMiddleware,
  formatApiResponse,
  applyCorsHeaders,
  createRequestMetadata,
  checkRateLimit
} from '@/middleware/api';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) {
    return NextResponse.json(middlewareResponse);
  }

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'default');

  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        applyCorsHeaders(
          formatApiResponse(
            null,
            'ID is required',
            400,
            rateLimitInfo
          )
        )
      );
    }

    return NextResponse.json(
      applyCorsHeaders(
        formatApiResponse(
          { message: 'Success' },
          null,
          200,
          rateLimitInfo
        )
      )
    );
  } catch (error: any) {
    console.error('Failed:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'test'
    });

    return NextResponse.json(
      applyCorsHeaders(
        formatApiResponse(
          null,
          error.message || 'Failed',
          500,
          rateLimitInfo
        )
      )
    );
  }
}
