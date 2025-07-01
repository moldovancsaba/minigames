import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { UserService } from '@/lib/userService';

/**
 * GET /api/me
 * Returns the currently authenticated user's profile information
 */
export async function GET(request: NextRequest) {
  try {
    // Get authentication token/session
    const session = await getSession(request);
    
    if (!session || !session.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    // Fetch user data from MongoDB
    const user = await UserService.findByEmail(session.email);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Return user data with success response
    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
