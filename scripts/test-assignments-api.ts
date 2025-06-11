// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3001';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  data?: any;
}

class AssignmentsAPITester {
  private results: TestResult[] = [];
  private tokens: Record<string, string> = {};

  async login(
    email: string,
    password: string,
    role: string
  ): Promise<string | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        this.tokens[role] = data.token;
        this.addResult(
          `Login as ${role}`,
          'PASS',
          `Successfully logged in as ${email}`
        );
        return data.token;
      } else {
        const error = (await response.json()) as any;
        this.addResult(
          `Login as ${role}`,
          'FAIL',
          `Login failed: ${error.error}`
        );
        return null;
      }
    } catch (error) {
      this.addResult(`Login as ${role}`, 'FAIL', `Network error: ${error}`);
      return null;
    }
  }

  async testAssignmentsAPI(role: string, token: string) {
    try {
      const response = await fetch(`${BASE_URL}/api/assignments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        this.addResult(
          `Get Assignments (${role})`,
          'PASS',
          `Retrieved ${data.assignments?.length || 0} assignments`,
          { count: data.assignments?.length }
        );
      } else {
        const error = (await response.json()) as any;
        this.addResult(
          `Get Assignments (${role})`,
          'FAIL',
          `API error: ${error.error}`
        );
      }
    } catch (error) {
      this.addResult(
        `Get Assignments (${role})`,
        'FAIL',
        `Network error: ${error}`
      );
    }
  }

  async testAssignmentStats(role: string, token: string) {
    try {
      const response = await fetch(`${BASE_URL}/api/assignments/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        this.addResult(
          `Get Assignment Stats (${role})`,
          'PASS',
          `Retrieved stats successfully`,
          data.stats
        );
      } else {
        const error = (await response.json()) as any;
        this.addResult(
          `Get Assignment Stats (${role})`,
          'FAIL',
          `API error: ${error.error}`
        );
      }
    } catch (error) {
      this.addResult(
        `Get Assignment Stats (${role})`,
        'FAIL',
        `Network error: ${error}`
      );
    }
  }

  async testCreateAssignment(token: string) {
    try {
      const assignmentData = {
        title: 'Test Assignment - API Test',
        description: 'This is a test assignment created via API testing',
        subject: 'Computer Science',
        assignmentType: 'HOMEWORK',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        grade: 'Grade 11'
      };

      const response = await fetch(`${BASE_URL}/api/assignments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        this.addResult(
          'Create Assignment (Teacher)',
          'PASS',
          `Successfully created assignment: ${data.assignment.title}`,
          { assignmentId: data.assignment.id }
        );
        return data.assignment.id;
      } else {
        const error = (await response.json()) as any;
        this.addResult(
          'Create Assignment (Teacher)',
          'FAIL',
          `API error: ${error.error}`
        );
        return null;
      }
    } catch (error) {
      this.addResult(
        'Create Assignment (Teacher)',
        'FAIL',
        `Network error: ${error}`
      );
      return null;
    }
  }

  async testSubmissions(role: string, token: string) {
    try {
      const response = await fetch(`${BASE_URL}/api/assignments/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        this.addResult(
          `Get Submissions (${role})`,
          'PASS',
          `Retrieved ${data.submissions?.length || 0} submissions`,
          { count: data.submissions?.length }
        );
      } else {
        const error = (await response.json()) as any;
        this.addResult(
          `Get Submissions (${role})`,
          'FAIL',
          `API error: ${error.error}`
        );
      }
    } catch (error) {
      this.addResult(
        `Get Submissions (${role})`,
        'FAIL',
        `Network error: ${error}`
      );
    }
  }

  private addResult(
    test: string,
    status: 'PASS' | 'FAIL',
    message: string,
    data?: any
  ) {
    this.results.push({ test, status, message, data });
  }

  async runAllTests() {
    console.log('🧪 Starting Assignments API Tests...\n');

    // Test login for all roles
    await this.login('admin@rkinstitute.com', 'admin123', 'ADMIN');
    await this.login('teacher1@rkinstitute.com', 'admin123', 'TEACHER');
    await this.login('parent@rkinstitute.com', 'admin123', 'PARENT');
    await this.login('student@rkinstitute.com', 'admin123', 'STUDENT');

    // Test assignments API for each role
    for (const [role, token] of Object.entries(this.tokens)) {
      if (token) {
        await this.testAssignmentsAPI(role, token);
        await this.testAssignmentStats(role, token);
        await this.testSubmissions(role, token);
      }
    }

    // Test assignment creation (Teacher only)
    if (this.tokens.TEACHER) {
      await this.testCreateAssignment(this.tokens.TEACHER);
    }

    // Print results
    this.printResults();
  }

  private printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.message}`);
      if (result.data && Object.keys(result.data).length > 0) {
        console.log(`   Data: ${JSON.stringify(result.data, null, 2)}`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`📈 Summary: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
      console.log('🎉 All tests passed! Assignments API is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please check the issues above.');
    }
  }
}

// Run the tests
const tester = new AssignmentsAPITester();
tester.runAllTests().catch(console.error);
