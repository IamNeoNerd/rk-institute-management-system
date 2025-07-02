# 🔒 API Security Documentation - RK Institute Management System

## 📋 Overview

The RK Institute Management System API implements enterprise-grade security measures to protect sensitive educational data and ensure compliance with FERPA and other privacy regulations.

## 🛡️ Security Architecture

### Multi-Layer Security Approach

1. **Authentication Layer**: Enhanced JWT with validation and tracking
2. **Authorization Layer**: Role-based access control (RBAC)
3. **Rate Limiting Layer**: IP-based request throttling
4. **Input Validation Layer**: XSS and injection protection
5. **Audit Layer**: Comprehensive security event logging

## 🔐 Authentication

### Enhanced JWT Implementation

#### Token Structure

```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "role": "ADMIN|TEACHER|PARENT|STUDENT",
  "iat": 1704672000,
  "exp": 1704686400,
  "jti": "unique-jwt-id",
  "iss": "rk-institute",
  "aud": "rk-institute-users"
}
```

#### Security Features

- **Algorithm**: HS256 (explicitly specified)
- **Expiry**: 4 hours (reduced for better security)
- **Tracking**: Unique JWT ID for session management
- **Validation**: Issuer and audience verification
- **Secret**: Secure secret key validation (no fallbacks)

### Authentication Endpoints

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "name": "User Name",
    "email": "user@example.com",
    "role": "ADMIN"
  },
  "expiresAt": "2025-01-07T16:00:00.000Z"
}
```

**Security Headers:**

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 🚫 Rate Limiting

### Rate Limit Configuration

| Endpoint Type  | Window     | Limit        | Tracking        |
| -------------- | ---------- | ------------ | --------------- |
| Authentication | 15 minutes | 5 requests   | IP + User Agent |
| General API    | 15 minutes | 100 requests | IP + User Agent |
| File Upload    | 1 minute   | 10 requests  | IP + User Agent |

### Rate Limit Headers

```http
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704672900
Retry-After: 300
```

### Rate Limit Response

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 300
}
```

## 🔒 Authorization

### Role-Based Access Control (RBAC)

#### User Roles

- **ADMIN**: Full system access
- **TEACHER**: Course and student management
- **PARENT**: Family and payment access
- **STUDENT**: Read-only access to own data

#### Permission Matrix

| Resource    | ADMIN | TEACHER     | PARENT     | STUDENT     |
| ----------- | ----- | ----------- | ---------- | ----------- |
| Users       | CRUD  | Read        | -          | -           |
| Students    | CRUD  | Read/Update | Read (own) | Read (own)  |
| Courses     | CRUD  | CRUD (own)  | Read       | Read        |
| Assignments | CRUD  | CRUD (own)  | Read       | Read/Submit |
| Payments    | CRUD  | Read        | CRUD (own) | Read (own)  |
| Reports     | CRUD  | Read (own)  | Read (own) | Read (own)  |

### Authorization Headers

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## 🛡️ Input Validation

### Security Patterns Detected

- **XSS Patterns**: `<script>`, `javascript:`, `on*=`
- **SQL Injection**: `UNION SELECT`, `DROP TABLE`, `--`, `/**/`
- **Path Traversal**: `../`, `..\\`, null bytes
- **Command Injection**: `;`, `|`, `&`, backticks

### Validation Response

```json
{
  "error": "Invalid input data",
  "message": "Potentially malicious input detected",
  "timestamp": "2025-01-07T12:00:00.000Z",
  "requestId": "req-uuid"
}
```

## 📊 Data Protection

### FERPA Compliance

#### Sensitive Data Fields

- **SSN**: Restricted level, encryption + audit
- **Date of Birth**: Restricted level, encryption + audit
- **Medical Information**: Restricted level, encryption + audit
- **Parent Income**: Restricted level, encryption + audit
- **Email**: Confidential level, audit required
- **Phone**: Confidential level, audit required
- **Address**: Confidential level, encryption + audit

#### Data Masking Examples

```json
{
  "ssn": "XXX-XX-1234",
  "email": "j***@example.com",
  "phone": "(***) ***-1234"
}
```

### Encryption

- **Algorithm**: AES-256-GCM
- **Key Management**: Environment-based secure keys
- **Field-Level**: Sensitive data encrypted at field level
- **Audit Trail**: All encryption/decryption events logged

## 📋 Audit Logging

### Security Events Tracked

- Authentication attempts (success/failure)
- Authorization failures
- Rate limit violations
- Input validation failures
- Data access events
- Encryption/decryption operations

### Audit Log Format

```json
{
  "timestamp": 1704672000000,
  "event": "AUTHENTICATION_FAILED",
  "details": {
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "path": "/api/auth/login",
    "reason": "Invalid credentials"
  }
}
```

## 🚨 Security Headers

### Comprehensive Security Headers

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 🔍 Security Monitoring

### Real-Time Monitoring

- Failed authentication attempts
- Rate limit violations
- Unusual access patterns
- Input validation failures
- Security header violations

### Alerting Thresholds

- **High**: >10 failed logins from same IP in 5 minutes
- **Medium**: >50 rate limit violations in 1 hour
- **Low**: Unusual access patterns detected

## 🛠️ Security Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET="secure-32-plus-character-secret"
JWT_EXPIRY="4h"

# Security Features
SECURITY_AUDIT_ENABLED="true"
RATE_LIMITING_ENABLED="true"
SECURITY_HEADERS_ENABLED="true"

# Data Protection
DATA_ENCRYPTION_KEY="64-character-hex-key"
```

### Middleware Configuration

```typescript
// API Security Middleware
const securityConfig = {
  enableRateLimit: true,
  enableAuditLog: true,
  enableInputValidation: true,
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100,
  requiredRole: ['ADMIN'], // Optional role restriction
  allowAnonymous: false // Require authentication
};
```

## 🚀 Best Practices

### For Developers

1. **Always validate JWT tokens** with proper error handling
2. **Use role-based authorization** for all protected endpoints
3. **Implement input validation** for all user inputs
4. **Log security events** for audit and monitoring
5. **Use HTTPS only** in production environments

### For API Consumers

1. **Store JWT tokens securely** (not in localStorage)
2. **Handle rate limiting gracefully** with exponential backoff
3. **Validate server certificates** to prevent MITM attacks
4. **Use secure communication channels** only
5. **Report security issues** immediately

## 📞 Security Contact

### Reporting Security Issues

- **Email**: security@rk-institute.com
- **Response Time**: 24 hours for critical issues
- **Encryption**: Use PGP key for sensitive reports

### Security Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [FERPA Compliance Guide](https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html)

---

**🎯 This API security documentation ensures enterprise-grade protection for the RK Institute Management System API.**
