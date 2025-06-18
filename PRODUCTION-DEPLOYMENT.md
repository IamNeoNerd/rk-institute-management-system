# 🏫 RK Institute Management System - Production Deployment Guide

## 📚 Academic Year 2024-25 | CBSE Curriculum

### 🎯 **Production Readiness Status: ✅ READY**

---

## 🚀 **Quick Deployment**

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database (Neon Cloud configured)
- Ubuntu/CentOS server with sudo access
- Domain name configured

### **One-Command Deployment**
```bash
npm run deploy:production
```

---

## 📋 **Detailed Deployment Steps**

### **1. Server Preparation**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/rk-institute-management
sudo chown $USER:$USER /var/www/rk-institute-management
```

### **2. Application Setup**
```bash
# Clone repository
git clone https://github.com/your-org/rk-institute-management.git
cd rk-institute-management

# Install dependencies
npm ci --only=production

# Configure environment
cp .env.production .env.local
# Edit .env.local with your production values

# Run database migrations
npm run db:migrate

# Build application
npm run build
```

### **3. Production Configuration**

#### **Environment Variables (.env.local)**
```env
# Database
DATABASE_URL="your-production-database-url"

# Security
JWT_SECRET="your-super-secure-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_NAME="RK Institute Management System"
NEXT_PUBLIC_ACADEMIC_YEAR="2024-25"
```

### **4. Process Management with PM2**
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'rk-institute',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/rk-institute-management',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/rk-institute-error.log',
    out_file: '/var/log/rk-institute-out.log',
    log_file: '/var/log/rk-institute.log'
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **5. Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🧪 **Testing & Validation**

### **Health Check**
```bash
# Basic health check
npm run health:check

# Comprehensive testing
npm run test:production

# Security audit
npm run security:audit
```

### **Smoke Tests**
```bash
# Test all user roles
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rkinstitute.com","password":"admin123"}'

# Test protected routes
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/admin/dashboard
```

---

## 📊 **Monitoring & Maintenance**

### **Application Monitoring**
```bash
# View logs
pm2 logs rk-institute

# Monitor performance
pm2 monit

# Restart application
pm2 restart rk-institute
```

### **Health Monitoring**
- **Health Endpoint**: `https://your-domain.com/api/health`
- **Detailed Health**: `POST https://your-domain.com/api/health`

### **Database Monitoring**
```bash
# Check database connectivity
npm run db:check

# View database studio
npm run db:studio
```

---

## 🔐 **Security Checklist**

### **Pre-Production Security**
- [ ] JWT secrets configured (not default values)
- [ ] Database credentials secured
- [ ] HTTPS enabled with SSL certificate
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] Regular security updates scheduled

### **Application Security**
- [ ] Authentication middleware active
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] SQL injection protection verified

---

## 🎓 **Educational System Configuration**

### **Academic Year Setup**
- **Current Year**: 2024-25
- **Curriculum**: CBSE
- **Grading System**: A1, A2, B1, B2, C1, C2, D, E
- **Academic Calendar**: April 1st - March 31st

### **User Roles & Access**
- **Admin**: Full system access
- **Teacher**: Class management, grade entry, student records
- **Parent**: Child progress, fee status, communication
- **Student**: Grades, assignments, schedule, academic records

### **Default Test Accounts**
```
Admin: admin@rkinstitute.com / admin123
Teacher: teacher1@rkinstitute.com / admin123
Parent: parent@rkinstitute.com / admin123
Student: student@rkinstitute.com / admin123
```

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check logs
pm2 logs rk-institute

# Verify environment
node -v  # Should be 18+
npm -v   # Should be 8+

# Check database connection
npm run db:check
```

#### **Database Connection Issues**
```bash
# Test database connectivity
psql "postgresql://user:pass@host:port/db"

# Verify environment variables
echo $DATABASE_URL
```

#### **Performance Issues**
```bash
# Monitor system resources
htop

# Check application metrics
pm2 monit

# Analyze bundle size
npm run performance:analyze
```

---

## 📞 **Support & Maintenance**

### **Support Contacts**
- **Technical Support**: admin@rkinstitute.com
- **Emergency Contact**: +91-XXXX-XXXX-XX

### **Maintenance Schedule**
- **Daily**: Automated backups at 2:00 AM
- **Weekly**: Security updates and patches
- **Monthly**: Performance optimization review
- **Quarterly**: Comprehensive security audit

### **Backup & Recovery**
```bash
# Manual backup
npm run backup:create

# Restore from backup
# (Follow your database backup/restore procedures)
```

---

## 🎉 **Post-Deployment Checklist**

- [ ] Application accessible at production URL
- [ ] All user roles can login successfully
- [ ] Database migrations completed
- [ ] SSL certificate installed and working
- [ ] Monitoring and logging configured
- [ ] Backup schedule activated
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Team training completed

---

## 📈 **Performance Benchmarks**

### **Target Metrics**
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Database Query Time**: < 200ms
- **Concurrent Users**: 100+ supported
- **Uptime**: 99.9%

### **Monitoring Tools**
- PM2 for process monitoring
- Nginx access logs for traffic analysis
- Database slow query logs
- Application health endpoint

---

**🏫 RK Institute Management System - Academic Year 2024-25**  
**✅ Production Ready | 🔒 Secure | ⚡ Optimized | 📚 CBSE Compliant**
