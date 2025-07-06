import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import {
  publicApiMiddleware,
  formatApiResponse,
  applyCorsHeaders,
  createRequestMetadata,
  checkRateLimit
} from '@/middleware/api';

/**
 * DELETE /api/images/[id]
 * Deletes a single image by its ID
 * Returns success status
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) {
    return NextResponse.json(middlewareResponse);
  }

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'images');

  try {
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id) {
return NextResponse.json(applyCorsHeaders(
        formatApiResponse(
          null,
          'Image ID is required',
          400,
          rateLimitInfo
        )
      ));
    }

    const { db } = await connectToDatabase();

    // Verify valid ObjectId format
    if (!ObjectId.isValid(id)) {
return NextResponse.json(applyCorsHeaders(
        formatApiResponse(
          null,
          'Invalid image ID format',
          400,
          rateLimitInfo
        )
      ));

    }

    const result = await db.collection('images').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        applyCorsHeaders(
          formatApiResponse(
            null,
            'Image not found',
            404,
            rateLimitInfo
          )
        )
      );
    }

    return NextResponse.json(
      applyCorsHeaders(
        formatApiResponse(
          { message: 'Image successfully deleted' },
          null,
          200,
          rateLimitInfo
        )
      )
    );
  } catch (error: any) {
    console.error('Failed to delete image:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'delete_image'
    });
      return NextResponse.json(
        applyCorsHeaders(
          formatApiResponse(
            null,
            error.message || 'Failed to delete image',
            500,
            rateLimitInfo
          )
        )
      );
  }
}
