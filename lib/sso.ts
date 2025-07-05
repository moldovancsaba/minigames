import { NextRequest, NextResponse } from 'next/server';
import { createToken, setUserCookie } from './auth';
import { UserService } from './userService';

const SSO_URL = 'https://thanperfect.vercel.app';

export async function initiateSSOLogin() {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  return `${SSO_URL}/auth/login?callback=${encodeURIComponent(callbackUrl)}`;
}

export async function handleSSOCallback(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    if (!token) {
      throw new Error('No token provided');
    }

    // Verify token with ThanPerfect SSO
    const verifyResponse = await fetch(`${SSO_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!verifyResponse.ok) {
      throw new Error('Invalid token');
    }

    const userData = await verifyResponse.json();
    
    // Find or create user in our system
    const user = await UserService.findOrCreateUser(userData.email);

    // Create our internal JWT token
    const jwtToken = await createToken({
      email: user.email,
      role: user.role
    });

    // Create success response
    const response = NextResponse.redirect(new URL('/organizations', req.url));
    
    // Set our auth cookie
    return setUserCookie(response, jwtToken);
  } catch (error) {
    console.error('SSO callback error:', error);
    return NextResponse.redirect(new URL('/login?error=sso_failed', req.url));
  }
}
