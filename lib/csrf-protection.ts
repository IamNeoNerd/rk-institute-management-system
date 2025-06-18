/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

import { NextRequest, NextResponse } from 'next/server';

// CSRF token configuration
const CSRF_CONFIG = {
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24 hours
  }
};

/**
 * Generate a CSRF token (Edge Runtime compatible)
 */
export function generateCSRFToken(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(CSRF_CONFIG.tokenLength);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(request: NextRequest): boolean {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_CONFIG.cookieName)?.value;
  
  // Get token from header
  const headerToken = request.headers.get(CSRF_CONFIG.headerName);
  
  // Both tokens must exist and match
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Simple string comparison (Edge Runtime compatible)
  // In production, consider implementing timing-safe comparison
  return cookieToken === headerToken;
}

/**
 * CSRF protection middleware for API routes
 */
export function withCSRFProtection(handler: Function) {
  return async (request: NextRequest) => {
    // Validate CSRF token for state-changing requests
    if (!validateCSRFToken(request)) {
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      );
    }

    return handler(request);
  };
}

/**
 * Set CSRF token in response
 */
export function setCSRFToken(response: NextResponse): NextResponse {
  const token = generateCSRFToken();
  
  // Set token in cookie
  response.cookies.set(CSRF_CONFIG.cookieName, token, CSRF_CONFIG.cookieOptions);
  
  // Also set in header for client-side access
  response.headers.set('x-csrf-token', token);
  
  return response;
}

/**
 * CSRF protection for Next.js API routes
 */
export function csrfProtection(request: NextRequest, response: NextResponse) {
  // Generate and set CSRF token for new sessions
  if (!request.cookies.get(CSRF_CONFIG.cookieName)) {
    setCSRFToken(response);
  }
  
  // Validate CSRF token for state-changing requests
  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      { error: 'CSRF token validation failed' },
      { status: 403 }
    );
  }
  
  return null; // Continue with request
}

/**
 * Client-side CSRF token helper
 */
export const CSRFClient = {
  /**
   * Get CSRF token from cookie (client-side)
   */
  getToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${CSRF_CONFIG.cookieName}=`)
    );
    
    return csrfCookie ? csrfCookie.split('=')[1] : null;
  },

  /**
   * Add CSRF token to fetch request headers
   */
  addToHeaders(headers: HeadersInit = {}): HeadersInit {
    const token = this.getToken();
    if (token) {
      return {
        ...headers,
        [CSRF_CONFIG.headerName]: token
      };
    }
    return headers;
  },

  /**
   * Create fetch wrapper with CSRF protection
   */
  fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = this.addToHeaders(options.headers);
    return fetch(url, { ...options, headers });
  }
};

export default {
  generateCSRFToken,
  validateCSRFToken,
  withCSRFProtection,
  setCSRFToken,
  csrfProtection,
  CSRFClient,
  CSRF_CONFIG
};
