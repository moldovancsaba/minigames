import { NextRequest, NextResponse } from 'next/server';
import { createToken, setUserCookie } from '@/lib/auth';
import { UserService } from '@/lib/userService';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find or create user
    const user = await UserService.findOrCreateUser(email);

    // Create JWT token
    const token = await createToken({
      email: user.email,
      role: user.role
    });

    // Create response with user data
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });

    // Set cookie
    return await setUserCookie(response, token);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
