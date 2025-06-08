# 🤝 Contributing to RK Institute Management System

Welcome to the RK Institute Management System! We're excited that you're interested in contributing. This guide will help you understand our development workflow and standards.

## 📋 **Table of Contents**

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm 8+
- PostgreSQL database
- Git knowledge
- TypeScript/React experience

### **Local Development Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/IamNeoNerd/rk-institute-management-system.git
   cd rk-institute-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

---

## 🔄 **Development Workflow**

### **GitFlow Branching Model**

We follow a strict GitFlow workflow:

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features
- **`feature/*`** - New features and enhancements
- **`bugfix/*`** - Bug fixes
- **`hotfix/*`** - Critical production fixes

### **Branch Naming Conventions**

```
feature/user-authentication
feature/fee-calculation-engine
bugfix/login-validation-error
hotfix/security-vulnerability-fix
```

### **Commit Message Format**

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT token refresh mechanism
fix(fees): resolve discount calculation edge case
docs(api): update authentication endpoint documentation
```

---

## 📏 **Code Standards**

### **TypeScript Guidelines**
- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### **React Best Practices**
- Use functional components with hooks
- Implement proper error boundaries
- Follow component composition patterns
- Use TypeScript for prop definitions

### **Code Style**
- Follow ESLint and Prettier configurations
- Use single quotes for strings
- 2-space indentation
- Semicolons required
- No trailing commas

### **File Organization**
```
src/
├── app/                 # Next.js app router
├── components/
│   ├── ui/             # Reusable UI components
│   └── features/       # Feature-specific components
├── lib/                # Utilities and services
├── types/              # TypeScript type definitions
└── tests/              # Test files
```

---

## 🧪 **Testing Guidelines**

### **Testing Strategy**
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and workflows
- **E2E Tests**: Test complete user journeys

### **Testing Requirements**
- All new features must include tests
- Maintain minimum 70% code coverage
- Test edge cases and error scenarios
- Mock external dependencies

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### **Test File Naming**
```
component.test.tsx       # Component tests
service.test.ts         # Service/utility tests
api.test.ts            # API endpoint tests
```

---

## 🔍 **Pull Request Process**

### **Before Creating a PR**

1. **Ensure your branch is up to date**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Run quality checks**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

3. **Test your changes thoroughly**
   - Manual testing of affected features
   - Cross-browser compatibility
   - Mobile responsiveness

### **PR Requirements**

- [ ] **Clear title and description**
- [ ] **All CI checks passing**
- [ ] **Code review from at least 2 team members**
- [ ] **Tests included for new functionality**
- [ ] **Documentation updated if needed**
- [ ] **No merge conflicts**

### **PR Review Process**

1. **Automated Checks**
   - Build verification
   - TypeScript compilation
   - Linting and formatting
   - Test execution
   - Security scanning

2. **Manual Review**
   - Code quality and architecture
   - Business logic correctness
   - Security implications
   - Performance considerations
   - User experience impact

3. **Approval and Merge**
   - Requires 2 approvals
   - Squash and merge to maintain clean history
   - Automatic deployment to staging

---

## 🐛 **Issue Reporting**

### **Bug Reports**
Use the bug report template and include:
- Clear reproduction steps
- Expected vs actual behavior
- Environment details
- Screenshots/videos if applicable

### **Feature Requests**
Use the feature request template and include:
- Business justification
- User stories
- Acceptance criteria
- Technical considerations

### **Security Issues**
For security vulnerabilities:
- **DO NOT** create public issues
- Email security concerns directly
- Include detailed reproduction steps
- Provide suggested fixes if possible

---

## 🔒 **Security Guidelines**

### **Sensitive Data**
- Never commit secrets or credentials
- Use environment variables for configuration
- Sanitize all user inputs
- Implement proper authentication/authorization

### **Code Security**
- Follow OWASP security guidelines
- Use parameterized queries
- Implement rate limiting
- Validate all API inputs

---

## 📚 **Additional Resources**

- [Project Documentation](./README.md)
- [API Documentation](./API-DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT-GUIDE.md)
- [Security Guidelines](./SECURITY.md)

---

## 🤝 **Getting Help**

- **Questions**: Create a discussion or issue
- **Bugs**: Use the bug report template
- **Features**: Use the feature request template
- **Security**: Email directly for sensitive issues

---

## 📄 **License**

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to the RK Institute Management System! 🎉**
