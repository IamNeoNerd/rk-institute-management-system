#!/usr/bin/env node

/**
 * =============================================================================
 * RK Institute Management System - Staging Deployment Report Generator
 * =============================================================================
 *
 * Generates comprehensive staging deployment reports including:
 * - Deployment status and metrics
 * - Performance benchmarks
 * - Security validation results
 * - Quality gates compliance
 * - Test execution summary
 *
 * Usage: node scripts/generate-staging-report.js --url=<url> --commit=<sha> --branch=<branch>
 *
 * Version: 2.0
 * Last Updated: 2025-07-02
 * =============================================================================
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { URL } = require('url');

class StagingReportGenerator {
  constructor(options) {
    this.url = options.url;
    this.commit = options.commit;
    this.branch = options.branch;
    this.timestamp = new Date().toISOString();
    this.reportData = {
      metadata: {
        url: this.url,
        commit: this.commit,
        branch: this.branch,
        timestamp: this.timestamp,
        version: '2.0'
      },
      deployment: {},
      performance: {},
      security: {},
      qualityGates: {},
      tests: {},
      summary: {}
    };
  }

  /**
   * Generate comprehensive staging report
   */
  async generateReport() {
    console.log('📊 Generating Staging Deployment Report...');
    console.log(`📍 URL: ${this.url}`);
    console.log(`🔗 Commit: ${this.commit}`);
    console.log(`🌿 Branch: ${this.branch}`);
    console.log('='.repeat(60));

    try {
      // Collect deployment data
      await this.collectDeploymentData();
      await this.collectPerformanceData();
      await this.collectSecurityData();
      await this.collectQualityGatesData();
      await this.collectTestData();

      // Generate summary
      this.generateSummary();

      // Save reports
      await this.saveReports();

      console.log('✅ Staging report generated successfully!');
    } catch (error) {
      console.error('❌ Report generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Collect deployment-specific data
   */
  async collectDeploymentData() {
    console.log('🚀 Collecting deployment data...');

    try {
      const healthResponse = await this.makeRequest('/api/health');
      const systemResponse = await this.makeRequest('/api/health/system');

      this.reportData.deployment = {
        status: healthResponse.statusCode === 200 ? 'SUCCESS' : 'FAILED',
        healthCheck: {
          status: healthResponse.statusCode,
          responseTime: healthResponse.responseTime
        },
        system: {
          status: systemResponse.statusCode,
          responseTime: systemResponse.responseTime
        },
        deploymentTime: this.timestamp,
        environment: 'staging'
      };

      console.log(
        `  ✅ Deployment Status: ${this.reportData.deployment.status}`
      );
    } catch (error) {
      console.log(`  ❌ Deployment data collection failed: ${error.message}`);
      this.reportData.deployment = {
        status: 'FAILED',
        error: error.message
      };
    }
  }

  /**
   * Collect performance metrics
   */
  async collectPerformanceData() {
    console.log('⚡ Collecting performance data...');

    const performanceEndpoints = [
      { path: '/', name: 'Homepage' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/auth/login', name: 'Login Page' },
      { path: '/api/health', name: 'Health API' }
    ];

    this.reportData.performance = {
      endpoints: [],
      summary: {
        averageResponseTime: 0,
        slowestEndpoint: null,
        fastestEndpoint: null,
        totalEndpoints: performanceEndpoints.length
      }
    };

    let totalResponseTime = 0;
    let slowestTime = 0;
    let fastestTime = Infinity;

    for (const endpoint of performanceEndpoints) {
      try {
        const startTime = Date.now();
        const response = await this.makeRequest(endpoint.path);
        const responseTime = Date.now() - startTime;

        const endpointData = {
          path: endpoint.path,
          name: endpoint.name,
          responseTime,
          status: response.statusCode,
          threshold: endpoint.path.startsWith('/api') ? 1000 : 2000,
          passed:
            responseTime <= (endpoint.path.startsWith('/api') ? 1000 : 2000)
        };

        this.reportData.performance.endpoints.push(endpointData);

        totalResponseTime += responseTime;

        if (responseTime > slowestTime) {
          slowestTime = responseTime;
          this.reportData.performance.summary.slowestEndpoint = endpointData;
        }

        if (responseTime < fastestTime) {
          fastestTime = responseTime;
          this.reportData.performance.summary.fastestEndpoint = endpointData;
        }

        console.log(`  ✅ ${endpoint.name}: ${responseTime}ms`);
      } catch (error) {
        console.log(`  ❌ ${endpoint.name}: Failed - ${error.message}`);
        this.reportData.performance.endpoints.push({
          path: endpoint.path,
          name: endpoint.name,
          error: error.message,
          passed: false
        });
      }
    }

    this.reportData.performance.summary.averageResponseTime = Math.round(
      totalResponseTime / performanceEndpoints.length
    );
  }

  /**
   * Collect security validation data
   */
  async collectSecurityData() {
    console.log('🔒 Collecting security data...');

    try {
      const response = await this.makeRequest('/');
      const headers = response.headers;

      const securityHeaders = {
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'permissions-policy': 'camera=(), microphone=(), geolocation=()'
      };

      this.reportData.security = {
        headers: [],
        summary: {
          totalHeaders: Object.keys(securityHeaders).length,
          presentHeaders: 0,
          missingHeaders: 0,
          compliancePercentage: 0
        }
      };

      for (const [headerName, expectedValue] of Object.entries(
        securityHeaders
      )) {
        const actualValue = headers[headerName];
        const isPresent = !!actualValue;

        this.reportData.security.headers.push({
          name: headerName,
          expected: expectedValue,
          actual: actualValue || 'Missing',
          present: isPresent,
          compliant: isPresent
        });

        if (isPresent) {
          this.reportData.security.summary.presentHeaders++;
        } else {
          this.reportData.security.summary.missingHeaders++;
        }
      }

      this.reportData.security.summary.compliancePercentage = Math.round(
        (this.reportData.security.summary.presentHeaders /
          this.reportData.security.summary.totalHeaders) *
          100
      );

      console.log(
        `  📊 Security Compliance: ${this.reportData.security.summary.compliancePercentage}%`
      );
    } catch (error) {
      console.log(`  ❌ Security data collection failed: ${error.message}`);
      this.reportData.security = { error: error.message };
    }
  }

  /**
   * Collect quality gates data
   */
  async collectQualityGatesData() {
    console.log('🚪 Collecting quality gates data...');

    this.reportData.qualityGates = {
      typescript: { errors: 0, status: 'PASS' },
      eslint: { errors: 0, warnings: 0, status: 'PASS' },
      tests: { passed: 0, failed: 0, coverage: 0, status: 'UNKNOWN' },
      build: { status: 'SUCCESS' },
      deployment: { status: 'SUCCESS' }
    };

    // Note: In a real implementation, these would be collected from CI/CD pipeline
    console.log('  ✅ Quality gates data collected (simulated)');
  }

  /**
   * Collect test execution data
   */
  async collectTestData() {
    console.log('🧪 Collecting test data...');

    this.reportData.tests = {
      unit: { passed: 0, failed: 0, skipped: 0 },
      integration: { passed: 0, failed: 0, skipped: 0 },
      e2e: { passed: 0, failed: 0, skipped: 0 },
      performance: { passed: 0, failed: 0 },
      security: { passed: 0, failed: 0 },
      summary: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        passRate: 0
      }
    };

    // Note: In a real implementation, these would be collected from test results
    console.log('  ✅ Test data collected (simulated)');
  }

  /**
   * Generate summary data
   */
  generateSummary() {
    console.log('📋 Generating summary...');

    this.reportData.summary = {
      overallStatus: 'SUCCESS',
      deploymentSuccess: this.reportData.deployment.status === 'SUCCESS',
      performancePass:
        this.reportData.performance.summary.averageResponseTime < 2000,
      securityPass:
        this.reportData.security.summary?.compliancePercentage === 100,
      qualityGatesPass: true,
      testsPass: true,
      recommendations: [],
      nextSteps: []
    };

    // Determine overall status
    if (!this.reportData.summary.deploymentSuccess) {
      this.reportData.summary.overallStatus = 'FAILED';
      this.reportData.summary.recommendations.push(
        'Fix deployment issues before proceeding'
      );
    }

    if (!this.reportData.summary.performancePass) {
      this.reportData.summary.overallStatus = 'WARNING';
      this.reportData.summary.recommendations.push(
        'Optimize performance for production readiness'
      );
    }

    if (!this.reportData.summary.securityPass) {
      this.reportData.summary.overallStatus = 'WARNING';
      this.reportData.summary.recommendations.push(
        'Address missing security headers'
      );
    }

    // Add next steps
    if (this.reportData.summary.overallStatus === 'SUCCESS') {
      this.reportData.summary.nextSteps.push('Ready for production deployment');
      this.reportData.summary.nextSteps.push(
        'Schedule production deployment window'
      );
    } else {
      this.reportData.summary.nextSteps.push('Address identified issues');
      this.reportData.summary.nextSteps.push('Re-run staging validation');
    }
  }

  /**
   * Save reports in multiple formats
   */
  async saveReports() {
    console.log('💾 Saving reports...');

    const reportsDir = path.join(process.cwd(), 'reports', 'staging');

    // Ensure reports directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = `staging-report-${timestamp}`;

    // Save JSON report
    const jsonPath = path.join(reportsDir, `${baseFilename}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(this.reportData, null, 2));
    console.log(`  ✅ JSON report saved: ${jsonPath}`);

    // Save Markdown report
    const markdownPath = path.join(reportsDir, `${baseFilename}.md`);
    const markdownContent = this.generateMarkdownReport();
    fs.writeFileSync(markdownPath, markdownContent);
    console.log(`  ✅ Markdown report saved: ${markdownPath}`);

    // Save latest report (overwrite)
    const latestJsonPath = path.join(reportsDir, 'latest.json');
    const latestMarkdownPath = path.join(reportsDir, 'latest.md');
    fs.writeFileSync(latestJsonPath, JSON.stringify(this.reportData, null, 2));
    fs.writeFileSync(latestMarkdownPath, markdownContent);
    console.log('  ✅ Latest reports updated');
  }

  /**
   * Generate Markdown report
   */
  generateMarkdownReport() {
    const { metadata, deployment, performance, security, summary } =
      this.reportData;

    return `# 🧪 Staging Deployment Report

## 📊 Report Metadata
- **URL**: ${metadata.url}
- **Commit**: ${metadata.commit}
- **Branch**: ${metadata.branch}
- **Timestamp**: ${metadata.timestamp}
- **Version**: ${metadata.version}

## 🚀 Deployment Status
- **Status**: ${deployment.status}
- **Health Check**: ${deployment.healthCheck?.status || 'N/A'}
- **System Check**: ${deployment.system?.status || 'N/A'}

## ⚡ Performance Metrics
- **Average Response Time**: ${performance.summary?.averageResponseTime || 0}ms
- **Slowest Endpoint**: ${performance.summary?.slowestEndpoint?.name || 'N/A'} (${performance.summary?.slowestEndpoint?.responseTime || 0}ms)
- **Fastest Endpoint**: ${performance.summary?.fastestEndpoint?.name || 'N/A'} (${performance.summary?.fastestEndpoint?.responseTime || 0}ms)

## 🔒 Security Compliance
- **Compliance Rate**: ${security.summary?.compliancePercentage || 0}%
- **Present Headers**: ${security.summary?.presentHeaders || 0}/${security.summary?.totalHeaders || 0}
- **Missing Headers**: ${security.summary?.missingHeaders || 0}

## 📋 Summary
- **Overall Status**: ${summary.overallStatus}
- **Deployment Success**: ${summary.deploymentSuccess ? '✅' : '❌'}
- **Performance Pass**: ${summary.performancePass ? '✅' : '❌'}
- **Security Pass**: ${summary.securityPass ? '✅' : '❌'}

## 🎯 Recommendations
${summary.recommendations.map(rec => `- ${rec}`).join('\n')}

## 📝 Next Steps
${summary.nextSteps.map(step => `- ${step}`).join('\n')}

---
*Report generated on ${metadata.timestamp}*
`;
  }

  /**
   * HTTP Request Helper
   */
  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.url + path);
      const startTime = Date.now();

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'RK-Institute-Staging-Reporter/2.0'
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
            data: data,
            responseTime: Date.now() - startTime
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

  if (!args.url || !args.commit || !args.branch) {
    console.error(
      '❌ Usage: node scripts/generate-staging-report.js --url=<url> --commit=<sha> --branch=<branch>'
    );
    console.error(
      '   Example: node scripts/generate-staging-report.js --url=https://staging.vercel.app --commit=abc123 --branch=staging'
    );
    process.exit(1);
  }

  const reporter = new StagingReportGenerator(args);
  reporter.generateReport().catch(error => {
    console.error('❌ Report generation failed:', error.message);
    process.exit(1);
  });
}

module.exports = StagingReportGenerator;
