# 🚀 Production Environment Setup Guide

## RK Institute Management System - Production Deployment

**Version**: 2.0  
**Last Updated**: 2025-07-02  
**Status**: Production Ready

---

## 🎯 Overview

This guide provides comprehensive instructions for setting up the production environment for the RK Institute Management System, including security configurations, environment variables, and deployment procedures.

**Prerequisites:**

- Vercel account with deployment access
- Neon PostgreSQL database (or compatible PostgreSQL provider)
- Domain name with DNS management access
- SSL certificate (automatic with Vercel)

---

## 🔐 Security Configuration

### **Environment Variables Setup**

#### **1. Database Configuration**

```bash
# Primary database connection (Neon PostgreSQL recommended)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Connection pooling settings
DATABASE_POOL_MIN="5"
DATABASE_POOL_MAX="20"
DATABASE_TIMEOUT="30000"
```

#### **2. Security Keys (CRITICAL)**

```bash
# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET="your-secure-32-plus-character-jwt-secret-key"
JWT_EXPIRY="4h"

# Data Encryption Key - Generate with: openssl rand -hex 32
DATA_ENCRYPTION_KEY="your-secure-64-character-hex-encryption-key"

# Password Hashing
BCRYPT_ROUNDS="14"
```

#### **3. Application Configuration**

```bash
# Production domain
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"
NODE_ENV="production"
PORT="3000"

# Security features
SECURITY_AUDIT_ENABLED="true"
RATE_LIMITING_ENABLED="true"
SECURITY_HEADERS_ENABLED="true"
```

#### **4. Rate Limiting & Security**

```bash
# Rate limiting (15 minutes window, 50 requests max)
RATE_LIMIT_WINDOW="900000"
RATE_LIMIT_MAX="50"

# CORS configuration
CORS_ORIGIN="https://your-production-domain.com"

# Session security
SESSION_TIMEOUT="14400000"  # 4 hours
MAX_LOGIN_ATTEMPTS="5"
LOCKOUT_TIME="900000"       # 15 minutes
```

### **Security Best Practices**

#### **1. Environment Variable Security**

- ✅ Never commit `.env.production` to version control
- ✅ Use Vercel Environment Variables dashboard
- ✅ Set file permissions to 600 for local env files
- ✅ Rotate secrets regularly (quarterly recommended)

#### **2. Database Security**

- ✅ Use SSL connections (`sslmode=require`)
- ✅ Enable connection pooling
- ✅ Configure IP allowlisting
- ✅ Regular security updates

#### **3. Application Security**

- ✅ Enable all security headers
- ✅ Configure proper CORS policies
- ✅ Implement rate limiting
- ✅ Enable audit logging

---

## 🌐 Domain & SSL Configuration

### **Domain Setup**

1. **Purchase/Configure Domain**
   - Register production domain
   - Configure DNS settings
   - Set up subdomain for staging (staging.yourdomain.com)

2. **Vercel Domain Configuration**

   ```bash
   # Add domain to Vercel project
   vercel domains add your-production-domain.com

   # Configure DNS records
   # A Record: @ -> 76.76.19.61
   # CNAME: www -> cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Automatic SSL with Vercel (Let's Encrypt)
   - Custom SSL certificates supported
   - HTTPS redirect enabled by default

### **DNS Configuration**

```dns
# Production domain
A     @           76.76.19.61
CNAME www         cname.vercel-dns.com

# Staging subdomain
CNAME staging     cname.vercel-dns.com

# Email (if using custom email)
MX    @           10 mail.your-domain.com
```

---

## 📊 Monitoring & Logging Setup

### **Health Checks**

```bash
# Health check configuration
HEALTH_CHECK_URL="/api/health"
METRICS_ENABLED="true"

# Monitoring endpoints
# - /api/health - Application health
# - /api/health/database - Database connectivity
# - /api/health/services - External services
```

### **Error Tracking**

```bash
# Sentry configuration (recommended)
SENTRY_DSN="your-sentry-dsn"
SENTRY_ENVIRONMENT="production"

# Error tracking features
FEATURE_ERROR_TRACK="true"
FEATURE_PERF_MON="true"
```

### **Logging Configuration**

```bash
# Production logging
LOG_LEVEL="warn"
ENABLE_AUDIT_LOGS="true"

# Log retention
LOG_RETENTION_DAYS="30"
```

---

## 🚀 Deployment Configuration

### **Vercel Configuration**

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

### **Build Configuration**

```bash
# Build scripts (already configured in package.json)
npm run build      # Production build with migrations
npm run start      # Start production server
npm run health     # Health check validation
```

### **Database Migration**

```bash
# Production database setup
npx prisma migrate deploy
npx prisma generate
npm run db:seed    # Initial data seeding
```

---

## 🔧 Feature Flags Configuration

### **Production Feature Flags**

```bash
# Core features (enabled for production)
FEATURE_REPORTING="true"
FEATURE_MOBILE="true"
FEATURE_AUDIT="true"
FEATURE_RATE_LIMIT="true"
FEATURE_INPUT_VALIDATION="true"

# Performance features
FEATURE_CACHE="true"
FEATURE_LAZY_LOAD="true"
FEATURE_IMAGE_OPT="true"
FEATURE_DB_OPT="true"

# Security features
FEATURE_2FA="false"          # Enable after testing
FEATURE_PERF_MON="true"
FEATURE_ERROR_TRACK="true"

# Advanced features (disabled initially)
FEATURE_REALTIME="false"     # Enable after load testing
FEATURE_AI="false"           # Future enhancement
FEATURE_OFFLINE="false"      # Future enhancement
```

---

## 📋 Pre-Deployment Checklist

### **Security Verification**

- [ ] All environment variables configured
- [ ] Strong passwords and secrets generated
- [ ] SSL certificate configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] CORS policies set

### **Database Verification**

- [ ] Production database created
- [ ] Connection string tested
- [ ] Migrations applied
- [ ] Backup strategy configured
- [ ] Connection pooling enabled

### **Application Verification**

- [ ] Build process successful
- [ ] All tests passing
- [ ] Quality gates validated
- [ ] Performance benchmarks met
- [ ] Error tracking configured

### **Infrastructure Verification**

- [ ] Domain configured
- [ ] DNS records set
- [ ] SSL certificate active
- [ ] Health checks responding
- [ ] Monitoring dashboards active

---

## 🚨 Emergency Procedures

### **Rollback Process**

1. **Immediate Rollback**

   ```bash
   # Rollback to previous deployment
   vercel rollback
   ```

2. **Database Rollback**

   ```bash
   # Restore from backup
   pg_restore -d production_db backup_file.sql
   ```

3. **DNS Rollback**
   - Update DNS records to previous configuration
   - Wait for propagation (up to 24 hours)

### **Incident Response**

1. **Monitor alerts and health checks**
2. **Check error tracking dashboard**
3. **Review application logs**
4. **Execute rollback if necessary**
5. **Document incident and resolution**

---

## 📞 Support & Maintenance

### **Monitoring Dashboards**

- **Vercel Analytics**: Application performance
- **Sentry**: Error tracking and performance
- **Database Monitoring**: Query performance and connections
- **Uptime Monitoring**: Service availability

### **Regular Maintenance**

- **Weekly**: Review error logs and performance metrics
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Security audit and secret rotation
- **Annually**: Infrastructure review and optimization

### **Contact Information**

- **Technical Lead**: [Your contact information]
- **DevOps Team**: [Team contact information]
- **Emergency Contact**: [24/7 support contact]

---

**🎯 DEPLOYMENT STATUS: READY FOR PRODUCTION**

This configuration provides enterprise-grade security, monitoring, and deployment procedures for the RK Institute Management System.
