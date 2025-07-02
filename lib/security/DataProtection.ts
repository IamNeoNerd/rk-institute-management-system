/**
 * Data Protection and Privacy Utilities
 *
 * Comprehensive data protection utilities for handling sensitive student information
 * in compliance with FERPA and educational data privacy requirements.
 *
 * Features:
 * - Field-level encryption for sensitive data
 * - Data masking and anonymization
 * - PII (Personally Identifiable Information) detection
 * - Secure data sanitization
 * - Audit trail for data access
 * - FERPA compliance helpers
 */

import crypto from 'crypto';

interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  requiresEncryption: boolean;
  requiresAudit: boolean;
  retentionPeriod?: number; // days
}

interface SensitiveField {
  fieldName: string;
  classification: DataClassification;
  maskingPattern?: string;
}

class DataProtectionService {
  private readonly encryptionConfig: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16
  };

  private readonly encryptionKey: Buffer;
  private readonly auditLog: Array<{
    timestamp: number;
    action: string;
    field: string;
    userId?: string;
  }> = [];

  // Define sensitive fields for student data
  private readonly sensitiveFields: Map<string, SensitiveField> = new Map([
    [
      'ssn',
      {
        fieldName: 'ssn',
        classification: {
          level: 'restricted',
          requiresEncryption: true,
          requiresAudit: true
        },
        maskingPattern: 'XXX-XX-####'
      }
    ],
    [
      'email',
      {
        fieldName: 'email',
        classification: {
          level: 'confidential',
          requiresEncryption: false,
          requiresAudit: true
        },
        maskingPattern: '####@####.com'
      }
    ],
    [
      'phone',
      {
        fieldName: 'phone',
        classification: {
          level: 'confidential',
          requiresEncryption: false,
          requiresAudit: true
        },
        maskingPattern: '(###) ###-####'
      }
    ],
    [
      'address',
      {
        fieldName: 'address',
        classification: {
          level: 'confidential',
          requiresEncryption: true,
          requiresAudit: true
        }
      }
    ],
    [
      'dateOfBirth',
      {
        fieldName: 'dateOfBirth',
        classification: {
          level: 'restricted',
          requiresEncryption: true,
          requiresAudit: true
        }
      }
    ],
    [
      'emergencyContact',
      {
        fieldName: 'emergencyContact',
        classification: {
          level: 'confidential',
          requiresEncryption: true,
          requiresAudit: true
        }
      }
    ],
    [
      'medicalInfo',
      {
        fieldName: 'medicalInfo',
        classification: {
          level: 'restricted',
          requiresEncryption: true,
          requiresAudit: true
        }
      }
    ],
    [
      'parentIncome',
      {
        fieldName: 'parentIncome',
        classification: {
          level: 'restricted',
          requiresEncryption: true,
          requiresAudit: true
        }
      }
    ]
  ]);

  constructor() {
    // Initialize encryption key from environment or generate one
    const keyString = process.env.DATA_ENCRYPTION_KEY;
    if (keyString) {
      this.encryptionKey = Buffer.from(keyString, 'hex');
    } else {
      // Generate a key for development (should be set in production)
      this.encryptionKey = crypto.randomBytes(this.encryptionConfig.keyLength);
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '⚠️ Using generated encryption key. Set DATA_ENCRYPTION_KEY in production.'
        );
      }
    }
  }

  /**
   * Encrypt sensitive data
   */
  public encryptSensitiveData(data: string, fieldName?: string): string {
    try {
      const iv = crypto.randomBytes(this.encryptionConfig.ivLength);
      const cipher = crypto.createCipher(
        this.encryptionConfig.algorithm,
        this.encryptionKey
      );

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = (cipher as any).getAuthTag();

      // Combine IV, auth tag, and encrypted data
      const result =
        iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;

      // Log encryption event
      if (fieldName) {
        this.logDataAccess('ENCRYPT', fieldName);
      }

      return result;
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrypt sensitive data
   */
  public decryptSensitiveData(
    encryptedData: string,
    fieldName?: string
  ): string {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipher(
        this.encryptionConfig.algorithm,
        this.encryptionKey
      );
      (decipher as any).setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      // Log decryption event
      if (fieldName) {
        this.logDataAccess('DECRYPT', fieldName);
      }

      return decrypted;
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Mask sensitive data for display
   */
  public maskSensitiveData(data: string, fieldName: string): string {
    const fieldConfig = this.sensitiveFields.get(fieldName);
    if (!fieldConfig || !fieldConfig.maskingPattern) {
      // Default masking - show first and last characters
      if (data.length <= 2) return '*'.repeat(data.length);
      return data[0] + '*'.repeat(data.length - 2) + data[data.length - 1];
    }

    // Apply specific masking pattern
    const pattern = fieldConfig.maskingPattern;
    if (fieldName === 'ssn') {
      // SSN: XXX-XX-1234
      return data.replace(/(\d{3})-(\d{2})-(\d{4})/, 'XXX-XX-$3');
    } else if (fieldName === 'email') {
      // Email: j***@example.com
      const [local, domain] = data.split('@');
      return local[0] + '*'.repeat(local.length - 1) + '@' + domain;
    } else if (fieldName === 'phone') {
      // Phone: (***) ***-1234
      return data.replace(/(\(\d{3}\) \d{3}-)(\d{4})/, '(***) ***-$2');
    }

    return data.replace(/./g, '*');
  }

  /**
   * Detect PII in text content
   */
  public detectPII(
    text: string
  ): Array<{ type: string; value: string; confidence: number }> {
    const piiPatterns = [
      { type: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, confidence: 0.9 },
      {
        type: 'email',
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        confidence: 0.95
      },
      {
        type: 'phone',
        pattern: /\b\(\d{3}\)\s?\d{3}-\d{4}\b/g,
        confidence: 0.8
      },
      {
        type: 'creditCard',
        pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
        confidence: 0.7
      }
    ];

    const detected: Array<{ type: string; value: string; confidence: number }> =
      [];

    for (const { type, pattern, confidence } of piiPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          detected.push({ type, value: match, confidence });
        }
      }
    }

    return detected;
  }

  /**
   * Sanitize data for safe storage/display
   */
  public sanitizeData(
    data: any,
    options: { removeHtml?: boolean; removeSql?: boolean } = {}
  ): any {
    if (typeof data === 'string') {
      let sanitized = data;

      // Remove HTML tags if requested
      if (options.removeHtml) {
        sanitized = sanitized.replace(/<[^>]*>/g, '');
      }

      // Remove potential SQL injection patterns
      if (options.removeSql) {
        const sqlPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
          /(--|\/\*|\*\/)/g,
          /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi
        ];

        for (const pattern of sqlPatterns) {
          sanitized = sanitized.replace(pattern, '');
        }
      }

      // Remove null bytes and control characters
      sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

      return sanitized.trim();
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item, options));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value, options);
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Process student data with appropriate protection
   */
  public processStudentData(
    studentData: any,
    operation: 'store' | 'retrieve' | 'display',
    userId?: string
  ): any {
    const processed = { ...studentData };

    for (const [fieldName, fieldConfig] of this.sensitiveFields) {
      if (processed[fieldName] !== undefined && processed[fieldName] !== null) {
        switch (operation) {
          case 'store':
            if (fieldConfig.classification.requiresEncryption) {
              processed[fieldName] = this.encryptSensitiveData(
                processed[fieldName],
                fieldName
              );
            }
            break;

          case 'retrieve':
            if (
              fieldConfig.classification.requiresEncryption &&
              typeof processed[fieldName] === 'string'
            ) {
              try {
                processed[fieldName] = this.decryptSensitiveData(
                  processed[fieldName],
                  fieldName
                );
              } catch (error) {
                console.error(`Failed to decrypt field ${fieldName}:`, error);
                processed[fieldName] = '[ENCRYPTED]';
              }
            }
            break;

          case 'display':
            processed[fieldName] = this.maskSensitiveData(
              processed[fieldName],
              fieldName
            );
            break;
        }

        // Log access for audit trail
        if (fieldConfig.classification.requiresAudit) {
          this.logDataAccess(operation.toUpperCase(), fieldName, userId);
        }
      }
    }

    return processed;
  }

  /**
   * FERPA compliance check
   */
  public checkFERPACompliance(dataAccess: {
    userId: string;
    userRole: string;
    studentId: string;
    requestedFields: string[];
    purpose: string;
  }): { compliant: boolean; violations: string[]; recommendations: string[] } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check if user has legitimate educational interest
    const legitimateRoles = ['ADMIN', 'TEACHER', 'COUNSELOR'];
    if (!legitimateRoles.includes(dataAccess.userRole)) {
      violations.push(
        'User role does not have legitimate educational interest'
      );
    }

    // Check for excessive data access
    const restrictedFields = ['ssn', 'medicalInfo', 'parentIncome'];
    const requestedRestrictedFields = dataAccess.requestedFields.filter(field =>
      restrictedFields.includes(field)
    );

    if (
      requestedRestrictedFields.length > 0 &&
      dataAccess.userRole !== 'ADMIN'
    ) {
      violations.push(
        `Access to restricted fields requires admin approval: ${requestedRestrictedFields.join(', ')}`
      );
    }

    // Recommendations
    if (dataAccess.requestedFields.length > 10) {
      recommendations.push(
        'Consider limiting data access to only necessary fields'
      );
    }

    if (!dataAccess.purpose || dataAccess.purpose.length < 10) {
      recommendations.push('Provide detailed purpose for data access');
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations
    };
  }

  /**
   * Log data access for audit trail
   */
  private logDataAccess(action: string, field: string, userId?: string): void {
    const logEntry = {
      timestamp: Date.now(),
      action,
      field,
      userId
    };

    this.auditLog.push(logEntry);

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 Data Access: ${action} on ${field}`, {
        userId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get audit log for compliance reporting
   */
  public getAuditLog(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    field?: string;
    action?: string;
  }): Array<{
    timestamp: number;
    action: string;
    field: string;
    userId?: string;
  }> {
    let filtered = [...this.auditLog];

    if (filters) {
      if (filters.startDate) {
        filtered = filtered.filter(
          entry => entry.timestamp >= filters.startDate!.getTime()
        );
      }
      if (filters.endDate) {
        filtered = filtered.filter(
          entry => entry.timestamp <= filters.endDate!.getTime()
        );
      }
      if (filters.userId) {
        filtered = filtered.filter(entry => entry.userId === filters.userId);
      }
      if (filters.field) {
        filtered = filtered.filter(entry => entry.field === filters.field);
      }
      if (filters.action) {
        filtered = filtered.filter(entry => entry.action === filters.action);
      }
    }

    return filtered;
  }

  /**
   * Generate compliance report
   */
  public generateComplianceReport(period: { start: Date; end: Date }): {
    totalAccesses: number;
    uniqueUsers: number;
    sensitiveFieldAccesses: number;
    encryptionEvents: number;
    potentialViolations: Array<{
      timestamp: number;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  } {
    const periodLog = this.getAuditLog({
      startDate: period.start,
      endDate: period.end
    });

    const uniqueUsers = new Set(
      periodLog.map(entry => entry.userId).filter(Boolean)
    ).size;
    const sensitiveFieldAccesses = periodLog.filter(entry =>
      this.sensitiveFields.has(entry.field)
    ).length;
    const encryptionEvents = periodLog.filter(
      entry => entry.action === 'ENCRYPT' || entry.action === 'DECRYPT'
    ).length;

    // Detect potential violations
    const potentialViolations: Array<{
      timestamp: number;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    // Check for excessive access patterns
    const userAccess = new Map<string, number>();
    periodLog.forEach(entry => {
      if (entry.userId) {
        userAccess.set(entry.userId, (userAccess.get(entry.userId) || 0) + 1);
      }
    });

    userAccess.forEach((count, userId) => {
      if (count > 1000) {
        potentialViolations.push({
          timestamp: Date.now(),
          description: `User ${userId} accessed data ${count} times - potential excessive access`,
          severity: 'medium'
        });
      }
    });

    return {
      totalAccesses: periodLog.length,
      uniqueUsers,
      sensitiveFieldAccesses,
      encryptionEvents,
      potentialViolations
    };
  }
}

// Singleton instance
export const dataProtectionService = new DataProtectionService();

export default DataProtectionService;
