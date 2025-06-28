#!/usr/bin/env node

/**
 * ⏳ Enhanced Deployment Countdown Monitor
 * 
 * Provides visual countdown timer with automatic deployment verification
 * Implements 2-minute waiting period with progress updates every 10-15 seconds
 */

const https = require('https');

class DeploymentCountdownMonitor {
  constructor() {
    this.waitDuration = 120000; // 2 minutes in milliseconds
    this.updateInterval = 10000; // 10 seconds
    this.lastKnownDeploymentId = '2677451686'; // Previous failed deployment
    this.startTime = Date.now();
  }

  /**
   * 🌐 Make GitHub API request
   */
  async makeGitHubRequest(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        port: 443,
        path: path,
        method: 'GET',
        headers: {
          'User-Agent': 'MCP-Deployment-Monitor/1.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * ⏰ Format time remaining
   */
  formatTimeRemaining(milliseconds) {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 📊 Display countdown progress bar
   */
  getProgressBar(elapsed, total, width = 30) {
    const progress = Math.min(elapsed / total, 1);
    const filled = Math.floor(progress * width);
    const empty = width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percentage = Math.floor(progress * 100);
    
    return `[${bar}] ${percentage}%`;
  }

  /**
   * ⏳ Enhanced countdown timer with visual feedback
   */
  async startCountdownTimer() {
    console.log('⏳ DEPLOYMENT COUNTDOWN TIMER STARTED');
    console.log('====================================');
    console.log('🚀 Vercel deployment detected in progress');
    console.log('⏱️  Waiting 2 minutes for build completion...');
    console.log('🔄 Updates every 10 seconds\n');

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.waitDuration - elapsed);
        
        if (remaining <= 0) {
          console.log('\n✅ COUNTDOWN COMPLETE!');
          console.log('🔍 Proceeding to deployment verification...\n');
          clearInterval(interval);
          resolve();
          return;
        }

        // Clear previous line and show updated countdown
        process.stdout.write('\r\x1b[K'); // Clear line
        
        const timeRemaining = this.formatTimeRemaining(remaining);
        const progressBar = this.getProgressBar(elapsed, this.waitDuration);
        const elapsedSeconds = Math.floor(elapsed / 1000);
        
        // Enhanced visual display
        const status = `⏳ Waiting ${timeRemaining} remaining... ${progressBar} (${elapsedSeconds}s elapsed)`;
        process.stdout.write(status);
        
        // Show milestone messages
        if (elapsed >= 60000 && elapsed < 70000) {
          console.log('\n💡 Halfway through build process...');
        } else if (elapsed >= 100000 && elapsed < 110000) {
          console.log('\n🔧 Build should be completing soon...');
        }
        
      }, this.updateInterval);

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n\n🛑 Countdown stopped by user');
        clearInterval(interval);
        resolve();
      });
    });
  }

  /**
   * 🔍 Check for new deployment
   */
  async checkForNewDeployment() {
    try {
      console.log('🔍 Checking for new deployment...');
      
      const deployments = await this.makeGitHubRequest(
        '/repos/IamNeoNerd/rk-institute-management-system/deployments?per_page=3'
      );

      if (deployments.length === 0) {
        return { found: false, message: 'No deployments found' };
      }

      const latestDeployment = deployments[0];
      
      // Check if this is a new deployment
      if (latestDeployment.id.toString() !== this.lastKnownDeploymentId) {
        console.log('🎉 NEW DEPLOYMENT DETECTED!');
        console.log(`📅 ID: ${latestDeployment.id}`);
        console.log(`🌿 Ref: ${latestDeployment.ref}`);
        console.log(`🌍 Environment: ${latestDeployment.environment}`);
        console.log(`⏰ Created: ${latestDeployment.created_at}`);
        
        return { 
          found: true, 
          deployment: latestDeployment,
          isNew: true
        };
      } else {
        console.log('ℹ️  No new deployment detected yet');
        return { 
          found: true, 
          deployment: latestDeployment,
          isNew: false,
          message: 'Still waiting for new deployment to appear in GitHub API'
        };
      }

    } catch (error) {
      console.error('❌ Error checking deployments:', error.message);
      return { found: false, error: error.message };
    }
  }

  /**
   * 📊 Get deployment status with detailed information
   */
  async getDeploymentStatus(deploymentId) {
    try {
      console.log(`📊 Checking status for deployment ${deploymentId}...`);
      
      const statuses = await this.makeGitHubRequest(
        `/repos/IamNeoNerd/rk-institute-management-system/deployments/${deploymentId}/statuses`
      );

      if (statuses.length === 0) {
        return { 
          state: 'pending', 
          description: 'No status available - deployment may still be initializing',
          target_url: null
        };
      }

      const latestStatus = statuses[0];
      
      console.log(`📊 Status: ${latestStatus.state}`);
      console.log(`📝 Description: ${latestStatus.description}`);
      
      if (latestStatus.target_url) {
        console.log(`🔗 URL: ${latestStatus.target_url}`);
      }

      return latestStatus;
    } catch (error) {
      console.error('❌ Error getting deployment status:', error.message);
      return { 
        state: 'error', 
        description: error.message,
        target_url: null
      };
    }
  }

  /**
   * 🧪 Generate MCP test URLs
   */
  generateMCPTestUrls(baseUrl) {
    if (!baseUrl) return [];

    const cleanUrl = baseUrl.replace(/\/$/, '');
    
    return [
      `${cleanUrl}/api/mcp`,
      `${cleanUrl}/api/health`,
      `${cleanUrl}/test-mobile-cards`,
      `${cleanUrl}/api/auth/status`
    ];
  }

  /**
   * 🎯 Handle successful deployment
   */
  handleSuccessfulDeployment(deployment, status) {
    console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('========================');
    console.log(`✅ Environment variables resolved the deployment issues!`);
    
    if (status.target_url) {
      console.log(`🔗 Preview URL: ${status.target_url}`);
      
      const testUrls = this.generateMCPTestUrls(status.target_url);
      console.log('\n🧪 MCP ENDPOINT TESTING READY:');
      testUrls.forEach((url, index) => {
        console.log(`   ${index + 1}. ${url}`);
      });
      
      console.log('\n🚀 PHASE 3: MCP ENDPOINT TESTING');
      console.log('================================');
      console.log('✅ Environment variable configuration successful');
      console.log('✅ Deployment completed without errors');
      console.log('🔄 Ready for comprehensive MCP endpoint validation');
      
      return {
        success: true,
        previewUrl: status.target_url,
        testUrls: testUrls,
        deploymentId: deployment.id,
        phase: 'testing_ready'
      };
    }
    
    return { 
      success: true, 
      deploymentId: deployment.id,
      phase: 'success_no_url'
    };
  }

  /**
   * ⏳ Handle deployment still in progress
   */
  handleDeploymentInProgress(deployment, status) {
    console.log('\n⏳ DEPLOYMENT STILL IN PROGRESS');
    console.log('===============================');
    console.log(`📊 Current Status: ${status.state}`);
    console.log(`📝 Description: ${status.description}`);
    console.log('🔄 Continuing to monitor until completion...');
    
    return {
      success: false,
      inProgress: true,
      deploymentId: deployment.id,
      status: status.state,
      message: 'Deployment build in progress'
    };
  }

  /**
   * ❌ Handle deployment failure
   */
  handleDeploymentFailure(deployment, status) {
    console.log('\n❌ DEPLOYMENT FAILED');
    console.log('===================');
    console.log(`📝 Reason: ${status.description}`);
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('   1. Check Vercel build logs for specific errors');
    console.log('   2. Verify environment variables are correctly formatted');
    console.log('   3. Review application startup sequence');
    
    return {
      success: false,
      failed: true,
      error: status.description,
      deploymentId: deployment.id
    };
  }

  /**
   * 🚀 Main execution flow
   */
  async executeCountdownAndVerification() {
    try {
      console.log('🚀 ENHANCED DEPLOYMENT COUNTDOWN & VERIFICATION');
      console.log('===============================================\n');

      // Step 1: 2-minute countdown timer
      await this.startCountdownTimer();

      // Step 2: Check for new deployment
      const deploymentCheck = await this.checkForNewDeployment();
      
      if (!deploymentCheck.found) {
        console.log('⚠️  No deployment found after countdown');
        console.log('💡 Deployment may still be initializing in Vercel');
        return { 
          success: false, 
          error: 'No deployment detected',
          recommendation: 'Check Vercel dashboard manually'
        };
      }

      if (!deploymentCheck.isNew) {
        console.log('ℹ️  New deployment not yet visible in GitHub API');
        console.log('⏳ This is normal - Vercel deployments can take 3-5 minutes to appear');
        return {
          success: false,
          waiting: true,
          message: 'Deployment in progress but not yet visible in GitHub API'
        };
      }

      // Step 3: Get deployment status
      const status = await this.getDeploymentStatus(deploymentCheck.deployment.id);

      // Step 4: Handle different deployment states
      if (status.state === 'success') {
        return this.handleSuccessfulDeployment(deploymentCheck.deployment, status);
      } else if (status.state === 'pending' || status.state === 'in_progress') {
        return this.handleDeploymentInProgress(deploymentCheck.deployment, status);
      } else if (status.state === 'failure') {
        return this.handleDeploymentFailure(deploymentCheck.deployment, status);
      } else {
        console.log(`🔍 Unknown deployment state: ${status.state}`);
        return {
          success: false,
          unknown: true,
          state: status.state,
          description: status.description
        };
      }

    } catch (error) {
      console.error('💥 Countdown and verification failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const monitor = new DeploymentCountdownMonitor();
  
  monitor.executeCountdownAndVerification()
    .then(result => {
      console.log('\n📊 FINAL VERIFICATION RESULT:');
      console.log('=============================');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\n🎉 DEPLOYMENT VERIFICATION COMPLETE!');
        console.log('🚀 Ready for MCP endpoint testing');
      } else if (result.inProgress) {
        console.log('\n⏳ Deployment still building - continue monitoring');
      } else if (result.waiting) {
        console.log('\n⏱️  Deployment in progress - check again in 2-3 minutes');
      } else {
        console.log('\n❌ Verification completed with issues');
      }
    })
    .catch(error => {
      console.error('💥 Monitor execution failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentCountdownMonitor;
