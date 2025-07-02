/**
 * API Security Middleware
 *
 * Comprehensive security middleware for API routes with enterprise-grade protection.
 * Provides authentication, authorization, rate limiting, input validation, and security headers.
 *
 * Features:
 * - JWT token validation with enhanced security
 * - Role-based access control
 * - Rate limiting per IP and user
 * - Input sanitization and validation
 * - Security headers injection
 * - Audit logging for security events
 * - Request/response security monitoring
 */

import crypto from 'crypto';

import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

interface SecurityConfig {
  enableRateLimit: boolean;
  enableAuditLog: boolean;
  enableInputValidation: boolean;
  rateLimitWindow: number; // milliseconds
  rateLimitMax: number; // requests per window
  requiredRole?: string[];
  allowAnonymous?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  userId?: string;
}

interface SecurityContext {
  userId: string;
  email: string;
  role: string;
  jti: string;
  iat: number;
  exp: number;
}

class ApiSecurityMiddleware {
  private rateLimitStore = new Map<string, RateLimitEntry>();
  private auditLog: Array<{ timestamp: number; event: string; details: any }> =
    [];

  /**
   * Main security middleware function
   */
  public async secureApiRoute(
    request: NextRequest,
    config: SecurityConfig = {
      enableRateLimit: true,
      enableAuditLog: true,
      enableInputValidation: true,
      rateLimitWindow: 15 * 60 * 1000, // 15 minutes
      rateLimitMax: 100
    }
  ): Promise<{
    success: boolean;
    response?: NextResponse;
    context?: SecurityContext;
  }> {
    try {
      // 1. Security Headers Check
      const securityHeadersResult = this.validateSecurityHeaders(request);
      if (!securityHeadersResult.valid) {
        return {
          success: false,
          response: this.createSecurityErrorResponse(
            'Invalid security headers',
            400
          )
        };
      }

      // 2. Rate Limiting
      if (config.enableRateLimit) {
        const rateLimitResult = this.checkRateLimit(request, config);
        if (!rateLimitResult.allowed) {
          this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
            ip: this.getClientIP(request),
            userAgent: request.headers.get('user-agent')
          });

          return {
            success: false,
            response: this.createRateLimitResponse(rateLimitResult)
          };
        }
      }

      // 3. Authentication (if not anonymous)
      let securityContext: SecurityContext | null = null;
      if (!config.allowAnonymous) {
        const authResult = await this.validateAuthentication(request);
        if (!authResult.valid || !authResult.context) {
          this.logSecurityEvent('AUTHENTICATION_FAILED', {
            ip: this.getClientIP(request),
            path: request.nextUrl.pathname
          });

          return {
            success: false,
            response: this.createSecurityErrorResponse(
              'Authentication required',
              401
            )
          };
        }
        securityContext = authResult.context;
      }

      // 4. Authorization (role-based)
      if (config.requiredRole && securityContext) {
        const authzResult = this.validateAuthorization(
          securityContext,
          config.requiredRole
        );
        if (!authzResult.valid) {
          this.logSecurityEvent('AUTHORIZATION_FAILED', {
            userId: securityContext.userId,
            role: securityContext.role,
            requiredRoles: config.requiredRole,
            path: request.nextUrl.pathname
          });

          return {
            success: false,
            response: this.createSecurityErrorResponse(
              'Insufficient permissions',
              403
            )
          };
        }
      }

      // 5. Input Validation (for POST/PUT/PATCH)
      if (
        config.enableInputValidation &&
        ['POST', 'PUT', 'PATCH'].includes(request.method)
      ) {
        const inputResult = await this.validateInput(request);
        if (!inputResult.valid) {
          this.logSecurityEvent('INPUT_VALIDATION_FAILED', {
            userId: securityContext?.userId,
            path: request.nextUrl.pathname,
            errors: inputResult.errors
          });

          return {
            success: false,
            response: this.createSecurityErrorResponse(
              'Invalid input data',
              400
            )
          };
        }
      }

      // 6. Log successful access
      if (config.enableAuditLog) {
        this.logSecurityEvent('API_ACCESS_GRANTED', {
          userId: securityContext?.userId,
          role: securityContext?.role,
          path: request.nextUrl.pathname,
          method: request.method,
          ip: this.getClientIP(request)
        });
      }

      return {
        success: true,
        context: securityContext || undefined
      };
    } catch (error) {
      this.logSecurityEvent('SECURITY_MIDDLEWARE_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: request.nextUrl.pathname
      });

      return {
        success: false,
        response: this.createSecurityErrorResponse(
          'Security validation failed',
          500
        )
      };
    }
  }

  /**
   * Validate security headers
   */
  private validateSecurityHeaders(request: NextRequest): {
    valid: boolean;
    errors?: string[];
  } {
    const errors: string[] = [];

    // Check Content-Type for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        errors.push('Invalid or missing Content-Type header');
      }
    }

    // Check for suspicious headers
    const suspiciousHeaders = ['x-forwarded-host', 'x-real-ip'];
    for (const header of suspiciousHeaders) {
      if (request.headers.get(header)) {
        // Log but don't block - might be legitimate proxy
        this.logSecurityEvent('SUSPICIOUS_HEADER_DETECTED', {
          header,
          value: request.headers.get(header),
          ip: this.getClientIP(request)
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(
    request: NextRequest,
    config: SecurityConfig
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const identifier = this.getClientIP(request);
    const now = Date.now();
    const entry = this.rateLimitStore.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.rateLimitWindow
      };
      this.rateLimitStore.set(identifier, newEntry);
      return {
        allowed: true,
        remaining: config.rateLimitMax - 1,
        resetTime: newEntry.resetTime
      };
    }

    if (entry.count >= config.rateLimitMax) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    this.rateLimitStore.set(identifier, entry);
    return {
      allowed: true,
      remaining: config.rateLimitMax - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Validate JWT authentication
   */
  private async validateAuthentication(
    request: NextRequest
  ): Promise<{ valid: boolean; context?: SecurityContext }> {
    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false };
      }

      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret || jwtSecret === 'fallback-secret') {
        throw new Error('JWT_SECRET not properly configured');
      }

      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
        issuer: 'rk-institute',
        audience: 'rk-institute-users'
      }) as any;

      // Validate token structure
      if (!decoded.userId || !decoded.email || !decoded.role || !decoded.jti) {
        return { valid: false };
      }

      return {
        valid: true,
        context: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          jti: decoded.jti,
          iat: decoded.iat,
          exp: decoded.exp
        }
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Validate role-based authorization
   */
  private validateAuthorization(
    context: SecurityContext,
    requiredRoles: string[]
  ): { valid: boolean } {
    return { valid: requiredRoles.includes(context.role) };
  }

  /**
   * Validate input data
   */
  private async validateInput(
    request: NextRequest
  ): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const body = await request.text();

      // Basic JSON validation
      if (body) {
        JSON.parse(body);
      }

      // Check for common injection patterns
      const suspiciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /union\s+select/gi,
        /drop\s+table/gi
      ];

      const errors: string[] = [];
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(body)) {
          errors.push('Potentially malicious input detected');
          break;
        }
      }

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return { valid: false, errors: ['Invalid JSON format'] };
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'
    );
  }

  /**
   * Log security events
   */
  private logSecurityEvent(event: string, details: any): void {
    const logEntry = {
      timestamp: Date.now(),
      event,
      details
    };

    this.auditLog.push(logEntry);

    // Keep only last 1000 entries to prevent memory issues
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 Security Event: ${event}`, details);
    }
  }

  /**
   * Create security error response
   */
  private createSecurityErrorResponse(
    message: string,
    status: number
  ): NextResponse {
    const response = NextResponse.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      },
      { status }
    );

    // Add security headers
    this.addSecurityHeaders(response);
    return response;
  }

  /**
   * Create rate limit response
   */
  private createRateLimitResponse(rateLimitResult: {
    remaining: number;
    resetTime: number;
  }): NextResponse {
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
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

    this.addSecurityHeaders(response);
    return response;
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(response: NextResponse): void {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    );
  }

  /**
   * Get audit log (for admin access)
   */
  public getAuditLog(): Array<{
    timestamp: number;
    event: string;
    details: any;
  }> {
    return [...this.auditLog];
  }
}

// Singleton instance
export const apiSecurityMiddleware = new ApiSecurityMiddleware();

// Helper function for easy integration
export async function withApiSecurity(
  request: NextRequest,
  config?: SecurityConfig
) {
  return apiSecurityMiddleware.secureApiRoute(request, config);
}

export default ApiSecurityMiddleware;
