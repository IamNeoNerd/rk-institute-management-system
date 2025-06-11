# 📚 RK Institute Management System - API Documentation

## **📋 Overview**

This document provides comprehensive documentation for all API endpoints in the RK Institute Management System. All endpoints require proper authentication unless otherwise specified.

## **🔐 Authentication**

### **Base URL**

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

### **Authentication Method**

- **Type**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Token Expiry**: 4 hours (configurable)

### **Authentication Endpoints**

#### **POST /auth/login**

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADMIN"
  }
}
```

#### **POST /auth/logout**

Invalidate current session.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### **GET /auth/me**

Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "lastLoginAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## **👨‍👩‍👧‍👦 Family Management**

#### **GET /families**

Get all families (paginated).

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by family name

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Smith Family",
      "email": "smith@example.com",
      "phone": "+1234567890",
      "discountAmount": 500,
      "studentsCount": 2,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### **POST /families**

Create a new family.

**Request Body:**

```json
{
  "name": "Johnson Family",
  "email": "johnson@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State",
  "discountAmount": 300
}
```

#### **GET /families/:id**

Get family details by ID.

#### **PUT /families/:id**

Update family information.

#### **DELETE /families/:id**

Delete a family (soft delete).

---

## **🎓 Student Management**

#### **GET /students**

Get all students (paginated).

**Query Parameters:**

- `page`, `limit`, `search`
- `familyId` (optional): Filter by family
- `grade` (optional): Filter by grade

#### **POST /students**

Create a new student.

**Request Body:**

```json
{
  "name": "Alice Johnson",
  "familyId": "uuid",
  "grade": "Grade 10",
  "dateOfBirth": "2008-05-15",
  "studentId": "STU001"
}
```

#### **GET /students/:id**

Get student details with subscriptions and fee allocations.

#### **PUT /students/:id**

Update student information.

#### **DELETE /students/:id**

Delete a student (soft delete).

---

## **📚 Course Management**

#### **GET /courses**

Get all courses.

#### **POST /courses**

Create a new course.

**Request Body:**

```json
{
  "name": "Advanced Mathematics",
  "description": "Advanced math concepts for Grade 10",
  "grade": "Grade 10",
  "teacherId": "uuid",
  "capacity": 30,
  "feeStructure": {
    "amount": 1500,
    "billingCycle": "MONTHLY"
  }
}
```

#### **GET /courses/:id**

Get course details with enrolled students.

#### **PUT /courses/:id**

Update course information.

#### **DELETE /courses/:id**

Delete a course.

---

## **🛠️ Service Management**

#### **GET /services**

Get all services.

#### **POST /services**

Create a new service.

**Request Body:**

```json
{
  "name": "Transportation",
  "description": "School bus service",
  "feeStructure": {
    "amount": 800,
    "billingCycle": "MONTHLY"
  }
}
```

---

## **💰 Fee Management**

#### **POST /fees/calculate**

Calculate monthly fees for a student.

**Request Body:**

```json
{
  "studentId": "uuid",
  "month": "2024-01",
  "year": 2024
}
```

**Response:**

```json
{
  "success": true,
  "calculation": {
    "studentId": "uuid",
    "studentName": "Alice Johnson",
    "month": "2024-01",
    "grossMonthlyFee": 2300,
    "itemDiscounts": 200,
    "familyDiscountShare": 150,
    "totalDiscount": 350,
    "netMonthlyFee": 1950,
    "breakdown": [
      {
        "type": "course",
        "name": "Mathematics",
        "amount": 1500,
        "discount": 100
      },
      {
        "type": "service",
        "name": "Transportation",
        "amount": 800,
        "discount": 100
      }
    ]
  }
}
```

#### **POST /fees/allocate**

Generate fee allocations for students.

**Request Body:**

```json
{
  "studentIds": ["uuid1", "uuid2"],
  "month": "2024-01",
  "year": 2024
}
```

#### **GET /fees/allocations**

Get fee allocations with filters.

**Query Parameters:**

- `studentId`, `familyId`, `month`, `year`, `status`

---

## **💳 Payment Management**

#### **GET /payments**

Get all payments (paginated).

#### **POST /payments**

Record a new payment.

**Request Body:**

```json
{
  "familyId": "uuid",
  "amount": 3500,
  "paymentMethod": "BANK_TRANSFER",
  "reference": "TXN123456",
  "feeAllocationIds": ["uuid1", "uuid2"]
}
```

#### **GET /payments/:id**

Get payment details.

---

## **📊 Reports**

#### **GET /reports/financial**

Generate financial reports.

**Query Parameters:**

- `startDate`, `endDate`
- `familyId` (optional)
- `format` (json, csv, pdf)

#### **GET /reports/students**

Generate student reports.

#### **GET /reports/attendance**

Generate attendance reports.

---

## **👥 User Management**

#### **GET /users**

Get all users (Admin only).

#### **POST /users**

Create a new user (Admin only).

**Request Body:**

```json
{
  "name": "Jane Teacher",
  "email": "jane@school.com",
  "role": "TEACHER",
  "familyId": "uuid"
}
```

---

## **🏥 Health & Monitoring**

#### **GET /health**

Application health check.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "memory": "healthy"
  }
}
```

#### **GET /health/database**

Database connectivity check.

#### **GET /status**

System status and metrics.

---

## **🔒 Security Features**

### **Rate Limiting**

- **Authentication endpoints**: 5 requests per 15 minutes
- **General API endpoints**: 100 requests per 15 minutes
- **Admin endpoints**: 10 requests per minute

### **Input Validation**

All endpoints validate input data using Zod schemas:

- Email format validation
- Password complexity requirements
- UUID format validation
- Numeric range validation

### **Error Responses**

Standardized error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### **Common Error Codes**

- `AUTHENTICATION_REQUIRED` (401)
- `INSUFFICIENT_PERMISSIONS` (403)
- `RESOURCE_NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)

---

## **📝 Request/Response Examples**

### **Complete Fee Calculation Workflow**

1. **Create Family**

```bash
curl -X POST https://your-domain.com/api/families \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Family", "email": "test@example.com"}'
```

2. **Create Student**

```bash
curl -X POST https://your-domain.com/api/students \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Student", "familyId": "uuid", "grade": "Grade 10"}'
```

3. **Calculate Fees**

```bash
curl -X POST https://your-domain.com/api/fees/calculate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"studentId": "uuid", "month": "2024-01", "year": 2024}'
```

---

## **🔧 Development & Testing**

### **API Testing**

Use tools like Postman, Insomnia, or curl for testing endpoints.

### **Authentication for Testing**

1. Login to get token: `POST /auth/login`
2. Use token in subsequent requests: `Authorization: Bearer <token>`

### **Environment Variables**

Ensure proper environment configuration for API functionality.

---

**🎯 This API documentation provides complete reference for integrating with the RK Institute Management System.**
