# 🔌 API Documentation - RK Institute Management System

Welcome to the RK Institute Management System API documentation. This RESTful API provides comprehensive access to all system functionality with enterprise-grade security and performance.

## 🚀 Quick Start

### Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

### Authentication

All API endpoints require authentication via JWT tokens:

```bash
# Include in headers
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## 📚 API Reference

### 🔐 **[Authentication API](authentication.md)**

User authentication, authorization, and session management.

**Endpoints:**

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user info

---

### 👥 **[Students API](students.md)**

Complete student management functionality.

**Endpoints:**

- `GET /api/students` - List all students
- `POST /api/students` - Create new student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

---

### 👨‍🏫 **[Teachers API](teachers.md)**

Teacher management and course assignment.

**Endpoints:**

- `GET /api/teachers` - List all teachers
- `POST /api/teachers` - Create new teacher
- `GET /api/teachers/:id` - Get teacher details
- `PUT /api/teachers/:id` - Update teacher
- `GET /api/teachers/:id/courses` - Get teacher's courses

---

### 💰 **[Fees API](fees.md)**

Fee management, payment processing, and financial reporting.

**Endpoints:**

- `GET /api/fees` - List fee structures
- `POST /api/fees` - Create fee structure
- `GET /api/payments` - List payments
- `POST /api/payments` - Process payment
- `GET /api/invoices` - Generate invoices

---

### 📚 **[Assignments API](assignments.md)**

Assignment creation, submission, and grading.

**Endpoints:**

- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments/:id/submit` - Submit assignment
- `PUT /api/assignments/:id/grade` - Grade assignment

## 🔒 Security

### Enhanced Authentication Flow

1. **Login**: `POST /api/auth/login` with credentials
2. **Receive Token**: Enhanced JWT token with security features
   - 4-hour expiry for better security
   - Unique JWT ID (jti) for tracking
   - Algorithm specification (HS256)
   - Issuer/audience validation
3. **Use Token**: Include in `Authorization` header for all requests
4. **Security Headers**: Automatic security headers in all responses
5. **Token Validation**: Enhanced validation with proper error handling

### Enterprise-Grade Rate Limiting

- **Authentication**: 5 requests per 15 minutes (enhanced monitoring)
- **General API**: 100 requests per 15 minutes (configurable)
- **File Upload**: 10 requests per minute
- **IP-based Tracking**: Advanced rate limiting with user identification
- **Security Events**: Automatic logging of rate limit violations

### Security Features

- **Input Validation**: XSS and SQL injection protection
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-XSS-Protection
- **Audit Logging**: Comprehensive security event tracking
- **Data Protection**: Field-level encryption for sensitive information
- **FERPA Compliance**: Educational data protection standards

### CORS Policy

- **Development**: `http://localhost:3000`
- **Production**: Your configured domain only

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "metadata": {
    "timestamp": "2025-01-07T12:00:00Z",
    "version": "1.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

## 🔧 Common Patterns

### Pagination

```bash
GET /api/students?page=1&limit=20&sort=name&order=asc
```

### Filtering

```bash
GET /api/students?grade=10&isActive=true
```

### Field Selection

```bash
GET /api/students?fields=id,name,email
```

## 📝 Examples

### Create Student

```bash
curl -X POST https://your-domain.com/api/students \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "grade": "10",
    "familyId": "family-123"
  }'
```

### Get Student List

```bash
curl -X GET https://your-domain.com/api/students?page=1&limit=10 \
  -H "Authorization: Bearer <token>"
```

## 🧪 Testing

### Postman Collection

Download our [Postman collection](../development/guides/api-testing.md) for easy API testing.

### Test Environment

```
Base URL: https://test.your-domain.com/api
Test Credentials: Available in development documentation
```

## 📈 Monitoring

### Health Check

```bash
GET /api/health
```

### API Status

```bash
GET /api/status
```

## 🆘 Troubleshooting

### Common Issues

- **401 Unauthorized**: Check JWT token validity
- **403 Forbidden**: Verify user permissions
- **429 Too Many Requests**: Respect rate limits
- **500 Internal Server Error**: Check server logs

### Support

- **Documentation Issues**: See [Contributing Guide](../CONTRIBUTING.md)
- **API Bugs**: Report via GitHub issues
- **Integration Help**: Contact development team

---

**Ready to start?** Begin with [Authentication API](authentication.md) →
