#!/usr/bin/env node

/**
 * 🧪 SIMPLE AUTHENTICATION TEST
 * Basic test using curl commands to verify authentication
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const BASE_URL = 'http://localhost:3000';

class SimpleAuthTest {
  constructor() {
    this.results = [];
  }

  addResult(test, status, details) {
    this.results.push({ test, status, details });
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${test}: ${details}`);
  }

  async testWithCurl(url, options = {}) {
    try {
      let curlCmd = `curl -s -w "HTTPSTATUS:%{http_code}" "${url}"`;
      
      if (options.method && options.method !== 'GET') {
        curlCmd += ` -X ${options.method}`;
      }
      
      if (options.headers) {
        for (const [key, value] of Object.entries(options.headers)) {
          curlCmd += ` -H "${key}: ${value}"`;
        }
      }
      
      if (options.data) {
        curlCmd += ` -d '${JSON.stringify(options.data)}'`;
      }

      const { stdout, stderr } = await execAsync(curlCmd);
      
      if (stderr) {
        throw new Error(stderr);
      }

      const parts = stdout.split('HTTPSTATUS:');
      const body = parts[0];
      const status = parseInt(parts[1]);

      return { body, status };
    } catch (error) {
      throw new Error(`Curl failed: ${error.message}`);
    }
  }

  async testBasicConnectivity() {
    console.log('\n🔍 TESTING BASIC CONNECTIVITY...\n');

    try {
      const result = await this.testWithCurl(`${BASE_URL}/`);
      if (result.status === 200) {
        this.addResult('Server Connectivity', 'PASS', 'Server is responding');
      } else {
        this.addResult('Server Connectivity', 'FAIL', `Server returned status ${result.status}`);
      }
    } catch (error) {
      this.addResult('Server Connectivity', 'FAIL', error.message);
    }
  }

  async testAuthentication() {
    console.log('\n🔐 TESTING AUTHENTICATION...\n');

    const credentials = [
      { role: 'ADMIN', email: 'admin@rkinstitute.com', password: 'admin123' },
      { role: 'TEACHER', email: 'teacher1@rkinstitute.com', password: 'admin123' },
      { role: 'STUDENT', email: 'student@rkinstitute.com', password: 'admin123' },
      { role: 'PARENT', email: 'parent@rkinstitute.com', password: 'admin123' }
    ];

    for (const cred of credentials) {
      try {
        const result = await this.testWithCurl(`${BASE_URL}/api/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            email: cred.email,
            password: cred.password
          }
        });

        if (result.status === 200) {
          try {
            const data = JSON.parse(result.body);
            if (data.token && data.user) {
              this.addResult(`${cred.role} Login`, 'PASS', `Successfully authenticated`);
            } else {
              this.addResult(`${cred.role} Login`, 'FAIL', `Invalid response format`);
            }
          } catch (parseError) {
            this.addResult(`${cred.role} Login`, 'FAIL', `Invalid JSON response`);
          }
        } else {
          this.addResult(`${cred.role} Login`, 'FAIL', `Authentication failed with status ${result.status}`);
        }
      } catch (error) {
        this.addResult(`${cred.role} Login`, 'FAIL', error.message);
      }
    }
  }

  async testInvalidCredentials() {
    console.log('\n🛡️ TESTING SECURITY...\n');

    try {
      const result = await this.testWithCurl(`${BASE_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          email: 'admin@rkinstitute.com',
          password: 'wrongpassword'
        }
      });

      if (result.status === 401) {
        this.addResult('Invalid Password Protection', 'PASS', 'Correctly rejected invalid credentials');
      } else {
        this.addResult('Invalid Password Protection', 'FAIL', `Should reject invalid credentials`);
      }
    } catch (error) {
      this.addResult('Invalid Password Protection', 'FAIL', error.message);
    }

    // Test missing credentials
    try {
      const result = await this.testWithCurl(`${BASE_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {}
      });

      if (result.status === 400) {
        this.addResult('Missing Credentials Protection', 'PASS', 'Correctly rejected empty credentials');
      } else {
        this.addResult('Missing Credentials Protection', 'FAIL', `Should reject empty credentials`);
      }
    } catch (error) {
      this.addResult('Missing Credentials Protection', 'FAIL', error.message);
    }
  }

  async testProtectedRoutes() {
    console.log('\n🔒 TESTING PROTECTED ROUTES...\n');

    const protectedRoutes = [
      '/admin/dashboard',
      '/teacher/schedule',
      '/student/grades',
      '/parent/fees'
    ];

    for (const route of protectedRoutes) {
      try {
        const result = await this.testWithCurl(`${BASE_URL}${route}`);
        
        // For Next.js, we expect either a redirect or the page to load
        // Since we're testing without authentication, we should see some form of protection
        if (result.status === 200) {
          // Check if the response contains authentication-related content
          if (result.body.includes('login') || result.body.includes('authentication') || 
              result.body.includes('Welcome Back') || result.body.includes('Sign in')) {
            this.addResult(`Protected Route ${route}`, 'PASS', 'Route requires authentication (client-side)');
          } else {
            this.addResult(`Protected Route ${route}`, 'WARN', 'Route may be accessible without auth');
          }
        } else if (result.status === 401 || result.status === 403) {
          this.addResult(`Protected Route ${route}`, 'PASS', 'Route properly protected');
        } else {
          this.addResult(`Protected Route ${route}`, 'WARN', `Unexpected status ${result.status}`);
        }
      } catch (error) {
        this.addResult(`Protected Route ${route}`, 'FAIL', error.message);
      }
    }
  }

  generateReport() {
    console.log('\n📊 TEST REPORT\n');
    console.log('='.repeat(60));

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
    
    if (summary.total > 0) {
      console.log(`   Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);
    }

    const failedTests = this.results.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      failedTests.forEach(test => {
        console.log(`   • ${test.test}: ${test.details}`);
      });
    }

    const warningTests = this.results.filter(r => r.status === 'WARN');
    if (warningTests.length > 0) {
      console.log(`\n⚠️  WARNINGS:`);
      warningTests.forEach(test => {
        console.log(`   • ${test.test}: ${test.details}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🧪 Testing completed at ${new Date().toISOString()}`);
    
    return summary;
  }

  async runAllTests() {
    console.log('🧪 SIMPLE AUTHENTICATION TEST SUITE');
    console.log('🎯 Testing RK Institute Management System');
    console.log('🌐 Target: ' + BASE_URL);
    console.log('⏰ Started at: ' + new Date().toISOString());
    console.log('='.repeat(60));

    try {
      await this.testBasicConnectivity();
      await this.testAuthentication();
      await this.testInvalidCredentials();
      await this.testProtectedRoutes();
    } catch (error) {
      console.error('❌ Critical testing error:', error);
      this.addResult('Test Suite Execution', 'FAIL', `Critical error: ${error.message}`);
    }

    return this.generateReport();
  }
}

// Run the tests
async function main() {
  const testSuite = new SimpleAuthTest();
  
  try {
    const summary = await testSuite.runAllTests();
    
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

if (require.main === module) {
  main();
}
