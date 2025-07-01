import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await User.findOneAndUpdate(
      { email: 'moldovancsaba@gmail.com' },
      { $set: { role: 'admin' } },
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      data: {
        email: user?.email,
        role: user?.role
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Admin role update error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
