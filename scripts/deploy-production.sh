#!/bin/bash

# RK Institute Management System - Production Deployment Script
# Academic Year 2024-25

set -e  # Exit on any error

echo "🚀 Starting RK Institute Management System Production Deployment"
echo "📚 Academic Year 2024-25 | CBSE Curriculum"
echo "=" 
echo ""

# Configuration
APP_NAME="rk-institute-management"
BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/rk-institute-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
log "🔍 Running pre-deployment checks..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 18+ before deployment."
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js version 18+ is required. Current version: $(node --version)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    error "npm is not installed. Please install npm before deployment."
fi

# Check if PostgreSQL is accessible
log "🗄️ Checking database connectivity..."
if ! npm run db:check &> /dev/null; then
    warning "Database connectivity check failed. Please ensure PostgreSQL is running and accessible."
fi

# Create backup directory
log "📦 Creating backup directory..."
mkdir -p "$BACKUP_DIR"

# Backup current deployment (if exists)
if [ -d "/var/www/$APP_NAME" ]; then
    log "💾 Backing up current deployment..."
    cp -r "/var/www/$APP_NAME" "$BACKUP_DIR/app_backup"
fi

# Install dependencies
log "📦 Installing production dependencies..."
npm ci --only=production

# Run database migrations
log "🗄️ Running database migrations..."
npm run db:migrate:deploy

# Generate Prisma client
log "🔧 Generating Prisma client..."
npm run db:generate

# Run comprehensive tests
log "🧪 Running comprehensive test suite..."
if ! npm run test:production; then
    error "Production tests failed. Deployment aborted."
fi

# Build application
log "🏗️ Building application for production..."
npm run build

# Security checks
log "🛡️ Running security audit..."
npm audit --audit-level=high

# Performance optimization
log "⚡ Optimizing for production..."
npm run optimize:production 2>/dev/null || log "Optimization script not found, skipping..."

# Copy files to production directory
log "📁 Deploying to production directory..."
sudo mkdir -p "/var/www/$APP_NAME"
sudo cp -r .next "/var/www/$APP_NAME/"
sudo cp -r public "/var/www/$APP_NAME/"
sudo cp -r node_modules "/var/www/$APP_NAME/"
sudo cp package.json "/var/www/$APP_NAME/"
sudo cp .env.production "/var/www/$APP_NAME/.env.local"

# Set proper permissions
log "🔐 Setting file permissions..."
sudo chown -R www-data:www-data "/var/www/$APP_NAME"
sudo chmod -R 755 "/var/www/$APP_NAME"

# Restart application service
log "🔄 Restarting application service..."
sudo systemctl restart "$APP_NAME" || warning "Service restart failed. Manual restart may be required."

# Health check
log "🏥 Running post-deployment health check..."
sleep 10  # Wait for service to start

# Check if application is responding
if curl -f http://localhost:3000/api/health &> /dev/null; then
    log "✅ Health check passed. Application is running successfully."
else
    error "❌ Health check failed. Application may not be running correctly."
fi

# Run smoke tests
log "💨 Running smoke tests..."
if npm run test:smoke; then
    log "✅ Smoke tests passed."
else
    warning "⚠️ Some smoke tests failed. Please review the application."
fi

# Cleanup
log "🧹 Cleaning up temporary files..."
rm -rf .next/cache
npm cache clean --force

# Generate deployment report
log "📊 Generating deployment report..."
cat > "$BACKUP_DIR/deployment_report.txt" << EOF
RK Institute Management System - Deployment Report
Academic Year: 2024-25
Deployment Date: $(date)
Version: $(npm run version --silent 2>/dev/null || echo "1.0.0")
Node.js Version: $(node --version)
Database: PostgreSQL (Neon)
Environment: Production

Deployment Status: SUCCESS
Backup Location: $BACKUP_DIR
Log File: $LOG_FILE

Post-Deployment Checklist:
□ Verify all user roles can login
□ Test critical workflows (enrollment, fee payment, grade entry)
□ Verify email/SMS notifications
□ Check data backup schedule
□ Monitor application performance
□ Review security logs

Support Contact: admin@rkinstitute.com
EOF

log "🎉 Deployment completed successfully!"
log "📊 Deployment report saved to: $BACKUP_DIR/deployment_report.txt"
log "📝 Full deployment log: $LOG_FILE"

echo ""
echo "🏫 RK Institute Management System is now live!"
echo "🌐 Access the application at: https://your-domain.com"
echo "👨‍💼 Admin Portal: https://your-domain.com/admin"
echo "👩‍🏫 Teacher Portal: https://your-domain.com/teacher"
echo "👨‍👩‍👧‍👦 Parent Portal: https://your-domain.com/parent"
echo "🎓 Student Portal: https://your-domain.com/student"
echo ""
echo "📚 Academic Year 2024-25 | CBSE Curriculum"
echo "✅ Production deployment completed successfully!"
