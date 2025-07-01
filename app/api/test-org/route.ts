import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    console.log('Connected to database');
    
    // Get current user ID from session
    const data = await request.json();
    const now = new Date();

    // Create test organization
    const organization = {
      name: data.name || 'Test Organization',
      slug: data.slug || 'test-org',
      status: 'active',
      members: [{
        userId: data.userId,
        role: 'owner',
        joinedAt: now
      }],
      settings: {
        allowPublicProjects: true,
        defaultProjectVisibility: 'private'
      },
      createdAt: now,
      updatedAt: now
    };

    // Insert directly into MongoDB
    console.log('Attempting to create organization:', organization);
    const result = await db.collection('organizations').insertOne(organization);
    console.log('Organization created successfully:', result.insertedId);

    return NextResponse.json({
      success: true,
      data: { ...organization, _id: result.insertedId },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test organization creation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
