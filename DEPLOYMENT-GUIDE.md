# 🚀 RK Institute Management System - Deployment Guide

## **📋 Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Application Deployment](#application-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [SSL Configuration](#ssl-configuration)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## **🔧 Prerequisites**

### **System Requirements**
- **OS**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows Server
- **Node.js**: Version 18.0 or higher
- **PostgreSQL**: Version 14.0 or higher
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: Minimum 10GB free space

### **Required Software**
```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2 (Process Manager)
npm install -g pm2
```

---

## **🌍 Environment Setup**

### **1. Create Environment File**
```bash
cp .env.example .env.production
```

### **2. Configure Environment Variables**
Edit `.env.production` with your settings:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/rk_institute_prod"

# Security Configuration
JWT_SECRET="your-super-secure-jwt-secret-minimum-32-characters"
BCRYPT_ROUNDS="14"

# Application Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# Email Configuration
EMAIL_SERVER="smtp://your-email:password@smtp.provider.com:587"
EMAIL_FROM="noreply@your-domain.com"
EMAIL_ENABLED="true"

# Security Settings
RATE_LIMIT_WINDOW="900000"
RATE_LIMIT_MAX="50"
SECURITY_HEADERS_ENABLED="true"
CORS_ORIGIN="https://your-domain.com"

# Database Pool
DATABASE_POOL_MIN="5"
DATABASE_POOL_MAX="20"
DATABASE_TIMEOUT="30000"

# Optional: Redis for Caching
REDIS_URL="redis://localhost:6379"
REDIS_ENABLED="true"
```

---

## **🗄️ Database Configuration**

### **1. Create Database**
```bash
sudo -u postgres psql
CREATE DATABASE rk_institute_prod;
CREATE USER rk_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE rk_institute_prod TO rk_user;
\q
```

### **2. Configure PostgreSQL**
Edit `/etc/postgresql/14/main/postgresql.conf`:
```bash
# Performance Settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

### **3. Run Database Migrations**
```bash
npx prisma generate
npx prisma migrate deploy
```

---

## **🚀 Application Deployment**

### **Method 1: Direct Deployment**

#### **1. Install Dependencies**
```bash
npm ci --production
```

#### **2. Build Application**
```bash
npm run build
```

#### **3. Start with PM2**
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
    env_file: '.env.production',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Create logs directory
mkdir -p logs

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Method 2: Systemd Service**

#### **1. Create Service File**
```bash
sudo tee /etc/systemd/system/rk-institute.service << EOF
[Unit]
Description=RK Institute Management System
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/rk-institute
Environment=NODE_ENV=production
EnvironmentFile=/var/www/rk-institute/.env.production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

#### **2. Enable and Start Service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable rk-institute
sudo systemctl start rk-institute
sudo systemctl status rk-institute
```

---

## **🐳 Docker Deployment**

### **1. Using Docker Compose (Recommended)**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **2. Manual Docker Build**
```bash
# Build image
docker build -t rk-institute .

# Run container
docker run -d \
  --name rk-institute \
  --env-file .env.production \
  -p 3000:3000 \
  rk-institute
```

---

## **☁️ Cloud Deployment**

### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# ... add other variables
```

### **AWS EC2 Deployment**
```bash
# 1. Launch EC2 instance (t3.medium recommended)
# 2. Install dependencies
# 3. Clone deployment files
# 4. Follow direct deployment steps
# 5. Configure security groups (port 80, 443)
```

### **DigitalOcean App Platform**
```yaml
# app.yaml
name: rk-institute
services:
- name: web
  source_dir: /
  github:
    repo: your-username/rk-institute-deployment
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
databases:
- name: db
  engine: PG
  version: "14"
```

---

## **🔒 SSL Configuration**

### **Using Let's Encrypt (Certbot)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

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

## **📊 Monitoring & Maintenance**

### **Health Checks**
```bash
# Application health
curl https://your-domain.com/api/health

# Database health
curl https://your-domain.com/api/health/database
```

### **Log Management**
```bash
# PM2 logs
pm2 logs

# System logs
sudo journalctl -u rk-institute -f

# Docker logs
docker-compose logs -f
```

### **Database Backup**
```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U rk_user rk_institute_prod > backup_\$DATE.sql
# Upload to cloud storage
EOF

chmod +x backup.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### **Performance Monitoring**
```bash
# Install monitoring tools
npm install -g clinic

# Monitor performance
clinic doctor -- npm start
```

---

## **🔄 Updates & Maintenance**

### **Application Updates**
```bash
# 1. Backup database
./backup.sh

# 2. Download new deployment package
# 3. Stop application
pm2 stop rk-institute

# 4. Update files
# 5. Run migrations
npx prisma migrate deploy

# 6. Restart application
pm2 start rk-institute
```

### **Security Updates**
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Node.js dependencies
npm audit fix
```

---

## **🆘 Troubleshooting**

### **Common Issues**

1. **Database Connection Failed**
   - Check PostgreSQL service: `sudo systemctl status postgresql`
   - Verify connection string in `.env.production`
   - Check firewall settings

2. **Application Won't Start**
   - Check logs: `pm2 logs` or `sudo journalctl -u rk-institute`
   - Verify environment variables
   - Check port availability: `sudo netstat -tlnp | grep :3000`

3. **SSL Certificate Issues**
   - Renew certificate: `sudo certbot renew`
   - Check Nginx configuration: `sudo nginx -t`

### **Support Commands**
```bash
# Check application status
pm2 status

# Restart application
pm2 restart rk-institute

# View real-time logs
pm2 logs --lines 100

# Check system resources
htop
df -h
```

---

**🎯 This guide provides complete instructions for deploying the RK Institute Management System in production environments.**
