import { NextRequest, NextResponse } from 'next/server';
import {
  RateLimitInfo,
  RateLimitConfig,
  RequestMetadata,
  REQUEST_SIZE_LIMITS,
  CORS_CONFIG,
  ApiResponse
} from '@/types/api';

import { redisClient, getRateLimit, setRateLimit } from '@/lib/redis';

// Default rate limit configuration per endpoint
const rateLimitConfigs: { [key: string]: RateLimitConfig } = {
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 requests per minute
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 30 // 30 requests per 15 minutes
  },
  images: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100 // 100 requests per minute
  }
};

// DDoS protection thresholds
const ddosThresholds = {
  maxRequestsPerSecond: 10,
  maxConcurrentRequests: 50,
  maxPayloadSize: 10 * 1024 * 1024, // 10MB
  blockDuration: 60 * 60, // 1 hour in seconds
  suspiciousPatterns: [
    /\.(php|asp|aspx|jsp|cgi)$/i,
    /\/wp\-/i,
    /\/admin/i,
    /\/vendor/i
  ]
};

// Track concurrent requests
let concurrentRequests = 0;
const requestsPerSecond = new Map<string, number>();

/**
 * Get client IP from request
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || '127.0.0.1';
}

/**
 * Create request metadata
 */
export function createRequestMetadata(req: NextRequest): RequestMetadata {
  return {
    ip: getClientIp(req),
    userAgent: req.headers.get('user-agent') || 'unknown',
    timestamp: new Date().toISOString(),
    path: req.nextUrl.pathname,
    method: req.method
  };
}

/**
 * Check rate limit for IP and endpoint
 */
export async function checkRateLimit(ip: string, endpoint: string): Promise<RateLimitInfo> {
  const config = rateLimitConfigs[endpoint] || rateLimitConfigs.default;
  const key = `rate_limit:${ip}:${endpoint}`;
  const now = Date.now();
  const windowSecs = Math.floor(config.windowMs / 1000);
  
  // Get and increment rate limit counter
  const count = await getRateLimit(key);
  await setRateLimit(key, config.maxRequests, windowSecs);
  
  // Calculate reset time
  const resetTime = now - (now % config.windowMs) + config.windowMs;
  
  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - count),
    reset: new Date(resetTime).toISOString()
  };
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  headers.set('Access-Control-Allow-Methods', CORS_CONFIG.methods.join(', '));
  headers.set('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
  headers.set('Access-Control-Expose-Headers', CORS_CONFIG.exposedHeaders.join(', '));
  headers.set('Access-Control-Max-Age', CORS_CONFIG.maxAge.toString());
  
  if (CORS_CONFIG.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Check request body size
 */
export async function checkRequestSize(req: NextRequest): Promise<Response | null> {
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
  const contentType = req.headers.get('content-type') || '';
  
  let limit = 1024 * 1024; // 1MB default
  
  if (contentType.includes('application/json')) {
    limit = 10 * 1024 * 1024; // 10MB for JSON
  } else if (contentType.includes('multipart/form-data')) {
    limit = 5 * 1024 * 1024; // 5MB for form data
  }
  
  if (contentLength > limit) {
    return NextResponse.json({
      success: false,
      error: 'Request body too large',
      timestamp: new Date().toISOString()
    }, { status: 413 });
  }
  
  return null;
}

/**
 * Sanitize request body
 */
export function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(body)) {
    // Remove potential XSS content
    if (typeof value === 'string') {
      sanitized[key] = value
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
    }
    // Recursively sanitize nested objects
    else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeRequestBody(value);
    }
    // Keep other types as is
    else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Format API response
 */
export function formatApiResponse<T>(
  data: T | null,
  error: string | null = null,
  status: number = 200,
  rateLimit: RateLimitInfo
): Response {
  const response: ApiResponse<T> = {
    success: !error && status < 400,
    timestamp: new Date().toISOString(),
    rateLimit
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (error) {
    response.error = error;
  }
  
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
  headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  headers.set('X-RateLimit-Reset', rateLimit.reset);
  
  return NextResponse.json(response, { status, headers });
}

/**
 * Check for DDoS attack patterns
 */
async function checkDDoSPatterns(req: NextRequest, metadata: RequestMetadata): Promise<Response | null> {
  const ip = metadata.ip;
  
  // Check suspicious URL patterns
  if (ddosThresholds.suspiciousPatterns.some(pattern => pattern.test(req.url))) {
    await redisClient.setex(`blocked:${ip}`, ddosThresholds.blockDuration, '1');
    return formatApiResponse(null, 'Access denied', 403, { limit: 0, remaining: 0, reset: new Date().toISOString() });
  }
  
  // Check if IP is blocked
  const isBlocked = await redisClient.get(`blocked:${ip}`);
  if (isBlocked) {
    return formatApiResponse(null, 'Access denied', 403, { limit: 0, remaining: 0, reset: new Date().toISOString() });
  }
  
  // Track requests per second
  const now = Math.floor(Date.now() / 1000);
  const reqCount = requestsPerSecond.get(ip) || 0;
  requestsPerSecond.set(ip, reqCount + 1);
  
  // Clear counters after 1 second
  setTimeout(() => requestsPerSecond.delete(ip), 1000);
  
  // Check request rate
  if (reqCount > ddosThresholds.maxRequestsPerSecond) {
    await redisClient.setex(`blocked:${ip}`, ddosThresholds.blockDuration, '1');
    return formatApiResponse(null, 'Too many requests', 429, { limit: 0, remaining: 0, reset: new Date().toISOString() });
  }
  
  // Check concurrent requests
  if (concurrentRequests >= ddosThresholds.maxConcurrentRequests) {
    return formatApiResponse(null, 'Server is busy', 503, { limit: 0, remaining: 0, reset: new Date().toISOString() });
  }
  
  return null;
}

/**
 * Public API middleware
 */
export async function publicApiMiddleware(req: NextRequest) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return applyCorsHeaders(new Response(null, { status: 204 }));
  }
  
  // Get request metadata
  const metadata = createRequestMetadata(req);
  
  // Increment concurrent requests counter
  concurrentRequests++;
  
  try {
    // Check for DDoS patterns
    const ddosCheck = await checkDDoSPatterns(req, metadata);
    if (ddosCheck) {
      return applyCorsHeaders(ddosCheck);
    }

    // Determine endpoint type for rate limiting
    let endpoint = 'default';
    if (req.url.includes('/api/auth')) endpoint = 'auth';
    if (req.url.includes('/api/images')) endpoint = 'images';

    // Check rate limit
    const rateLimitInfo = await checkRateLimit(metadata.ip, endpoint);
    if (rateLimitInfo.remaining <= 0) {
      return applyCorsHeaders(
        formatApiResponse(null, 'Rate limit exceeded', 429, rateLimitInfo)
      );
    }

    // Check request size
    if (req.method !== 'GET') {
      const sizeError = await checkRequestSize(req);
      if (sizeError) {
        return applyCorsHeaders(sizeError);
      }
    }
  
    // Clone the request to read the body
    const clonedReq = req.clone();
  
    try {
      // Get and sanitize body for non-GET requests
      if (req.method !== 'GET') {
        const body = await clonedReq.json();
        const sanitizedBody = sanitizeRequestBody(body);
        
        // Create new request with sanitized body
        const newReq = new NextRequest(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(sanitizedBody)
        });
        
        // Replace original request
        Object.assign(req, newReq);
      }
      
      // Continue to route handler
      return null;
    } catch (error) {
      return applyCorsHeaders(
        formatApiResponse(
          null,
          'Invalid request body',
          400,
          rateLimitInfo
        )
      );
    }
  } finally {
    // Decrement concurrent requests counter
    concurrentRequests--;
  }
}
