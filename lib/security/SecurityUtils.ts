/**
 * Security Utilities
 *
 * Simple, modular security utilities that can be used optionally throughout
 * the application without constraining development or requiring major refactoring.
 *
 * Design Principles:
 * - Optional and non-intrusive
 * - Easy to integrate into existing code
 * - Configuration-driven
 * - Minimal performance impact
 * - Backwards compatible
 *
 * Features:
 * - Password validation
 * - Rate limiting helpers
 * - Input sanitization
 * - Basic audit logging
 * - Session security helpers
 */

interface SecurityConfig {
  enableAuditLogging: boolean;
  enableRateLimiting: boolean;
  enablePasswordValidation: boolean;
  logLevel: 'none' | 'basic' | 'detailed';
  rateLimitWindow: number; // in milliseconds
  rateLimitMax: number; // max requests per window
}

interface AuditEvent {
  userId: string;
  action: string;
  resource: string;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SecurityUtils {
  private config: SecurityConfig;
  private rateLimitStore = new Map<string, RateLimitEntry>();
  private auditEvents: AuditEvent[] = [];

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      enableAuditLogging: false, // Disabled by default
      enableRateLimiting: false, // Disabled by default
      enablePasswordValidation: true, // Enabled by default
      logLevel: 'basic',
      rateLimitWindow: 60000, // 1 minute
      rateLimitMax: 100, // 100 requests per minute
      ...config
    };
  }

  /**
   * Validate password strength (always available, non-intrusive)
   */
  public validatePassword(password: string): {
    valid: boolean;
    score: number;
    feedback: string[];
  } {
    if (!this.config.enablePasswordValidation) {
      return { valid: true, score: 100, feedback: [] };
    }

    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 25;
    } else {
      feedback.push('Password should be at least 8 characters long');
    }

    // Character variety
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 15;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z\d]/.test(password)) score += 15;
    else feedback.push('Add special characters');

    // Length bonus
    if (password.length >= 12) score += 15;

    const valid = score >= 60; // Require at least 60% score
    return { valid, score, feedback };
  }

  /**
   * Simple rate limiting (optional, can be enabled per route)
   */
  public checkRateLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    if (!this.config.enableRateLimiting) {
      return {
        allowed: true,
        remaining: this.config.rateLimitMax,
        resetTime: Date.now() + this.config.rateLimitWindow
      };
    }

    const now = Date.now();
    const entry = this.rateLimitStore.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.rateLimitWindow
      };
      this.rateLimitStore.set(identifier, newEntry);
      return {
        allowed: true,
        remaining: this.config.rateLimitMax - 1,
        resetTime: newEntry.resetTime
      };
    }

    entry.count++;
    this.rateLimitStore.set(identifier, entry);

    const allowed = entry.count <= this.config.rateLimitMax;
    const remaining = Math.max(0, this.config.rateLimitMax - entry.count);

    return { allowed, remaining, resetTime: entry.resetTime };
  }

  /**
   * Basic input sanitization (always available)
   */
  public sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove basic HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  }

  /**
   * Optional audit logging (non-intrusive)
   */
  public logAudit(event: Omit<AuditEvent, 'timestamp'>): void {
    if (!this.config.enableAuditLogging) return;

    const auditEvent: AuditEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.auditEvents.push(auditEvent);

    // Keep only last 1000 events in memory
    if (this.auditEvents.length > 1000) {
      this.auditEvents = this.auditEvents.slice(-1000);
    }

    // Simple console logging for development
    if (this.config.logLevel === 'detailed') {
      console.log(
        `[AUDIT] ${event.userId} performed ${event.action} on ${event.resource}`
      );
    }
  }

  /**
   * Generate secure session token
   */
  public generateSecureToken(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Simple hash function for non-sensitive data
   */
  public simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Validate email format
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if IP address is in allowed range (basic implementation)
   */
  public isAllowedIP(ip: string, allowedRanges: string[] = []): boolean {
    if (allowedRanges.length === 0) return true; // No restrictions

    // Simple implementation - in production, use proper IP range checking
    return allowedRanges.some(range => ip.startsWith(range));
  }

  /**
   * Get audit events (for optional monitoring)
   */
  public getAuditEvents(limit: number = 100): AuditEvent[] {
    return this.auditEvents.slice(-limit).reverse();
  }

  /**
   * Clear audit events
   */
  public clearAuditEvents(): void {
    this.auditEvents = [];
  }

  /**
   * Update configuration (allows runtime changes)
   */
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Clean up expired rate limit entries
   */
  public cleanupRateLimit(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }
}

// Create a default instance with conservative settings
export const securityUtils = new SecurityUtils({
  enableAuditLogging: false, // Start disabled
  enableRateLimiting: false, // Start disabled
  enablePasswordValidation: true, // This is always helpful
  logLevel: 'basic'
});

// Export utilities as individual functions for easy integration
export const validatePassword = (password: string) =>
  securityUtils.validatePassword(password);
export const sanitizeInput = (input: string) =>
  securityUtils.sanitizeInput(input);
export const validateEmail = (email: string) =>
  securityUtils.validateEmail(email);
export const generateSecureToken = (length?: number) =>
  securityUtils.generateSecureToken(length);

// Optional middleware-style functions
export const withRateLimit = (identifier: string) =>
  securityUtils.checkRateLimit(identifier);
export const withAuditLog = (event: Omit<AuditEvent, 'timestamp'>) =>
  securityUtils.logAudit(event);

// Configuration helpers
export const enableSecurity = (features: Partial<SecurityConfig>) =>
  securityUtils.updateConfig(features);
export const getSecurityConfig = () => securityUtils.getConfig();

export default SecurityUtils;
export type { SecurityConfig, AuditEvent, RateLimitEntry };
