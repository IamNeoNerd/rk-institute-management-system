/**
 * Next.js Middleware - Security and Performance Enhancement
 *
 * Comprehensive middleware for enterprise-grade security, performance optimization,
 * and request handling for the RK Institute Management System.
 *
 * Features:
 * - Security headers injection
 * - Rate limiting and DDoS protection
 * - Authentication and authorization
 * - Request/response monitoring
 * - Performance optimization
 * - CORS handling
 * - CSP (Content Security Policy) enforcement
 */

import { NextRequest, NextResponse } from 'next/server';

import { withApiSecurity } from './lib/security/ApiSecurityMiddleware';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // requests per window
  authRateLimitMax: 5, // auth attempts per window

  // Security headers
  enableHSTS: true,
  enableCSP: true,
  enableXSSProtection: true,

  // Protected routes
  protectedRoutes: ['/admin', '/teacher', '/parent', '/student'],
  authRoutes: ['/api/auth'],
  publicRoutes: ['/', '/login', '/about', '/contact']
};

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Add security headers to all responses
  addSecurityHeaders(response, request);

  // 2. Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    handleCORS(response, request);
  }

  // 3. Rate limiting
  const rateLimitResult = checkRateLimit(request);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  // 4. API route security
  if (pathname.startsWith('/api/')) {
    return handleApiSecurity(request, response);
  }

  // 5. Protected route authentication
  if (isProtectedRoute(pathname)) {
    return handleProtectedRoute(request, response);
  }

  // 6. Performance optimizations
  addPerformanceHeaders(response);

  return response;
}

/**
 * Add comprehensive security headers
 */
function addSecurityHeaders(
  response: NextResponse,
  request: NextRequest
): void {
  // Content Security Policy
  if (SECURITY_CONFIG.enableCSP) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.vercel.com wss://ws-us3.pusher.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);
  }

  // HTTP Strict Transport Security
  if (SECURITY_CONFIG.enableHSTS) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // XSS Protection
  if (SECURITY_CONFIG.enableXSSProtection) {
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // Remove server information
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');

  // Add custom security headers
  response.headers.set('X-Security-Policy', 'RK-Institute-Security-v1.0');
  response.headers.set('X-Request-ID', crypto.randomUUID());
}

/**
 * Handle CORS for API routes
 */
function handleCORS(
  response: NextResponse,
  request: NextRequest
): NextResponse | void {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'https://rk-institute.vercel.app',
    process.env.NEXT_PUBLIC_APP_URL
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
}

/**
 * Rate limiting implementation
 */
function checkRateLimit(request: NextRequest): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const identifier = getClientIdentifier(request);
  const now = Date.now();
  const isAuthRoute = SECURITY_CONFIG.authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );
  const maxRequests = isAuthRoute
    ? SECURITY_CONFIG.authRateLimitMax
    : SECURITY_CONFIG.rateLimitMax;

  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const newEntry = {
      count: 1,
      resetTime: now + SECURITY_CONFIG.rateLimitWindow
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime
    };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  rateLimitStore.set(identifier, entry);
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

/**
 * Create rate limit response
 */
function createRateLimitResponse(rateLimitResult: {
  remaining: number;
  resetTime: number;
}): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    },
    { status: 429 }
  );

  response.headers.set(
    'X-RateLimit-Remaining',
    rateLimitResult.remaining.toString()
  );
  response.headers.set(
    'X-RateLimit-Reset',
    rateLimitResult.resetTime.toString()
  );
  response.headers.set(
    'Retry-After',
    Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
  );

  return response;
}

/**
 * Handle API route security
 */
async function handleApiSecurity(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Skip security for public API routes
  const publicApiRoutes = ['/api/health', '/api/status'];
  if (publicApiRoutes.includes(pathname)) {
    return response;
  }

  // Apply API security middleware
  const securityResult = await withApiSecurity(request, {
    enableRateLimit: true,
    enableAuditLog: true,
    enableInputValidation: true,
    rateLimitWindow: SECURITY_CONFIG.rateLimitWindow,
    rateLimitMax: SECURITY_CONFIG.rateLimitMax,
    allowAnonymous: pathname === '/api/auth/login'
  });

  if (!securityResult.success && securityResult.response) {
    return securityResult.response;
  }

  return response;
}

/**
 * Check if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return SECURITY_CONFIG.protectedRoutes.some(route =>
    pathname.startsWith(route)
  );
}

/**
 * Handle protected route authentication
 */
function handleProtectedRoute(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  // Check for authentication token in cookies or headers
  const token =
    request.cookies.get('auth-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    // Redirect to login page
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // In a real implementation, you would verify the JWT token here
  // For now, we'll assume the token is valid if present
  return response;
}

/**
 * Add performance optimization headers
 */
function addPerformanceHeaders(response: NextResponse): void {
  // Cache control for static assets
  response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  // Preload critical resources
  response.headers.set(
    'Link',
    '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin'
  );

  // Enable compression
  response.headers.set('Vary', 'Accept-Encoding');
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Use IP address as primary identifier
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';

  // Include user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const userAgentHash = Buffer.from(userAgent).toString('base64').slice(0, 8);

  return `${ip}:${userAgentHash}`;
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)'
  ]
};

export default middleware;
