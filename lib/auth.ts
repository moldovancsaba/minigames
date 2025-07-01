import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Define JWT secret with fallback for development
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_jwt_secret_key_please_change_in_production'
)

// JWT payload interface
export interface UserJwtPayload {
  [key: string]: string | undefined;  // Index signature for JWTPayload compatibility
  email: string
  role: string
}

/**
 * Creates a JWT token with the provided user payload
 * @param payload User information to encode in the token
 * @returns Promise resolving to the signed JWT token
 */
export async function createToken(payload: UserJwtPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Token expires in 24 hours
    .sign(JWT_SECRET)
  
  return token
}

/**
 * Verifies a JWT token and returns its payload
 * @param token JWT token to verify
 * @returns Promise resolving to the decoded token payload
 */
export async function verifyToken(token: string): Promise<UserJwtPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as UserJwtPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

/**
 * Extracts and verifies the JWT token from cookies
 * @param req Next.js request object
 * @returns Promise resolving to the user payload if valid token exists
 */
export async function getSession(req: NextRequest): Promise<UserJwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    return null
  }

  try {
    return await verifyToken(token.value)
  } catch {
    return null
  }
}

/**
 * Sets the authentication cookie with the JWT token
 * @param token JWT token to store in cookie
 */
export function setUserCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours in seconds
    path: '/'
  });
  return response;
}

/**
 * Removes the authentication cookie
 */
export function clearUserCookie(): NextResponse {
  const response = new NextResponse(null);
  response.cookies.delete('auth-token');
  return response;
}
