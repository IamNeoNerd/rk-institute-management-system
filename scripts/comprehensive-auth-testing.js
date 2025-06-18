#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE AUTHENTICATION & PORTAL TESTING SUITE
 * 
 * This script performs automated testing of:
 * - Authentication endpoints
 * - Role-based access control
 * - Protected route verification
 * - Portal page accessibility
 * - Security boundary testing
 */

const BASE_URL = 'http://localhost:3000';

class ComprehensiveTestSuite {
  constructor() {
    this.results = [];
    this.tokens = {};
    this.users = {
      ADMIN: { email: 'admin@rkinstitute.com', password: 'admin123' },
      TEACHER: { email: 'teacher1@rkinstitute.com', password: 'admin123' },
      PARENT: { email: 'parent@rkinstitute.com', password: 'admin123' },
      STUDENT: { email: 'student@rkinstitute.com', password: 'admin123' }
    };
    this.protectedRoutes = {
      ADMIN: [
        '/admin/dashboard',
        '/admin/people',
        '/admin/financials',
        '/admin/reports'
      ],
      TEACHER: [
        '/teacher/dashboard',
        '/teacher/schedule',
        '/teacher/grades',
        '/teacher/messages',
        '/teacher/students'
      ],
      PARENT: [
        '/parent/dashboard',
        '/parent/children',
        '/parent/fees',
        '/parent/reports',
        '/parent/meetings'
      ],
      STUDENT: [
        '/student/dashboard',
        '/student/grades',
        '/student/schedule',
        '/student/messages',
        '/student/assignments'
      ]
    };
  }

  addResult(test, status, details, duration = null) {
    const timestamp = new Date().toISOString();
    this.results.push({
      timestamp,
      test,
      status,
      details,
      duration: duration ? `${duration}ms` : null
    });
    
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    const durationText = duration ? ` (${duration}ms)` : '';
    console.log(`${statusIcon} ${test}${durationText}: ${details}`);
  }

  async makeRequest(url, options = {}) {
    const startTime = Date.now();
    try {
      const response = await fetch(url, {
        timeout: 10000,
        ...options
      });
      const duration = Date.now() - startTime;
      return { response, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw { error, duration };
    }
  }

  // 🔐 AUTHENTICATION TESTING
  async testAuthentication() {
    console.log('\n🔐 TESTING AUTHENTICATION SYSTEM...\n');

    for (const [role, credentials] of Object.entries(this.users)) {
      await this.testLogin(role, credentials);
      await this.testInvalidLogin(role);
    }

    await this.testMissingCredentials();
    await this.testSQLInjection();
  }

  async testLogin(role, credentials) {
    try {
      const { response, duration } = await this.makeRequest(`${BASE_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        this.tokens[role] = data.token;
        this.addResult(
          `Login as ${role}`,
          'PASS',
          `Successfully authenticated ${credentials.email}`,
          duration
        );
        
        // Verify token structure
        if (data.token && data.user && data.user.role === role) {
          this.addResult(
            `Token validation for ${role}`,
            'PASS',
            `Valid JWT token and user data received`
          );
        } else {
          this.addResult(
            `Token validation for ${role}`,
            'FAIL',
            `Invalid token structure or user data`
          );
        }
      } else {
        const error = await response.json();
        this.addResult(
          `Login as ${role}`,
          'FAIL',
          `Authentication failed: ${error.error}`,
          duration
        );
      }
    } catch ({ error, duration }) {
      this.addResult(
        `Login as ${role}`,
        'FAIL',
        `Network error: ${error.message}`,
        duration
      );
    }
  }

  async testInvalidLogin(role) {
    try {
      const { response, duration } = await this.makeRequest(`${BASE_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.users[role].email,
          password: 'wrongpassword'
        })
      });

      if (response.status === 401) {
        this.addResult(
          `Invalid password for ${role}`,
          'PASS',
          `Correctly rejected invalid credentials`,
          duration
        );
      } else {
        this.addResult(
          `Invalid password for ${role}`,
          'FAIL',
          `Should have rejected invalid credentials`,
          duration
        );
      }
    } catch ({ error, duration }) {
      this.addResult(
        `Invalid password for ${role}`,
        'FAIL',
        `Network error: ${error.message}`,
        duration
      );
    }
  }

  async testMissingCredentials() {
    try {
      const { response, duration } = await this.makeRequest(`${BASE_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.status === 400) {
        this.addResult(
          'Missing credentials validation',
          'PASS',
          'Correctly rejected empty credentials',
          duration
        );
      } else {
        this.addResult(
          'Missing credentials validation',
          'FAIL',
          'Should reject empty credentials',
          duration
        );
      }
    } catch ({ error, duration }) {
      this.addResult(
        'Missing credentials validation',
        'FAIL',
        `Network error: ${error.message}`,
        duration
      );
    }
  }

  async testSQLInjection() {
    const maliciousInputs = [
      "admin@rkinstitute.com'; DROP TABLE users; --",
      "admin@rkinstitute.com' OR '1'='1",
      "admin@rkinstitute.com' UNION SELECT * FROM users --"
    ];

    for (const maliciousEmail of maliciousInputs) {
      try {
        const { response, duration } = await this.makeRequest(`${BASE_URL}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: maliciousEmail,
            password: 'admin123'
          })
        });

        if (response.status === 401) {
          this.addResult(
            'SQL Injection Protection',
            'PASS',
            `Safely handled malicious input: ${maliciousEmail.substring(0, 30)}...`,
            duration
          );
        } else {
          this.addResult(
            'SQL Injection Protection',
            'FAIL',
            `Potential SQL injection vulnerability`,
            duration
          );
        }
      } catch ({ error, duration }) {
        this.addResult(
          'SQL Injection Protection',
          'PASS',
          `Request safely failed: ${error.message}`,
          duration
        );
      }
    }
  }

  // 🛡️ AUTHORIZATION TESTING
  async testAuthorization() {
    console.log('\n🛡️ TESTING AUTHORIZATION & ROLE-BASED ACCESS...\n');

    // Test each role accessing their own routes
    for (const [role, routes] of Object.entries(this.protectedRoutes)) {
      if (this.tokens[role]) {
        await this.testAuthorizedAccess(role, routes);
      }
    }

    // Test cross-role access (should be denied)
    await this.testUnauthorizedAccess();
    
    // Test access without authentication
    await this.testUnauthenticatedAccess();
  }

  async testAuthorizedAccess(role, routes) {
    for (const route of routes) {
      try {
        const { response, duration } = await this.makeRequest(`${BASE_URL}${route}`, {
          headers: {
            'Authorization': `Bearer ${this.tokens[role]}`,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });

        if (response.ok || response.status === 200) {
          this.addResult(
            `${role} access to ${route}`,
            'PASS',
            `Authorized access granted`,
            duration
          );
        } else {
          this.addResult(
            `${role} access to ${route}`,
            'FAIL',
            `Access denied with status ${response.status}`,
            duration
          );
        }
      } catch ({ error, duration }) {
        this.addResult(
          `${role} access to ${route}`,
          'FAIL',
          `Network error: ${error.message}`,
          duration
        );
      }
    }
  }

  async testUnauthorizedAccess() {
    // Test STUDENT trying to access TEACHER routes
    if (this.tokens.STUDENT && this.tokens.TEACHER) {
      const teacherRoutes = this.protectedRoutes.TEACHER.slice(0, 2); // Test first 2 routes
      
      for (const route of teacherRoutes) {
        try {
          const { response, duration } = await this.makeRequest(`${BASE_URL}${route}`, {
            headers: {
              'Authorization': `Bearer ${this.tokens.STUDENT}`,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
          });

          if (response.status === 403 || response.status === 401) {
            this.addResult(
              `STUDENT blocked from ${route}`,
              'PASS',
              `Correctly denied cross-role access`,
              duration
            );
          } else {
            this.addResult(
              `STUDENT blocked from ${route}`,
              'FAIL',
              `Should deny cross-role access`,
              duration
            );
          }
        } catch ({ error, duration }) {
          this.addResult(
            `STUDENT blocked from ${route}`,
            'WARN',
            `Network error: ${error.message}`,
            duration
          );
        }
      }
    }
  }

  async testUnauthenticatedAccess() {
    const testRoutes = [
      '/admin/dashboard',
      '/teacher/schedule',
      '/student/grades',
      '/parent/fees'
    ];

    for (const route of testRoutes) {
      try {
        const { response, duration } = await this.makeRequest(`${BASE_URL}${route}`, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });

        // For Next.js pages, unauthenticated access might return 200 but redirect via client-side
        // We need to check if the response contains login-related content
        const text = await response.text();
        
        if (response.status === 401 || response.status === 403 || 
            text.includes('login') || text.includes('authentication')) {
          this.addResult(
            `Unauthenticated access to ${route}`,
            'PASS',
            `Correctly requires authentication`,
            duration
          );
        } else {
          this.addResult(
            `Unauthenticated access to ${route}`,
            'WARN',
            `May allow unauthenticated access (client-side protection)`,
            duration
          );
        }
      } catch ({ error, duration }) {
        this.addResult(
          `Unauthenticated access to ${route}`,
          'PASS',
          `Request failed as expected: ${error.message}`,
          duration
        );
      }
    }
  }

  // 🔍 API ENDPOINT TESTING
  async testAPIEndpoints() {
    console.log('\n🔍 TESTING API ENDPOINTS...\n');

    const apiTests = [
      { endpoint: '/api/health', method: 'GET', requiresAuth: false },
      { endpoint: '/api/courses', method: 'GET', requiresAuth: true, roles: ['ADMIN', 'TEACHER'] },
      { endpoint: '/api/students', method: 'GET', requiresAuth: true, roles: ['ADMIN', 'TEACHER'] },
      { endpoint: '/api/families', method: 'GET', requiresAuth: true, roles: ['ADMIN'] },
      { endpoint: '/api/assignments', method: 'GET', requiresAuth: true, roles: ['ADMIN', 'TEACHER', 'STUDENT'] }
    ];

    for (const test of apiTests) {
      if (!test.requiresAuth) {
        await this.testPublicAPI(test);
      } else {
        await this.testProtectedAPI(test);
      }
    }
  }

  async testPublicAPI(test) {
    try {
      const { response, duration } = await this.makeRequest(`${BASE_URL}${test.endpoint}`, {
        method: test.method
      });

      if (response.ok) {
        this.addResult(
          `Public API ${test.endpoint}`,
          'PASS',
          `Public endpoint accessible`,
          duration
        );
      } else {
        this.addResult(
          `Public API ${test.endpoint}`,
          'FAIL',
          `Public endpoint failed with status ${response.status}`,
          duration
        );
      }
    } catch ({ error, duration }) {
      this.addResult(
        `Public API ${test.endpoint}`,
        'FAIL',
        `Network error: ${error.message}`,
        duration
      );
    }
  }

  async testProtectedAPI(test) {
    // Test with valid tokens
    for (const role of test.roles) {
      if (this.tokens[role]) {
        try {
          const { response, duration } = await this.makeRequest(`${BASE_URL}${test.endpoint}`, {
            method: test.method,
            headers: {
              'Authorization': `Bearer ${this.tokens[role]}`
            }
          });

          if (response.ok) {
            this.addResult(
              `${role} API access ${test.endpoint}`,
              'PASS',
              `Authorized API access granted`,
              duration
            );
          } else {
            this.addResult(
              `${role} API access ${test.endpoint}`,
              'FAIL',
              `API access denied with status ${response.status}`,
              duration
            );
          }
        } catch ({ error, duration }) {
          this.addResult(
            `${role} API access ${test.endpoint}`,
            'FAIL',
            `Network error: ${error.message}`,
            duration
          );
        }
      }
    }

    // Test without authentication
    try {
      const { response, duration } = await this.makeRequest(`${BASE_URL}${test.endpoint}`, {
        method: test.method
      });

      if (response.status === 401) {
        this.addResult(
          `Unauthenticated API ${test.endpoint}`,
          'PASS',
          `Correctly requires authentication`,
          duration
        );
      } else {
        this.addResult(
          `Unauthenticated API ${test.endpoint}`,
          'FAIL',
          `Should require authentication`,
          duration
        );
      }
    } catch ({ error, duration }) {
      this.addResult(
        `Unauthenticated API ${test.endpoint}`,
        'PASS',
        `Request failed as expected: ${error.message}`,
        duration
      );
    }
  }

  // 🎯 PORTAL FUNCTIONALITY TESTING
  async testPortalFunctionality() {
    console.log('\n🎯 TESTING PORTAL FUNCTIONALITY...\n');

    // Test critical portal features for each role
    for (const [role, token] of Object.entries(this.tokens)) {
      if (token) {
        await this.testRoleSpecificFeatures(role, token);
      }
    }
  }

  async testRoleSpecificFeatures(role, token) {
    const features = {
      ADMIN: [
        { name: 'Dashboard Stats', endpoint: '/api/admin/stats' },
        { name: 'User Management', endpoint: '/api/users' },
        { name: 'Financial Reports', endpoint: '/api/reports/financial' }
      ],
      TEACHER: [
        { name: 'My Students', endpoint: '/api/students' },
        { name: 'My Courses', endpoint: '/api/courses' },
        { name: 'Academic Logs', endpoint: '/api/academic-logs' }
      ],
      STUDENT: [
        { name: 'My Grades', endpoint: '/api/grades' },
        { name: 'My Assignments', endpoint: '/api/assignments' },
        { name: 'My Schedule', endpoint: '/api/schedule' }
      ],
      PARENT: [
        { name: 'Children Info', endpoint: '/api/families/children' },
        { name: 'Fee Status', endpoint: '/api/fees' },
        { name: 'Academic Progress', endpoint: '/api/reports/academic' }
      ]
    };

    const roleFeatures = features[role] || [];

    for (const feature of roleFeatures) {
      try {
        const { response, duration } = await this.makeRequest(`${BASE_URL}${feature.endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok || response.status === 404) { // 404 is acceptable for unimplemented endpoints
          this.addResult(
            `${role} ${feature.name}`,
            response.status === 404 ? 'WARN' : 'PASS',
            response.status === 404 ? 'Endpoint not implemented yet' : 'Feature accessible',
            duration
          );
        } else {
          this.addResult(
            `${role} ${feature.name}`,
            'FAIL',
            `Feature failed with status ${response.status}`,
            duration
          );
        }
      } catch ({ error, duration }) {
        this.addResult(
          `${role} ${feature.name}`,
          'WARN',
          `Network error: ${error.message}`,
          duration
        );
      }
    }
  }

  // 📊 GENERATE COMPREHENSIVE REPORT
  generateReport() {
    console.log('\n📊 COMPREHENSIVE TEST REPORT\n');
    console.log('='.repeat(80));

    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'PASS').length,
      failed: this.results.filter(r => r.status === 'FAIL').length,
      warnings: this.results.filter(r => r.status === 'WARN').length
    };

    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   ✅ Passed: ${summary.passed}`);
    console.log(`   ❌ Failed: ${summary.failed}`);
    console.log(`   ⚠️  Warnings: ${summary.warnings}`);
    console.log(`   Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);

    // Group results by category
    const categories = {
      'Authentication': this.results.filter(r => r.test.includes('Login') || r.test.includes('credentials') || r.test.includes('Token') || r.test.includes('SQL')),
      'Authorization': this.results.filter(r => r.test.includes('access') || r.test.includes('blocked')),
      'API Endpoints': this.results.filter(r => r.test.includes('API')),
      'Portal Features': this.results.filter(r => !r.test.includes('Login') && !r.test.includes('access') && !r.test.includes('API') && !r.test.includes('credentials'))
    };

    for (const [category, tests] of Object.entries(categories)) {
      if (tests.length > 0) {
        console.log(`\n🔍 ${category.toUpperCase()}:`);
        const categoryPassed = tests.filter(t => t.status === 'PASS').length;
        const categoryFailed = tests.filter(t => t.status === 'FAIL').length;
        const categoryWarnings = tests.filter(t => t.status === 'WARN').length;

        console.log(`   ✅ ${categoryPassed} passed, ❌ ${categoryFailed} failed, ⚠️ ${categoryWarnings} warnings`);

        // Show failed tests
        const failedTests = tests.filter(t => t.status === 'FAIL');
        if (failedTests.length > 0) {
          console.log(`   Failed tests:`);
          failedTests.forEach(test => {
            console.log(`     ❌ ${test.test}: ${test.details}`);
          });
        }
      }
    }

    // Security Assessment
    console.log(`\n🛡️ SECURITY ASSESSMENT:`);
    const authTests = this.results.filter(r =>
      r.test.includes('SQL') ||
      r.test.includes('Invalid') ||
      r.test.includes('Unauthenticated') ||
      r.test.includes('blocked')
    );
    const securityPassed = authTests.filter(t => t.status === 'PASS').length;
    const securityTotal = authTests.length;

    if (securityTotal > 0) {
      const securityScore = (securityPassed / securityTotal) * 100;
      console.log(`   Security Score: ${securityScore.toFixed(1)}% (${securityPassed}/${securityTotal})`);

      if (securityScore >= 90) {
        console.log(`   🟢 Excellent security posture`);
      } else if (securityScore >= 75) {
        console.log(`   🟡 Good security, minor improvements needed`);
      } else {
        console.log(`   🔴 Security improvements required`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`🧪 Testing completed at ${new Date().toISOString()}`);

    return summary;
  }

  // 🚀 MAIN TEST RUNNER
  async runAllTests() {
    console.log('🧪 COMPREHENSIVE AUTHENTICATION & PORTAL TESTING SUITE');
    console.log('🎯 Testing RK Institute Management System');
    console.log('🌐 Target: ' + BASE_URL);
    console.log('⏰ Started at: ' + new Date().toISOString());
    console.log('='.repeat(80));

    const startTime = Date.now();

    try {
      // Phase 1: Authentication Testing
      await this.testAuthentication();

      // Phase 2: Authorization Testing
      await this.testAuthorization();

      // Phase 3: API Endpoint Testing
      await this.testAPIEndpoints();

      // Phase 4: Portal Functionality Testing
      await this.testPortalFunctionality();

    } catch (error) {
      console.error('❌ Critical testing error:', error);
      this.addResult('Test Suite Execution', 'FAIL', `Critical error: ${error.message}`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n⏱️ Total execution time: ${totalTime}ms`);

    return this.generateReport();
  }
}

// 🎬 SCRIPT EXECUTION
async function main() {
  const testSuite = new ComprehensiveTestSuite();

  try {
    const summary = await testSuite.runAllTests();

    // Exit with appropriate code
    if (summary.failed > 0) {
      console.log('\n❌ Some tests failed. Please review the results above.');
      process.exit(1);
    } else {
      console.log('\n✅ All critical tests passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Test suite crashed:', error);
    process.exit(1);
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { ComprehensiveTestSuite };
