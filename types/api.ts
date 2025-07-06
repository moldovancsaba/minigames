import { NextRequest } from 'next/server';

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: string; // ISO timestamp
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

// Enhanced request tracking
export interface RequestMetadata {
  ip: string;
  userAgent: string;
  timestamp: string;
  path: string;
  method: string;
}

// Public API response envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  rateLimit: RateLimitInfo;
}

// Request size limits
export const REQUEST_SIZE_LIMITS = {
  json: '10mb',
  form: '5mb',
  text: '1mb'
} as const;

// CORS configuration
export const CORS_CONFIG = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400 // 24 hours
} as const;

// Middleware function types
export type RateLimitMiddleware = (
  req: NextRequest,
  metadata: RequestMetadata
) => Promise<RateLimitInfo | null>;

export type RequestValidationMiddleware = (
  req: NextRequest,
  metadata: RequestMetadata
) => Promise<Response | null>;
