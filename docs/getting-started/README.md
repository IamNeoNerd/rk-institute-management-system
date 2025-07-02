# 🚀 Getting Started - RK Institute Management System

Welcome! This section will help you get up and running with the RK Institute Management System quickly and efficiently.

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- PostgreSQL 14+ database
- Git for version control
- A code editor (VS Code recommended)

## 🎯 Quick Navigation

### 1. **[Installation Guide](installation.md)**

Complete step-by-step installation instructions for setting up the system locally or in production.

### 2. **[Quick Start Tutorial](quick-start.md)**

A fast-track guide to get the system running in under 15 minutes.

### 3. **[Configuration Guide](configuration.md)**

Essential configuration settings and environment variables.

### 4. **[Troubleshooting](troubleshooting.md)**

Common issues and their solutions during setup.

## 🏃‍♂️ Fast Track (5 Minutes)

If you're experienced with Node.js applications:

```bash
# Clone and install
git clone <repository-url>
cd rk-institute-management-system
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your database URL

# Set up database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📚 What's Next?

After completing the setup:

1. **For Users**: Check out the [User Guides](../user-guides/README.md)
2. **For Developers**: See [Development Documentation](../development/README.md)
3. **For Deployment**: Review [Deployment Guides](../deployment/README.md)

## 🆘 Need Help?

- **Common Issues**: See [Troubleshooting](troubleshooting.md)
- **Configuration Problems**: Check [Configuration Guide](configuration.md)
- **Development Setup**: Visit [Development Setup](../development/setup/local-development.md)

---

**Next Step**: Start with the [Installation Guide](installation.md) →
