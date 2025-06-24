/**
 * Comprehensive Testing Script for Refactored Components
 * 
 * This script validates all refactored components and functionality
 * to ensure our three-principle methodology hasn't broken anything.
 */

const puppeteer = require('puppeteer');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_ACCOUNTS = {
  admin: { email: 'admin@rkinstitute.com', password: 'admin123' },
  teacher: { email: 'teacher1@rkinstitute.com', password: 'admin123' },
  student: { email: 'student@rkinstitute.com', password: 'admin123' },
  parent: { email: 'parent@rkinstitute.com', password: 'admin123' }
};

class ComponentTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async init() {
    console.log('🚀 Initializing Component Testing...');
    this.browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: { width: 1280, height: 720 }
    });
    this.page = await this.browser.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Error:', msg.text());
        this.results.errors.push(`Browser Error: ${msg.text()}`);
      }
    });
  }

  async login(userType) {
    console.log(`🔐 Logging in as ${userType}...`);
    const account = TEST_ACCOUNTS[userType];
    
    await this.page.goto(`${BASE_URL}/login`);
    await this.page.waitForSelector('input[type="email"]', { timeout: 5000 });
    
    await this.page.type('input[type="email"]', account.email);
    await this.page.type('input[type="password"]', account.password);
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect
    await this.page.waitForNavigation({ timeout: 10000 });
    
    const currentUrl = this.page.url();
    if (currentUrl.includes(`/${userType}/dashboard`)) {
      console.log(`✅ ${userType} login successful`);
      this.results.passed++;
      return true;
    } else {
      console.log(`❌ ${userType} login failed - redirected to: ${currentUrl}`);
      this.results.failed++;
      this.results.errors.push(`${userType} login failed`);
      return false;
    }
  }

  async testStudentPortal() {
    console.log('\n📚 Testing Student Portal Components...');
    
    if (!(await this.login('student'))) return;

    try {
      // Test 1: Header Component
      console.log('Testing StudentHeader component...');
      const header = await this.page.$('header');
      const brandingText = await this.page.$eval('h1', el => el.textContent);
      const portalBadge = await this.page.$('.bg-gradient-to-r.from-blue-100');
      
      if (header && brandingText === 'RK Institute' && portalBadge) {
        console.log('✅ StudentHeader component working');
        this.results.passed++;
      } else {
        console.log('❌ StudentHeader component failed');
        this.results.failed++;
        this.results.errors.push('StudentHeader component missing elements');
      }

      // Test 2: Navigation Component
      console.log('Testing StudentNavigation component...');
      const navTabs = await this.page.$$('nav button');
      const expectedTabs = ['Dashboard', 'My Courses', 'Fees & Payments', 'Assignments & Notes', 'Academic Progress'];
      
      if (navTabs.length === expectedTabs.length) {
        console.log('✅ StudentNavigation component working');
        this.results.passed++;
      } else {
        console.log(`❌ StudentNavigation component failed - found ${navTabs.length} tabs, expected ${expectedTabs.length}`);
        this.results.failed++;
        this.results.errors.push('StudentNavigation component incorrect tab count');
      }

      // Test 3: Stats Overview Component
      console.log('Testing StudentStatsOverview component...');
      const welcomeSection = await this.page.$('.bg-gradient-to-r.from-blue-500');
      const statsCards = await this.page.$$('.bg-white.p-6.rounded-xl');
      
      if (welcomeSection && statsCards.length >= 6) {
        console.log('✅ StudentStatsOverview component working');
        this.results.passed++;
      } else {
        console.log(`❌ StudentStatsOverview component failed - welcome: ${!!welcomeSection}, stats: ${statsCards.length}`);
        this.results.failed++;
        this.results.errors.push('StudentStatsOverview component missing elements');
      }

      // Test 4: Quick Actions Component
      console.log('Testing StudentQuickActions component...');
      const quickActionButtons = await this.page.$$('button.bg-gradient-to-r');
      
      if (quickActionButtons.length >= 4) {
        console.log('✅ StudentQuickActions component working');
        this.results.passed++;
      } else {
        console.log(`❌ StudentQuickActions component failed - found ${quickActionButtons.length} action buttons`);
        this.results.failed++;
        this.results.errors.push('StudentQuickActions component missing buttons');
      }

      // Test 5: Tab Navigation Functionality
      console.log('Testing tab navigation functionality...');
      await this.page.click('button:has-text("My Courses")');
      await this.page.waitForTimeout(1000);
      
      const coursesContent = await this.page.$('text=My Courses') || await this.page.$('text=Courses');
      if (coursesContent) {
        console.log('✅ Tab navigation working');
        this.results.passed++;
      } else {
        console.log('❌ Tab navigation failed');
        this.results.failed++;
        this.results.errors.push('Tab navigation not working');
      }

    } catch (error) {
      console.log('❌ Student Portal testing error:', error.message);
      this.results.failed++;
      this.results.errors.push(`Student Portal error: ${error.message}`);
    }
  }

  async testAdminHubs() {
    console.log('\n🏢 Testing Admin Hub Components...');
    
    if (!(await this.login('admin'))) return;

    const hubs = ['people', 'financial', 'reports', 'operations'];
    
    for (const hub of hubs) {
      try {
        console.log(`Testing ${hub} hub...`);
        await this.page.goto(`${BASE_URL}/admin/${hub}`);
        await this.page.waitForSelector('main', { timeout: 5000 });
        
        // Check for hub-specific elements
        const hubContent = await this.page.$('main');
        const statsCards = await this.page.$$('.bg-white');
        
        if (hubContent && statsCards.length > 0) {
          console.log(`✅ ${hub} hub working`);
          this.results.passed++;
        } else {
          console.log(`❌ ${hub} hub failed`);
          this.results.failed++;
          this.results.errors.push(`${hub} hub not loading properly`);
        }
        
      } catch (error) {
        console.log(`❌ ${hub} hub error:`, error.message);
        this.results.failed++;
        this.results.errors.push(`${hub} hub error: ${error.message}`);
      }
    }
  }

  async testCrossPortalNavigation() {
    console.log('\n🔄 Testing Cross-Portal Navigation...');
    
    try {
      // Test logout and re-login
      await this.page.goto(`${BASE_URL}/admin/dashboard`);
      await this.page.click('button:has-text("Logout")');
      await this.page.waitForNavigation({ timeout: 5000 });
      
      const loginPage = this.page.url().includes('/login') || this.page.url() === `${BASE_URL}/`;
      if (loginPage) {
        console.log('✅ Logout functionality working');
        this.results.passed++;
      } else {
        console.log('❌ Logout functionality failed');
        this.results.failed++;
        this.results.errors.push('Logout not redirecting properly');
      }
      
    } catch (error) {
      console.log('❌ Cross-portal navigation error:', error.message);
      this.results.failed++;
      this.results.errors.push(`Cross-portal navigation error: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('\n📊 TESTING RESULTS SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ Tests Passed: ${this.results.passed}`);
    console.log(`❌ Tests Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERRORS FOUND:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('\n' + '=' .repeat(50));
    
    return {
      passed: this.results.passed,
      failed: this.results.failed,
      successRate: (this.results.passed / (this.results.passed + this.results.failed)) * 100,
      errors: this.results.errors
    };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.init();
      await this.testStudentPortal();
      await this.testAdminHubs();
      await this.testCrossPortalNavigation();
      return await this.generateReport();
    } catch (error) {
      console.log('❌ Testing framework error:', error.message);
      return { error: error.message };
    } finally {
      await this.cleanup();
    }
  }
}

// Export for use in other scripts
module.exports = ComponentTester;

// Run tests if called directly
if (require.main === module) {
  const tester = new ComponentTester();
  tester.runAllTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  });
}
