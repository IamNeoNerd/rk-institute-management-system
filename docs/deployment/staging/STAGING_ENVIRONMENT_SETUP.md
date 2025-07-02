# 🧪 Staging Environment Setup Guide

## RK Institute Management System - Pre-Production Testing Environment

**Version**: 2.0  
**Last Updated**: 2025-07-02  
**Status**: Production-Ready Testing Environment

---

## 🎯 Overview

This guide provides comprehensive instructions for setting up a staging environment that mirrors production for thorough testing before deployment. The staging environment serves as the final validation step in our quality gates framework.

**Purpose:**

- Pre-production testing and validation
- Quality gates comprehensive testing
- Performance and security validation
- User acceptance testing environment
- Deployment process validation

---

## 🏗️ Staging Architecture

### **Environment Specifications**

```
Staging Environment Architecture:
┌─────────────────────────────────────────────────────────────┐
│ Internet → Vercel Preview → Next.js App → Staging Database │
│                ↓                                           │
│        Staging Monitoring                                  │
│                ↓                                           │
│        Quality Gates Validation                           │
└─────────────────────────────────────────────────────────────┘
```

### **Key Components**

- **Platform**: Vercel Preview Deployments
- **Database**: Dedicated staging PostgreSQL database
- **Domain**: `staging-rk-institute.vercel.app` or custom staging domain
- **Monitoring**: Comprehensive health checks and performance monitoring
- **Security**: Production-equivalent security configurations
- **Testing**: Automated testing scenarios and validation

---

## 🔐 Staging Environment Configuration

### **Environment Variables Template**

```bash
# =============================================================================
# STAGING ENVIRONMENT CONFIGURATION
# =============================================================================
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging-rk-institute.vercel.app

# =============================================================================
# STAGING DATABASE CONFIGURATION
# =============================================================================
# Dedicated staging database (separate from production)
DATABASE_URL=postgresql://staging_user:STAGING_PASSWORD@staging-host:port/staging_db?sslmode=require
DIRECT_URL=postgresql://staging_user:STAGING_PASSWORD@staging-host:port/staging_db?sslmode=require

# Connection pooling for staging
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_TIMEOUT=30000

# =============================================================================
# STAGING SECURITY CONFIGURATION
# =============================================================================
# Staging-specific JWT secret (different from production)
JWT_SECRET=STAGING_SECURE_32_PLUS_CHARACTER_SECRET_KEY
DATA_ENCRYPTION_KEY=STAGING_SECURE_64_CHARACTER_HEX_ENCRYPTION_KEY

# Staging authentication settings
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=14400000
MAX_LOGIN_ATTEMPTS=5

# =============================================================================
# STAGING FEATURE FLAGS
# =============================================================================
# Enable all features for comprehensive testing
FEATURE_REPORTING=true
FEATURE_ANALYTICS=true
FEATURE_NOTIFICATIONS=true
FEATURE_ADVANCED_SEARCH=true
FEATURE_BULK_OPERATIONS=true
FEATURE_EXPORT_IMPORT=true
FEATURE_AUDIT_LOGGING=true
FEATURE_PERFORMANCE_MONITORING=true

# Staging-specific features
FEATURE_DEBUG_MODE=true
FEATURE_VERBOSE_LOGGING=true
FEATURE_PERFORMANCE_PROFILING=true
FEATURE_SYNTHETIC_TESTING=true

# =============================================================================
# STAGING MONITORING CONFIGURATION
# =============================================================================
# Enhanced monitoring for staging validation
MONITORING_ENABLED=true
HEALTH_CHECK_INTERVAL=30000
PERFORMANCE_MONITORING=true
ERROR_TRACKING_ENABLED=true
SYNTHETIC_MONITORING=true

# Staging-specific monitoring
STAGING_VALIDATION_MODE=true
QUALITY_GATES_MONITORING=true
AUTOMATED_TESTING_ENABLED=true

# =============================================================================
# STAGING TESTING CONFIGURATION
# =============================================================================
# Test data and scenarios
TEST_DATA_ENABLED=true
SYNTHETIC_USERS_ENABLED=true
LOAD_TESTING_ENABLED=true
SECURITY_TESTING_ENABLED=true

# Testing thresholds
PERFORMANCE_THRESHOLD_MS=2000
MEMORY_THRESHOLD_MB=512
CPU_THRESHOLD_PERCENT=80
ERROR_RATE_THRESHOLD=0.01

# =============================================================================
# STAGING DEPLOYMENT CONFIGURATION
# =============================================================================
# Vercel staging configuration
VERCEL_ENV=preview
VERCEL_BRANCH=staging

# Deployment validation
DEPLOYMENT_VALIDATION_ENABLED=true
POST_DEPLOYMENT_TESTING=true
ROLLBACK_ON_FAILURE=true
```

---

## 🚀 Staging Deployment Process

### **Step 1: Staging Database Setup**

```bash
# Create dedicated staging database
# Using Neon PostgreSQL (recommended)

# 1. Create staging database instance
# 2. Configure connection pooling
# 3. Apply database migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma

# 4. Seed with test data
npm run db:seed:staging
```

### **Step 2: Vercel Staging Configuration**

```bash
# Configure Vercel for staging deployments
vercel env add NODE_ENV staging
vercel env add DATABASE_URL [staging-database-url] staging
vercel env add JWT_SECRET [staging-jwt-secret] staging
vercel env add DATA_ENCRYPTION_KEY [staging-encryption-key] staging

# Add all staging environment variables
# Use Vercel dashboard or CLI for secure configuration
```

### **Step 3: GitHub Actions Staging Workflow**

```yaml
# Enhanced staging deployment in .github/workflows/deploy.yml
staging-deployment:
  name: 🧪 Staging Deployment
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/staging'
  needs: [pre-deployment-checks]

  steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4

    - name: 📦 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: 📥 Install dependencies
      run: npm ci

    - name: 🔧 Generate Prisma client
      run: npx prisma generate

    - name: 🏗️ Build application
      run: npm run build

    - name: 🧪 Deploy to Vercel (Staging)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./

    - name: 🔍 Post-deployment validation
      run: |
        echo "🔍 Starting post-deployment validation..."

        # Wait for deployment to be ready
        sleep 30

        # Health check validation
        curl -f -s "${{ steps.deploy.outputs.preview-url }}/api/health" || exit 1

        # Database connectivity check
        curl -f -s "${{ steps.deploy.outputs.preview-url }}/api/health/database" || exit 1

        # Performance validation
        node scripts/staging-validation.js "${{ steps.deploy.outputs.preview-url }}"

    - name: 🧪 Run staging test suite
      run: |
        export STAGING_URL="${{ steps.deploy.outputs.preview-url }}"
        npm run test:staging

    - name: 📊 Generate staging report
      run: |
        node scripts/generate-staging-report.js \
          --url="${{ steps.deploy.outputs.preview-url }}" \
          --commit="${{ github.sha }}" \
          --branch="${{ github.ref_name }}"
```

---

## 🔍 Staging Validation Framework

### **Automated Testing Scenarios**

#### **1. Health Check Validation**

```javascript
// scripts/staging-validation.js
class StagingValidator {
  async validateHealthChecks(baseUrl) {
    const checks = [
      `${baseUrl}/api/health`,
      `${baseUrl}/api/health/database`,
      `${baseUrl}/api/health/system`
    ];

    for (const check of checks) {
      const response = await fetch(check);
      if (!response.ok) {
        throw new Error(`Health check failed: ${check}`);
      }
    }
  }

  async validatePerformance(baseUrl) {
    const startTime = Date.now();
    const response = await fetch(`${baseUrl}/dashboard`);
    const loadTime = Date.now() - startTime;

    if (loadTime > 2000) {
      throw new Error(`Page load time exceeded threshold: ${loadTime}ms`);
    }
  }

  async validateSecurity(baseUrl) {
    // Test security headers
    const response = await fetch(baseUrl);
    const headers = response.headers;

    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];

    for (const header of requiredHeaders) {
      if (!headers.get(header)) {
        throw new Error(`Missing security header: ${header}`);
      }
    }
  }
}
```

#### **2. Database Validation**

```javascript
// Test database connectivity and operations
async function validateDatabase() {
  // Connection test
  await prisma.$connect();

  // Basic CRUD operations test
  const testUser = await prisma.user.create({
    data: { name: 'Test User', email: 'test@staging.com' }
  });

  await prisma.user.delete({ where: { id: testUser.id } });

  await prisma.$disconnect();
}
```

#### **3. API Endpoint Validation**

```javascript
// Test all critical API endpoints
const criticalEndpoints = [
  '/api/auth/login',
  '/api/users',
  '/api/students',
  '/api/fees',
  '/api/reports'
];

for (const endpoint of criticalEndpoints) {
  await validateEndpoint(`${baseUrl}${endpoint}`);
}
```

---

## 📊 Staging Monitoring & Metrics

### **Performance Monitoring**

```javascript
// Enhanced monitoring for staging environment
const stagingMetrics = {
  responseTime: {
    target: '<2000ms',
    critical: '>5000ms'
  },
  memoryUsage: {
    target: '<512MB',
    critical: '>1GB'
  },
  errorRate: {
    target: '<1%',
    critical: '>5%'
  },
  availability: {
    target: '>99%',
    critical: '<95%'
  }
};
```

### **Quality Gates Integration**

```bash
# Staging-specific quality gates
npm run quality:gates:staging

# Comprehensive staging validation
npm run validate:staging:comprehensive

# Performance benchmarking
npm run benchmark:staging
```

---

## 🧪 Staging Test Scenarios

### **Test Data Management**

```sql
-- Staging test data setup
INSERT INTO users (name, email, role) VALUES
  ('Staging Admin', 'admin@staging.test', 'ADMIN'),
  ('Staging Teacher', 'teacher@staging.test', 'TEACHER'),
  ('Staging Student', 'student@staging.test', 'STUDENT');

-- Test fee records
INSERT INTO fees (student_id, amount, due_date, status) VALUES
  (1, 5000.00, '2025-08-01', 'PENDING'),
  (2, 3000.00, '2025-07-15', 'PAID');
```

### **Synthetic User Testing**

```javascript
// Automated user journey testing
class SyntheticUserTesting {
  async runUserJourneys() {
    await this.testStudentRegistration();
    await this.testFeePayment();
    await this.testReportGeneration();
    await this.testAdminOperations();
  }
}
```

---

## ✅ Staging Validation Checklist

### **Pre-Deployment Validation**

- [ ] **Environment Configuration**
  - [ ] All staging environment variables configured
  - [ ] Database connection tested
  - [ ] Security configurations validated
  - [ ] Feature flags properly set

- [ ] **Quality Gates**
  - [ ] TypeScript compilation: 0 errors
  - [ ] ESLint validation: Critical errors resolved
  - [ ] Test suite: 100% pass rate
  - [ ] Build process: Successful completion

### **Post-Deployment Validation**

- [ ] **Health Checks**
  - [ ] Application health check responding
  - [ ] Database health check passing
  - [ ] System health metrics within thresholds

- [ ] **Performance Validation**
  - [ ] Page load times <2 seconds
  - [ ] API response times <1 second
  - [ ] Memory usage within limits
  - [ ] No memory leaks detected

- [ ] **Security Validation**
  - [ ] Security headers present
  - [ ] Authentication working correctly
  - [ ] Authorization rules enforced
  - [ ] Data encryption validated

- [ ] **Functional Testing**
  - [ ] Critical user journeys working
  - [ ] Database operations successful
  - [ ] File uploads/downloads working
  - [ ] Email notifications functioning

---

**🎯 STAGING ENVIRONMENT STATUS: PRODUCTION-READY TESTING**

This staging environment provides comprehensive pre-production validation with enterprise-grade monitoring and automated testing scenarios.
