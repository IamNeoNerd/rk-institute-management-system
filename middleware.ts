import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/teacher', 
  '/parent',
  '/student',
  '/dashboard'
];

// Define role-based route access
const roleRoutes = {
  ADMIN: ['/admin'],
  TEACHER: ['/teacher'],
  PARENT: ['/parent'], 
  STUDENT: ['/student']
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/auth',
  '/test-login',
  '/api/auth',
  '/api/health',
  '/_next',
  '/favicon.ico'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Basic security headers (Phase 3 Security Enhancement)
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSRF protection implemented at API route level for Edge Runtime compatibility

  // Skip middleware for public routes and static assets
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get token from Authorization header or cookie
  let token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    // Try to get token from cookie
    token = request.cookies.get('token')?.value;
  }

  if (!token) {
    // No token found - redirect to login
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!token) {
    // No token found - redirect to login
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Basic JWT structure validation (without full verification for Edge Runtime compatibility)
    const parts = token!.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode payload (without signature verification for now)
    const payload = JSON.parse(atob(parts[1]));

    if (!payload || !payload.role) {
      throw new Error('Invalid token payload');
    }

    // Check token expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }

    // Check role-based access
    const userRole = payload.role;
    const hasAccess = Object.entries(roleRoutes).some(([role, routes]) => {
      if (role === userRole) {
        return routes.some(route => pathname.startsWith(route));
      }
      return false;
    });

    if (!hasAccess) {
      // User doesn't have access to this route - redirect to their dashboard
      const redirectUrl = new URL(getRoleDashboard(userRole), request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Add user info to request headers for use in pages
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId || '');
    response.headers.set('x-user-role', payload.role);
    response.headers.set('x-user-email', payload.email || '');

    return response;

  } catch (error) {
    // Invalid token - redirect to login
    console.error('Token validation error:', error);
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'session_expired');
    return NextResponse.redirect(loginUrl);
  }
}

function getRoleDashboard(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'TEACHER':
      return '/teacher/dashboard';
    case 'PARENT':
      return '/parent/dashboard';
    case 'STUDENT':
      return '/student/dashboard';
    default:
      return '/';
  }
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
