# ✅ RK Institute Management System - Deployment Checklist

## **📋 Pre-Deployment Checklist**

### **🔒 Security Verification**
- [ ] All environment variables configured in `.env.production`
- [ ] JWT_SECRET is at least 32 characters and cryptographically secure
- [ ] Database credentials are strong and unique
- [ ] No hardcoded secrets in source code
- [ ] SSL/TLS certificates installed and configured
- [ ] Security headers enabled in production
- [ ] Rate limiting configured and tested
- [ ] CORS origins properly configured
- [ ] File upload restrictions in place
- [ ] Audit logging enabled

### **🗄️ Database Setup**
- [ ] PostgreSQL server installed and running
- [ ] Production database created
- [ ] Database user created with minimal privileges
- [ ] Database connection string configured
- [ ] Prisma migrations applied: `npx prisma migrate deploy`
- [ ] Database indexes optimized
- [ ] Connection pooling configured
- [ ] Database backup strategy implemented
- [ ] Database monitoring enabled

### **🌐 Infrastructure Setup**
- [ ] Server meets minimum requirements (2GB RAM, 10GB storage)
- [ ] Node.js 18+ installed
- [ ] PM2 or systemd service configured
- [ ] Nginx reverse proxy configured (if applicable)
- [ ] Firewall rules configured (ports 80, 443, 22)
- [ ] SSL certificates installed and auto-renewal configured
- [ ] Log rotation configured
- [ ] Monitoring and alerting set up

### **📦 Application Configuration**
- [ ] Production dependencies installed: `npm ci --production`
- [ ] Application built successfully: `npm run build`
- [ ] Environment variables validated
- [ ] Health check endpoints responding
- [ ] API endpoints tested
- [ ] File permissions set correctly (600 for .env files)
- [ ] Upload directories created with proper permissions
- [ ] Log directories created

---

## **🚀 Deployment Steps**

### **Step 1: Server Preparation**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2
npm install -g pm2

# Install Nginx (optional)
sudo apt-get install nginx
```

### **Step 2: Database Setup**
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE rk_institute_prod;
CREATE USER rk_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE rk_institute_prod TO rk_user;
\q

# Test connection
psql -h localhost -U rk_user -d rk_institute_prod
```

### **Step 3: Application Deployment**
```bash
# Create application directory
sudo mkdir -p /var/www/rk-institute
sudo chown $USER:$USER /var/www/rk-institute

# Copy deployment files
cp -r deployment/* /var/www/rk-institute/
cd /var/www/rk-institute

# Configure environment
cp .env.example .env.production
# Edit .env.production with your values

# Install dependencies
npm ci --production

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Test application
npm start
```

### **Step 4: Process Management**
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'rk-institute',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production'
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Step 5: Nginx Configuration (Optional)**
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/rk-institute << EOF
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/rk-institute /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## **🧪 Post-Deployment Testing**

### **Health Checks**
```bash
# Application health
curl https://your-domain.com/api/health

# Database health
curl https://your-domain.com/api/health/database

# Authentication test
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'
```

### **Performance Testing**
```bash
# Load testing with Apache Bench
ab -n 100 -c 10 https://your-domain.com/api/health

# Memory usage
free -h
ps aux | grep node

# Disk usage
df -h
```

### **Security Testing**
```bash
# SSL certificate check
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Security headers check
curl -I https://your-domain.com

# Rate limiting test
for i in {1..10}; do curl https://your-domain.com/api/auth/login; done
```

---

## **📊 Monitoring Setup**

### **Application Monitoring**
- [ ] PM2 monitoring dashboard configured
- [ ] Application logs being collected
- [ ] Error tracking implemented
- [ ] Performance metrics collected
- [ ] Uptime monitoring configured

### **System Monitoring**
- [ ] CPU and memory monitoring
- [ ] Disk space monitoring
- [ ] Network monitoring
- [ ] Database performance monitoring
- [ ] SSL certificate expiry monitoring

### **Alerting**
- [ ] Email alerts for critical errors
- [ ] SMS alerts for downtime
- [ ] Slack/Discord notifications configured
- [ ] Log aggregation and analysis

---

## **🔄 Maintenance Procedures**

### **Regular Maintenance**
- [ ] Weekly security updates: `sudo apt update && sudo apt upgrade`
- [ ] Monthly dependency audits: `npm audit`
- [ ] Quarterly security assessments
- [ ] Database maintenance and optimization
- [ ] Log cleanup and rotation
- [ ] SSL certificate renewal verification

### **Backup Procedures**
- [ ] Daily automated database backups
- [ ] Weekly full system backups
- [ ] Monthly backup restoration tests
- [ ] Offsite backup storage configured
- [ ] Backup encryption verified

### **Update Procedures**
1. **Backup current system**
2. **Test updates in staging environment**
3. **Schedule maintenance window**
4. **Apply updates with rollback plan**
5. **Verify functionality post-update**
6. **Monitor for issues**

---

## **🆘 Troubleshooting Guide**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check logs
pm2 logs rk-institute

# Check environment variables
cat .env.production

# Check database connection
npx prisma db pull
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U rk_user -d rk_institute_prod

# Check connection string
echo $DATABASE_URL
```

#### **SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t
```

### **Emergency Contacts**
- **System Administrator**: admin@company.com
- **Database Administrator**: dba@company.com
- **Security Team**: security@company.com
- **On-call Support**: +1-XXX-XXX-XXXX

---

## **✅ Final Verification**

### **Deployment Complete Checklist**
- [ ] Application accessible via HTTPS
- [ ] All API endpoints responding correctly
- [ ] Authentication working properly
- [ ] Database operations functioning
- [ ] File uploads working (if applicable)
- [ ] Email notifications working (if configured)
- [ ] Monitoring and alerting active
- [ ] Backup procedures tested
- [ ] Documentation updated
- [ ] Team notified of deployment

### **Go-Live Approval**
- [ ] Technical lead approval
- [ ] Security team approval
- [ ] Business stakeholder approval
- [ ] Monitoring team notified
- [ ] Support team briefed

---

**🎯 Once all items are checked, the RK Institute Management System is ready for production use!**
