import { NextResponse } from 'next/server';
import { validateHttpMethod } from '../../../lib/api-utils';

// Define allowed HTTP methods
const ALLOWED_METHODS = ['GET', 'POST'];
import { connectToDatabase } from '../../../lib/mongodb';

// Validate MongoDB configuration
if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
    console.error('MongoDB configuration missing:', {
        timestamp: new Date().toISOString(),
        MONGODB_URI: !!process.env.MONGODB_URI,
        MONGODB_DB: !!process.env.MONGODB_DB
    });
    throw new Error('MongoDB configuration is not properly set up');
}

/**
 * GET /api/images
 * Fetches all images from the database
 * Returns a paginated list of images with proper error handling
 */
export async function GET(request) {
    const methodCheck = validateHttpMethod(request, ALLOWED_METHODS);
    if (methodCheck) return methodCheck;
    console.log('GET /api/images - Starting request');
    try {
        // Log MongoDB client connection attempt
        console.log('Attempting to connect to MongoDB...');
        const { db } = await connectToDatabase();
        
        // Log database query operation
        console.log('Attempting to fetch images from database...');
        const images = await db.collection('images').find({}).toArray();
        console.log(`Successfully retrieved ${images.length} images`);
        
        return NextResponse.json({
            success: true,
            data: images,
            timestamp: new Date().toISOString()
        }, { status: 200 });
    } catch (error) {
        console.error('Detailed error in GET /api/images:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            operation: 'fetch_images'
        });
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch images',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

/**
 * POST /api/images
 * Adds new images to the database
 * Expects a JSON body with image data
 * Returns the newly created image entry
 */
export async function POST(request) {
    const methodCheck = validateHttpMethod(request, ALLOWED_METHODS);
    if (methodCheck) return methodCheck;
    console.log('POST /api/images - Starting request');
    try {
        console.log('Parsing request body...');
        const body = await request.json();
        console.log('Request body:', body);
        
        // Validate urls array
        if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'URLs array is required',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        console.log('Attempting to connect to MongoDB...');
        const { db } = await connectToDatabase();

        console.log('Preparing image data for insertion...');
        const imageDataArray = body.urls.map(url => ({
            url,
            title: url.split('/').pop() || 'Untitled',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));

        console.log('Attempting database insertion operation...');
        const result = await db.collection('images').insertMany(imageDataArray);
        console.log('Database operation result:', result);
        
        return NextResponse.json({
            success: true,
            data: imageDataArray.map((img, idx) => ({ ...img, _id: Object.values(result.insertedIds)[idx] })),
            timestamp: new Date().toISOString()
        }, { status: 201 });
    } catch (error) {
        console.error('Detailed error in POST /api/images:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            operation: 'create_images'
        });
        return NextResponse.json({
            success: false,
            error: 'Failed to create image',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
