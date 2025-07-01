import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

// Define paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/test-admin'];

export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    // If user is already logged in and tries to access login page, redirect to organizations
    if (session && pathname === '/login') {
      return NextResponse.redirect(new URL('/organizations', request.url));
    }
    return NextResponse.next();
  }

  // Check if the request is for an API route
  const isApiRoute = pathname.startsWith('/api/');

  // If not authenticated and trying to access protected route
  if (!session) {
    // For API routes, return 401 Unauthorized
    if (isApiRoute) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    // For page routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // User is authenticated, allow the request
  return NextResponse.next();
}

// Configure paths that should be checked by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next (Next.js internals)
     * 2. static (static files)
     * 3. favicon.ico (browser icon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
