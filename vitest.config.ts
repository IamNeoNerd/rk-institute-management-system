import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

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
      'node_modules',
      'dist',
      '.next',
      'coverage',
      'migration-backup',
      'playwright.config.ts',
      'tests/**' // Exclude Playwright E2E tests
    ],

    // Performance optimization (latest patterns)
    pool: 'forks', // Better compatibility than threads for Next.js
    poolOptions: {
      forks: {
        singleFork: false,
        isolate: true
      }
    },

    // Enhanced coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'coverage/**',
        'dist/**',
        '.next/**',
        'node_modules/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/migration-backup/**',
        'app/test-*/**' // Exclude test pages
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
      hooks: 'list' // Sequential hook execution like Jest
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/services': path.resolve(__dirname, './lib/services'),
      '@/utils': path.resolve(__dirname, './lib/utils'),
      '@/app': path.resolve(__dirname, './app')
    }
  },

  // Environment variables for tests
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.NEXT_PUBLIC_APP_URL': '"http://localhost:3000"'
  }
});
