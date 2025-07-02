#!/usr/bin/env node

/**
 * Quality Gates Validation Runner
 *
 * Executes comprehensive synthetic test scenarios to validate our quality gates,
 * CI/CD pipeline, and development workflow from basic to advanced edge cases.
 *
 * Usage:
 *   node scripts/validate-quality-gates.js [--level=basic|intermediate|advanced|all]
 *   node scripts/validate-quality-gates.js --help
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class QualityGatesValidator {
  constructor(options = {}) {
    this.options = {
      level: options.level || 'basic',
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      outputFile: options.outputFile || null
    };

    this.results = {
      basic: { passed: 0, failed: 0, tests: [] },
      intermediate: { passed: 0, failed: 0, tests: [] },
      advanced: { passed: 0, failed: 0, tests: [] },
      summary: { totalPassed: 0, totalFailed: 0, duration: 0 }
    };

    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icons = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      critical: '🚫',
      test: '🧪'
    };

    const formattedMessage = `${icons[type]} [${timestamp}] ${message}`;
    console.log(formattedMessage);

    if (this.options.outputFile) {
      fs.appendFileSync(this.options.outputFile, formattedMessage + '\n');
    }
  }

  async runCommand(command, description, expectFailure = false) {
    this.log(`Running: ${description}`, 'test');

    if (this.options.dryRun) {
      this.log(`DRY RUN: Would execute: ${command}`, 'info');
      return { success: true, output: 'DRY RUN', duration: 0 };
    }

    const startTime = Date.now();

    try {
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 60000 // 1 minute timeout
      });

      const duration = Date.now() - startTime;
      const success = !expectFailure;

      if (success) {
        this.log(`✅ PASSED: ${description} (${duration}ms)`, 'success');
      } else {
        this.log(
          `❌ UNEXPECTED SUCCESS: ${description} (expected failure)`,
          'error'
        );
      }

      return { success, output, duration, expected: !expectFailure };
    } catch (error) {
      const duration = Date.now() - startTime;
      const success = expectFailure;

      if (success) {
        this.log(
          `✅ PASSED: ${description} (expected failure, ${duration}ms)`,
          'success'
        );
      } else {
        this.log(`❌ FAILED: ${description} (${duration}ms)`, 'error');
        if (this.options.verbose) {
          this.log(`Error: ${error.message}`, 'error');
        }
      }

      return {
        success,
        output: error.stdout || error.message,
        error: error.stderr || error.message,
        duration,
        expected: expectFailure
      };
    }
  }

  async validateBasicLevel() {
    this.log('🧪 Starting Basic Level Quality Gates Validation', 'info');

    const tests = [
      {
        name: 'TypeScript Compilation Check',
        command: 'npx tsc --noEmit',
        expectFailure: false
      },
      {
        name: 'ESLint Basic Check',
        command: 'npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 1000',
        expectFailure: false
      },
      {
        name: 'Prettier Format Check',
        command: 'npx prettier --check .',
        expectFailure: false
      },
      {
        name: 'Package Scripts - Type Check',
        command: 'npm run type-check',
        expectFailure: false
      },
      {
        name: 'Package Scripts - Quality Check',
        command: 'npm run quality:check',
        expectFailure: false
      },
      {
        name: 'Quality Gates Script Execution',
        command: 'node scripts/quality-gates.js --quiet',
        expectFailure: false
      },
      {
        name: 'Basic Test Suite Execution',
        command:
          'npm run test:run -- __tests__/quality-gates/basic-validation.test.ts --reporter=basic',
        expectFailure: false
      }
    ];

    for (const test of tests) {
      const result = await this.runCommand(
        test.command,
        test.name,
        test.expectFailure
      );

      this.results.basic.tests.push({
        name: test.name,
        passed: result.success,
        duration: result.duration,
        expected: result.expected
      });

      if (result.success) {
        this.results.basic.passed++;
      } else {
        this.results.basic.failed++;
      }
    }
  }

  async validateIntermediateLevel() {
    this.log('🧪 Starting Intermediate Level Quality Gates Validation', 'info');

    // Create temporary files with violations for testing
    const tempDir = path.join(
      process.cwd(),
      '__tests__/quality-gates/temp-intermediate'
    );
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
      // Create file with TypeScript errors
      const tsErrorFile = path.join(tempDir, 'ts-error-test.ts');
      fs.writeFileSync(
        tsErrorFile,
        `
        interface Test {
          id: string;
        }
        const test: Test = { id: 123 }; // Type error
      `
      );

      // Create file with ESLint violations
      const eslintErrorFile = path.join(tempDir, 'eslint-error-test.ts');
      fs.writeFileSync(
        eslintErrorFile,
        `
        const module = 'test'; // no-assign-module-variable
        import React from 'react';
        import React from 'react'; // duplicate import
      `
      );

      const tests = [
        {
          name: 'TypeScript Error Detection',
          command: `npx tsc --noEmit ${tsErrorFile}`,
          expectFailure: true
        },
        {
          name: 'ESLint Critical Error Detection',
          command: `npx eslint ${eslintErrorFile} --max-warnings 0`,
          expectFailure: true
        },
        {
          name: 'Pre-commit Hook Simulation (TypeScript)',
          command: `npx tsc --noEmit ${tsErrorFile}`,
          expectFailure: true
        },
        {
          name: 'Lint-staged Simulation',
          command: `npx eslint ${eslintErrorFile} --fix --max-warnings 0`,
          expectFailure: true
        },
        {
          name: 'Quality Gates with Violations',
          command: 'node scripts/quality-gates.js --strict',
          expectFailure: true // May fail due to existing issues
        }
      ];

      for (const test of tests) {
        const result = await this.runCommand(
          test.command,
          test.name,
          test.expectFailure
        );

        this.results.intermediate.tests.push({
          name: test.name,
          passed: result.success,
          duration: result.duration,
          expected: result.expected
        });

        if (result.success) {
          this.results.intermediate.passed++;
        } else {
          this.results.intermediate.failed++;
        }
      }
    } finally {
      // Clean up temp files
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }

  async validateAdvancedLevel() {
    this.log('🧪 Starting Advanced Level Quality Gates Validation', 'info');

    const tests = [
      {
        name: 'Full Test Suite with Coverage',
        command: 'npm run test:coverage',
        expectFailure: false
      },
      {
        name: 'Build Process Validation',
        command: 'npm run build',
        expectFailure: false
      },
      {
        name: 'Performance Test Execution',
        command: 'npm run test:performance',
        expectFailure: false
      },
      {
        name: 'Security Audit',
        command: 'npm audit --audit-level=high',
        expectFailure: false
      },
      {
        name: 'Dependency Vulnerability Check',
        command: 'npx audit-ci --config .audit-ci.json',
        expectFailure: false
      }
    ];

    for (const test of tests) {
      const result = await this.runCommand(
        test.command,
        test.name,
        test.expectFailure
      );

      this.results.advanced.tests.push({
        name: test.name,
        passed: result.success,
        duration: result.duration,
        expected: result.expected
      });

      if (result.success) {
        this.results.advanced.passed++;
      } else {
        this.results.advanced.failed++;
      }
    }
  }

  generateReport() {
    const endTime = Date.now();
    this.results.summary.duration = endTime - this.startTime;

    // Calculate totals
    Object.keys(this.results).forEach(level => {
      if (level !== 'summary') {
        this.results.summary.totalPassed += this.results[level].passed;
        this.results.summary.totalFailed += this.results[level].failed;
      }
    });

    this.log('\n📊 QUALITY GATES VALIDATION REPORT', 'info');
    this.log('=====================================', 'info');

    // Level-by-level results
    ['basic', 'intermediate', 'advanced'].forEach(level => {
      if (this.options.level === 'all' || this.options.level === level) {
        const results = this.results[level];
        const total = results.passed + results.failed;
        const percentage =
          total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0.0';

        this.log(`\n${level.toUpperCase()} LEVEL:`, 'info');
        this.log(`  ✅ Passed: ${results.passed}`, 'success');
        this.log(
          `  ❌ Failed: ${results.failed}`,
          results.failed > 0 ? 'error' : 'info'
        );
        this.log(
          `  📊 Success Rate: ${percentage}%`,
          percentage === '100.0' ? 'success' : 'warning'
        );

        if (this.options.verbose && results.tests.length > 0) {
          this.log('  📋 Test Details:', 'info');
          results.tests.forEach(test => {
            const status = test.passed ? '✅' : '❌';
            const expected = test.expected ? '' : ' (UNEXPECTED)';
            this.log(
              `    ${status} ${test.name} (${test.duration}ms)${expected}`,
              'info'
            );
          });
        }
      }
    });

    // Overall summary
    const overallPercentage =
      this.results.summary.totalPassed + this.results.summary.totalFailed > 0
        ? (
            (this.results.summary.totalPassed /
              (this.results.summary.totalPassed +
                this.results.summary.totalFailed)) *
            100
          ).toFixed(1)
        : '0.0';

    this.log('\n🎯 OVERALL SUMMARY:', 'info');
    this.log(
      `  ✅ Total Passed: ${this.results.summary.totalPassed}`,
      'success'
    );
    this.log(
      `  ❌ Total Failed: ${this.results.summary.totalFailed}`,
      this.results.summary.totalFailed > 0 ? 'error' : 'info'
    );
    this.log(
      `  📊 Overall Success Rate: ${overallPercentage}%`,
      overallPercentage === '100.0' ? 'success' : 'warning'
    );
    this.log(
      `  ⏱️  Total Duration: ${(this.results.summary.duration / 1000).toFixed(2)}s`,
      'info'
    );

    // Quality assessment
    if (overallPercentage === '100.0') {
      this.log(
        '\n🎉 EXCELLENT: All quality gates are functioning correctly!',
        'success'
      );
    } else if (parseFloat(overallPercentage) >= 80) {
      this.log(
        '\n⚠️  GOOD: Most quality gates are working, some issues detected',
        'warning'
      );
    } else {
      this.log(
        '\n🚫 CRITICAL: Significant quality gate failures detected',
        'error'
      );
    }

    return this.results.summary.totalFailed === 0;
  }

  async run() {
    this.log('🚀 Starting Quality Gates Validation', 'info');
    this.log(
      `Configuration: level=${this.options.level}, verbose=${this.options.verbose}, dryRun=${this.options.dryRun}`,
      'info'
    );

    try {
      if (this.options.level === 'all' || this.options.level === 'basic') {
        await this.validateBasicLevel();
      }

      if (
        this.options.level === 'all' ||
        this.options.level === 'intermediate'
      ) {
        await this.validateIntermediateLevel();
      }

      if (this.options.level === 'all' || this.options.level === 'advanced') {
        await this.validateAdvancedLevel();
      }

      const success = this.generateReport();
      process.exit(success ? 0 : 1);
    } catch (error) {
      this.log(`🚫 CRITICAL ERROR: ${error.message}`, 'critical');
      process.exit(1);
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Quality Gates Validation Runner

Usage:
  node scripts/validate-quality-gates.js [options]

Options:
  --level=<level>     Validation level: basic, intermediate, advanced, all (default: basic)
  --verbose           Show detailed test output
  --dry-run           Show what would be executed without running
  --output=<file>     Save results to file
  --help, -h          Show this help message

Examples:
  node scripts/validate-quality-gates.js --level=basic
  node scripts/validate-quality-gates.js --level=all --verbose
  node scripts/validate-quality-gates.js --dry-run --output=validation-results.log
    `);
    process.exit(0);
  }

  const options = {
    level:
      args.find(arg => arg.startsWith('--level='))?.split('=')[1] || 'basic',
    verbose: args.includes('--verbose'),
    dryRun: args.includes('--dry-run'),
    outputFile:
      args.find(arg => arg.startsWith('--output='))?.split('=')[1] || null
  };

  const validator = new QualityGatesValidator(options);
  validator.run().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = QualityGatesValidator;
