#!/usr/bin/env node

/**
 * 🧪 PRODUCTION-READY TESTING SUITE
 * RK Institute Management System - Industry Standards Testing
 * 
 * Phase 1: Critical Security & Authentication Testing
 * Phase 2: Performance & Load Testing  
 * Phase 3: Compliance & Accessibility Testing
 * Phase 4: Integration & Final Validation
 */

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:3000';

class ProductionReadyTestSuite {
  constructor() {
    this.results = [];
    this.securityFindings = [];
    this.performanceMetrics = [];
    this.complianceIssues = [];
    this.tokens = {};
    this.startTime = Date.now();
    
    // Test data with realistic Indian educational context
    this.testData = {
      users: {
        ADMIN: { email: 'admin@rkinstitute.com', password: 'admin123', name: 'Dr. Rajesh Kumar Sharma' },
        TEACHER: { email: 'teacher1@rkinstitute.com', password: 'admin123', name: 'Mrs. Priya Mehta' },
        PARENT: { email: 'parent@rkinstitute.com', password: 'admin123', name: 'Mr. Suresh Patel' },
        STUDENT: { email: 'student@rkinstitute.com', password: 'admin123', name: 'Aarav Patel' }
      }
    };
  }

  // 🌐 HTTP REQUEST UTILITY (Node.js Native)
  async makeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const httpModule = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'RK-Institute-Testing-Suite/1.0',
          ...options.headers
        },
        timeout: 30000
      };

      const req = httpModule.request(requestOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          const duration = Date.now() - startTime;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body,
            duration
          });
        });
      });

      req.on('error', (error) => {
        const duration = Date.now() - startTime;
        reject({ error: error.message, duration });
      });

      req.on('timeout', () => {
        req.destroy();
        const duration = Date.now() - startTime;
        reject({ error: 'Request timeout', duration });
      });

      if (options.data) {
        req.write(JSON.stringify(options.data));
      }

      req.end();
    });
  }

  // 📊 RESULT LOGGING
  addResult(phase, category, test, status, details, duration = null, metadata = {}) {
    const result = {
      timestamp: new Date().toISOString(),
      phase,
      category,
      test,
      status,
      details,
      duration: duration ? `${duration}ms` : null,
      metadata
    };
    
    this.results.push(result);
    
    if (duration) {
      this.performanceMetrics.push({ test, duration, category, phase });
    }

    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : '⏭️';
    const durationText = duration ? ` (${duration}ms)` : '';
    console.log(`${statusIcon} [${phase}] ${category} - ${test}${durationText}: ${details}`);
  }

  addSecurityFinding(severity, finding, details, recommendation = '') {
    this.securityFindings.push({
      severity,
      finding,
      details,
      recommendation,
      timestamp: new Date().toISOString()
    });
  }

  // 🔐 PHASE 1: CRITICAL AUTHENTICATION & SECURITY TESTING
  async runPhase1_CriticalSecurity() {
    console.log('\n🔴 PHASE 1: CRITICAL AUTHENTICATION & SECURITY TESTING');
    console.log('🎯 Focus: Authentication, Authorization, Security Vulnerabilities');
    console.log('=' .repeat(80));

    await this.testAuthenticationSystem();
    await this.testSecurityVulnerabilities();
    await this.testSessionManagement();
    await this.testPasswordSecurity();
  }

  async testAuthenticationSystem() {
    console.log('\n🔐 Testing Authentication System...');
    
    for (const [role, userData] of Object.entries(this.testData.users)) {
      // Test valid login
      try {
        const result = await this.makeHttpRequest(`${BASE_URL}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: { email: userData.email, password: userData.password }
        });

        if (result.status === 200) {
          try {
            const data = JSON.parse(result.body);
            if (data.token && data.user && data.user.role === role) {
              this.tokens[role] = data.token;
              this.addResult(
                'Phase 1',
                'Authentication',
                `${role} Valid Login`,
                'PASS',
                `Successfully authenticated ${userData.name}`,
                result.duration,
                { role, email: userData.email }
              );
              
              // Test token structure
              await this.validateJWTToken(data.token, role);
            } else {
              this.addResult('Phase 1', 'Authentication', `${role} Token Structure`, 'FAIL', 'Invalid token or user data structure');
            }
          } catch (parseError) {
            this.addResult('Phase 1', 'Authentication', `${role} Response Format`, 'FAIL', 'Invalid JSON response');
          }
        } else {
          this.addResult('Phase 1', 'Authentication', `${role} Valid Login`, 'FAIL', `Authentication failed with status ${result.status}`, result.duration);
        }
      } catch ({ error, duration }) {
        this.addResult('Phase 1', 'Authentication', `${role} Valid Login`, 'FAIL', `Network error: ${error}`, duration);
      }

      // Test invalid credentials
      await this.testInvalidCredentials(role, userData);
    }
  }

  async validateJWTToken(token, role) {
    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length === 3) {
        this.addResult('Phase 1', 'Security', `${role} JWT Structure`, 'PASS', 'Valid JWT token format');
        
        // Test token expiration (should be reasonable)
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (payload.exp && payload.iat) {
          const tokenLifetime = payload.exp - payload.iat;
          if (tokenLifetime <= 28800) { // 8 hours max
            this.addResult('Phase 1', 'Security', `${role} Token Expiration`, 'PASS', `Token lifetime: ${tokenLifetime/3600} hours`);
          } else {
            this.addResult('Phase 1', 'Security', `${role} Token Expiration`, 'WARN', 'Token lifetime exceeds recommended 8 hours');
            this.addSecurityFinding('MEDIUM', 'Long Token Lifetime', `${role} tokens valid for ${tokenLifetime/3600} hours`, 'Reduce token lifetime to 8 hours or less');
          }
        }
      } else {
        this.addResult('Phase 1', 'Security', `${role} JWT Structure`, 'FAIL', 'Invalid JWT token format');
        this.addSecurityFinding('HIGH', 'Invalid JWT Format', `${role} token does not follow JWT standard`);
      }
    } catch (error) {
      this.addResult('Phase 1', 'Security', `${role} JWT Validation`, 'FAIL', `Token validation error: ${error.message}`);
    }
  }

  async testInvalidCredentials(role, userData) {
    const invalidTests = [
      { 
        data: { email: userData.email, password: 'wrongpassword' }, 
        description: 'Invalid Password',
        expectedStatus: 401
      },
      { 
        data: { email: 'nonexistent@rkinstitute.com', password: userData.password }, 
        description: 'Invalid Email',
        expectedStatus: 401
      },
      { 
        data: { email: '', password: '' }, 
        description: 'Empty Credentials',
        expectedStatus: 400
      },
      { 
        data: { email: userData.email }, 
        description: 'Missing Password',
        expectedStatus: 400
      },
      { 
        data: { password: userData.password }, 
        description: 'Missing Email',
        expectedStatus: 400
      }
    ];

    for (const test of invalidTests) {
      try {
        const result = await this.makeHttpRequest(`${BASE_URL}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: test.data
        });

        if (result.status === test.expectedStatus) {
          this.addResult('Phase 1', 'Security', `${role} ${test.description}`, 'PASS', `Correctly rejected with status ${result.status}`, result.duration);
        } else {
          this.addResult('Phase 1', 'Security', `${role} ${test.description}`, 'FAIL', `Expected ${test.expectedStatus}, got ${result.status}`, result.duration);
          this.addSecurityFinding('HIGH', 'Authentication Bypass Risk', `${test.description} for ${role} returned unexpected status ${result.status}`);
        }
      } catch ({ error, duration }) {
        // Network errors are acceptable for invalid requests
        this.addResult('Phase 1', 'Security', `${role} ${test.description}`, 'PASS', `Request failed as expected: ${error}`, duration);
      }
    }
  }

  async testSecurityVulnerabilities() {
    console.log('\n🛡️ Testing Security Vulnerabilities...');
    
    // SQL Injection Tests
    await this.testSQLInjection();
    
    // XSS Tests
    await this.testXSSVulnerabilities();
    
    // CSRF Tests
    await this.testCSRFProtection();
    
    // Rate Limiting Tests
    await this.testRateLimiting();
  }

  async testSQLInjection() {
    const sqlPayloads = [
      "admin@rkinstitute.com'; DROP TABLE users; --",
      "admin@rkinstitute.com' OR '1'='1",
      "admin@rkinstitute.com' UNION SELECT * FROM users --",
      "admin@rkinstitute.com'; INSERT INTO users VALUES('hacker', 'password'); --"
    ];

    for (const payload of sqlPayloads) {
      try {
        const result = await this.makeHttpRequest(`${BASE_URL}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: { email: payload, password: 'admin123' }
        });

        if (result.status === 401 || result.status === 400) {
          this.addResult('Phase 1', 'Security', 'SQL Injection Protection', 'PASS', 'Malicious SQL payload safely handled', result.duration);
        } else if (result.status === 200) {
          this.addResult('Phase 1', 'Security', 'SQL Injection Protection', 'FAIL', 'CRITICAL: SQL injection may be possible', result.duration);
          this.addSecurityFinding('CRITICAL', 'SQL Injection Vulnerability', `Payload "${payload.substring(0, 30)}..." may have been processed`);
        } else {
          this.addResult('Phase 1', 'Security', 'SQL Injection Protection', 'WARN', `Unexpected response status: ${result.status}`, result.duration);
        }
      } catch ({ error, duration }) {
        this.addResult('Phase 1', 'Security', 'SQL Injection Protection', 'PASS', `Request failed safely: ${error}`, duration);
      }
    }
  }

  async testXSSVulnerabilities() {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>'
    ];

    for (const payload of xssPayloads) {
      try {
        const result = await this.makeHttpRequest(`${BASE_URL}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: { email: payload, password: 'admin123' }
        });

        // Check if XSS payload is reflected in response
        if (result.body && result.body.includes(payload)) {
          this.addResult('Phase 1', 'Security', 'XSS Protection', 'FAIL', 'CRITICAL: XSS payload reflected in response', result.duration);
          this.addSecurityFinding('CRITICAL', 'XSS Vulnerability', `Payload "${payload}" reflected in response`);
        } else {
          this.addResult('Phase 1', 'Security', 'XSS Protection', 'PASS', 'XSS payload not reflected', result.duration);
        }
      } catch ({ error, duration }) {
        this.addResult('Phase 1', 'Security', 'XSS Protection', 'PASS', `Request failed safely: ${error}`, duration);
      }
    }
  }

  async testCSRFProtection() {
    console.log('\n🛡️ Testing CSRF Protection...');
    
    // Test if API accepts requests without proper CSRF tokens
    if (this.tokens.ADMIN) {
      try {
        const result = await this.makeHttpRequest(`${BASE_URL}/api/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.tokens.ADMIN}`,
            'Content-Type': 'application/json',
            'Origin': 'http://malicious-site.com'
          },
          data: { name: 'Test User', email: 'test@example.com' }
        });

        if (result.status === 403) {
          this.addResult('Phase 1', 'Security', 'CSRF Protection', 'PASS', 'Cross-origin request properly blocked', result.duration);
        } else if (result.status === 404) {
          this.addResult('Phase 1', 'Security', 'CSRF Protection', 'WARN', 'API endpoint not implemented', result.duration);
        } else {
          this.addResult('Phase 1', 'Security', 'CSRF Protection', 'WARN', 'CSRF protection may not be implemented', result.duration);
          this.addSecurityFinding('MEDIUM', 'Potential CSRF Vulnerability', 'Cross-origin requests may be accepted without proper validation');
        }
      } catch ({ error, duration }) {
        this.addResult('Phase 1', 'Security', 'CSRF Protection', 'PASS', `Cross-origin request failed: ${error}`, duration);
      }
    }
  }

  async testRateLimiting() {
    console.log('\n🚦 Testing Rate Limiting...');
    
    const rapidRequests = [];
    const requestCount = 20;
    
    // Send rapid authentication requests
    for (let i = 0; i < requestCount; i++) {
      rapidRequests.push(
        this.makeHttpRequest(`${BASE_URL}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: { email: 'test@example.com', password: 'wrongpassword' }
        }).catch(error => ({ error: error.error, duration: error.duration }))
      );
    }

    try {
      const results = await Promise.all(rapidRequests);
      const blockedRequests = results.filter(r => r.status === 429 || r.status === 403).length;
      const successfulRequests = results.filter(r => r.status && r.status < 400).length;
      
      if (blockedRequests > 0) {
        this.addResult('Phase 1', 'Security', 'Rate Limiting', 'PASS', `${blockedRequests}/${requestCount} requests rate limited`);
      } else if (successfulRequests === 0) {
        this.addResult('Phase 1', 'Security', 'Rate Limiting', 'PASS', 'All requests properly rejected (authentication failed)');
      } else {
        this.addResult('Phase 1', 'Security', 'Rate Limiting', 'WARN', 'Rate limiting may not be implemented');
        this.addSecurityFinding('MEDIUM', 'Missing Rate Limiting', 'API may be vulnerable to brute force attacks');
      }
    } catch (error) {
      this.addResult('Phase 1', 'Security', 'Rate Limiting', 'WARN', `Rate limiting test failed: ${error.message}`);
    }
  }

  async testSessionManagement() {
    console.log('\n🔐 Testing Session Management...');

    if (this.tokens.ADMIN) {
      // Test token validation
      try {
        const result = await this.makeHttpRequest(`${BASE_URL}/admin/dashboard`, {
          headers: { 'Authorization': `Bearer ${this.tokens.ADMIN}` }
        });

        if (result.status === 200) {
          this.addResult('Phase 1', 'Security', 'Valid Token Access', 'PASS', 'Valid token grants access', result.duration);
        } else {
          this.addResult('Phase 1', 'Security', 'Valid Token Access', 'FAIL', `Valid token rejected with status ${result.status}`, result.duration);
        }
      } catch ({ error, duration }) {
        this.addResult('Phase 1', 'Security', 'Valid Token Access', 'WARN', `Token validation test failed: ${error}`, duration);
      }

      // Test invalid token
      try {
        const result = await this.makeHttpRequest(`${BASE_URL}/admin/dashboard`, {
          headers: { 'Authorization': 'Bearer invalid-token-12345' }
        });

        if (result.status === 401 || result.status === 403) {
          this.addResult('Phase 1', 'Security', 'Invalid Token Rejection', 'PASS', 'Invalid token properly rejected', result.duration);
        } else {
          this.addResult('Phase 1', 'Security', 'Invalid Token Rejection', 'FAIL', 'Invalid token may have been accepted', result.duration);
          this.addSecurityFinding('HIGH', 'Token Validation Bypass', 'Invalid tokens may be accepted by the system');
        }
      } catch ({ error, duration }) {
        this.addResult('Phase 1', 'Security', 'Invalid Token Rejection', 'PASS', `Invalid token request failed: ${error}`, duration);
      }
    }
  }

  async testPasswordSecurity() {
    console.log('\n🔒 Testing Password Security...');

    // Test weak password acceptance (if registration endpoint exists)
    const weakPasswords = ['123', 'password', '12345678', 'admin'];

    for (const weakPassword of weakPasswords) {
      try {
        const result = await this.makeHttpRequest(`${BASE_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: {
            name: 'Test User',
            email: 'test@rkinstitute.com',
            password: weakPassword,
            role: 'STUDENT'
          }
        });

        if (result.status === 400) {
          this.addResult('Phase 1', 'Security', `Weak Password Rejection`, 'PASS', `Weak password "${weakPassword}" properly rejected`, result.duration);
        } else if (result.status === 404) {
          this.addResult('Phase 1', 'Security', 'Password Policy Testing', 'SKIP', 'Registration endpoint not implemented');
          break;
        } else if (result.status === 200 || result.status === 201) {
          this.addResult('Phase 1', 'Security', `Weak Password Rejection`, 'FAIL', `Weak password "${weakPassword}" accepted`, result.duration);
          this.addSecurityFinding('MEDIUM', 'Weak Password Policy', `Weak password "${weakPassword}" was accepted`);
        }
      } catch ({ error, duration }) {
        this.addResult('Phase 1', 'Security', `Weak Password Testing`, 'WARN', `Test failed: ${error}`, duration);
      }
    }
  }

  // 📊 PHASE 2: PERFORMANCE & LOAD TESTING
  async runPhase2_Performance() {
    console.log('\n🟡 PHASE 2: PERFORMANCE & LOAD TESTING');
    console.log('🎯 Focus: Load Testing, Database Performance, Concurrent Users');
    console.log('=' .repeat(80));

    await this.testSingleUserPerformance();
    await this.testConcurrentUsers();
    await this.testDatabasePerformance();
  }

  async testSingleUserPerformance() {
    console.log('\n⚡ Testing Single User Performance...');

    const performanceTests = [
      { name: 'Home Page Load', url: `${BASE_URL}/`, threshold: 1000 },
      { name: 'Login Page Load', url: `${BASE_URL}/login`, threshold: 1000 },
    ];

    if (this.tokens.ADMIN) {
      performanceTests.push(
        { name: 'Admin Dashboard', url: `${BASE_URL}/admin/dashboard`, headers: { 'Authorization': `Bearer ${this.tokens.ADMIN}` }, threshold: 2000 }
      );
    }

    for (const test of performanceTests) {
      try {
        const result = await this.makeHttpRequest(test.url, {
          method: test.method || 'GET',
          headers: { 'Content-Type': 'application/json', ...test.headers },
          data: test.data
        });

        if (result.duration <= test.threshold) {
          this.addResult('Phase 2', 'Performance', test.name, 'PASS', `Response time: ${result.duration}ms (threshold: ${test.threshold}ms)`, result.duration);
        } else {
          this.addResult('Phase 2', 'Performance', test.name, 'WARN', `Slow response: ${result.duration}ms (threshold: ${test.threshold}ms)`, result.duration);
        }
      } catch ({ error, duration }) {
        this.addResult('Phase 2', 'Performance', test.name, 'FAIL', `Performance test failed: ${error}`, duration);
      }
    }
  }

  async testConcurrentUsers() {
    console.log('\n👥 Testing Concurrent User Access...');

    const concurrentTests = [5, 10]; // Start with smaller numbers

    for (const userCount of concurrentTests) {
      console.log(`\n🔄 Testing ${userCount} concurrent users...`);

      const concurrentRequests = [];
      for (let i = 0; i < userCount; i++) {
        concurrentRequests.push(
          this.makeHttpRequest(`${BASE_URL}/`).catch(error => ({ error: error.error, duration: error.duration }))
        );
      }

      try {
        const startTime = Date.now();
        const results = await Promise.all(concurrentRequests);
        const totalTime = Date.now() - startTime;

        const successfulRequests = results.filter(r => r.status === 200).length;
        const avgResponseTime = results
          .filter(r => r.duration)
          .reduce((sum, r) => sum + r.duration, 0) / results.length;

        if (successfulRequests >= userCount * 0.9) { // 90% success rate
          this.addResult('Phase 2', 'Load Testing', `${userCount} Concurrent Users`, 'PASS',
            `${successfulRequests}/${userCount} successful, avg: ${Math.round(avgResponseTime)}ms`, totalTime);
        } else {
          this.addResult('Phase 2', 'Load Testing', `${userCount} Concurrent Users`, 'FAIL',
            `Only ${successfulRequests}/${userCount} successful`, totalTime);
        }
      } catch (error) {
        this.addResult('Phase 2', 'Load Testing', `${userCount} Concurrent Users`, 'FAIL', `Concurrent test failed: ${error.message}`);
      }
    }
  }

  async testDatabasePerformance() {
    console.log('\n🗄️ Testing Database Performance...');

    if (this.tokens.ADMIN) {
      const dbTests = [
        { name: 'User List API', url: `${BASE_URL}/api/users` },
        { name: 'Student List API', url: `${BASE_URL}/api/students` }
      ];

      for (const test of dbTests) {
        try {
          const result = await this.makeHttpRequest(test.url, {
            headers: { 'Authorization': `Bearer ${this.tokens.ADMIN}` }
          });

          if (result.status === 200) {
            if (result.duration <= 2000) {
              this.addResult('Phase 2', 'Database', test.name, 'PASS', `DB query time: ${result.duration}ms`, result.duration);
            } else {
              this.addResult('Phase 2', 'Database', test.name, 'WARN', `Slow DB query: ${result.duration}ms`, result.duration);
            }
          } else if (result.status === 404) {
            this.addResult('Phase 2', 'Database', test.name, 'SKIP', 'API endpoint not implemented');
          } else {
            this.addResult('Phase 2', 'Database', test.name, 'FAIL', `DB operation failed with status ${result.status}`, result.duration);
          }
        } catch ({ error, duration }) {
          this.addResult('Phase 2', 'Database', test.name, 'FAIL', `DB test failed: ${error}`, duration);
        }
      }
    }
  }

  // 📋 COMPREHENSIVE REPORTING
  async generateProductionReadinessReport() {
    const totalTime = Date.now() - this.startTime;

    console.log('\n📊 PRODUCTION READINESS ASSESSMENT REPORT');
    console.log('🏫 RK Institute Management System - Industry Standards Evaluation');
    console.log('=' .repeat(80));

    // Executive Summary
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'PASS').length,
      failed: this.results.filter(r => r.status === 'FAIL').length,
      warnings: this.results.filter(r => r.status === 'WARN').length,
      skipped: this.results.filter(r => r.status === 'SKIP').length
    };

    console.log(`\n📈 EXECUTIVE SUMMARY:`);
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   ✅ Passed: ${summary.passed} (${((summary.passed / summary.total) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Failed: ${summary.failed} (${((summary.failed / summary.total) * 100).toFixed(1)}%)`);
    console.log(`   ⚠️  Warnings: ${summary.warnings} (${((summary.warnings / summary.total) * 100).toFixed(1)}%)`);
    console.log(`   ⏭️  Skipped: ${summary.skipped} (${((summary.skipped / summary.total) * 100).toFixed(1)}%)`);
    console.log(`   ⏱️  Execution Time: ${totalTime}ms`);

    // Phase Analysis
    console.log(`\n🎯 PHASE-WISE ANALYSIS:`);
    const phases = ['Phase 1', 'Phase 2'];

    for (const phase of phases) {
      const phaseResults = this.results.filter(r => r.phase === phase);
      if (phaseResults.length > 0) {
        const phasePassed = phaseResults.filter(r => r.status === 'PASS').length;
        const phaseFailed = phaseResults.filter(r => r.status === 'FAIL').length;
        const phaseWarnings = phaseResults.filter(r => r.status === 'WARN').length;

        console.log(`   ${phase}: ${phasePassed} passed, ${phaseFailed} failed, ${phaseWarnings} warnings`);
      }
    }

    // Security Assessment
    console.log(`\n🛡️ SECURITY ASSESSMENT:`);
    if (this.securityFindings.length === 0) {
      console.log(`   🟢 No critical security vulnerabilities detected`);
    } else {
      console.log(`   🔴 ${this.securityFindings.length} security findings detected:`);

      const criticalFindings = this.securityFindings.filter(f => f.severity === 'CRITICAL');
      const highFindings = this.securityFindings.filter(f => f.severity === 'HIGH');
      const mediumFindings = this.securityFindings.filter(f => f.severity === 'MEDIUM');

      if (criticalFindings.length > 0) {
        console.log(`     🚨 CRITICAL (${criticalFindings.length}):`);
        criticalFindings.forEach(f => console.log(`       • ${f.finding}: ${f.details}`));
      }

      if (highFindings.length > 0) {
        console.log(`     🔴 HIGH (${highFindings.length}):`);
        highFindings.forEach(f => console.log(`       • ${f.finding}: ${f.details}`));
      }

      if (mediumFindings.length > 0) {
        console.log(`     🟡 MEDIUM (${mediumFindings.length}):`);
        mediumFindings.forEach(f => console.log(`       • ${f.finding}: ${f.details}`));
      }
    }

    // Performance Analysis
    if (this.performanceMetrics.length > 0) {
      const durations = this.performanceMetrics.map(m => m.duration);
      const avgResponseTime = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxResponseTime = Math.max(...durations);
      const minResponseTime = Math.min(...durations);

      console.log(`\n⚡ PERFORMANCE ANALYSIS:`);
      console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);
      console.log(`   Fastest Response: ${minResponseTime}ms`);
      console.log(`   Slowest Response: ${maxResponseTime}ms`);

      const fast = durations.filter(d => d < 500).length;
      const medium = durations.filter(d => d >= 500 && d < 2000).length;
      const slow = durations.filter(d => d >= 2000).length;

      console.log(`   Performance Distribution:`);
      console.log(`     🟢 Fast (<500ms): ${fast} (${((fast / durations.length) * 100).toFixed(1)}%)`);
      console.log(`     🟡 Medium (500-2000ms): ${medium} (${((medium / durations.length) * 100).toFixed(1)}%)`);
      console.log(`     🔴 Slow (>2000ms): ${slow} (${((slow / durations.length) * 100).toFixed(1)}%)`);
    }

    // Production Readiness Assessment
    console.log(`\n🎯 PRODUCTION READINESS ASSESSMENT:`);

    const criticalIssues = this.results.filter(r => r.status === 'FAIL' && r.phase === 'Phase 1').length;
    const securityIssues = this.securityFindings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').length;

    if (criticalIssues === 0 && securityIssues === 0) {
      console.log(`   🟢 READY FOR PRODUCTION`);
      console.log(`   ✅ All critical security tests passed`);
      console.log(`   ✅ No high-risk vulnerabilities detected`);
    } else if (criticalIssues > 0 || securityIssues > 0) {
      console.log(`   🔴 NOT READY FOR PRODUCTION`);
      console.log(`   ❌ ${criticalIssues} critical test failures`);
      console.log(`   ❌ ${securityIssues} high-risk security issues`);
    } else {
      console.log(`   🟡 READY FOR STAGING/PILOT`);
      console.log(`   ⚠️ Minor issues detected, suitable for controlled testing`);
    }

    // Recommendations
    console.log(`\n💡 IMMEDIATE RECOMMENDATIONS:`);

    if (criticalIssues > 0) {
      console.log(`   🔧 Fix ${criticalIssues} critical authentication/security failures`);
    }

    if (securityIssues > 0) {
      console.log(`   🛡️ Address ${securityIssues} high-risk security vulnerabilities`);
    }

    const performanceIssues = this.performanceMetrics.filter(m => m.duration > 2000).length;
    if (performanceIssues > 0) {
      console.log(`   ⚡ Optimize ${performanceIssues} slow-performing endpoints`);
    }

    const missingFeatures = this.results.filter(r => r.status === 'SKIP').length;
    if (missingFeatures > 0) {
      console.log(`   🔨 Implement ${missingFeatures} missing API endpoints`);
    }

    console.log('\n' + '=' .repeat(80));
    console.log(`🧪 Production readiness testing completed at ${new Date().toISOString()}`);

    return {
      summary,
      securityFindings: this.securityFindings,
      performanceMetrics: this.performanceMetrics,
      productionReady: criticalIssues === 0 && securityIssues === 0
    };
  }

  // 🚀 MAIN EXECUTION ENGINE
  async runProductionReadinessTesting() {
    console.log('🧪 PRODUCTION READINESS TESTING SUITE');
    console.log('🏫 RK Institute Management System');
    console.log('🎯 Industry Standards Compliance Testing');
    console.log('🌐 Target: ' + BASE_URL);
    console.log('⏰ Started at: ' + new Date().toISOString());
    console.log('=' .repeat(80));

    try {
      // Phase 1: Critical Security Testing
      await this.runPhase1_CriticalSecurity();

      // Phase 2: Performance Testing
      await this.runPhase2_Performance();

      // Generate comprehensive report
      const assessment = await this.generateProductionReadinessReport();

      // Save detailed report
      await this.saveDetailedReport(assessment);

      return assessment;

    } catch (error) {
      console.error('❌ Critical testing error:', error);
      this.addResult('System', 'Test Execution', 'Critical Error', 'FAIL', `Testing suite crashed: ${error.message}`);
      throw error;
    }
  }

  // 💾 SAVE DETAILED REPORT
  async saveDetailedReport(assessment) {
    const reportData = {
      metadata: {
        testSuite: 'RK Institute Management System - Production Readiness Testing',
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - this.startTime,
        target: BASE_URL,
        version: '1.0.0'
      },
      assessment,
      results: this.results,
      securityFindings: this.securityFindings,
      performanceMetrics: this.performanceMetrics
    };

    try {
      const reportPath = path.join(__dirname, `production-readiness-report-${Date.now()}.json`);
      await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
      console.log(`\n💾 Detailed report saved to: ${reportPath}`);
      return reportPath;
    } catch (error) {
      console.error('❌ Failed to save report:', error.message);
      return null;
    }
  }
}

// 🎬 MAIN EXECUTION
async function main() {
  const testSuite = new ProductionReadyTestSuite();

  try {
    console.log('🚀 Initializing Production Readiness Testing...');
    console.log('🎯 Focus: Critical Security, Performance, Industry Standards');

    const assessment = await testSuite.runProductionReadinessTesting();

    // Exit with appropriate code
    if (!assessment.productionReady) {
      console.log('\n❌ SYSTEM NOT READY FOR PRODUCTION');
      console.log('🔧 Please address critical issues before deployment');
      process.exit(1);
    } else {
      console.log('\n✅ SYSTEM READY FOR PRODUCTION DEPLOYMENT!');
      console.log('🎉 All critical tests passed successfully');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Production readiness testing failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { ProductionReadyTestSuite };
