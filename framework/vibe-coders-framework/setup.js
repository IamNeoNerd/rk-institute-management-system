#!/usr/bin/env node

/**
 * =============================================================================
 * Vibe Coders Framework - Automated Setup Script
 * =============================================================================
 *
 * Comprehensive framework setup for technical debt elimination and production deployment:
 * - Project initialization with proven templates
 * - Quality gates configuration and automation
 * - Monitoring system setup
 * - CI/CD pipeline integration
 * - Documentation generation
 *
 * Usage: node setup.js --project=<name> --type=<nextjs|react|node>
 * Example: node setup.js --project=my-app --type=nextjs
 *
 * Version: 2.0
 * Last Updated: 2025-07-02
 * =============================================================================
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class VibeCodersFrameworkSetup {
  constructor(options) {
    this.projectName = options.project || 'vibe-coders-project';
    this.projectType = options.type || 'nextjs';
    this.timestamp = new Date().toISOString();
    this.frameworkVersion = '2.0';

    this.supportedTypes = ['nextjs', 'react', 'node', 'typescript'];
    this.setupSteps = [
      'validateInput',
      'createProjectStructure',
      'installDependencies',
      'setupQualityGates',
      'configureMonitoring',
      'setupDeployment',
      'generateDocumentation',
      'finalizeSetup'
    ];
  }

  /**
   * Main setup orchestrator
   */
  async setupFramework() {
    console.log('🚀 Vibe Coders Framework Setup');
    console.log(`📦 Project: ${this.projectName}`);
    console.log(`🏗️  Type: ${this.projectType}`);
    console.log(`📅 Version: ${this.frameworkVersion}`);
    console.log('='.repeat(70));

    try {
      for (const step of this.setupSteps) {
        console.log(`\n🔄 Executing: ${step}...`);
        await this[step]();
        console.log(`✅ Completed: ${step}`);
      }

      console.log('\n🎉 Vibe Coders Framework setup completed successfully!');
      this.displayNextSteps();
    } catch (error) {
      console.error(`❌ Setup failed at step: ${error.step || 'unknown'}`);
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Validate input parameters
   */
  async validateInput() {
    if (!this.supportedTypes.includes(this.projectType)) {
      throw new Error(
        `Unsupported project type: ${this.projectType}. Supported: ${this.supportedTypes.join(', ')}`
      );
    }

    if (fs.existsSync(this.projectName)) {
      throw new Error(`Directory ${this.projectName} already exists`);
    }

    console.log('  ✅ Input validation passed');
  }

  /**
   * Create project structure
   */
  async createProjectStructure() {
    const projectPath = path.join(process.cwd(), this.projectName);

    // Create main project directory
    fs.mkdirSync(projectPath, { recursive: true });

    // Create framework directory structure
    const directories = [
      'scripts',
      'docs',
      'docs/methodologies',
      'docs/quality-gates',
      'docs/deployment',
      'docs/monitoring',
      'monitoring',
      'monitoring/dashboards',
      'monitoring/scripts',
      'monitoring/config',
      '.github',
      '.github/workflows',
      'framework',
      'framework/templates',
      'framework/automation'
    ];

    for (const dir of directories) {
      fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
    }

    console.log(`  ✅ Project structure created: ${projectPath}`);
  }

  /**
   * Install dependencies
   */
  async installDependencies() {
    const projectPath = path.join(process.cwd(), this.projectName);

    // Create package.json based on project type
    const packageJson = this.generatePackageJson();
    fs.writeFileSync(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Install dependencies
    console.log('  📦 Installing dependencies...');
    process.chdir(projectPath);

    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('  ✅ Dependencies installed successfully');
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  /**
   * Setup quality gates
   */
  async setupQualityGates() {
    const projectPath = process.cwd();

    // Copy quality gates script
    const qualityGatesScript = this.generateQualityGatesScript();
    fs.writeFileSync(
      path.join(projectPath, 'scripts/quality-gates.js'),
      qualityGatesScript
    );

    // Setup pre-commit hooks
    const preCommitHook = this.generatePreCommitHook();
    fs.writeFileSync(
      path.join(projectPath, '.husky/pre-commit'),
      preCommitHook
    );

    // Create TypeScript configuration
    const tsConfig = this.generateTsConfig();
    fs.writeFileSync(
      path.join(projectPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );

    // Create ESLint configuration
    const eslintConfig = this.generateEslintConfig();
    fs.writeFileSync(
      path.join(projectPath, '.eslintrc.json'),
      JSON.stringify(eslintConfig, null, 2)
    );

    console.log('  ✅ Quality gates configured');
  }

  /**
   * Configure monitoring system
   */
  async configureMonitoring() {
    const projectPath = process.cwd();

    // Copy monitoring setup script
    const monitoringScript = fs.readFileSync(
      path.join(__dirname, '../../scripts/setup-monitoring-dashboard.js'),
      'utf8'
    );
    fs.writeFileSync(
      path.join(projectPath, 'scripts/setup-monitoring-dashboard.js'),
      monitoringScript
    );

    // Create monitoring configuration
    const monitoringConfig = {
      environment: 'development',
      healthChecks: {
        interval: 30000,
        timeout: 10000,
        endpoints: ['/api/health', '/api/health/database']
      },
      performance: {
        thresholds: {
          responseTime: 1000,
          pageLoadTime: 1500,
          apiResponseTime: 500
        }
      },
      alerting: {
        channels: ['console', 'email'],
        escalation: {
          level1: 300000,
          level2: 900000
        }
      }
    };

    fs.writeFileSync(
      path.join(projectPath, 'monitoring/config/monitoring-config.json'),
      JSON.stringify(monitoringConfig, null, 2)
    );

    console.log('  ✅ Monitoring system configured');
  }

  /**
   * Setup deployment configuration
   */
  async setupDeployment() {
    const projectPath = process.cwd();

    // Create GitHub Actions workflow
    const workflow = this.generateGitHubWorkflow();
    fs.writeFileSync(
      path.join(projectPath, '.github/workflows/deploy.yml'),
      workflow
    );

    // Create Vercel configuration
    const vercelConfig = {
      version: 2,
      name: this.projectName,
      builds: [
        {
          src: 'package.json',
          use: '@vercel/next'
        }
      ],
      routes: [
        {
          src: '/api/health',
          dest: '/api/health'
        }
      ]
    };

    fs.writeFileSync(
      path.join(projectPath, 'vercel.json'),
      JSON.stringify(vercelConfig, null, 2)
    );

    console.log('  ✅ Deployment configuration created');
  }

  /**
   * Generate documentation
   */
  async generateDocumentation() {
    const projectPath = process.cwd();

    // Create project README
    const readme = this.generateProjectReadme();
    fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

    // Create methodology documentation
    const methodologyDoc = this.generateMethodologyDoc();
    fs.writeFileSync(
      path.join(
        projectPath,
        'docs/methodologies/TECHNICAL_DEBT_ELIMINATION.md'
      ),
      methodologyDoc
    );

    // Create quality gates documentation
    const qualityGatesDoc = this.generateQualityGatesDoc();
    fs.writeFileSync(
      path.join(projectPath, 'docs/quality-gates/QUALITY_GATES_FRAMEWORK.md'),
      qualityGatesDoc
    );

    console.log('  ✅ Documentation generated');
  }

  /**
   * Finalize setup
   */
  async finalizeSetup() {
    const projectPath = process.cwd();

    // Create initial git repository
    try {
      execSync('git init', { stdio: 'inherit' });
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Initial commit: Vibe Coders Framework setup"', {
        stdio: 'inherit'
      });
      console.log('  ✅ Git repository initialized');
    } catch (error) {
      console.log('  ⚠️  Git initialization skipped (git not available)');
    }

    // Create setup completion marker
    const setupInfo = {
      frameworkVersion: this.frameworkVersion,
      projectName: this.projectName,
      projectType: this.projectType,
      setupDate: this.timestamp,
      setupSteps: this.setupSteps
    };

    fs.writeFileSync(
      path.join(projectPath, '.vibe-coders-framework.json'),
      JSON.stringify(setupInfo, null, 2)
    );

    console.log('  ✅ Setup finalized');
  }

  /**
   * Generate package.json based on project type
   */
  generatePackageJson() {
    const basePackage = {
      name: this.projectName,
      version: '1.0.0',
      description: `${this.projectName} - Built with Vibe Coders Framework`,
      private: true,
      scripts: {
        'vibe:assess': 'node scripts/quality-gates.js --assess',
        'vibe:eliminate': 'node scripts/quality-gates.js --fix',
        'vibe:validate': 'node scripts/quality-gates.js --validate',
        'vibe:monitor': 'node scripts/setup-monitoring-dashboard.js',
        'vibe:deploy': 'npm run build && npm run vibe:validate',
        build: 'next build',
        start: 'next start',
        dev: 'next dev',
        lint: 'eslint . --ext .js,.jsx,.ts,.tsx',
        'lint:fix': 'eslint . --ext .js,.jsx,.ts,.tsx --fix',
        'type-check': 'tsc --noEmit',
        'quality:check': 'npm run type-check && npm run lint',
        'quality:fix': 'npm run lint:fix && npm run type-check'
      },
      dependencies: {},
      devDependencies: {
        '@types/node': '^20.0.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        eslint: '^8.0.0',
        'eslint-config-next': '^14.0.0',
        husky: '^8.0.0',
        typescript: '^5.0.0'
      }
    };

    // Add project-type specific dependencies
    if (this.projectType === 'nextjs') {
      basePackage.dependencies = {
        ...basePackage.dependencies,
        next: '^14.0.0',
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      };
    }

    return basePackage;
  }

  /**
   * Generate quality gates script
   */
  generateQualityGatesScript() {
    return `#!/usr/bin/env node

/**
 * Vibe Coders Framework - Quality Gates Script
 * Generated by Vibe Coders Framework v${this.frameworkVersion}
 */

const { execSync } = require('child_process');

class QualityGates {
  async runChecks() {
    console.log('🚪 Running Quality Gates...');
    
    try {
      // TypeScript check
      console.log('🔍 Checking TypeScript...');
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScript check passed');
      
      // ESLint check
      console.log('🔍 Checking ESLint...');
      execSync('npx eslint . --ext .js,.jsx,.ts,.tsx', { stdio: 'inherit' });
      console.log('✅ ESLint check passed');
      
      console.log('🎉 All quality gates passed!');
      
    } catch (error) {
      console.error('❌ Quality gates failed');
      process.exit(1);
    }
  }
}

const gates = new QualityGates();
gates.runChecks();
`;
  }

  /**
   * Generate pre-commit hook
   */
  generatePreCommitHook() {
    return `#!/bin/sh
# Vibe Coders Framework - Pre-commit Hook

echo "🚪 Running pre-commit quality gates..."

# Run TypeScript check
if ! npx tsc --noEmit; then
  echo "❌ TypeScript compilation failed!"
  exit 1
fi

# Run ESLint
if ! npx eslint . --ext .js,.jsx,.ts,.tsx; then
  echo "❌ ESLint check failed!"
  exit 1
fi

echo "✅ Pre-commit quality gates passed!"
`;
  }

  /**
   * Generate TypeScript configuration
   */
  generateTsConfig() {
    return {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [
          {
            name: 'next'
          }
        ],
        paths: {
          '@/*': ['./*']
        }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    };
  }

  /**
   * Generate ESLint configuration
   */
  generateEslintConfig() {
    return {
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'next/core-web-vitals'
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        'prefer-const': 'error',
        'no-var': 'error'
      },
      env: {
        browser: true,
        node: true,
        es2021: true
      }
    };
  }

  /**
   * Generate GitHub Actions workflow
   */
  generateGitHubWorkflow() {
    return `name: Vibe Coders Framework - CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run quality gates
      run: npm run vibe:validate
    
    - name: Build application
      run: npm run build

  deploy:
    needs: quality-gates
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: \${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
`;
  }

  /**
   * Generate project README
   */
  generateProjectReadme() {
    return `# ${this.projectName}

Built with **Vibe Coders Framework v${this.frameworkVersion}** - The proven methodology for technical debt elimination and production deployment.

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run quality gates
npm run vibe:validate

# Deploy to production
npm run vibe:deploy
\`\`\`

## 🎯 Vibe Coders Commands

- \`npm run vibe:assess\` - Assess technical debt
- \`npm run vibe:eliminate\` - Eliminate technical debt
- \`npm run vibe:validate\` - Validate code quality
- \`npm run vibe:monitor\` - Setup monitoring
- \`npm run vibe:deploy\` - Deploy to production

## 📚 Documentation

- [Technical Debt Elimination](docs/methodologies/TECHNICAL_DEBT_ELIMINATION.md)
- [Quality Gates Framework](docs/quality-gates/QUALITY_GATES_FRAMEWORK.md)

---

*Generated by Vibe Coders Framework v${this.frameworkVersion} on ${this.timestamp}*
`;
  }

  /**
   * Generate methodology documentation
   */
  generateMethodologyDoc() {
    return `# Technical Debt Elimination Methodology

## 7-Phase Proven Framework

1. **Assessment Phase** (15-20 min)
2. **Strategic Planning** (5-10 min)
3. **Critical Error Resolution** (60-70 min)
4. **Quality Gates Implementation**
5. **Validation & Testing**
6. **Documentation**
7. **Production Deployment**

## Success Metrics
- TypeScript Errors: Target 0
- ESLint Issues: 70%+ reduction
- Test Pass Rate: 95%+
- Build Success: 100%

*Part of Vibe Coders Framework v${this.frameworkVersion}*
`;
  }

  /**
   * Generate quality gates documentation
   */
  generateQualityGatesDoc() {
    return `# Quality Gates Framework

## Multi-Layer Defense System

1. **IDE Integration** - Real-time error detection
2. **Pre-commit Hooks** - Prevent bad code commits
3. **CI/CD Pipeline** - Automated validation
4. **Production Monitoring** - Real-time health checks

## Zero-Tolerance Policy
- TypeScript compilation errors: 0 allowed
- Critical ESLint errors: 0 allowed
- Build failures: 0 allowed

*Part of Vibe Coders Framework v${this.frameworkVersion}*
`;
  }

  /**
   * Display next steps after setup
   */
  displayNextSteps() {
    console.log('\n🎯 Next Steps:');
    console.log(`1. cd ${this.projectName}`);
    console.log('2. npm run dev');
    console.log('3. npm run vibe:assess');
    console.log('4. npm run vibe:eliminate');
    console.log('5. npm run vibe:deploy');
    console.log('\n📚 Documentation:');
    console.log('- README.md - Project overview');
    console.log('- docs/ - Comprehensive documentation');
    console.log('\n🎉 Happy coding with Vibe Coders Framework!');
  }
}

// Parse command line arguments
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.split('=');
    if (key.startsWith('--')) {
      args[key.substring(2)] = value;
    }
  });
  return args;
}

// Main execution
if (require.main === module) {
  const args = parseArgs();

  if (!args.project) {
    console.error(
      '❌ Usage: node setup.js --project=<name> [--type=<nextjs|react|node>]'
    );
    console.error('   Example: node setup.js --project=my-app --type=nextjs');
    process.exit(1);
  }

  const setup = new VibeCodersFrameworkSetup(args);
  setup.setupFramework().catch(error => {
    console.error('❌ Framework setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = VibeCodersFrameworkSetup;
