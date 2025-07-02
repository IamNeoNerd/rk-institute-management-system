#!/usr/bin/env node

/**
 * =============================================================================
 * RK Institute Management System - Production Environment Validation
 * =============================================================================
 *
 * Comprehensive production environment validation with:
 * - Critical health checks with strict thresholds
 * - Performance validation with production SLAs
 * - Security compliance verification
 * - Database performance and integrity checks
 * - API endpoint validation with load testing
 * - SSL certificate and domain validation
 * - Production monitoring integration
 *
 * Usage: node scripts/production-validation.js <production-url>
 * Example: node scripts/production-validation.js https://rk-institute.vercel.app
 *
 * Version: 2.0
 * Last Updated: 2025-07-02
 * =============================================================================
 */

const http = require('http');
const https = require('https');
const tls = require('tls');
const { URL } = require('url');

class ProductionValidator {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.results = {
      healthChecks: [],
      performance: [],
      security: [],
      ssl: [],
      database: [],
      apiEndpoints: [],
      loadTesting: [],
      monitoring: []
    };
    this.startTime = Date.now();
    this.productionThresholds = {
      responseTime: 1000, // 1 second max for production
      pageLoadTime: 1500, // 1.5 seconds max for pages
      apiResponseTime: 500, // 500ms max for API calls
      uptime: 99.9, // 99.9% uptime requirement
      errorRate: 0.001 // 0.1% max error rate
    };
  }

  /**
   * Main production validation orchestrator
   */
  async validate() {
    console.log('🚀 Starting Production Environment Validation...');
    console.log(`📍 Target URL: ${this.baseUrl}`);
    console.log(
      `⚡ Production SLA Thresholds: ${JSON.stringify(this.productionThresholds)}`
    );
    console.log('='.repeat(70));

    try {
      // Critical production validation steps
      await this.validateCriticalHealthChecks();
      await this.validateProductionPerformance();
      await this.validateProductionSecurity();
      await this.validateSSLCertificate();
      await this.validateDatabasePerformance();
      await this.validateCriticalApiEndpoints();
      await this.performLoadTesting();
      await this.validateMonitoringIntegration();

      // Generate production report
      this.generateProductionReport();

      console.log('✅ Production validation completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Production validation FAILED:', error.message);
      this.generateProductionReport();
      process.exit(1);
    }
  }

  /**
   * Critical Health Checks for Production
   */
  async validateCriticalHealthChecks() {
    console.log('🏥 Validating Critical Health Checks...');

    const criticalEndpoints = [
      '/api/health',
      '/api/health/database',
      '/api/health/system',
      '/api/health/ready'
    ];

    for (const endpoint of criticalEndpoints) {
      try {
        const startTime = Date.now();
        const response = await this.makeRequest(endpoint);
        const responseTime = Date.now() - startTime;

        if (
          response.statusCode === 200 &&
          responseTime <= this.productionThresholds.responseTime
        ) {
          console.log(`  ✅ ${endpoint} - OK (${responseTime}ms)`);
          this.results.healthChecks.push({
            endpoint,
            status: 'PASS',
            responseTime,
            statusCode: response.statusCode,
            threshold: this.productionThresholds.responseTime
          });
        } else {
          throw new Error(
            `Critical health check failed: ${endpoint} - ${response.statusCode} (${responseTime}ms)`
          );
        }
      } catch (error) {
        console.log(`  ❌ ${endpoint} - CRITICAL FAILURE: ${error.message}`);
        this.results.healthChecks.push({
          endpoint,
          status: 'CRITICAL_FAIL',
          error: error.message
        });
        throw error;
      }
    }
  }

  /**
   * Production Performance Validation
   */
  async validateProductionPerformance() {
    console.log('⚡ Validating Production Performance...');

    const performanceEndpoints = [
      {
        path: '/',
        name: 'Homepage',
        threshold: this.productionThresholds.pageLoadTime
      },
      {
        path: '/dashboard',
        name: 'Dashboard',
        threshold: this.productionThresholds.pageLoadTime
      },
      {
        path: '/auth/login',
        name: 'Login',
        threshold: this.productionThresholds.pageLoadTime
      },
      {
        path: '/api/health',
        name: 'Health API',
        threshold: this.productionThresholds.apiResponseTime
      }
    ];

    for (const endpoint of performanceEndpoints) {
      try {
        // Run multiple tests for accuracy
        const testRuns = 3;
        const responseTimes = [];

        for (let i = 0; i < testRuns; i++) {
          const startTime = Date.now();
          const response = await this.makeRequest(endpoint.path);
          const responseTime = Date.now() - startTime;
          responseTimes.push(responseTime);
        }

        const avgResponseTime = Math.round(
          responseTimes.reduce((a, b) => a + b) / testRuns
        );
        const maxResponseTime = Math.max(...responseTimes);

        if (avgResponseTime <= endpoint.threshold) {
          console.log(
            `  ✅ ${endpoint.name} - ${avgResponseTime}ms avg (max: ${maxResponseTime}ms)`
          );
          this.results.performance.push({
            endpoint: endpoint.path,
            name: endpoint.name,
            status: 'PASS',
            avgResponseTime,
            maxResponseTime,
            threshold: endpoint.threshold,
            testRuns
          });
        } else {
          throw new Error(
            `Performance SLA violation: ${endpoint.name} - ${avgResponseTime}ms > ${endpoint.threshold}ms`
          );
        }
      } catch (error) {
        console.log(
          `  ❌ ${endpoint.name} - PERFORMANCE FAILURE: ${error.message}`
        );
        this.results.performance.push({
          endpoint: endpoint.path,
          name: endpoint.name,
          status: 'FAIL',
          error: error.message
        });
        throw error;
      }
    }
  }

  /**
   * Production Security Validation
   */
  async validateProductionSecurity() {
    console.log('🔒 Validating Production Security...');

    try {
      const response = await this.makeRequest('/');
      const headers = response.headers;

      const requiredSecurityHeaders = {
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'permissions-policy': 'camera=(), microphone=(), geolocation=()'
      };

      let securityScore = 0;
      const totalHeaders = Object.keys(requiredSecurityHeaders).length;

      for (const [headerName, expectedValue] of Object.entries(
        requiredSecurityHeaders
      )) {
        const actualValue = headers[headerName];

        if (actualValue) {
          console.log(`  ✅ ${headerName}: Present`);
          securityScore++;
          this.results.security.push({
            header: headerName,
            status: 'PASS',
            expected: expectedValue,
            actual: actualValue
          });
        } else {
          console.log(`  ❌ ${headerName}: MISSING - CRITICAL SECURITY ISSUE`);
          this.results.security.push({
            header: headerName,
            status: 'CRITICAL_FAIL',
            expected: expectedValue,
            actual: null
          });
        }
      }

      const securityPercentage = (securityScore / totalHeaders) * 100;
      console.log(
        `  📊 Security Compliance: ${securityScore}/${totalHeaders} (${securityPercentage}%)`
      );

      if (securityPercentage < 100) {
        throw new Error(
          `Production security compliance failure: ${securityPercentage}% < 100%`
        );
      }
    } catch (error) {
      console.log(
        `  ❌ Security validation CRITICAL FAILURE: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * SSL Certificate Validation
   */
  async validateSSLCertificate() {
    console.log('🔐 Validating SSL Certificate...');

    try {
      const url = new URL(this.baseUrl);

      if (url.protocol !== 'https:') {
        throw new Error('Production must use HTTPS');
      }

      const cert = await this.getSSLCertificate(url.hostname, url.port || 443);

      const now = new Date();
      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const daysUntilExpiry = Math.floor(
        (validTo - now) / (1000 * 60 * 60 * 24)
      );

      if (now < validFrom || now > validTo) {
        throw new Error(
          `SSL certificate is not valid (valid from ${validFrom} to ${validTo})`
        );
      }

      if (daysUntilExpiry < 30) {
        console.log(
          `  ⚠️  SSL certificate expires in ${daysUntilExpiry} days - renewal recommended`
        );
      }

      console.log(
        `  ✅ SSL Certificate valid until ${validTo.toDateString()} (${daysUntilExpiry} days)`
      );
      console.log(`  ✅ Subject: ${cert.subject.CN}`);
      console.log(`  ✅ Issuer: ${cert.issuer.CN}`);

      this.results.ssl.push({
        status: 'PASS',
        validFrom,
        validTo,
        daysUntilExpiry,
        subject: cert.subject.CN,
        issuer: cert.issuer.CN
      });
    } catch (error) {
      console.log(`  ❌ SSL validation CRITICAL FAILURE: ${error.message}`);
      this.results.ssl.push({
        status: 'CRITICAL_FAIL',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Database Performance Validation
   */
  async validateDatabasePerformance() {
    console.log('🗄️  Validating Database Performance...');

    try {
      const dbTests = [
        { endpoint: '/api/health/database', name: 'Connection Test' },
        {
          endpoint: '/api/health/database?test=performance',
          name: 'Performance Test'
        }
      ];

      for (const test of dbTests) {
        const startTime = Date.now();
        const response = await this.makeRequest(test.endpoint);
        const responseTime = Date.now() - startTime;

        if (
          response.statusCode === 200 &&
          responseTime <= this.productionThresholds.apiResponseTime
        ) {
          console.log(`  ✅ ${test.name} - ${responseTime}ms`);
          this.results.database.push({
            test: test.name,
            status: 'PASS',
            responseTime,
            threshold: this.productionThresholds.apiResponseTime
          });
        } else {
          throw new Error(
            `Database ${test.name} failed: ${response.statusCode} (${responseTime}ms)`
          );
        }
      }
    } catch (error) {
      console.log(
        `  ❌ Database validation CRITICAL FAILURE: ${error.message}`
      );
      this.results.database.push({
        test: 'Database Performance',
        status: 'CRITICAL_FAIL',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Critical API Endpoints Validation
   */
  async validateCriticalApiEndpoints() {
    console.log('🔌 Validating Critical API Endpoints...');

    const criticalApis = [
      {
        path: '/api/health',
        method: 'GET',
        expectedStatus: 200,
        name: 'Health Check'
      },
      {
        path: '/api/auth/session',
        method: 'GET',
        expectedStatus: [200, 401],
        name: 'Session Check'
      },
      {
        path: '/api/students',
        method: 'GET',
        expectedStatus: [200, 401],
        name: 'Students API'
      }
    ];

    for (const api of criticalApis) {
      try {
        const startTime = Date.now();
        const response = await this.makeRequest(api.path, api.method);
        const responseTime = Date.now() - startTime;

        const expectedStatuses = Array.isArray(api.expectedStatus)
          ? api.expectedStatus
          : [api.expectedStatus];

        if (
          expectedStatuses.includes(response.statusCode) &&
          responseTime <= this.productionThresholds.apiResponseTime
        ) {
          console.log(
            `  ✅ ${api.name} - ${response.statusCode} (${responseTime}ms)`
          );
          this.results.apiEndpoints.push({
            endpoint: api.path,
            method: api.method,
            name: api.name,
            status: 'PASS',
            statusCode: response.statusCode,
            responseTime,
            threshold: this.productionThresholds.apiResponseTime
          });
        } else {
          throw new Error(
            `API ${api.name} failed: ${response.statusCode} (${responseTime}ms)`
          );
        }
      } catch (error) {
        console.log(`  ❌ ${api.name} - CRITICAL FAILURE: ${error.message}`);
        this.results.apiEndpoints.push({
          endpoint: api.path,
          method: api.method,
          name: api.name,
          status: 'CRITICAL_FAIL',
          error: error.message
        });
        throw error;
      }
    }
  }

  /**
   * Load Testing
   */
  async performLoadTesting() {
    console.log('🚀 Performing Load Testing...');

    const concurrentRequests = 10;
    const testEndpoint = '/api/health';

    try {
      console.log(
        `  🔄 Running ${concurrentRequests} concurrent requests to ${testEndpoint}...`
      );

      const promises = [];
      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(this.makeRequest(testEndpoint));
      }

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgResponseTime = totalTime / concurrentRequests;

      const successCount = results.filter(r => r.statusCode === 200).length;
      const successRate = (successCount / concurrentRequests) * 100;

      if (
        successRate >= 99 &&
        avgResponseTime <= this.productionThresholds.responseTime
      ) {
        console.log(
          `  ✅ Load test passed - ${successRate}% success rate, ${avgResponseTime}ms avg`
        );
        this.results.loadTesting.push({
          status: 'PASS',
          concurrentRequests,
          successRate,
          avgResponseTime,
          totalTime
        });
      } else {
        throw new Error(
          `Load test failed: ${successRate}% success rate, ${avgResponseTime}ms avg`
        );
      }
    } catch (error) {
      console.log(`  ❌ Load testing FAILURE: ${error.message}`);
      this.results.loadTesting.push({
        status: 'FAIL',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Monitoring Integration Validation
   */
  async validateMonitoringIntegration() {
    console.log('📊 Validating Monitoring Integration...');

    try {
      // Check if monitoring endpoints are available
      const monitoringEndpoints = ['/api/health/metrics', '/api/health/status'];

      for (const endpoint of monitoringEndpoints) {
        try {
          const response = await this.makeRequest(endpoint);
          if (response.statusCode === 200) {
            console.log(`  ✅ Monitoring endpoint ${endpoint} - Available`);
            this.results.monitoring.push({
              endpoint,
              status: 'AVAILABLE'
            });
          }
        } catch (error) {
          console.log(
            `  ⚠️  Monitoring endpoint ${endpoint} - Not available (optional)`
          );
          this.results.monitoring.push({
            endpoint,
            status: 'NOT_AVAILABLE'
          });
        }
      }
    } catch (error) {
      console.log(
        `  ⚠️  Monitoring validation completed with warnings: ${error.message}`
      );
    }
  }

  /**
   * Get SSL Certificate Information
   */
  getSSLCertificate(hostname, port) {
    return new Promise((resolve, reject) => {
      const socket = tls.connect(
        port,
        hostname,
        { servername: hostname },
        () => {
          const cert = socket.getPeerCertificate();
          socket.end();
          resolve(cert);
        }
      );

      socket.on('error', reject);
      socket.setTimeout(10000, () => {
        socket.destroy();
        reject(new Error('SSL certificate check timeout'));
      });
    });
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
        timeout: 15000,
        headers: {
          'User-Agent': 'RK-Institute-Production-Validator/2.0'
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
   * Generate Production Validation Report
   */
  generateProductionReport() {
    const totalTime = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(70));
    console.log('🚀 PRODUCTION VALIDATION REPORT');
    console.log('='.repeat(70));
    console.log(`🕒 Total Validation Time: ${totalTime}ms`);
    console.log(`📍 Production URL: ${this.baseUrl}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);

    // Calculate overall status
    const categories = [
      'healthChecks',
      'performance',
      'security',
      'ssl',
      'database',
      'apiEndpoints',
      'loadTesting'
    ];
    let overallPass = true;

    console.log('\n📈 VALIDATION SUMMARY:');
    for (const category of categories) {
      const results = this.results[category];
      const total = results.length;
      const passed = results.filter(
        r => r.status === 'PASS' || r.status === 'AVAILABLE'
      ).length;
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 100;

      if (percentage < 100) overallPass = false;

      console.log(`  ${category}: ${passed}/${total} passed (${percentage}%)`);
    }

    console.log(
      `\n🎯 PRODUCTION STATUS: ${overallPass ? '✅ READY FOR PRODUCTION' : '❌ NOT READY - CRITICAL ISSUES'}`
    );
    console.log('='.repeat(70));
  }
}

// Main execution
if (require.main === module) {
  const productionUrl = process.argv[2];

  if (!productionUrl) {
    console.error(
      '❌ Usage: node scripts/production-validation.js <production-url>'
    );
    console.error(
      '   Example: node scripts/production-validation.js https://rk-institute.vercel.app'
    );
    process.exit(1);
  }

  const validator = new ProductionValidator(productionUrl);
  validator.validate().catch(error => {
    console.error('❌ Production validation CRITICAL FAILURE:', error.message);
    process.exit(1);
  });
}

module.exports = ProductionValidator;
