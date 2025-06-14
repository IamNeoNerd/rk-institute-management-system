/**
 * Security Configuration and Utilities
 * Comprehensive security measures for production deployment
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Security Constants
export const SECURITY_CONFIG = {
  JWT_EXPIRY: process.env.JWT_EXPIRY || '4h',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT: 4 * 60 * 60 * 1000 // 4 hours
};

// Rate Limiting Configuration
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: req => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    }
  });
};

// Specific rate limiters
export const authRateLimit = createRateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const apiRateLimit = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const strictRateLimit = createRateLimiter(60 * 1000, 10); // 10 requests per minute

// Helmet Security Headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS Configuration
export const corsConfig = cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

// Input Validation Schemas
export const validationSchemas = {
  email: z.string().email().max(255),
  password: z.string().min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH).max(128),
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z\s'-]+$/),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/)
    .max(20),
  amount: z.number().positive().max(999999.99),
  uuid: z.string().uuid(),
  date: z.string().datetime()
};

// Password Security
export class PasswordSecurity {
  static async hash(password) {
    return bcrypt.hash(password, SECURITY_CONFIG.BCRYPT_ROUNDS);
  }

  static async verify(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static validate(password) {
    const schema = z
      .string()
      .min(SECURITY_CONFIG.PASSWORD_MIN_LENGTH)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .max(128);

    return schema.safeParse(password);
  }

  static generateSecure(length = 16) {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';

    // Ensure at least one character from each required set
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '@$!%*?&'[Math.floor(Math.random() * 7)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}

// JWT Security
export class JWTSecurity {
  static sign(payload, expiresIn = SECURITY_CONFIG.JWT_EXPIRY) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  static verify(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static decode(token) {
    return jwt.decode(token);
  }
}

// Input Sanitization
export class InputSanitizer {
  static sanitizeString(input, maxLength = 255) {
    if (typeof input !== 'string') return '';

    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  static sanitizeNumber(input, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const num = parseFloat(input);
    if (isNaN(num)) return 0;
    return Math.max(min, Math.min(max, num));
  }

  static sanitizeEmail(input) {
    const result = validationSchemas.email.safeParse(input);
    return result.success ? result.data.toLowerCase() : '';
  }
}

// Security Middleware
export function securityMiddleware(req, res, next) {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Remove server information
  res.removeHeader('X-Powered-By');

  next();
}

// Authentication Middleware
export function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = JWTSecurity.verify(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
}

// Role-based Authorization
export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Audit Logging
export class AuditLogger {
  static async log(action, details, userId, familyId = null) {
    try {
      // This would integrate with your audit trail system
      console.log(
        `[AUDIT] ${new Date().toISOString()} - ${action} by ${userId}:`,
        details
      );

      // In production, save to database
      // await prisma.auditTrail.create({
      //   data: {
      //     action,
      //     details: JSON.stringify(details),
      //     performedBy: userId,
      //     familyId,
      //   }
      // });
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }
}

// File Upload Security
export const fileUploadConfig = {
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
};

export default {
  SECURITY_CONFIG,
  createRateLimiter,
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  helmetConfig,
  corsConfig,
  validationSchemas,
  PasswordSecurity,
  JWTSecurity,
  InputSanitizer,
  securityMiddleware,
  requireAuth,
  requireRole,
  AuditLogger,
  fileUploadConfig
};
