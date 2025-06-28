#!/usr/bin/env node

/**
 * 🌐 Vercel Dashboard Browser Automation
 * 
 * Specialized script for accessing Vercel dashboard with existing authentication
 * Designed to work with existing browser sessions and extract deployment data
 */

const { chromium } = require('playwright');

class VercelDashboardAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.dashboardUrl = 'https://vercel.com/iamneonerds-projects/~/deployments';
    this.projectName = 'rk-institute-management-system';
    this.featureBranch = 'feature/mcp-autonomous-deployment';
  }

  /**
   * 🔗 Connect to existing Chrome session or launch new one
   */
  async connectToBrowser() {
    console.log('🔗 Connecting to browser...');
    
    try {
      // Method 1: Try to connect to existing Chrome with debugging enabled
      console.log('🔍 Attempting to connect to existing Chrome session...');
      
      const cdpEndpoints = [
        'http://localhost:9222',
        'http://127.0.0.1:9222',
        'http://localhost:9223'
      ];

      for (const endpoint of cdpEndpoints) {
        try {
          console.log(`   Trying ${endpoint}...`);
          this.browser = await chromium.connectOverCDP(endpoint);
          console.log('✅ Connected to existing Chrome session!');
          
          // Get existing context and page
          const contexts = this.browser.contexts();
          if (contexts.length > 0) {
            const pages = contexts[0].pages();
            this.page = pages.length > 0 ? pages[0] : await contexts[0].newPage();
          } else {
            const context = await this.browser.newContext();
            this.page = await context.newPage();
          }
          
          return { method: 'existing_session', success: true };
        } catch (error) {
          console.log(`   ❌ ${endpoint} failed: ${error.message}`);
        }
      }

      // Method 2: Launch new browser (user needs to login manually)
      console.log('🚀 Launching new browser session...');
      this.browser = await chromium.launch({
        headless: false,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security'
        ]
      });
      
      const context = await this.browser.newContext();
      this.page = await context.newPage();
      
      return { method: 'new_session', success: true };
      
    } catch (error) {
      console.error('❌ Failed to connect to browser:', error.message);
      return { method: 'failed', success: false, error: error.message };
    }
  }

  /**
   * 🌐 Navigate to Vercel dashboard
   */
  async navigateToVercelDashboard() {
    try {
      console.log(`🌐 Navigating to ${this.dashboardUrl}...`);
      
      await this.page.goto(this.dashboardUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for page to stabilize
      await this.page.waitForTimeout(3000);
      
      console.log('✅ Successfully navigated to Vercel dashboard');
      return true;
    } catch (error) {
      console.error('❌ Navigation failed:', error.message);
      return false;
    }
  }

  /**
   * 🔐 Check authentication status
   */
  async checkAuthentication() {
    try {
      console.log('🔐 Checking authentication status...');
      
      const currentUrl = this.page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      // Check for login indicators
      const loginIndicators = await this.page.evaluate(() => {
        const indicators = {
          hasLoginButton: !!document.querySelector('button[data-testid="login-button"], [href*="login"], button:has-text("Log in")'),
          hasEmailInput: !!document.querySelector('input[type="email"]'),
          hasLoginText: document.body.textContent.includes('Log in to Vercel') || document.body.textContent.includes('Sign in'),
          currentPath: window.location.pathname
        };
        return indicators;
      });

      if (loginIndicators.hasLoginButton || loginIndicators.hasEmailInput || loginIndicators.hasLoginText) {
        console.log('❌ Not authenticated - login required');
        return { authenticated: false, indicators: loginIndicators };
      }

      // Check for dashboard indicators
      const dashboardIndicators = await this.page.evaluate(() => {
        return {
          hasDeployments: document.body.textContent.includes('Deployments'),
          hasProjectName: document.body.textContent.includes('rk-institute-management-system'),
          hasOverview: document.body.textContent.includes('Overview')
        };
      });

      if (dashboardIndicators.hasDeployments || dashboardIndicators.hasProjectName) {
        console.log('✅ Authenticated and on dashboard');
        return { authenticated: true, indicators: dashboardIndicators };
      }

      console.log('⚠️  Authentication status unclear');
      return { authenticated: 'unknown', indicators: { login: loginIndicators, dashboard: dashboardIndicators } };
      
    } catch (error) {
      console.error('❌ Authentication check failed:', error.message);
      return { authenticated: false, error: error.message };
    }
  }

  /**
   * 📋 Extract deployment information
   */
  async extractDeploymentData() {
    try {
      console.log('📋 Extracting deployment data...');
      
      // Wait for deployments to load
      await this.page.waitForTimeout(5000);
      
      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'vercel-dashboard-debug.png', fullPage: true });
      console.log('📸 Debug screenshot saved as vercel-dashboard-debug.png');
      
      // Extract all deployment information
      const deploymentData = await this.page.evaluate((featureBranch) => {
        const results = {
          deployments: [],
          featureBranchDeployment: null,
          pageText: document.body.textContent.substring(0, 1000),
          timestamp: new Date().toISOString()
        };

        // Look for deployment cards/items with various selectors
        const selectors = [
          '[data-testid*="deployment"]',
          '[class*="deployment"]',
          '.deployment-card',
          '.deployment-item',
          'a[href*="vercel.app"]',
          '[href*="/deployments/"]'
        ];

        const deploymentElements = new Set();
        
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => deploymentElements.add(el));
        });

        // Also look for any links or text containing our branch name
        const branchElements = document.querySelectorAll(`*:contains("${featureBranch}"), [href*="mcp-autonomous"], [href*="feature-mcp"]`);
        branchElements.forEach(el => deploymentElements.add(el));

        deploymentElements.forEach((element, index) => {
          if (index < 20) { // Limit to prevent overwhelming data
            const text = element.textContent || '';
            const href = element.href || element.querySelector('a')?.href || '';
            
            const deploymentInfo = {
              text: text.substring(0, 200),
              href: href,
              className: element.className,
              tagName: element.tagName
            };

            results.deployments.push(deploymentInfo);

            // Check if this is our feature branch deployment
            if (text.includes(featureBranch) || 
                text.includes('mcp-autonomous') || 
                href.includes('feature-mcp') ||
                href.includes('mcp-autonomous')) {
              results.featureBranchDeployment = deploymentInfo;
            }
          }
        });

        return results;
      }, this.featureBranch);

      console.log(`📊 Found ${deploymentData.deployments.length} deployment elements`);
      
      if (deploymentData.featureBranchDeployment) {
        console.log('✅ Found feature branch deployment!');
        console.log(`🔗 Deployment info: ${JSON.stringify(deploymentData.featureBranchDeployment, null, 2)}`);
        
        // Try to get more details by clicking on the deployment
        if (deploymentData.featureBranchDeployment.href) {
          const detailedInfo = await this.getDetailedDeploymentInfo(deploymentData.featureBranchDeployment.href);
          deploymentData.detailedInfo = detailedInfo;
        }
      } else {
        console.log('❌ Feature branch deployment not found');
        console.log('📝 Available deployments:');
        deploymentData.deployments.slice(0, 5).forEach((dep, index) => {
          console.log(`   ${index + 1}. ${dep.text.substring(0, 100)}...`);
        });
      }

      return deploymentData;
      
    } catch (error) {
      console.error('❌ Failed to extract deployment data:', error.message);
      return { error: error.message, timestamp: new Date().toISOString() };
    }
  }

  /**
   * 🔍 Get detailed deployment information
   */
  async getDetailedDeploymentInfo(deploymentUrl) {
    try {
      console.log(`🔍 Getting detailed info from: ${deploymentUrl}`);
      
      await this.page.goto(deploymentUrl);
      await this.page.waitForTimeout(3000);
      
      const details = await this.page.evaluate(() => {
        return {
          status: document.body.textContent.includes('Ready') ? 'success' : 
                 document.body.textContent.includes('Failed') ? 'failed' : 'unknown',
          url: Array.from(document.querySelectorAll('a')).find(a => 
            a.href && a.href.includes('vercel.app') && !a.href.includes('dashboard')
          )?.href || '',
          pageTitle: document.title,
          bodyText: document.body.textContent.substring(0, 500)
        };
      });
      
      console.log(`📊 Deployment status: ${details.status}`);
      if (details.url) {
        console.log(`🔗 Deployment URL: ${details.url}`);
      }
      
      return details;
    } catch (error) {
      console.error('❌ Failed to get detailed info:', error.message);
      return { error: error.message };
    }
  }

  /**
   * 🧹 Cleanup resources
   */
  async cleanup() {
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close();
      }
      // Don't close browser if we connected to existing session
      if (this.browser && this.connectionMethod !== 'existing_session') {
        await this.browser.close();
      }
    } catch (error) {
      console.error('❌ Cleanup error:', error.message);
    }
  }

  /**
   * 🚀 Main execution function
   */
  async run() {
    try {
      console.log('🚀 VERCEL DASHBOARD AUTOMATION STARTED');
      console.log('=====================================\n');

      // Step 1: Connect to browser
      const connectionResult = await this.connectToBrowser();
      this.connectionMethod = connectionResult.method;
      
      if (!connectionResult.success) {
        throw new Error(`Browser connection failed: ${connectionResult.error}`);
      }

      // Step 2: Navigate to dashboard
      const navigationSuccess = await this.navigateToVercelDashboard();
      if (!navigationSuccess) {
        throw new Error('Failed to navigate to Vercel dashboard');
      }

      // Step 3: Check authentication
      const authStatus = await this.checkAuthentication();
      if (!authStatus.authenticated) {
        console.log('\n⚠️  AUTHENTICATION REQUIRED');
        console.log('Please log in to Vercel manually in the browser window that opened.');
        console.log('After logging in, run this script again.');
        return {
          success: false,
          reason: 'authentication_required',
          authStatus
        };
      }

      // Step 4: Extract deployment data
      const deploymentData = await this.extractDeploymentData();
      
      return {
        success: true,
        method: connectionResult.method,
        authStatus,
        deploymentData,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('💥 Automation failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    } finally {
      // Note: We don't cleanup automatically to allow manual inspection
      console.log('\n🔧 Browser window left open for manual inspection');
      console.log('Call cleanup() method when done');
    }
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const automation = new VercelDashboardAutomation();
  
  automation.run()
    .then(result => {
      console.log('\n📊 AUTOMATION RESULT:');
      console.log('====================');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success && result.deploymentData?.featureBranchDeployment) {
        console.log('\n🎉 SUCCESS! Feature branch deployment found');
        if (result.deploymentData.detailedInfo?.url) {
          console.log(`🔗 Deployment URL: ${result.deploymentData.detailedInfo.url}`);
        }
      } else if (!result.success && result.reason === 'authentication_required') {
        console.log('\n🔐 Please log in to Vercel and run the script again');
      } else {
        console.log('\n⚠️  Deployment not found or extraction incomplete');
      }
    })
    .catch(error => {
      console.error('💥 Script execution failed:', error);
    });
}

module.exports = VercelDashboardAutomation;
