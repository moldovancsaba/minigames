import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/userService';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getSession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const users = await UserService.getAllUsers();
    
    return NextResponse.json({
      users: users.map(user => ({
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getSession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { email, role } = await request.json();

    if (!email || !role || !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid request data' },
        { status: 400 }
      );
    }

    const updatedUser = await UserService.updateUserRole(email, role);
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        email: updatedUser.email,
        role: updatedUser.role,
        lastLoginAt: updatedUser.lastLoginAt,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
