#!/usr/bin/env node

/**
 * RK Institute Management System - Quality Gates Verification
 *
 * This script enforces the zero-error policy and prevents technical debt
 * re-accumulation by running comprehensive quality checks.
 *
 * Usage:
 *   node scripts/quality-gates.js [--fix] [--strict]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  ZERO_TYPESCRIPT_ERRORS: true,
  MAX_ESLINT_ERRORS: 0,
  MAX_ESLINT_WARNINGS: 1000, // Allow warnings but track them
  CRITICAL_ESLINT_RULES: [
    'no-assign-module-variable',
    'import/order',
    'no-duplicate-imports'
  ]
};

class QualityGateChecker {
  constructor(options = {}) {
    this.options = {
      fix: options.fix || false,
      strict: options.strict || false,
      verbose: options.verbose || true
    };
    this.results = {
      typescript: { passed: false, errors: 0 },
      eslint: { passed: false, errors: 0, warnings: 0 },
      prettier: { passed: false },
      build: { passed: false }
    };
  }

  log(message, type = 'info') {
    if (!this.options.verbose) return;

    const icons = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      critical: '🚫'
    };

    console.log(`${icons[type]} ${message}`);
  }

  async runCommand(command, description) {
    this.log(`Running: ${description}`);
    try {
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd()
      });
      return { success: true, output };
    } catch (error) {
      return {
        success: false,
        output: error.stdout || error.message,
        error: error.stderr || error.message
      };
    }
  }

  async checkTypeScript() {
    this.log('Checking TypeScript compilation...', 'info');

    const result = await this.runCommand(
      'npx tsc --noEmit',
      'TypeScript type checking'
    );

    if (result.success) {
      this.results.typescript.passed = true;
      this.results.typescript.errors = 0;
      this.log('TypeScript compilation: PASSED (0 errors)', 'success');
      return true;
    } else {
      // Count errors from output
      const errorCount = (result.output.match(/error TS\d+:/g) || []).length;
      this.results.typescript.errors = errorCount;

      if (CONFIG.ZERO_TYPESCRIPT_ERRORS) {
        this.log(
          `TypeScript compilation: FAILED (${errorCount} errors)`,
          'critical'
        );
        this.log('🚫 ZERO-ERROR POLICY VIOLATED', 'critical');
        return false;
      }
    }
  }

  async checkESLint() {
    this.log('Checking ESLint...', 'info');

    const result = await this.runCommand(
      'npx eslint . --ext .ts,.tsx,.js,.jsx --format=compact',
      'ESLint code quality check'
    );

    // Parse ESLint output
    const output = result.output || '';
    const errorMatches = output.match(/Error -/g) || [];
    const warningMatches = output.match(/Warning -/g) || [];

    this.results.eslint.errors = errorMatches.length;
    this.results.eslint.warnings = warningMatches.length;

    // Check for critical rule violations
    const criticalViolations = CONFIG.CRITICAL_ESLINT_RULES.some(rule =>
      output.includes(rule)
    );

    if (
      this.results.eslint.errors <= CONFIG.MAX_ESLINT_ERRORS &&
      !criticalViolations
    ) {
      this.results.eslint.passed = true;
      this.log(
        `ESLint: PASSED (${this.results.eslint.errors} errors, ${this.results.eslint.warnings} warnings)`,
        'success'
      );
      return true;
    } else {
      this.log(
        `ESLint: FAILED (${this.results.eslint.errors} errors, ${this.results.eslint.warnings} warnings)`,
        'error'
      );
      if (criticalViolations) {
        this.log('🚫 CRITICAL ESLINT RULES VIOLATED', 'critical');
      }
      return false;
    }
  }

  async checkPrettier() {
    this.log('Checking Prettier formatting...', 'info');

    const result = await this.runCommand(
      'npx prettier --check .',
      'Prettier format checking'
    );

    this.results.prettier.passed = result.success;

    if (result.success) {
      this.log('Prettier: PASSED (all files formatted)', 'success');
      return true;
    } else {
      this.log('Prettier: FAILED (formatting issues found)', 'warning');
      if (this.options.fix) {
        this.log('Auto-fixing Prettier issues...', 'info');
        await this.runCommand('npx prettier --write .', 'Auto-fix Prettier');
      }
      return !this.options.strict;
    }
  }

  async checkBuild() {
    this.log('Checking build...', 'info');

    const result = await this.runCommand(
      'npm run build',
      'Next.js build verification'
    );

    this.results.build.passed = result.success;

    if (result.success) {
      this.log('Build: PASSED', 'success');
      return true;
    } else {
      this.log('Build: FAILED', 'error');
      return false;
    }
  }

  generateReport() {
    this.log('\n📊 QUALITY GATES REPORT', 'info');
    this.log('========================', 'info');

    const checks = [
      [
        'TypeScript',
        this.results.typescript.passed,
        `${this.results.typescript.errors} errors`
      ],
      [
        'ESLint',
        this.results.eslint.passed,
        `${this.results.eslint.errors} errors, ${this.results.eslint.warnings} warnings`
      ],
      ['Prettier', this.results.prettier.passed, 'formatting'],
      ['Build', this.results.build.passed, 'compilation']
    ];

    checks.forEach(([name, passed, details]) => {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      this.log(
        `${name.padEnd(12)}: ${status} (${details})`,
        passed ? 'success' : 'error'
      );
    });

    const allPassed = Object.values(this.results).every(r => r.passed);

    this.log('\n🎯 OVERALL RESULT', 'info');
    if (allPassed) {
      this.log('🎉 ALL QUALITY GATES PASSED!', 'success');
      this.log('✅ Zero-error policy maintained', 'success');
    } else {
      this.log('🚫 QUALITY GATES FAILED!', 'critical');
      this.log('❌ Fix issues before proceeding', 'error');
    }

    return allPassed;
  }

  async run() {
    this.log('🚀 Starting Quality Gates Check...', 'info');
    this.log(
      `Options: fix=${this.options.fix}, strict=${this.options.strict}`,
      'info'
    );

    const checks = [
      () => this.checkTypeScript(),
      () => this.checkESLint(),
      () => this.checkPrettier(),
      () => this.checkBuild()
    ];

    for (const check of checks) {
      const passed = await check();
      if (!passed && this.options.strict) {
        this.log('🛑 Stopping due to strict mode', 'error');
        break;
      }
    }

    const success = this.generateReport();
    process.exit(success ? 0 : 1);
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    strict: args.includes('--strict'),
    verbose: !args.includes('--quiet')
  };

  const checker = new QualityGateChecker(options);
  checker.run().catch(error => {
    console.error('❌ Quality gates check failed:', error);
    process.exit(1);
  });
}

module.exports = QualityGateChecker;
