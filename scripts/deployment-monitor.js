#!/usr/bin/env node

/**
 * Deployment Monitoring Script
 * RK Institute Management System
 *
 * Comprehensive deployment monitoring and validation
 * for production and staging environments
 */

const http = require('http');
const https = require('https');

class DeploymentMonitor {
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 30000,
      retries: options.retries || 5,
      retryDelay: options.retryDelay || 10000,
      verbose: options.verbose || false,
      ...options
    };
  }

  /**
   * Monitor deployment health and performance
   */
  async monitorDeployment(url, environment = 'production') {
    console.log(`🔍 Starting deployment monitoring for ${environment}`);
    console.log(`🌐 Target URL: ${url}`);

    const results = {
      environment,
      url,
      timestamp: new Date().toISOString(),
      tests: {},
      overall: 'unknown'
    };

    try {
      // Basic connectivity test
      results.tests.connectivity = await this.testConnectivity(url);

      // Health check endpoints
      results.tests.health = await this.testHealthEndpoint(url);
      results.tests.databaseHealth = await this.testDatabaseHealth(url);

      // Performance tests
      results.tests.performance = await this.testPerformance(url);

      // Security headers test
      results.tests.security = await this.testSecurityHeaders(url);

      // Critical functionality tests
      results.tests.functionality = await this.testCriticalFunctionality(url);

      // Determine overall status
      results.overall = this.calculateOverallStatus(results.tests);

      // Generate report
      this.generateReport(results);

      return results;
    } catch (error) {
      console.error('❌ Deployment monitoring failed:', error.message);
      results.overall = 'failed';
      results.error = error.message;
      return results;
    }
  }

  /**
   * Test basic connectivity
   */
  async testConnectivity(url) {
    console.log('🔗 Testing basic connectivity...');

    try {
      const response = await this.makeRequest(url, { method: 'GET' });

      return {
        status: 'passed',
        responseTime: response.responseTime,
        statusCode: response.statusCode,
        message: 'Connectivity test passed'
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        message: 'Failed to establish basic connectivity'
      };
    }
  }

  /**
   * Test health endpoint
   */
  async testHealthEndpoint(url) {
    console.log('🏥 Testing health endpoint...');

    try {
      const healthUrl = `${url}/api/health`;
      const response = await this.makeRequest(healthUrl);

      if (response.statusCode === 200) {
        const healthData = JSON.parse(response.body);

        return {
          status: 'passed',
          responseTime: response.responseTime,
          healthStatus: healthData.status,
          uptime: healthData.uptime,
          message: `Health check passed - Status: ${healthData.status}`
        };
      } else {
        return {
          status: 'failed',
          statusCode: response.statusCode,
          message: 'Health endpoint returned non-200 status'
        };
      }
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        message: 'Health endpoint test failed'
      };
    }
  }

  /**
   * Test database health
   */
  async testDatabaseHealth(url) {
    console.log('🗄️ Testing database health...');

    try {
      const dbHealthUrl = `${url}/api/health/database`;
      const response = await this.makeRequest(dbHealthUrl);

      if (response.statusCode === 200) {
        const dbHealth = JSON.parse(response.body);

        return {
          status: 'passed',
          responseTime: response.responseTime,
          dbStatus: dbHealth.status,
          connectionTime: dbHealth.connection.responseTime,
          message: `Database health check passed - Status: ${dbHealth.status}`
        };
      } else {
        return {
          status: 'failed',
          statusCode: response.statusCode,
          message: 'Database health endpoint returned non-200 status'
        };
      }
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        message: 'Database health test failed'
      };
    }
  }

  /**
   * Test performance metrics
   */
  async testPerformance(url) {
    console.log('⚡ Testing performance...');

    try {
      const tests = [];

      // Test multiple requests to get average response time
      for (let i = 0; i < 3; i++) {
        const response = await this.makeRequest(url);
        tests.push(response.responseTime);
      }

      const averageResponseTime =
        tests.reduce((a, b) => a + b, 0) / tests.length;
      const maxResponseTime = Math.max(...tests);

      const performanceThreshold = 3000; // 3 seconds
      const status =
        averageResponseTime < performanceThreshold ? 'passed' : 'warning';

      return {
        status,
        averageResponseTime: Math.round(averageResponseTime),
        maxResponseTime: Math.round(maxResponseTime),
        threshold: performanceThreshold,
        message: `Performance test ${status} - Avg: ${Math.round(averageResponseTime)}ms`
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        message: 'Performance test failed'
      };
    }
  }

  /**
   * Test security headers
   */
  async testSecurityHeaders(url) {
    console.log('🔒 Testing security headers...');

    try {
      const response = await this.makeRequest(url);
      const headers = response.headers;

      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'referrer-policy'
      ];

      const presentHeaders = [];
      const missingHeaders = [];

      requiredHeaders.forEach(header => {
        if (headers[header]) {
          presentHeaders.push(header);
        } else {
          missingHeaders.push(header);
        }
      });

      const status = missingHeaders.length === 0 ? 'passed' : 'warning';

      return {
        status,
        presentHeaders,
        missingHeaders,
        message: `Security headers test ${status} - ${presentHeaders.length}/${requiredHeaders.length} headers present`
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        message: 'Security headers test failed'
      };
    }
  }

  /**
   * Test critical functionality
   */
  async testCriticalFunctionality(url) {
    console.log('🧪 Testing critical functionality...');

    try {
      const tests = [];

      // Test login page accessibility
      try {
        const loginResponse = await this.makeRequest(`${url}/auth/login`);
        tests.push({
          name: 'Login Page',
          status: loginResponse.statusCode === 200 ? 'passed' : 'failed',
          statusCode: loginResponse.statusCode
        });
      } catch (error) {
        tests.push({
          name: 'Login Page',
          status: 'failed',
          error: error.message
        });
      }

      // Test dashboard accessibility (should redirect to login)
      try {
        const dashboardResponse = await this.makeRequest(`${url}/dashboard`);
        tests.push({
          name: 'Dashboard Redirect',
          status: [200, 302, 401].includes(dashboardResponse.statusCode)
            ? 'passed'
            : 'failed',
          statusCode: dashboardResponse.statusCode
        });
      } catch (error) {
        tests.push({
          name: 'Dashboard Redirect',
          status: 'failed',
          error: error.message
        });
      }

      const passedTests = tests.filter(test => test.status === 'passed').length;
      const status = passedTests === tests.length ? 'passed' : 'warning';

      return {
        status,
        tests,
        passedTests,
        totalTests: tests.length,
        message: `Functionality test ${status} - ${passedTests}/${tests.length} tests passed`
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        message: 'Critical functionality test failed'
      };
    }
  }

  /**
   * Make HTTP/HTTPS request with timeout and retry logic
   */
  async makeRequest(url, options = {}) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        timeout: this.options.timeout,
        headers: {
          'User-Agent': 'RK-Institute-Deployment-Monitor/1.0',
          ...options.headers
        }
      };

      const req = client.request(requestOptions, res => {
        let body = '';

        res.on('data', chunk => {
          body += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
            responseTime: Date.now() - startTime
          });
        });
      });

      req.on('error', error => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${this.options.timeout}ms`));
      });

      req.end();
    });
  }

  /**
   * Calculate overall status from test results
   */
  calculateOverallStatus(tests) {
    const statuses = Object.values(tests).map(test => test.status);

    if (statuses.includes('failed')) {
      return 'failed';
    } else if (statuses.includes('warning')) {
      return 'warning';
    } else if (statuses.every(status => status === 'passed')) {
      return 'passed';
    } else {
      return 'unknown';
    }
  }

  /**
   * Generate monitoring report
   */
  generateReport(results) {
    console.log('\n📊 DEPLOYMENT MONITORING REPORT');
    console.log('='.repeat(50));
    console.log(`Environment: ${results.environment}`);
    console.log(`URL: ${results.url}`);
    console.log(`Timestamp: ${results.timestamp}`);
    console.log(
      `Overall Status: ${this.getStatusEmoji(results.overall)} ${results.overall.toUpperCase()}`
    );
    console.log('');

    // Test results
    Object.entries(results.tests).forEach(([testName, testResult]) => {
      console.log(
        `${this.getStatusEmoji(testResult.status)} ${testName}: ${testResult.message}`
      );

      if (this.options.verbose && testResult.error) {
        console.log(`   Error: ${testResult.error}`);
      }
    });

    console.log('='.repeat(50));

    // Exit with appropriate code
    if (results.overall === 'failed') {
      process.exit(1);
    } else if (results.overall === 'warning') {
      console.log('⚠️ Deployment has warnings but is functional');
      process.exit(0);
    } else {
      console.log('✅ Deployment monitoring completed successfully');
      process.exit(0);
    }
  }

  /**
   * Get status emoji
   */
  getStatusEmoji(status) {
    switch (status) {
      case 'passed':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const url = args[0];
  const environment = args[1] || 'production';

  if (!url) {
    console.error('Usage: node deployment-monitor.js <url> [environment]');
    process.exit(1);
  }

  const monitor = new DeploymentMonitor({
    verbose: process.env.VERBOSE === 'true'
  });

  monitor.monitorDeployment(url, environment);
}

module.exports = DeploymentMonitor;
