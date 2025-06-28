#!/usr/bin/env node

/**
 * 🚀 Enhanced MCP Deployment Monitor
 * 
 * Improved monitoring system with two-phase approach and multi-source detection
 * Based on comprehensive analysis of timing synchronization issues
 */

const https = require('https');

class EnhancedDeploymentMonitor {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app';
    this.githubRepo = options.githubRepo || 'IamNeoNerd/rk-institute-management-system';
    this.branch = options.branch || 'feature/mcp-autonomous-deployment';
    
    // Timing configuration based on research
    this.pushVerificationTimeout = 300000; // 5 minutes
    this.pushCheckInterval = 10000; // 10 seconds
    this.deploymentWindow = 180000; // 3 minutes (Vercel typical deployment time)
    this.deploymentCheckInterval = 15000; // 15 seconds
    
    // Detection methods
    this.detectionMethods = [
      'github_api',
      'functional_testing',
      'commit_verification'
    ];
    
    this.lastKnownCommit = null;
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
          'User-Agent': 'Enhanced-Deployment-Monitor/2.0'
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
   * 📋 Get latest commit from GitHub API
   */
  async getLatestCommit() {
    try {
      const response = await this.makeRequest(
        `https://api.github.com/repos/${this.githubRepo}/commits/${this.branch}`
      );
      
      if (response.statusCode === 200) {
        const commit = JSON.parse(response.data);
        return {
          sha: commit.sha,
          shortSha: commit.sha.substring(0, 8),
          message: commit.commit.message,
          timestamp: commit.commit.committer.date
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching latest commit:', error.message);
      return null;
    }
  }

  /**
   * ⏳ Phase 1: Wait for successful push completion
   */
  async waitForPushCompletion(expectedCommitSha) {
    console.log('📤 PHASE 1: PUSH VERIFICATION');
    console.log('============================');
    console.log(`Expected commit: ${expectedCommitSha}`);
    console.log(`Timeout: ${this.pushVerificationTimeout/1000} seconds\n`);

    const startTime = Date.now();
    let attempts = 0;
    
    while (Date.now() - startTime < this.pushVerificationTimeout) {
      attempts++;
      console.log(`🔍 Push verification attempt ${attempts} - ${new Date().toLocaleTimeString()}`);
      
      const latestCommit = await this.getLatestCommit();
      
      if (latestCommit) {
        console.log(`   Latest commit: ${latestCommit.shortSha} - ${latestCommit.message.split('\n')[0]}`);
        
        if (latestCommit.sha === expectedCommitSha || latestCommit.shortSha === expectedCommitSha.substring(0, 8)) {
          const elapsed = Date.now() - startTime;
          console.log(`✅ Push verified! Elapsed time: ${elapsed/1000} seconds\n`);
          
          this.lastKnownCommit = latestCommit;
          return { success: true, elapsed, commit: latestCommit };
        } else {
          console.log(`   ⏳ Waiting for expected commit...`);
        }
      } else {
        console.log(`   ❌ Failed to fetch commit info`);
      }
      
      await new Promise(resolve => setTimeout(resolve, this.pushCheckInterval));
    }
    
    console.log(`❌ Push verification timeout after ${this.pushVerificationTimeout/1000} seconds\n`);
    return { success: false, timeout: true };
  }

  /**
   * 🔍 Detection Method 1: GitHub API Deployments with Build Status
   */
  async checkGitHubDeployments(commitSha) {
    try {
      const response = await this.makeRequest(
        `https://api.github.com/repos/${this.githubRepo}/deployments?per_page=5`
      );

      if (response.statusCode === 200) {
        const deployments = JSON.parse(response.data);

        for (const deployment of deployments) {
          if (deployment.sha === commitSha || deployment.sha.startsWith(commitSha.substring(0, 8))) {
            // Check deployment status
            const statusResponse = await this.makeRequest(deployment.statuses_url);
            let buildStatus = 'unknown';
            let buildState = 'unknown';

            if (statusResponse.statusCode === 200) {
              const statuses = JSON.parse(statusResponse.data);
              if (statuses.length > 0) {
                const latestStatus = statuses[0];
                buildStatus = latestStatus.description || 'unknown';
                buildState = latestStatus.state; // success, error, failure, pending
              }
            }

            return {
              found: true,
              method: 'github_api',
              deploymentId: deployment.url.split('/').pop(),
              createdAt: deployment.created_at,
              sha: deployment.sha,
              buildStatus,
              buildState,
              buildSuccess: buildState === 'success'
            };
          }
        }
      }

      return { found: false, method: 'github_api' };
    } catch (error) {
      return { found: false, method: 'github_api', error: error.message };
    }
  }

  /**
   * 🧪 Detection Method 2: Functional Testing
   */
  async checkFunctionalTesting() {
    try {
      // Test multiple endpoints to verify deployment
      const endpoints = [
        '/api/test',
        '/api/health-simple',
        '/api/mcp'
      ];
      
      let workingEndpoints = 0;
      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.makeRequest(`${this.baseUrl}${endpoint}`, 'GET', null, 5000);
          const isJson = response.headers['content-type']?.includes('application/json');
          const isWorking = response.statusCode === 200 && isJson;
          
          if (isWorking) {
            workingEndpoints++;
            
            // Try to extract commit info from response
            try {
              const data = JSON.parse(response.data);
              if (data.commit) {
                results.push({ endpoint, working: true, commit: data.commit });
              } else {
                results.push({ endpoint, working: true });
              }
            } catch (e) {
              results.push({ endpoint, working: true });
            }
          } else {
            results.push({ endpoint, working: false, statusCode: response.statusCode });
          }
        } catch (error) {
          results.push({ endpoint, working: false, error: error.message });
        }
      }
      
      // Consider deployment found if majority of endpoints are working
      const threshold = Math.ceil(endpoints.length / 2);
      
      return {
        found: workingEndpoints >= threshold,
        method: 'functional_testing',
        workingEndpoints,
        totalEndpoints: endpoints.length,
        results
      };
    } catch (error) {
      return { found: false, method: 'functional_testing', error: error.message };
    }
  }

  /**
   * 🔗 Detection Method 3: Commit Verification
   */
  async checkCommitVerification(expectedCommit) {
    try {
      // Test endpoint that should return commit info
      const response = await this.makeRequest(`${this.baseUrl}/api/test`, 'GET', null, 5000);
      
      if (response.statusCode === 200 && response.headers['content-type']?.includes('application/json')) {
        try {
          const data = JSON.parse(response.data);
          
          if (data.commit && (data.commit === expectedCommit.shortSha || data.commit === expectedCommit.sha)) {
            return {
              found: true,
              method: 'commit_verification',
              deployedCommit: data.commit,
              expectedCommit: expectedCommit.shortSha,
              match: true
            };
          }
        } catch (e) {
          // JSON parsing failed
        }
      }
      
      return { found: false, method: 'commit_verification' };
    } catch (error) {
      return { found: false, method: 'commit_verification', error: error.message };
    }
  }

  /**
   * 🚀 Phase 2: Monitor deployment with multiple detection methods
   */
  async monitorDeployment(commit) {
    console.log('🔍 PHASE 2: DEPLOYMENT MONITORING');
    console.log('=================================');
    console.log(`Monitoring commit: ${commit.shortSha}`);
    console.log(`Window: ${this.deploymentWindow/1000} seconds`);
    console.log(`Check interval: ${this.deploymentCheckInterval/1000} seconds\n`);

    const startTime = Date.now();
    let attempts = 0;
    
    while (Date.now() - startTime < this.deploymentWindow) {
      attempts++;
      console.log(`🔍 Deployment check ${attempts} - ${new Date().toLocaleTimeString()}`);
      
      // Run all detection methods in parallel
      const detectionPromises = [
        this.checkGitHubDeployments(commit.sha),
        this.checkFunctionalTesting(),
        this.checkCommitVerification(commit)
      ];

      try {
        const results = await Promise.allSettled(detectionPromises);
        const detectionResults = results.map(r => r.status === 'fulfilled' ? r.value : { found: false, error: r.reason });

        // Enhanced deployment validation
        const githubResult = detectionResults.find(r => r.method === 'github_api');
        const functionalResult = detectionResults.find(r => r.method === 'functional_testing');

        // Check if deployment found and build successful
        if (githubResult && githubResult.found) {
          const elapsed = Date.now() - startTime;
          console.log(`🎉 DEPLOYMENT DETECTED!`);
          console.log(`   Method: ${githubResult.method}`);
          console.log(`   Build Status: ${githubResult.buildStatus}`);
          console.log(`   Build State: ${githubResult.buildState}`);
          console.log(`   Detection time: ${elapsed/1000} seconds`);

          // Verify build success and functionality
          const buildSuccessful = githubResult.buildSuccess;
          const functionalWorking = functionalResult && functionalResult.found;

          if (buildSuccessful && functionalWorking) {
            console.log(`   ✅ Build successful and functionality verified`);
            return {
              success: true,
              elapsed,
              detectionMethod: githubResult.method,
              deploymentInfo: githubResult,
              allResults: detectionResults,
              buildSuccessful: true,
              functionalWorking: true
            };
          } else if (buildSuccessful && !functionalWorking) {
            console.log(`   ⚠️  Build successful but functionality not yet working (propagation delay)`);
            // Continue monitoring for functionality
          } else if (!buildSuccessful) {
            console.log(`   ❌ Build failed: ${githubResult.buildStatus}`);
            return {
              success: false,
              elapsed,
              detectionMethod: githubResult.method,
              deploymentInfo: githubResult,
              allResults: detectionResults,
              buildSuccessful: false,
              buildFailure: true,
              error: `Build failed: ${githubResult.buildStatus}`
            };
          }
        }

        // Show status of each detection method
        detectionResults.forEach(result => {
          const status = result.found ? '✅' : '❌';
          let details = result.found ? 'Found' : 'Not found';
          if (result.method === 'github_api' && result.found) {
            details += ` (Build: ${result.buildState})`;
          }
          console.log(`   ${status} ${result.method}: ${details}`);
        });
      } catch (error) {
        console.log(`   ❌ Detection error: ${error.message}`);
      }
      
      if (Date.now() - startTime < this.deploymentWindow) {
        await new Promise(resolve => setTimeout(resolve, this.deploymentCheckInterval));
      }
    }
    
    console.log(`⏰ Deployment monitoring timeout after ${this.deploymentWindow/1000} seconds\n`);
    return { success: false, timeout: true };
  }

  /**
   * 🧪 Test deployed functionality
   */
  async testDeployedFunctionality() {
    console.log('🧪 PHASE 3: FUNCTIONALITY TESTING');
    console.log('==================================');
    
    const functionalResult = await this.checkFunctionalTesting();
    
    if (functionalResult.found) {
      console.log(`✅ Functionality test passed: ${functionalResult.workingEndpoints}/${functionalResult.totalEndpoints} endpoints working`);
      
      // Test MCP JSON-RPC specifically
      try {
        const mcpPayload = {
          jsonrpc: "2.0",
          method: "tools/list",
          id: 1
        };
        
        const mcpResponse = await this.makeRequest(`${this.baseUrl}/api/mcp`, 'POST', mcpPayload);
        
        if (mcpResponse.statusCode === 200 && mcpResponse.headers['content-type']?.includes('application/json')) {
          const mcpData = JSON.parse(mcpResponse.data);
          if (mcpData.jsonrpc === "2.0") {
            console.log('✅ MCP JSON-RPC endpoint working correctly');
            return { success: true, mcpWorking: true, functionalResult };
          }
        }
        
        console.log('⚠️  MCP endpoint not working properly');
        return { success: true, mcpWorking: false, functionalResult };
      } catch (error) {
        console.log(`❌ MCP test failed: ${error.message}`);
        return { success: true, mcpWorking: false, functionalResult };
      }
    } else {
      console.log('❌ Functionality test failed');
      return { success: false, functionalResult };
    }
  }

  /**
   * 🚀 Execute complete enhanced monitoring workflow
   */
  async executeEnhancedMonitoring(expectedCommitSha) {
    try {
      console.log('🚀 ENHANCED MCP DEPLOYMENT MONITORING');
      console.log('=====================================');
      console.log(`Target commit: ${expectedCommitSha}`);
      console.log(`Base URL: ${this.baseUrl}`);
      console.log(`Start time: ${new Date().toLocaleString()}\n`);

      // Phase 1: Wait for push completion
      const pushResult = await this.waitForPushCompletion(expectedCommitSha);
      
      if (!pushResult.success) {
        return {
          success: false,
          phase: 'push_verification',
          error: 'Push verification failed or timed out'
        };
      }

      // Phase 2: Monitor deployment
      const deploymentResult = await this.monitorDeployment(pushResult.commit);
      
      if (!deploymentResult.success) {
        return {
          success: false,
          phase: 'deployment_monitoring',
          error: 'Deployment monitoring failed or timed out',
          pushResult
        };
      }

      // Phase 3: Test functionality
      const functionalityResult = await this.testDeployedFunctionality();

      // Final assessment
      const overallSuccess = pushResult.success && deploymentResult.success && functionalityResult.success;
      
      console.log('\n📊 ENHANCED MONITORING RESULTS:');
      console.log('===============================');
      console.log(`Overall Status: ${overallSuccess ? '✅ SUCCESS' : '❌ PARTIAL/FAILED'}`);
      console.log(`Push Verification: ${pushResult.success ? '✅' : '❌'}`);
      console.log(`Deployment Detection: ${deploymentResult.success ? '✅' : '❌'}`);
      console.log(`Functionality Test: ${functionalityResult.success ? '✅' : '❌'}`);
      console.log(`MCP Endpoint: ${functionalityResult.mcpWorking ? '✅' : '❌'}`);
      
      return {
        success: overallSuccess,
        pushResult,
        deploymentResult,
        functionalityResult,
        summary: {
          pushVerified: pushResult.success,
          deploymentDetected: deploymentResult.success,
          functionalityWorking: functionalityResult.success,
          mcpWorking: functionalityResult.mcpWorking
        }
      };
      
    } catch (error) {
      console.error('💥 Enhanced monitoring failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const expectedCommit = process.argv[2] || 'c942fe6'; // Default to our latest commit
  
  const monitor = new EnhancedDeploymentMonitor();
  
  monitor.executeEnhancedMonitoring(expectedCommit)
    .then(result => {
      if (result.success) {
        console.log('\n🎉 ENHANCED MONITORING COMPLETE - SUCCESS!');
        console.log('MCP autonomous deployment verification is fully operational!');
      } else {
        console.log('\n⚠️  ENHANCED MONITORING COMPLETE - NEEDS INVESTIGATION');
        console.log(`Failed at phase: ${result.phase || 'unknown'}`);
      }
    })
    .catch(error => {
      console.error('💥 Enhanced monitoring execution failed:', error);
      process.exit(1);
    });
}

module.exports = EnhancedDeploymentMonitor;
