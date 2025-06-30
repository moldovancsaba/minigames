import { NextResponse } from 'next/server';
import { validateHttpMethod } from '../../../../lib/api-utils';

// Define allowed HTTP methods
const ALLOWED_METHODS = ['DELETE'];
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * DELETE /api/images/[id]
 * Deletes a single image by its ID
 * Returns success status
 */
export async function DELETE(request, { params }) {
    const methodCheck = validateHttpMethod(request, ALLOWED_METHODS);
    if (methodCheck) return methodCheck;
    try {
        const id = params.id;
        
        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Image ID is required',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        const client = await clientPromise;
        const { db } = await connectToDatabase();
        
        // Verify valid ObjectId format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid image ID format',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        const result = await db.collection('images').deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({
                success: false,
                error: 'Image not found',
                timestamp: new Date().toISOString()
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: { message: 'Image successfully deleted' },
            timestamp: new Date().toISOString()
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete image',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
