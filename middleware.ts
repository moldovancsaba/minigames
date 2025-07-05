import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// All routes are public, no authentication required
export async function middleware(request: NextRequest) {
  // Always allow access
  return NextResponse.next();
}

// No need to check any paths
export const config = {
  matcher: [],
};
