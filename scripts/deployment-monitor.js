#!/usr/bin/env node

/**
 * 🔍 Real-time Deployment Monitor
 * 
 * Continuously monitors deployment status and provides real-time updates
 * Part of the MCP autonomous deployment verification strategy
 */

const { Octokit } = require('@octokit/rest');

class DeploymentMonitor {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || 'your_github_token_here'
    });
    
    this.repo = {
      owner: 'IamNeoNerd',
      repo: 'rk-institute-management-system'
    };

    this.lastDeploymentId = null;
    this.monitoringActive = false;
  }

  /**
   * 🔍 Check for new deployments
   */
  async checkForNewDeployments() {
    try {
      const { data: deployments } = await this.octokit.rest.repos.listDeployments({
        ...this.repo,
        per_page: 1
      });

      if (deployments.length === 0) {
        return null;
      }

      const latestDeployment = deployments[0];
      
      // Check if this is a new deployment
      if (this.lastDeploymentId !== latestDeployment.id) {
        this.lastDeploymentId = latestDeployment.id;
        
        console.log(`\n🚀 NEW DEPLOYMENT DETECTED!`);
        console.log(`📅 ID: ${latestDeployment.id}`);
        console.log(`🌿 Ref: ${latestDeployment.ref}`);
        console.log(`🌍 Environment: ${latestDeployment.environment}`);
        console.log(`⏰ Created: ${latestDeployment.created_at}`);
        
        // Get deployment status
        const status = await this.getDeploymentStatus(latestDeployment.id);
        return { deployment: latestDeployment, status };
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
      const { data: statuses } = await this.octokit.rest.repos.listDeploymentStatuses({
        ...this.repo,
        deployment_id: deploymentId
      });

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
   * 🎯 Generate deployment URLs for testing
   */
  generateTestUrls(deployment) {
    const baseUrl = 'rk-institute-management-system';
    const shortSha = deployment.sha ? deployment.sha.substring(0, 8) : 'unknown';
    
    const patterns = [
      `https://${baseUrl}-git-feature-mcp-autonomous-deployment-iamneonerd.vercel.app`,
      `https://${baseUrl}-feature-mcp-autonomous-deployment.vercel.app`,
      `https://${baseUrl}-${shortSha}.vercel.app`,
      `https://${baseUrl}-git-${deployment.ref}-iamneonerd.vercel.app`
    ];

    console.log('\n🔗 POSSIBLE DEPLOYMENT URLS:');
    patterns.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });

    return patterns;
  }

  /**
   * 🤖 Start continuous monitoring
   */
  async startMonitoring(intervalSeconds = 30) {
    console.log('🤖 DEPLOYMENT MONITOR STARTED');
    console.log('============================');
    console.log(`⏱️  Checking every ${intervalSeconds} seconds`);
    console.log('🔍 Monitoring for new deployments...\n');

    this.monitoringActive = true;

    // Initial check
    const initialResult = await this.checkForNewDeployments();
    if (initialResult) {
      this.handleNewDeployment(initialResult);
    } else {
      console.log('📋 No new deployments detected. Monitoring...');
    }

    // Set up interval monitoring
    const interval = setInterval(async () => {
      if (!this.monitoringActive) {
        clearInterval(interval);
        return;
      }

      const result = await this.checkForNewDeployments();
      if (result) {
        this.handleNewDeployment(result);
        
        // If deployment is successful, we can stop monitoring
        if (result.status.state === 'success') {
          console.log('\n🎉 DEPLOYMENT SUCCESSFUL! Stopping monitor.');
          this.stopMonitoring();
        } else if (result.status.state === 'failure') {
          console.log('\n❌ DEPLOYMENT FAILED! Stopping monitor.');
          this.stopMonitoring();
        }
      } else {
        process.stdout.write('.');
      }
    }, intervalSeconds * 1000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Monitoring stopped by user');
      this.stopMonitoring();
      process.exit(0);
    });
  }

  /**
   * 🎯 Handle new deployment detection
   */
  handleNewDeployment(result) {
    const { deployment, status } = result;
    
    if (status.state === 'success') {
      console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
      if (status.target_url) {
        console.log(`🔗 Deployment URL: ${status.target_url}`);
        console.log('\n🧪 READY FOR TESTING:');
        console.log(`   1. ${status.target_url}/api/mcp`);
        console.log(`   2. ${status.target_url}/api/health`);
        console.log(`   3. ${status.target_url}/test-mobile-cards`);
      }
    } else if (status.state === 'failure') {
      console.log('\n❌ DEPLOYMENT FAILED!');
      console.log(`📝 Reason: ${status.description}`);
      
      // Generate possible URLs for testing
      this.generateTestUrls(deployment);
      
      console.log('\n💡 TROUBLESHOOTING STEPS:');
      console.log('   1. Check Vercel build logs');
      console.log('   2. Verify environment variables');
      console.log('   3. Test database connectivity');
    } else if (status.state === 'pending' || status.state === 'in_progress') {
      console.log('\n⏳ DEPLOYMENT IN PROGRESS...');
      console.log('   Continuing to monitor...');
    }
  }

  /**
   * 🛑 Stop monitoring
   */
  stopMonitoring() {
    this.monitoringActive = false;
    console.log('\n🛑 Monitoring stopped');
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const monitor = new DeploymentMonitor();
  
  // Start monitoring with 15-second intervals
  monitor.startMonitoring(15)
    .catch(error => {
      console.error('💥 Monitor failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentMonitor;
