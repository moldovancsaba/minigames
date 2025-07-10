import jwt from 'jsonwebtoken';
import { ValidationError } from '@/lib/errors/ValidationError';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const JWT_SECRET_KEY = JWT_SECRET as jwt.Secret;

interface JWTPayload {
  userId: string;
  exp?: number;
  iat?: number;
}

/**
 * Verifies a JWT token and returns its decoded payload
 * @param token - The JWT token to verify
 * @returns The decoded token payload
 * @throws ValidationError if token is invalid or expired
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return decoded as JWTPayload;
    }
    throw new ValidationError('Invalid token payload');
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ValidationError('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ValidationError('Invalid token');
    }
    throw new ValidationError('Token verification failed');
  }
}

/**
 * Signs a new JWT token
 * @param payload - The data to be included in the token
 * @param expiresIn - Token expiration time (default: 24h)
 * @returns Signed JWT token
 */
export function signJWT(payload: JWTPayload, expiresIn: string = '24h'): string {
  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn } as jwt.SignOptions);
}
