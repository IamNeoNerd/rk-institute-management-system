#!/usr/bin/env node

/**
 * 🔍 Monitor New Deployment
 * 
 * Monitors for new deployment after our fixes and tests it
 * Based on retrospective analysis findings
 */

const https = require('https');

class NewDeploymentMonitor {
  constructor() {
    this.lastKnownDeployment = '2677601003'; // Previous deployment ID
    this.baseUrl = 'https://rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app';
    this.checkInterval = 15000; // 15 seconds
    this.maxChecks = 20; // 5 minutes total
  }

  /**
   * 🌐 Make HTTP request
   */
  async makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: method,
        headers: {
          'User-Agent': 'Deployment-Monitor/1.0'
        },
        timeout: 10000
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
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
   * 🔍 Check for new deployment
   */
  async checkForNewDeployment() {
    try {
      const response = await this.makeRequest('https://api.github.com/repos/IamNeoNerd/rk-institute-management-system/deployments?per_page=1');
      
      if (response.statusCode === 200) {
        const deployments = JSON.parse(response.data);
        if (deployments.length > 0) {
          const latestDeployment = deployments[0];
          const deploymentId = latestDeployment.url.split('/').pop();
          
          if (deploymentId !== this.lastKnownDeployment) {
            return {
              found: true,
              deploymentId,
              createdAt: latestDeployment.created_at,
              sha: latestDeployment.sha
            };
          }
        }
      }
      
      return { found: false };
    } catch (error) {
      console.error('Error checking for deployment:', error.message);
      return { found: false, error: error.message };
    }
  }

  /**
   * 🧪 Test API endpoint
   */
  async testApiEndpoint(endpoint) {
    try {
      const response = await this.makeRequest(`${this.baseUrl}${endpoint}`);
      
      const isJson = response.headers['content-type']?.includes('application/json');
      const isWorking = response.statusCode === 200 && isJson;
      
      if (isWorking) {
        try {
          const data = JSON.parse(response.data);
          return {
            working: true,
            statusCode: response.statusCode,
            contentType: response.headers['content-type'],
            data: data
          };
        } catch (e) {
          return {
            working: false,
            statusCode: response.statusCode,
            contentType: response.headers['content-type'],
            error: 'Invalid JSON'
          };
        }
      } else {
        return {
          working: false,
          statusCode: response.statusCode,
          contentType: response.headers['content-type'],
          error: 'Not JSON or wrong status'
        };
      }
    } catch (error) {
      return {
        working: false,
        error: error.message
      };
    }
  }

  /**
   * 🔧 Test MCP JSON-RPC
   */
  async testMcpJsonRpc() {
    try {
      const payload = {
        jsonrpc: "2.0",
        method: "tools/list",
        id: 1
      };
      
      const response = await this.makeRequest(`${this.baseUrl}/api/mcp`, 'POST', payload);
      
      const isJson = response.headers['content-type']?.includes('application/json');
      
      if (isJson && response.statusCode === 200) {
        try {
          const data = JSON.parse(response.data);
          return {
            working: true,
            data: data,
            isJsonRpc: data.jsonrpc === "2.0"
          };
        } catch (e) {
          return {
            working: false,
            error: 'Invalid JSON'
          };
        }
      } else {
        return {
          working: false,
          statusCode: response.statusCode,
          contentType: response.headers['content-type']
        };
      }
    } catch (error) {
      return {
        working: false,
        error: error.message
      };
    }
  }

  /**
   * 🚀 Monitor and test new deployment
   */
  async monitorAndTest() {
    console.log('🔍 MONITORING FOR NEW DEPLOYMENT');
    console.log('================================');
    console.log(`Last known deployment: ${this.lastKnownDeployment}`);
    console.log(`Checking every ${this.checkInterval/1000} seconds for ${this.maxChecks} checks\n`);

    for (let check = 1; check <= this.maxChecks; check++) {
      console.log(`🔍 Check ${check}/${this.maxChecks} - ${new Date().toLocaleTimeString()}`);
      
      const deploymentCheck = await this.checkForNewDeployment();
      
      if (deploymentCheck.found) {
        console.log(`🎉 NEW DEPLOYMENT FOUND!`);
        console.log(`📦 Deployment ID: ${deploymentCheck.deploymentId}`);
        console.log(`📅 Created: ${deploymentCheck.createdAt}`);
        console.log(`🔗 Commit: ${deploymentCheck.sha}\n`);
        
        // Wait a bit for deployment to be ready
        console.log('⏳ Waiting 30 seconds for deployment to be ready...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Test the new deployment
        console.log('🧪 TESTING NEW DEPLOYMENT');
        console.log('=========================');
        
        // Test simple endpoint
        console.log('📍 Testing /api/test...');
        const testResult = await this.testApiEndpoint('/api/test');
        console.log(`   Result: ${testResult.working ? '✅ Working' : '❌ Not working'}`);
        if (testResult.working) {
          console.log(`   Status: ${testResult.data.status}`);
          console.log(`   API Route Working: ${testResult.data.apiRouteWorking}`);
        }
        
        // Test health endpoint
        console.log('📍 Testing /api/health-simple...');
        const healthResult = await this.testApiEndpoint('/api/health-simple');
        console.log(`   Result: ${healthResult.working ? '✅ Working' : '❌ Not working'}`);
        
        // Test MCP endpoint
        console.log('📍 Testing /api/mcp (JSON-RPC)...');
        const mcpResult = await this.testMcpJsonRpc();
        console.log(`   Result: ${mcpResult.working ? '✅ Working' : '❌ Not working'}`);
        if (mcpResult.working) {
          console.log(`   JSON-RPC 2.0: ${mcpResult.isJsonRpc ? '✅' : '❌'}`);
        }
        
        // Final assessment
        const workingEndpoints = [testResult.working, healthResult.working, mcpResult.working].filter(Boolean).length;
        
        console.log('\n📊 DEPLOYMENT TEST RESULTS:');
        console.log('============================');
        console.log(`Working endpoints: ${workingEndpoints}/3`);
        
        if (workingEndpoints >= 2) {
          console.log('🎉 SUCCESS! API routes are now working!');
          console.log('✅ MCP autonomous deployment verification is functional!');
          return { success: true, workingEndpoints, deploymentId: deploymentCheck.deploymentId };
        } else {
          console.log('⚠️  PARTIAL SUCCESS - Some endpoints working but needs investigation');
          return { success: false, workingEndpoints, deploymentId: deploymentCheck.deploymentId };
        }
      } else {
        console.log('   No new deployment yet...');
        
        if (check < this.maxChecks) {
          await new Promise(resolve => setTimeout(resolve, this.checkInterval));
        }
      }
    }
    
    console.log('\n⏰ TIMEOUT - No new deployment found within monitoring period');
    return { success: false, timeout: true };
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const monitor = new NewDeploymentMonitor();
  
  monitor.monitorAndTest()
    .then(result => {
      if (result.success) {
        console.log('\n🎯 MONITORING COMPLETE - SUCCESS!');
      } else {
        console.log('\n❌ MONITORING COMPLETE - NEEDS INVESTIGATION');
      }
    })
    .catch(error => {
      console.error('💥 Monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = NewDeploymentMonitor;
