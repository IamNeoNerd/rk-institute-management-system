#!/usr/bin/env node

/**
 * 🔍 Deployment Discrepancy Analyzer
 * 
 * Analyzes GitHub API vs Vercel deployment discrepancies
 * Created to investigate RK-16: GitHub API vs Vercel Synchronization Issue
 */

const https = require('https');

class DeploymentDiscrepancyAnalyzer {
  constructor() {
    this.baseUrl = 'https://rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app';
    this.githubRepo = 'IamNeoNerd/rk-institute-management-system';
  }

  /**
   * 🌐 Make HTTP request with error handling
   */
  async makeRequest(url, method = 'GET', data = null, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.protocol === 'https:' ? 443 : 80,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'User-Agent': 'Deployment-Discrepancy-Analyzer/1.0'
        },
        timeout
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = (urlObj.protocol === 'https:' ? https : require('http')).request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
            url: url
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  /**
   * 📋 Get GitHub deployments
   */
  async getGitHubDeployments(limit = 5) {
    try {
      const response = await this.makeRequest(
        `https://api.github.com/repos/${this.githubRepo}/deployments?per_page=${limit}`
      );
      
      if (response.statusCode === 200) {
        return JSON.parse(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching GitHub deployments:', error.message);
      return null;
    }
  }

  /**
   * 📊 Get deployment status
   */
  async getDeploymentStatus(deploymentId) {
    try {
      const response = await this.makeRequest(
        `https://api.github.com/repos/${this.githubRepo}/deployments/${deploymentId}/statuses`
      );
      
      if (response.statusCode === 200) {
        const statuses = JSON.parse(response.data);
        return statuses.length > 0 ? statuses[0] : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching deployment status:', error.message);
      return null;
    }
  }

  /**
   * 🧪 Test Vercel endpoint functionality
   */
  async testVercelEndpoint(endpoint) {
    try {
      const response = await this.makeRequest(`${this.baseUrl}${endpoint}`, 'GET', null, 5000);
      
      const isJson = response.headers['content-type']?.includes('application/json');
      const isHtml = response.headers['content-type']?.includes('text/html');
      
      let responseType = 'unknown';
      let isWorking = false;
      let content = null;
      
      if (isJson) {
        responseType = 'json';
        isWorking = response.statusCode === 200;
        try {
          content = JSON.parse(response.data);
        } catch (e) {
          content = 'Invalid JSON';
        }
      } else if (isHtml) {
        responseType = 'html';
        isWorking = false; // HTML response indicates deployment failure
        content = response.data.substring(0, 200) + '...';
      }
      
      return {
        endpoint,
        statusCode: response.statusCode,
        responseType,
        isWorking,
        content,
        headers: response.headers
      };
    } catch (error) {
      return {
        endpoint,
        statusCode: 0,
        responseType: 'error',
        isWorking: false,
        content: error.message,
        headers: {}
      };
    }
  }

  /**
   * 🔍 Analyze deployment discrepancy
   */
  async analyzeDiscrepancy() {
    console.log('🔍 DEPLOYMENT DISCREPANCY ANALYSIS');
    console.log('==================================');
    console.log(`Repository: ${this.githubRepo}`);
    console.log(`Vercel URL: ${this.baseUrl}`);
    console.log(`Analysis Time: ${new Date().toLocaleString()}\n`);

    // Step 1: Get GitHub deployments
    console.log('📋 STEP 1: GITHUB API ANALYSIS');
    console.log('==============================');
    
    const deployments = await this.getGitHubDeployments(3);
    
    if (!deployments) {
      console.log('❌ Failed to fetch GitHub deployments');
      return;
    }
    
    console.log(`Found ${deployments.length} recent deployments:\n`);
    
    const deploymentAnalysis = [];
    
    for (let i = 0; i < deployments.length; i++) {
      const deployment = deployments[i];
      const status = await this.getDeploymentStatus(deployment.id);
      
      const analysis = {
        rank: i + 1,
        id: deployment.id,
        sha: deployment.sha,
        shortSha: deployment.sha.substring(0, 8),
        environment: deployment.environment,
        createdAt: deployment.created_at,
        creator: deployment.creator.login,
        status: status ? {
          state: status.state,
          description: status.description,
          createdAt: status.created_at
        } : null
      };
      
      deploymentAnalysis.push(analysis);
      
      console.log(`${i + 1}. Deployment ID: ${deployment.id}`);
      console.log(`   Commit: ${analysis.shortSha} (${deployment.sha})`);
      console.log(`   Environment: ${deployment.environment}`);
      console.log(`   Created: ${deployment.created_at}`);
      console.log(`   Creator: ${deployment.creator.login}`);
      if (status) {
        console.log(`   Status: ${status.state} - ${status.description}`);
        console.log(`   Status Updated: ${status.created_at}`);
      } else {
        console.log(`   Status: No status available`);
      }
      console.log('');
    }

    // Step 2: Test Vercel endpoints
    console.log('🧪 STEP 2: VERCEL ENDPOINT TESTING');
    console.log('==================================');
    
    const endpoints = ['/api/test', '/api/health-simple', '/api/mcp'];
    const endpointResults = [];
    
    for (const endpoint of endpoints) {
      const result = await this.testVercelEndpoint(endpoint);
      endpointResults.push(result);
      
      const status = result.isWorking ? '✅' : '❌';
      console.log(`${status} ${endpoint}:`);
      console.log(`   Status: ${result.statusCode}`);
      console.log(`   Type: ${result.responseType}`);
      console.log(`   Working: ${result.isWorking}`);
      if (result.content && typeof result.content === 'string') {
        console.log(`   Content: ${result.content.substring(0, 100)}...`);
      } else if (result.content) {
        console.log(`   Content: ${JSON.stringify(result.content).substring(0, 100)}...`);
      }
      console.log('');
    }

    // Step 3: Discrepancy analysis
    console.log('🎯 STEP 3: DISCREPANCY ANALYSIS');
    console.log('===============================');
    
    const latestDeployment = deploymentAnalysis[0];
    const workingEndpoints = endpointResults.filter(r => r.isWorking).length;
    const totalEndpoints = endpointResults.length;
    
    console.log(`Latest GitHub Deployment:`);
    console.log(`  ID: ${latestDeployment.id}`);
    console.log(`  Commit: ${latestDeployment.shortSha}`);
    console.log(`  Status: ${latestDeployment.status?.state || 'Unknown'}`);
    console.log(`  Description: ${latestDeployment.status?.description || 'No description'}`);
    console.log('');
    
    console.log(`Vercel Endpoint Status:`);
    console.log(`  Working endpoints: ${workingEndpoints}/${totalEndpoints}`);
    console.log(`  Success rate: ${Math.round((workingEndpoints/totalEndpoints) * 100)}%`);
    console.log('');
    
    // Determine discrepancy type
    const githubSuccess = latestDeployment.status?.state === 'success';
    const vercelWorking = workingEndpoints > 0;
    
    let discrepancyType = 'none';
    let discrepancyDescription = '';
    
    if (githubSuccess && !vercelWorking) {
      discrepancyType = 'github_success_vercel_failed';
      discrepancyDescription = 'GitHub API reports successful deployment but Vercel endpoints are not working';
    } else if (!githubSuccess && vercelWorking) {
      discrepancyType = 'github_failed_vercel_working';
      discrepancyDescription = 'GitHub API reports failed deployment but Vercel endpoints are working';
    } else if (!githubSuccess && !vercelWorking) {
      discrepancyType = 'both_failed';
      discrepancyDescription = 'Both GitHub API and Vercel endpoints indicate deployment failure';
    } else if (githubSuccess && vercelWorking) {
      discrepancyType = 'both_success';
      discrepancyDescription = 'Both GitHub API and Vercel endpoints indicate successful deployment';
    }
    
    console.log(`📊 DISCREPANCY ANALYSIS RESULTS:`);
    console.log(`================================`);
    console.log(`Type: ${discrepancyType}`);
    console.log(`Description: ${discrepancyDescription}`);
    console.log('');
    
    // Step 4: Recommendations
    console.log('💡 RECOMMENDATIONS:');
    console.log('===================');
    
    switch (discrepancyType) {
      case 'github_success_vercel_failed':
        console.log('1. Check Vercel build logs for deployment failures');
        console.log('2. Verify environment variables are properly configured');
        console.log('3. Check for build process errors not reflected in GitHub API');
        console.log('4. Consider GitHub-Vercel webhook synchronization issues');
        break;
        
      case 'github_failed_vercel_working':
        console.log('1. GitHub API may be reporting outdated status');
        console.log('2. Check if there are newer deployments not visible in API');
        console.log('3. Verify GitHub-Vercel integration configuration');
        break;
        
      case 'both_failed':
        console.log('1. Deployment genuinely failed - check build logs');
        console.log('2. Fix deployment issues and retry');
        break;
        
      case 'both_success':
        console.log('1. No discrepancy detected - monitoring system working correctly');
        console.log('2. Consider this a successful deployment');
        break;
    }
    
    return {
      deploymentAnalysis,
      endpointResults,
      discrepancyType,
      discrepancyDescription,
      summary: {
        latestDeployment: latestDeployment,
        githubSuccess,
        vercelWorking,
        workingEndpoints,
        totalEndpoints
      }
    };
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const analyzer = new DeploymentDiscrepancyAnalyzer();
  
  analyzer.analyzeDiscrepancy()
    .then(result => {
      if (result) {
        console.log('\n🎯 ANALYSIS COMPLETE');
        console.log(`Discrepancy Type: ${result.discrepancyType}`);
        console.log(`GitHub Success: ${result.summary.githubSuccess}`);
        console.log(`Vercel Working: ${result.summary.vercelWorking}`);
      }
    })
    .catch(error => {
      console.error('💥 Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentDiscrepancyAnalyzer;
