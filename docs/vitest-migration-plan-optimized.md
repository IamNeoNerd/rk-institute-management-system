# Optimized Vitest Migration Plan v2.0
## RK Institute Management System - Enhanced Testing Framework Migration

### Executive Summary

This optimized migration plan incorporates latest Vitest 3.x features, real-world migration best practices, and enhanced Next.js 14 integration patterns. Based on comprehensive research and analysis of current project patterns, this plan provides a streamlined, risk-minimized approach to resolving React Testing Library compatibility issues.

**Key Optimizations:**
- Latest Vitest 3.x configuration patterns
- Enhanced Next.js 14 integration with `@vitejs/plugin-react`
- Improved performance with optimized pool configuration
- Streamlined migration scripts with error handling
- Enhanced CI/CD integration with modern patterns

---

## Phase 1: Enhanced Environment Setup (4 hours)

### Step 1.1: Backup & Dependency Management
```bash
# Create comprehensive backup
mkdir -p migration-backup/config migration-backup/tests
cp jest.config.js jest.setup.js package.json migration-backup/config/
cp -r __tests__ migration-backup/tests/

# Install optimized Vitest ecosystem (latest versions)
npm uninstall jest jest-environment-jsdom @types/jest
npm install -D vitest@^2.1.0 @vitest/ui@^2.1.0 @vitejs/plugin-react@^4.3.0
npm install -D jsdom@^25.0.0 @testing-library/react@^16.0.0 @testing-library/jest-dom@^6.5.0
npm install -D @vitest/coverage-v8@^2.1.0 happy-dom@^15.0.0
```

### Step 1.2: Optimized Vitest Configuration
Create `vitest.config.ts` with latest best practices:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Modern environment configuration
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,

    // Optimized file patterns
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules', 'dist', '.next', 'coverage', 'migration-backup',
      'playwright.config.ts', 'tests/**' // Exclude Playwright E2E tests
    ],

    // Performance optimization (latest patterns)
    pool: 'forks', // Better compatibility than threads for Next.js
    poolOptions: {
      forks: {
        singleFork: false,
        isolate: true,
      },
    },

    // Enhanced coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'coverage/**', 'dist/**', '.next/**', 'node_modules/**',
        '**/*.d.ts', '**/*.config.{js,ts}', '**/migration-backup/**',
        'app/test-*/**', // Exclude test pages
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },

    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Sequence configuration for consistent execution
    sequence: {
      hooks: 'list', // Sequential hook execution like Jest
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/services': path.resolve(__dirname, './lib/services'),
      '@/utils': path.resolve(__dirname, './lib/utils'),
      '@/app': path.resolve(__dirname, './app'),
    },
  },

  // Environment variables for tests
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.NEXT_PUBLIC_APP_URL': '"http://localhost:3000"',
  },
})
```

### Step 1.3: Enhanced Setup File
Create `vitest.setup.ts` with comprehensive Next.js mocking:

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// =============================================================================
// Test Environment Setup
// =============================================================================

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.clearAllTimers()
})

beforeEach(() => {
  // Reset all mocks before each test
  vi.resetModules()
})

// =============================================================================
// Next.js 14 App Router Mocks (Enhanced)
// =============================================================================

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: vi.fn(),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}))

// Enhanced Next.js Image component mock
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, ...props }: any) => {
    return <img src={src} alt={alt} width={width} height={height} {...props} />
  },
}))

// Enhanced Next.js Link component mock
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  },
}))

// =============================================================================
// Environment Polyfills & Global Mocks
// =============================================================================

// TextEncoder/TextDecoder polyfills
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Enhanced window.location mock
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
})

// Enhanced matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Modern Observer mocks
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// =============================================================================
// Application-Specific Mocks (Enhanced)
// =============================================================================

// Enhanced Prisma Client mock
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
    student: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    fee: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    service: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  })),
}))

// Enhanced environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
}

// =============================================================================
// Console Configuration (Enhanced)
// =============================================================================

const originalConsole = { ...console }

beforeEach(() => {
  // Suppress console output in tests unless explicitly needed
  console.warn = vi.fn()
  console.error = vi.fn()
  console.log = vi.fn()
})

afterEach(() => {
  // Restore console after each test
  Object.assign(console, originalConsole)
})
```

---

## Phase 2: Package Configuration & Scripts (2 hours)

### Step 2.1: Enhanced Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui --open",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=verbose --reporter=junit",
    "test:changed": "vitest related",
    "test:debug": "vitest --inspect-brk --no-coverage --single-thread",
    "test:hooks": "vitest run __tests__/hooks",
    "test:components": "vitest run __tests__/components",
    "test:services": "vitest run __tests__/services",
    "test:integration": "vitest run __tests__/integration",
    "test:performance": "vitest run --reporter=verbose --pool=forks",
    "test:migrate": "node scripts/migrate-tests.js"
  }
}
```

### Step 2.2: Enhanced TypeScript Configuration
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": [
      "vitest/globals",
      "@testing-library/jest-dom",
      "node"
    ],
    "jsx": "preserve"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "vitest.config.ts",
    "vitest.setup.ts"
  ]
}
```

---

## Phase 3: Enhanced Test Migration (4 hours)

### Step 3.1: Intelligent Migration Script
Create `scripts/migrate-tests.js`:

```javascript
const fs = require('fs');
const path = require('path');
const glob = require('glob');

class VitestMigrator {
  constructor() {
    this.migrationLog = [];
    this.errorLog = [];
  }

  migrateTestFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Remove Jest environment docblock
      content = content.replace(/\/\*\*\s*\n\s*\*\s*@jest-environment\s+\w+\s*\n\s*\*\/\s*\n/g, '');

      // Update imports - handle multiple patterns
      content = content.replace(
        /import\s+{([^}]+)}\s+from\s+['"]@jest\/globals['"]/g,
        'import { $1, vi } from \'vitest\''
      );

      // Add vi import if jest functions are used but not imported
      if (content.includes('jest.') && !content.includes('import { vi }') && !content.includes('from \'vitest\'')) {
        const firstImport = content.indexOf('import');
        if (firstImport !== -1) {
          content = content.slice(0, firstImport) +
            'import { vi } from \'vitest\';\n' +
            content.slice(firstImport);
        }
      }

      // Update Jest globals to Vitest
      content = content.replace(/jest\.mock\(/g, 'vi.mock(');
      content = content.replace(/jest\.fn\(/g, 'vi.fn(');
      content = content.replace(/jest\.spyOn\(/g, 'vi.spyOn(');
      content = content.replace(/jest\.clearAllMocks\(/g, 'vi.clearAllMocks(');
      content = content.replace(/jest\.resetAllMocks\(/g, 'vi.resetAllMocks(');
      content = content.replace(/jest\.restoreAllMocks\(/g, 'vi.restoreAllMocks(');

      // Update timer mocks
      content = content.replace(/jest\.useFakeTimers\(/g, 'vi.useFakeTimers(');
      content = content.replace(/jest\.useRealTimers\(/g, 'vi.useRealTimers(');
      content = content.replace(/jest\.advanceTimersByTime\(/g, 'vi.advanceTimersByTime(');
      content = content.replace(/jest\.runAllTimers\(/g, 'vi.runAllTimers(');

      // Update module mocks
      content = content.replace(/jest\.requireActual\(/g, 'await vi.importActual(');

      // Update mock implementations for Vitest compatibility
      content = content.replace(
        /\.mockImplementation\(\(\) => \{([^}]+)\}\)/g,
        '.mockImplementation(() => ({ $1 }))'
      );

      // Only write if content changed
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.migrationLog.push(`✅ Migrated: ${filePath}`);
        console.log(`✅ Migrated: ${filePath}`);
      } else {
        this.migrationLog.push(`ℹ️  No changes needed: ${filePath}`);
        console.log(`ℹ️  No changes needed: ${filePath}`);
      }

    } catch (error) {
      this.errorLog.push(`❌ Error migrating ${filePath}: ${error.message}`);
      console.error(`❌ Error migrating ${filePath}:`, error.message);
    }
  }

  async migrateAllTests() {
    console.log('🚀 Starting Vitest migration...\n');

    // Find all test files
    const testFiles = glob.sync('__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}');

    console.log(`Found ${testFiles.length} test files to migrate:\n`);

    // Migrate each file
    testFiles.forEach(file => this.migrateTestFile(file));

    // Generate migration report
    this.generateReport();
  }

  generateReport() {
    const reportPath = 'migration-backup/migration-report.md';
    const report = `# Vitest Migration Report

## Summary
- **Total files processed**: ${this.migrationLog.length}
- **Successful migrations**: ${this.migrationLog.filter(log => log.includes('✅')).length}
- **Files with no changes**: ${this.migrationLog.filter(log => log.includes('ℹ️')).length}
- **Errors**: ${this.errorLog.length}

## Migration Log
${this.migrationLog.join('\n')}

## Errors
${this.errorLog.join('\n')}

Generated: ${new Date().toISOString()}
`;

    fs.writeFileSync(reportPath, report);
    console.log(`\n📊 Migration report saved to: ${reportPath}`);
  }
}

// Run migration
const migrator = new VitestMigrator();
migrator.migrateAllTests();
```

### Step 3.2: Manual Migration Patterns
Key patterns for manual review:

**Feature Flag Test Migration Example:**
```typescript
// Before (Jest)
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { renderHook, render, screen, waitFor } from '@testing-library/react';

// After (Vitest) - Enhanced
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, render, screen, waitFor } from '@testing-library/react';

// Enhanced mock setup
beforeEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});
```

---

## Phase 4: CI/CD Integration & Validation (2 hours)

### Step 4.1: Enhanced GitHub Actions
Update `.github/workflows/ci.yml`:

```yaml
test:
  name: 🧪 Vitest Execution
  runs-on: ubuntu-latest
  needs: [lint, typescript]

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

    - name: 🧪 Run Vitest tests
      run: npm run test:ci
      env:
        NODE_ENV: test

    - name: 📊 Upload coverage to Codecov
      uses: codecov/codecov-action@v4
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: vitest-coverage

    - name: 📋 Upload test results
      uses: dorny/test-reporter@v1
      if: success() || failure()
      with:
        name: Vitest Tests
        path: junit.xml
        reporter: java-junit
```

---

## Implementation & Execution

Now I'll proceed with the optimized migration implementation:

### **Immediate Actions**
