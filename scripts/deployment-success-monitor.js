#!/usr/bin/env node

/**
 * 🎯 Enhanced Deployment Success Monitor
 * 
 * Monitors for new deployment after environment variable configuration
 * Provides real-time updates and success verification
 */

const https = require('https');

class DeploymentSuccessMonitor {
  constructor() {
    this.lastKnownDeploymentId = '2677451686'; // The failed deployment
    this.checkInterval = 10000; // 10 seconds
    this.maxWaitTime = 300000; // 5 minutes
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
   * 🔍 Check for new deployments
   */
  async checkForNewDeployment() {
    try {
      const deployments = await this.makeGitHubRequest(
        '/repos/IamNeoNerd/rk-institute-management-system/deployments?per_page=3'
      );

      if (deployments.length === 0) {
        return null;
      }

      const latestDeployment = deployments[0];
      
      // Check if this is a new deployment
      if (latestDeployment.id.toString() !== this.lastKnownDeploymentId) {
        console.log(`\n🚀 NEW DEPLOYMENT DETECTED!`);
        console.log(`📅 ID: ${latestDeployment.id}`);
        console.log(`🌿 Ref: ${latestDeployment.ref}`);
        console.log(`🌍 Environment: ${latestDeployment.environment}`);
        console.log(`⏰ Created: ${latestDeployment.created_at}`);
        
        return latestDeployment;
      }

      return null;
    } catch (error) {
      console.error('❌ Error checking deployments:', error.message);
      return null;
    }
  }

  /**
   * 📊 Get deployment status
   */
  async getDeploymentStatus(deploymentId) {
    try {
      const statuses = await this.makeGitHubRequest(
        `/repos/IamNeoNerd/rk-institute-management-system/deployments/${deploymentId}/statuses`
      );

      if (statuses.length === 0) {
        return { state: 'pending', description: 'No status available' };
      }

      const latestStatus = statuses[0];
      
      console.log(`📊 Status: ${latestStatus.state}`);
      console.log(`📝 Description: ${latestStatus.description}`);
      
      if (latestStatus.target_url) {
        console.log(`🔗 URL: ${latestStatus.target_url}`);
      }

      return latestStatus;
    } catch (error) {
      console.error('❌ Error getting status:', error.message);
      return { state: 'error', description: error.message };
    }
  }

  /**
   * 🎯 Generate test URLs for MCP endpoints
   */
  generateMCPTestUrls(deploymentUrl) {
    if (!deploymentUrl) return [];

    const baseUrl = deploymentUrl.replace(/\/$/, '');
    
    return [
      `${baseUrl}/api/mcp`,
      `${baseUrl}/api/health`,
      `${baseUrl}/test-mobile-cards`,
      `${baseUrl}/api/auth/status`
    ];
  }

  /**
   * 🎉 Handle successful deployment
   */
  handleSuccessfulDeployment(deployment, status) {
    console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('========================');
    
    if (status.target_url) {
      console.log(`🔗 Preview URL: ${status.target_url}`);
      
      const testUrls = this.generateMCPTestUrls(status.target_url);
      console.log('\n🧪 MCP ENDPOINT TESTING READY:');
      testUrls.forEach((url, index) => {
        console.log(`   ${index + 1}. ${url}`);
      });
      
      console.log('\n✅ PHASE 2 COMPLETE - DEPLOYMENT SUCCESS');
      console.log('🚀 Ready for Phase 3: MCP Endpoint Testing');
      
      return {
        success: true,
        previewUrl: status.target_url,
        testUrls: testUrls,
        deploymentId: deployment.id
      };
    }
    
    return { success: true, deploymentId: deployment.id };
  }

  /**
   * ❌ Handle failed deployment
   */
  handleFailedDeployment(deployment, status) {
    console.log('\n❌ DEPLOYMENT FAILED!');
    console.log('====================');
    console.log(`📝 Reason: ${status.description}`);
    
    console.log('\n💡 TROUBLESHOOTING STEPS:');
    console.log('   1. Check Vercel build logs for specific errors');
    console.log('   2. Verify all environment variables are correctly set');
    console.log('   3. Test database connectivity');
    console.log('   4. Review application startup logs');
    
    return {
      success: false,
      error: status.description,
      deploymentId: deployment.id
    };
  }

  /**
   * 🤖 Start monitoring
   */
  async startMonitoring() {
    console.log('🤖 DEPLOYMENT SUCCESS MONITOR STARTED');
    console.log('=====================================');
    console.log('🔍 Monitoring for new deployment after environment variable configuration...');
    console.log(`⏱️  Checking every ${this.checkInterval / 1000} seconds`);
    console.log(`⏰ Max wait time: ${this.maxWaitTime / 1000} seconds\n`);

    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const elapsed = Date.now() - this.startTime;
        
        // Check for timeout
        if (elapsed > this.maxWaitTime) {
          console.log('\n⏰ TIMEOUT REACHED');
          console.log('No new deployment detected within 5 minutes');
          console.log('💡 Environment variables may not have triggered auto-deployment');
          clearInterval(interval);
          resolve({ success: false, error: 'Timeout waiting for deployment' });
          return;
        }

        // Check for new deployment
        const newDeployment = await this.checkForNewDeployment();
        
        if (newDeployment) {
          console.log('\n⏳ Checking deployment status...');
          
          // Wait a moment for status to be available
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const status = await this.getDeploymentStatus(newDeployment.id);
          
          if (status.state === 'success') {
            const result = this.handleSuccessfulDeployment(newDeployment, status);
            clearInterval(interval);
            resolve(result);
          } else if (status.state === 'failure') {
            const result = this.handleFailedDeployment(newDeployment, status);
            clearInterval(interval);
            resolve(result);
          } else {
            console.log(`⏳ Deployment in progress (${status.state})...`);
            // Continue monitoring for status changes
          }
        } else {
          // Show progress indicator
          const minutes = Math.floor(elapsed / 60000);
          const seconds = Math.floor((elapsed % 60000) / 1000);
          process.stdout.write(`\r🔍 Waiting for deployment... ${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, this.checkInterval);

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n\n🛑 Monitoring stopped by user');
        clearInterval(interval);
        resolve({ success: false, error: 'Stopped by user' });
      });
    });
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const monitor = new DeploymentSuccessMonitor();
  
  monitor.startMonitoring()
    .then(result => {
      console.log('\n📊 MONITORING RESULT:');
      console.log('====================');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\n🎉 MCP AUTONOMOUS DEPLOYMENT VERIFICATION READY!');
      } else {
        console.log('\n❌ Deployment monitoring completed with issues');
      }
    })
    .catch(error => {
      console.error('💥 Monitor failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentSuccessMonitor;
