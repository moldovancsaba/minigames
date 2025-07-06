import { NextRequest } from 'next/server';

interface ImageData {
  url: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
import { connectToDatabase } from '@/lib/mongodb';
import {
  publicApiMiddleware,
  formatApiResponse,
  applyCorsHeaders,
  createRequestMetadata,
  checkRateLimit
} from '@/middleware/api';

// Validate MongoDB configuration
if (!process.env.MONGODB_URI) {
  console.error('MongoDB configuration missing:', {
    timestamp: new Date().toISOString(),
    error: 'MONGODB_URI is required'
  });
  throw new Error('MongoDB configuration is not properly set up');
}

/**
 * GET /api/images
 * Fetches all images from the database
 * Returns a paginated list of images with proper error handling
 */
export async function GET(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'images');

  try {
    const { db } = await connectToDatabase();
    const images = await db.collection('images').find({}).toArray();

    return applyCorsHeaders(
      formatApiResponse(images, null, 200, rateLimitInfo)
    );
  } catch (error: any) {
    console.error('Failed to fetch images:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'fetch_images'
    });

    return applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to fetch images',
        500,
        rateLimitInfo
      )
    );
  }
}

/**
 * POST /api/images
 * Adds new images to the database
 * Expects a JSON body with image data
 * Returns the newly created image entry
 */
export async function POST(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'images');

  try {
    const body = await request.json();

    // Validate urls array
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'URLs array is required',
          400,
          rateLimitInfo
        )
      );
    }

    const { db } = await connectToDatabase();

    const imageDataArray: ImageData[] = body.urls.map((url: string) => ({
      url,
      title: url.split('/').pop() || 'Untitled',
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const result = await db.collection('images').insertMany(imageDataArray);

    return applyCorsHeaders(
      formatApiResponse(
        imageDataArray.map((img: ImageData, idx: number) => ({ ...img, _id: Object.values(result.insertedIds)[idx] })),
        null,
        201,
        rateLimitInfo
      )
    );
  } catch (error: any) {
    console.error('Failed to create images:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'create_images'
    });

    return applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to create images',
        500,
        rateLimitInfo
      )
    );
  }
}

/**
 * DELETE /api/images/{id}
 * Deletes an image from the database by ID
 * Returns success message if deleted or error if not found
 */
export async function DELETE(request: NextRequest) {
  // Apply public API middleware
  const middlewareResponse = await publicApiMiddleware(request);
  if (middlewareResponse) return middlewareResponse;

  // Get request metadata for rate limiting
  const metadata = createRequestMetadata(request);
  const rateLimitInfo = await checkRateLimit(metadata.ip, 'images');

  try {
    const { db } = await connectToDatabase();
    const imageId = request.nextUrl.pathname.split('/').pop();

    // Validate ID
    if (!imageId || imageId === 'images') {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Image ID is required',
          400,
          rateLimitInfo
        )
      );
    }

    const { ObjectId } = require('mongodb');
    let objectId;

    try {
      objectId = new ObjectId(imageId);
    } catch (error) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Invalid image ID format',
          400,
          rateLimitInfo
        )
      );
    }

    const result = await db.collection('images').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Image not found',
          404,
          rateLimitInfo
        )
      );
    }

    return applyCorsHeaders(
      formatApiResponse(
        { success: true, message: 'Image deleted successfully' },
        null,
        200,
        rateLimitInfo
      )
    );
  } catch (error: any) {
    console.error('Failed to delete image:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      operation: 'delete_image'
    });

    return applyCorsHeaders(
      formatApiResponse(
        null,
        error.message || 'Failed to delete image',
        500,
        rateLimitInfo
      )
    );
  }
}
