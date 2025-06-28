#!/usr/bin/env node

/**
 * 🤖 Comprehensive Deployment Verification System
 *
 * Dual-approach solution for deployment verification:
 * - Primary: GitHub API automation (no authentication required)
 * - Fallback: Browser automation with existing session support
 *
 * Features:
 * - GitHub API integration for deployment status
 * - Browser automation fallback for dashboard access
 * - Automatic deployment URL detection and validation
 * - Comprehensive failure analysis and troubleshooting
 * - MCP integration for autonomous deployment
 * - Session-aware browser automation
 */

const { Octokit } = require('@octokit/rest');
const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveDeploymentVerifier {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || 'your_github_token_here'
    });

    this.repo = {
      owner: 'IamNeoNerd',
      repo: 'rk-institute-management-system'
    };

    this.vercelConfig = {
      dashboardUrl: 'https://vercel.com/iamneonerds-projects/~/deployments',
      projectName: 'rk-institute-management-system'
    };

    this.browser = null;
    this.page = null;
  }

  /**
   * 🔍 Get latest deployment for a specific branch
   */
  async getLatestDeployment(branch = null) {
    try {
      console.log('🔍 Fetching deployments from GitHub API...');
      
      const { data: deployments } = await this.octokit.rest.repos.listDeployments({
        ...this.repo,
        per_page: 10
      });

      if (deployments.length === 0) {
        throw new Error('No deployments found');
      }

      // Get the latest deployment
      const latestDeployment = deployments[0];
      
      console.log(`📅 Latest deployment: ${latestDeployment.id}`);
      console.log(`🌿 Ref: ${latestDeployment.ref}`);
      console.log(`🌍 Environment: ${latestDeployment.environment}`);
      console.log(`⏰ Created: ${latestDeployment.created_at}`);

      return latestDeployment;
    } catch (error) {
      console.error('❌ Error fetching deployments:', error.message);
      throw error;
    }
  }

  /**
   * 📊 Get deployment status and URL
   */
  async getDeploymentStatus(deploymentId) {
    try {
      console.log(`📊 Fetching status for deployment ${deploymentId}...`);
      
      const { data: statuses } = await this.octokit.rest.repos.listDeploymentStatuses({
        ...this.repo,
        deployment_id: deploymentId
      });

      if (statuses.length === 0) {
        throw new Error('No deployment statuses found');
      }

      const latestStatus = statuses[0];
      
      console.log(`🎯 Status: ${latestStatus.state}`);
      console.log(`📝 Description: ${latestStatus.description}`);
      
      if (latestStatus.target_url) {
        console.log(`🔗 Deployment URL: ${latestStatus.target_url}`);
      }

      return latestStatus;
    } catch (error) {
      console.error('❌ Error fetching deployment status:', error.message);
      throw error;
    }
  }

  /**
   * 🔧 Analyze deployment failure and provide solutions
   */
  analyzeFailure(status, deployment) {
    console.log('\n🔧 DEPLOYMENT FAILURE ANALYSIS');
    console.log('================================');
    
    const analysis = {
      status: status.state,
      description: status.description,
      ref: deployment.ref,
      environment: deployment.environment,
      timestamp: status.created_at
    };

    // Common failure patterns and solutions
    const solutions = {
      'Build failed': [
        '🔍 Check TypeScript compilation errors',
        '📦 Verify all dependencies are installed',
        '🔧 Check next.config.js configuration',
        '📝 Review build logs in Vercel dashboard'
      ],
      'Environment variable': [
        '🔑 Add missing environment variables in Vercel',
        '🗄️ Verify DATABASE_URL for preview environment',
        '🔐 Check JWT_SECRET configuration',
        '🌐 Set NEXT_PUBLIC_APP_URL for preview'
      ],
      'Database connection': [
        '🗄️ Verify Neon PostgreSQL connection string',
        '🔗 Check database URL format and credentials',
        '🌐 Ensure database allows connections from Vercel',
        '📊 Test database connectivity'
      ],
      'Module not found': [
        '📦 Run npm install to update dependencies',
        '🔄 Clear node_modules and reinstall',
        '📝 Check package.json for missing dependencies',
        '🔧 Verify import paths and module resolution'
      ]
    };

    // Analyze description for known patterns
    const description = status.description.toLowerCase();
    let matchedSolutions = [];

    for (const [pattern, solutionList] of Object.entries(solutions)) {
      if (description.includes(pattern.toLowerCase())) {
        matchedSolutions = [...matchedSolutions, ...solutionList];
      }
    }

    if (matchedSolutions.length === 0) {
      matchedSolutions = [
        '🔍 Check Vercel deployment logs for specific errors',
        '📝 Review recent code changes for issues',
        '🔧 Verify all configuration files',
        '🗄️ Test database and API connections'
      ];
    }

    console.log(`❌ Failure: ${status.description}`);
    console.log(`🌿 Branch: ${deployment.ref}`);
    console.log(`⏰ Time: ${status.created_at}`);
    console.log('\n💡 RECOMMENDED SOLUTIONS:');
    matchedSolutions.forEach((solution, index) => {
      console.log(`   ${index + 1}. ${solution}`);
    });

    return analysis;
  }

  /**
   * 🚀 Generate deployment URL patterns for testing
   */
  generateDeploymentURLs(deployment) {
    const baseUrl = 'rk-institute-management-system';
    const shortSha = deployment.sha.substring(0, 8);
    
    const patterns = [
      `https://${baseUrl}-git-feature-mcp-autonomous-deployment-iamneonerd.vercel.app`,
      `https://${baseUrl}-feature-mcp-autonomous-deployment.vercel.app`,
      `https://${baseUrl}-${shortSha}.vercel.app`,
      `https://${baseUrl}-git-${deployment.ref}-iamneonerd.vercel.app`
    ];

    console.log('\n🔗 POSSIBLE DEPLOYMENT URLS TO TEST:');
    patterns.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });

    return patterns;
  }

  /**
   * 🌐 Browser Automation Fallback Solution
   */
  async connectToExistingBrowser() {
    try {
      console.log('🌐 Attempting to connect to existing Chrome session...');

      // Try to connect to existing Chrome instance via CDP
      const cdpEndpoints = [
        'http://localhost:9222',
        'http://127.0.0.1:9222',
        'http://localhost:9223',
        'http://127.0.0.1:9223'
      ];

      for (const endpoint of cdpEndpoints) {
        try {
          console.log(`🔗 Trying to connect to ${endpoint}...`);
          this.browser = await chromium.connectOverCDP(endpoint);
          console.log('✅ Connected to existing Chrome session!');
          return true;
        } catch (error) {
          console.log(`❌ Failed to connect to ${endpoint}: ${error.message}`);
        }
      }

      // Fallback: Launch new browser with user data
      console.log('🚀 Launching new browser session...');
      this.browser = await chromium.launch({
        headless: false,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      return true;
    } catch (error) {
      console.error('❌ Browser connection failed:', error.message);
      return false;
    }
  }

  /**
   * 📊 Extract deployment data from Vercel dashboard
   */
  async extractVercelDeploymentData() {
    try {
      if (!this.browser) {
        throw new Error('Browser not connected');
      }

      console.log('📊 Extracting deployment data from Vercel dashboard...');

      // Get or create page
      const contexts = this.browser.contexts();
      let context;

      if (contexts.length > 0) {
        context = contexts[0];
        const pages = context.pages();
        this.page = pages.length > 0 ? pages[0] : await context.newPage();
      } else {
        context = await this.browser.newContext();
        this.page = await context.newPage();
      }

      // Navigate to Vercel deployments dashboard
      console.log(`🌐 Navigating to ${this.vercelConfig.dashboardUrl}...`);
      await this.page.goto(this.vercelConfig.dashboardUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for page to load
      await this.page.waitForTimeout(3000);

      // Check if we're logged in
      const isLoggedIn = await this.checkVercelAuthentication();
      if (!isLoggedIn) {
        throw new Error('Not authenticated with Vercel. Please log in manually first.');
      }

      // Extract deployment information
      const deploymentData = await this.extractDeploymentInfo();

      return deploymentData;
    } catch (error) {
      console.error('❌ Failed to extract Vercel data:', error.message);
      throw error;
    }
  }

  /**
   * 🔐 Check Vercel authentication status
   */
  async checkVercelAuthentication() {
    try {
      // Look for login indicators
      const loginSelectors = [
        'button[data-testid="login-button"]',
        'input[type="email"]',
        'text=Log in to Vercel',
        'text=Sign in'
      ];

      const dashboardSelectors = [
        '[data-testid="deployment-list"]',
        'text=Deployments',
        '[data-testid="project-card"]',
        'text=Overview'
      ];

      // Check if we see login elements (not authenticated)
      for (const selector of loginSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          console.log('❌ Login required - not authenticated');
          return false;
        } catch (e) {
          // Selector not found, continue checking
        }
      }

      // Check if we see dashboard elements (authenticated)
      for (const selector of dashboardSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 });
          console.log('✅ Authenticated with Vercel');
          return true;
        } catch (e) {
          // Selector not found, continue checking
        }
      }

      // If we can't determine, assume we need to check the URL
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
        console.log('❌ Redirected to login page - not authenticated');
        return false;
      }

      console.log('✅ Appears to be authenticated (no login redirect)');
      return true;
    } catch (error) {
      console.error('❌ Authentication check failed:', error.message);
      return false;
    }
  }

  /**
   * 📋 Extract deployment information from dashboard
   */
  async extractDeploymentInfo() {
    try {
      console.log('📋 Extracting deployment information...');

      // Wait for deployments to load
      await this.page.waitForTimeout(3000);

      // Look for our feature branch deployment
      const deployments = await this.page.evaluate(() => {
        const deploymentElements = document.querySelectorAll('[data-testid="deployment-card"], .deployment-item, [class*="deployment"]');
        const results = [];

        deploymentElements.forEach((element, index) => {
          if (index < 10) { // Limit to first 10 deployments
            const textContent = element.textContent || '';
            const href = element.querySelector('a')?.href || '';

            results.push({
              text: textContent,
              href: href,
              html: element.outerHTML.substring(0, 500) // Truncate for safety
            });
          }
        });

        return results;
      });

      // Look for our specific branch
      const featureBranchDeployment = deployments.find(deployment =>
        deployment.text.includes('feature/mcp-autonomous-deployment') ||
        deployment.text.includes('mcp-autonomous') ||
        deployment.href.includes('feature-mcp-autonomous')
      );

      if (featureBranchDeployment) {
        console.log('✅ Found feature branch deployment!');

        // Extract more details by clicking on the deployment
        if (featureBranchDeployment.href) {
          console.log('🔍 Getting detailed deployment information...');
          await this.page.goto(featureBranchDeployment.href);
          await this.page.waitForTimeout(3000);

          const detailedInfo = await this.extractDetailedDeploymentInfo();

          return {
            found: true,
            deployment: featureBranchDeployment,
            details: detailedInfo,
            extractedAt: new Date().toISOString()
          };
        }
      }

      console.log('❌ Feature branch deployment not found in dashboard');
      return {
        found: false,
        allDeployments: deployments,
        extractedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Failed to extract deployment info:', error.message);
      throw error;
    }
  }

  /**
   * 🔍 Extract detailed deployment information
   */
  async extractDetailedDeploymentInfo() {
    try {
      const details = await this.page.evaluate(() => {
        const result = {
          status: 'unknown',
          url: '',
          logs: [],
          buildTime: '',
          error: ''
        };

        // Look for status indicators
        const statusElements = document.querySelectorAll('[data-testid*="status"], [class*="status"], [class*="badge"]');
        statusElements.forEach(el => {
          const text = el.textContent?.toLowerCase() || '';
          if (text.includes('success') || text.includes('ready')) {
            result.status = 'success';
          } else if (text.includes('fail') || text.includes('error')) {
            result.status = 'failed';
          } else if (text.includes('building') || text.includes('progress')) {
            result.status = 'building';
          }
        });

        // Look for deployment URL
        const urlElements = document.querySelectorAll('a[href*="vercel.app"], [data-testid*="url"]');
        urlElements.forEach(el => {
          const href = el.href || el.textContent;
          if (href && href.includes('vercel.app') && !result.url) {
            result.url = href;
          }
        });

        // Look for error messages
        const errorElements = document.querySelectorAll('[class*="error"], [data-testid*="error"], .text-red');
        errorElements.forEach(el => {
          if (el.textContent && el.textContent.length > 10) {
            result.error += el.textContent + ' ';
          }
        });

        // Look for build logs
        const logElements = document.querySelectorAll('[class*="log"], [data-testid*="log"], pre, code');
        logElements.forEach((el, index) => {
          if (index < 5 && el.textContent && el.textContent.length > 20) {
            result.logs.push(el.textContent.substring(0, 200));
          }
        });

        return result;
      });

      console.log(`📊 Deployment Status: ${details.status}`);
      if (details.url) {
        console.log(`🔗 Deployment URL: ${details.url}`);
      }
      if (details.error) {
        console.log(`❌ Error: ${details.error.substring(0, 100)}...`);
      }

      return details;
    } catch (error) {
      console.error('❌ Failed to extract detailed info:', error.message);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * 🧹 Cleanup browser resources
   */
  async cleanup() {
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      console.error('❌ Cleanup error:', error.message);
    }
  }

  /**
   * 🤖 Main comprehensive verification function
   */
  async comprehensiveDeploymentVerification() {
    let browserResult = null;

    try {
      console.log('🤖 COMPREHENSIVE DEPLOYMENT VERIFICATION STARTED');
      console.log('=================================================\n');

      console.log('📡 PHASE 1: GitHub API Automation (Primary)');
      console.log('--------------------------------------------');

      // Step 1: Get latest deployment via GitHub API
      const deployment = await this.getLatestDeployment();

      // Step 2: Get deployment status
      const status = await this.getDeploymentStatus(deployment.id);

      // Step 3: Analyze GitHub API results
      const githubResult = await this.analyzeGitHubResults(deployment, status);

      // If GitHub API provides complete information, return it
      if (githubResult.success && githubResult.url) {
        console.log('\n✅ PRIMARY SOLUTION SUCCESSFUL - GitHub API provided complete data');
        return githubResult;
      }

      console.log('\n🌐 PHASE 2: Browser Automation Fallback');
      console.log('---------------------------------------');

      // Step 4: Try browser automation fallback
      const browserConnected = await this.connectToExistingBrowser();

      if (browserConnected) {
        try {
          browserResult = await this.extractVercelDeploymentData();

          if (browserResult.found && browserResult.details.url) {
            console.log('\n✅ FALLBACK SOLUTION SUCCESSFUL - Browser automation provided deployment URL');

            // Combine GitHub and browser data
            return {
              success: true,
              method: 'browser_fallback',
              url: browserResult.details.url,
              status: browserResult.details.status,
              githubData: githubResult,
              browserData: browserResult,
              deployment,
              combinedAnalysis: this.combineAnalysis(githubResult, browserResult)
            };
          }
        } catch (browserError) {
          console.error('❌ Browser automation failed:', browserError.message);
        }
      }

      console.log('\n⚠️  PARTIAL SUCCESS - Using available data');

      // Return partial results with recommendations
      return {
        success: false,
        method: 'partial',
        githubData: githubResult,
        browserData: browserResult,
        deployment,
        recommendations: this.generateRecommendations(githubResult, browserResult)
      };

    } catch (error) {
      console.error('\n💥 COMPREHENSIVE VERIFICATION FAILED:', error.message);
      return {
        success: false,
        error: error.message,
        githubData: null,
        browserData: browserResult
      };
    } finally {
      // Always cleanup browser resources
      await this.cleanup();
    }
  }

  /**
   * 📊 Analyze GitHub API results
   */
  async analyzeGitHubResults(deployment, status) {
    if (status.state === 'success') {
      console.log('✅ GitHub API: Deployment successful');
      return {
        success: true,
        method: 'github_api',
        url: status.target_url,
        deployment,
        status
      };
    } else if (status.state === 'failure') {
      console.log('❌ GitHub API: Deployment failed');
      const analysis = this.analyzeFailure(status, deployment);
      const possibleUrls = this.generateDeploymentURLs(deployment);

      return {
        success: false,
        method: 'github_api',
        analysis,
        possibleUrls,
        deployment,
        status
      };
    } else {
      console.log(`⏳ GitHub API: Deployment in progress (${status.state})`);
      return {
        success: false,
        method: 'github_api',
        inProgress: true,
        status: status.state,
        deployment,
        status
      };
    }
  }

  /**
   * 🔗 Combine analysis from both methods
   */
  combineAnalysis(githubResult, browserResult) {
    return {
      github_status: githubResult.status?.state || 'unknown',
      browser_status: browserResult?.details?.status || 'unknown',
      deployment_url: browserResult?.details?.url || githubResult.url || null,
      error_sources: {
        github: githubResult.analysis?.description || null,
        browser: browserResult?.details?.error || null
      },
      confidence_level: browserResult?.found ? 'high' : 'medium'
    };
  }

  /**
   * 💡 Generate recommendations based on available data
   */
  generateRecommendations(githubResult, browserResult) {
    const recommendations = [];

    if (!browserResult || !browserResult.found) {
      recommendations.push('🔐 Ensure you are logged into Vercel in your browser');
      recommendations.push('🌐 Try accessing Vercel dashboard manually first');
      recommendations.push('🔄 Refresh the Vercel deployments page');
    }

    if (githubResult.analysis) {
      recommendations.push('🔧 Fix deployment issues identified by GitHub API');
      recommendations.push('📝 Check Vercel build logs for specific errors');
    }

    if (githubResult.possibleUrls) {
      recommendations.push('🔗 Try testing the generated deployment URLs manually');
    }

    recommendations.push('⚡ Add missing environment variables in Vercel project settings');
    recommendations.push('🔄 Trigger a new deployment after fixing issues');

    return recommendations;
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const verifier = new ComprehensiveDeploymentVerifier();

  verifier.comprehensiveDeploymentVerification()
    .then(result => {
      console.log('\n📊 COMPREHENSIVE VERIFICATION RESULT:');
      console.log('=====================================');
      console.log(JSON.stringify(result, null, 2));

      if (result.success) {
        console.log('\n🎉 SUCCESS! Deployment verification completed');
        if (result.url) {
          console.log(`🔗 Deployment URL: ${result.url}`);
          console.log(`📊 Method: ${result.method}`);
        }
      } else {
        console.log('\n⚠️  PARTIAL SUCCESS - See recommendations below');

        if (result.recommendations) {
          console.log('\n💡 RECOMMENDATIONS:');
          result.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
          });
        }

        if (result.githubData?.possibleUrls) {
          console.log('\n🔗 POSSIBLE DEPLOYMENT URLS TO TEST:');
          result.githubData.possibleUrls.forEach((url, index) => {
            console.log(`   ${index + 1}. ${url}`);
          });
        }
      }

      console.log('\n🔧 NEXT STEPS:');
      if (result.success) {
        console.log('1. ✅ Test the deployment URL');
        console.log('2. ✅ Validate MCP endpoints');
        console.log('3. ✅ Create Pull Request');
      } else {
        console.log('1. 🔧 Follow the recommendations above');
        console.log('2. 🔄 Fix any identified issues');
        console.log('3. 🚀 Trigger new deployment');
        console.log('4. 🔄 Run this script again');
      }
    })
    .catch(error => {
      console.error('💥 Comprehensive verification failed:', error);
      process.exit(1);
    });
}

module.exports = ComprehensiveDeploymentVerifier;
