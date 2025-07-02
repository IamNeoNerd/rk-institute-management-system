#!/usr/bin/env node

/**
 * =============================================================================
 * RK Institute Management System - Staging Environment Validation
 * =============================================================================
 *
 * Comprehensive staging environment validation script that performs:
 * - Health check validation
 * - Performance testing
 * - Security validation
 * - Database connectivity testing
 * - API endpoint validation
 * - Quality gates verification
 *
 * Usage: node scripts/staging-validation.js <staging-url>
 * Example: node scripts/staging-validation.js https://staging-rk-institute.vercel.app
 *
 * Version: 2.0
 * Last Updated: 2025-07-02
 * =============================================================================
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

class StagingValidator {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.results = {
      healthChecks: [],
      performance: [],
      security: [],
      database: [],
      apiEndpoints: [],
      qualityGates: []
    };
    this.startTime = Date.now();
  }

  /**
   * Main validation orchestrator
   */
  async validate() {
    console.log('🧪 Starting Staging Environment Validation...');
    console.log(`📍 Target URL: ${this.baseUrl}`);
    console.log('='.repeat(60));

    try {
      // Core validation steps
      await this.validateHealthChecks();
      await this.validatePerformance();
      await this.validateSecurity();
      await this.validateDatabase();
      await this.validateApiEndpoints();
      await this.validateQualityGates();

      // Generate final report
      this.generateReport();

      console.log('✅ Staging validation completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Staging validation failed:', error.message);
      this.generateReport();
      process.exit(1);
    }
  }

  /**
   * Health Check Validation
   */
  async validateHealthChecks() {
    console.log('🔍 Validating Health Checks...');

    const healthEndpoints = [
      '/api/health',
      '/api/health/database',
      '/api/health/system'
    ];

    for (const endpoint of healthEndpoints) {
      try {
        const startTime = Date.now();
        const response = await this.makeRequest(endpoint);
        const responseTime = Date.now() - startTime;

        if (response.statusCode === 200) {
          console.log(`  ✅ ${endpoint} - OK (${responseTime}ms)`);
          this.results.healthChecks.push({
            endpoint,
            status: 'PASS',
            responseTime,
            statusCode: response.statusCode
          });
        } else {
          throw new Error(
            `Health check failed: ${endpoint} returned ${response.statusCode}`
          );
        }
      } catch (error) {
        console.log(`  ❌ ${endpoint} - FAILED: ${error.message}`);
        this.results.healthChecks.push({
          endpoint,
          status: 'FAIL',
          error: error.message
        });
        throw error;
      }
    }
  }

  /**
   * Performance Validation
   */
  async validatePerformance() {
    console.log('⚡ Validating Performance...');

    const performanceEndpoints = [
      '/',
      '/dashboard',
      '/auth/login',
      '/api/health'
    ];

    for (const endpoint of performanceEndpoints) {
      try {
        const startTime = Date.now();
        const response = await this.makeRequest(endpoint);
        const loadTime = Date.now() - startTime;

        // Performance thresholds
        const threshold = endpoint.startsWith('/api') ? 1000 : 2000;

        if (loadTime <= threshold) {
          console.log(
            `  ✅ ${endpoint} - ${loadTime}ms (threshold: ${threshold}ms)`
          );
          this.results.performance.push({
            endpoint,
            status: 'PASS',
            loadTime,
            threshold
          });
        } else {
          console.log(
            `  ⚠️  ${endpoint} - ${loadTime}ms (exceeds ${threshold}ms threshold)`
          );
          this.results.performance.push({
            endpoint,
            status: 'WARNING',
            loadTime,
            threshold
          });
        }
      } catch (error) {
        console.log(
          `  ❌ ${endpoint} - Performance test failed: ${error.message}`
        );
        this.results.performance.push({
          endpoint,
          status: 'FAIL',
          error: error.message
        });
      }
    }
  }

  /**
   * Security Validation
   */
  async validateSecurity() {
    console.log('🔒 Validating Security Headers...');

    try {
      const response = await this.makeRequest('/');
      const headers = response.headers;

      const requiredHeaders = {
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block',
        'referrer-policy': 'strict-origin-when-cross-origin'
      };

      let securityScore = 0;
      const totalHeaders = Object.keys(requiredHeaders).length;

      for (const [headerName, expectedValue] of Object.entries(
        requiredHeaders
      )) {
        const actualValue = headers[headerName];

        if (actualValue) {
          console.log(`  ✅ ${headerName}: ${actualValue}`);
          securityScore++;
          this.results.security.push({
            header: headerName,
            status: 'PASS',
            expected: expectedValue,
            actual: actualValue
          });
        } else {
          console.log(`  ❌ ${headerName}: Missing`);
          this.results.security.push({
            header: headerName,
            status: 'FAIL',
            expected: expectedValue,
            actual: null
          });
        }
      }

      const securityPercentage = (securityScore / totalHeaders) * 100;
      console.log(
        `  📊 Security Score: ${securityScore}/${totalHeaders} (${securityPercentage}%)`
      );

      if (securityPercentage < 100) {
        throw new Error(
          `Security validation failed: ${securityPercentage}% compliance`
        );
      }
    } catch (error) {
      console.log(`  ❌ Security validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Database Validation
   */
  async validateDatabase() {
    console.log('🗄️  Validating Database Connectivity...');

    try {
      const response = await this.makeRequest('/api/health/database');

      if (response.statusCode === 200) {
        console.log('  ✅ Database connectivity - OK');
        this.results.database.push({
          test: 'connectivity',
          status: 'PASS'
        });
      } else {
        throw new Error(`Database health check failed: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`  ❌ Database validation failed: ${error.message}`);
      this.results.database.push({
        test: 'connectivity',
        status: 'FAIL',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * API Endpoints Validation
   */
  async validateApiEndpoints() {
    console.log('🔌 Validating API Endpoints...');

    const criticalEndpoints = [
      { path: '/api/health', method: 'GET', expectedStatus: 200 },
      { path: '/api/auth/login', method: 'POST', expectedStatus: 400 }, // Should fail without credentials
      { path: '/api/users', method: 'GET', expectedStatus: 401 } // Should require auth
    ];

    for (const endpoint of criticalEndpoints) {
      try {
        const response = await this.makeRequest(endpoint.path, endpoint.method);

        if (response.statusCode === endpoint.expectedStatus) {
          console.log(
            `  ✅ ${endpoint.method} ${endpoint.path} - ${response.statusCode} (expected)`
          );
          this.results.apiEndpoints.push({
            endpoint: endpoint.path,
            method: endpoint.method,
            status: 'PASS',
            statusCode: response.statusCode,
            expected: endpoint.expectedStatus
          });
        } else {
          console.log(
            `  ⚠️  ${endpoint.method} ${endpoint.path} - ${response.statusCode} (expected ${endpoint.expectedStatus})`
          );
          this.results.apiEndpoints.push({
            endpoint: endpoint.path,
            method: endpoint.method,
            status: 'WARNING',
            statusCode: response.statusCode,
            expected: endpoint.expectedStatus
          });
        }
      } catch (error) {
        console.log(
          `  ❌ ${endpoint.method} ${endpoint.path} - Failed: ${error.message}`
        );
        this.results.apiEndpoints.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          status: 'FAIL',
          error: error.message
        });
      }
    }
  }

  /**
   * Quality Gates Validation
   */
  async validateQualityGates() {
    console.log('🚪 Validating Quality Gates...');

    // Check if staging environment has quality gates indicators
    try {
      const response = await this.makeRequest('/api/health/system');

      if (response.statusCode === 200) {
        console.log('  ✅ Quality gates system check - OK');
        this.results.qualityGates.push({
          check: 'system_health',
          status: 'PASS'
        });
      }
    } catch (error) {
      console.log(`  ❌ Quality gates validation failed: ${error.message}`);
      this.results.qualityGates.push({
        check: 'system_health',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  /**
   * HTTP Request Helper
   */
  makeRequest(path, method = 'GET') {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        timeout: 10000,
        headers: {
          'User-Agent': 'RK-Institute-Staging-Validator/2.0'
        }
      };

      const client = url.protocol === 'https:' ? https : http;

      const req = client.request(options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * Generate Validation Report
   */
  generateReport() {
    const totalTime = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 STAGING VALIDATION REPORT');
    console.log('='.repeat(60));
    console.log(`🕒 Total Validation Time: ${totalTime}ms`);
    console.log(`📍 Target URL: ${this.baseUrl}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);

    // Summary statistics
    const stats = {
      healthChecks: this.getStats(this.results.healthChecks),
      performance: this.getStats(this.results.performance),
      security: this.getStats(this.results.security),
      database: this.getStats(this.results.database),
      apiEndpoints: this.getStats(this.results.apiEndpoints),
      qualityGates: this.getStats(this.results.qualityGates)
    };

    console.log('\n📈 VALIDATION SUMMARY:');
    for (const [category, stat] of Object.entries(stats)) {
      console.log(
        `  ${category}: ${stat.pass}/${stat.total} passed (${stat.percentage}%)`
      );
    }

    // Overall status
    const overallPass = Object.values(stats).every(
      stat => stat.percentage === 100
    );
    console.log(`\n🎯 OVERALL STATUS: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);

    console.log('='.repeat(60));
  }

  /**
   * Calculate statistics for a result category
   */
  getStats(results) {
    const total = results.length;
    const pass = results.filter(r => r.status === 'PASS').length;
    const percentage = total > 0 ? Math.round((pass / total) * 100) : 0;

    return { total, pass, percentage };
  }
}

// Main execution
if (require.main === module) {
  const stagingUrl = process.argv[2];

  if (!stagingUrl) {
    console.error('❌ Usage: node scripts/staging-validation.js <staging-url>');
    console.error(
      '   Example: node scripts/staging-validation.js https://staging-rk-institute.vercel.app'
    );
    process.exit(1);
  }

  const validator = new StagingValidator(stagingUrl);
  validator.validate().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = StagingValidator;
