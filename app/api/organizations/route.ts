import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/init';
import { OrganizationModel } from '@/lib/mongodb/organizationModel';
import { generateSlug } from '@/lib/utils/slug';

export async function GET() {
  try {
    await dbConnect();
    const organizations = await OrganizationModel.findAll();
    
    return NextResponse.json({
      success: true,
      data: organizations
    });
  } catch (error: any) {
    console.error('Failed to fetch organizations:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch organizations'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Organization name is required'
      }, { status: 400 });
    }

    // Generate a slug from the name
    const baseSlug = generateSlug(data.name);
    
    // Find a unique slug by appending numbers if necessary
    let slug = baseSlug;
    let counter = 1;
    while (!(await OrganizationModel.validateSlug(slug))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create organization with validated data
    const organization = await OrganizationModel.create({
      name: data.name.trim(),
      slug,
      description: data.description?.trim()
    });

    // Return the created organization
    return NextResponse.json({
      success: true,
      data: organization
    }, { status: 201 });
  } catch (error: any) {
    console.error('Organization creation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create organization'
    }, { status: 500 });
  }
}

