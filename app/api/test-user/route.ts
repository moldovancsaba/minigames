import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { UserService } from '@/lib/userService';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || !session.email) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    const user = await UserService.findByEmail(session.email);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        role: user.role
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test user info error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
