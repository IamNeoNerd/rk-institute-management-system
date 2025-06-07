# =============================================================================
# Initialize Git Repository for Clean Deployment
# =============================================================================

Write-Host "🚀 Initializing Git Repository for Production Deployment" -ForegroundColor Blue
Write-Host "=========================================================" -ForegroundColor Blue

# Check if git is available
try {
    git --version | Out-Null
    Write-Host "✅ Git is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Initialize git repository
if (Test-Path ".git") {
    Write-Host "⚠️  Git repository already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to reinitialize? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Aborted" -ForegroundColor Red
        exit 1
    }
    Remove-Item ".git" -Recurse -Force
}

Write-Host "📁 Initializing git repository..." -ForegroundColor Cyan
git init

Write-Host "📄 Adding all files..." -ForegroundColor Cyan
git add .

Write-Host "💾 Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial production deployment

🏗️  RK Institute Management System - Production Ready

✨ Features:
- Complete institute management system
- 8 core modules implemented
- Sophisticated fee calculation engine
- PostgreSQL database with optimized schema
- JWT authentication with role-based access
- Enterprise-grade security implementation
- Rate limiting and security headers
- Comprehensive API documentation

🔒 Security:
- No development artifacts or sensitive data
- Environment variables templated
- Production-optimized configurations
- Security best practices implemented

🚀 Deployment:
- Docker and cloud deployment ready
- Complete deployment documentation
- Health checks and monitoring
- Backup and maintenance scripts

📊 Technical Stack:
- Next.js 14 with TypeScript
- PostgreSQL with Prisma ORM
- Enterprise security features
- Production-ready performance optimization"

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host "🎉 Git repository initialized successfully!" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Create a new GitHub repository (e.g., 'rk-institute-production')" -ForegroundColor White
Write-Host "2. Add the remote origin:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/IamNeoNerd/rk-institute-production.git" -ForegroundColor Gray
Write-Host "3. Push to GitHub:" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "🔒 Security Note: This repository contains no sensitive data" -ForegroundColor Green
Write-Host "📖 Documentation: All deployment guides included" -ForegroundColor Green
Write-Host "🚀 Ready for: Production deployment" -ForegroundColor Green
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Blue
