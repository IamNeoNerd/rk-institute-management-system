#!/usr/bin/env node

/**
 * 🔍 Verify Deployment Commit
 * 
 * Checks if the deployment is actually using our latest commit
 * and investigates why API routes might not be working
 */

const https = require('https');

class DeploymentCommitVerifier {
  constructor() {
    this.baseUrl = 'https://rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app';
    this.expectedCommit = '4f036ac3e3044de23b2024aa399511cdad9b8ce5';
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
          'User-Agent': 'Deployment-Verifier/1.0'
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
            data: responseData,
            url: url
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
   * 🔍 Check deployment headers for commit info
   */
  async checkDeploymentHeaders() {
    try {
      console.log('🔍 CHECKING DEPLOYMENT HEADERS');
      console.log('==============================');
      
      const response = await this.makeRequest(this.baseUrl);
      
      console.log('📊 Response Headers:');
      Object.entries(response.headers).forEach(([key, value]) => {
        if (key.includes('vercel') || key.includes('git') || key.includes('commit')) {
          console.log(`   ${key}: ${value}`);
        }
      });
      
      // Check for Vercel deployment ID in headers
      const vercelId = response.headers['x-vercel-id'];
      if (vercelId) {
        console.log(`\n🔗 Vercel ID: ${vercelId}`);
      }
      
      return response.headers;
    } catch (error) {
      console.error('❌ Failed to check headers:', error.message);
      return {};
    }
  }

  /**
   * 🧪 Test all API endpoints
   */
  async testAllApiEndpoints() {
    console.log('\n🧪 TESTING ALL API ENDPOINTS');
    console.log('============================');
    
    const endpoints = [
      '/api/health',
      '/api/mcp',
      '/api/auth',
      '/api/users',
      '/api/students'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n📍 Testing ${endpoint}:`);
        
        const response = await this.makeRequest(`${this.baseUrl}${endpoint}`);
        
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Content-Type: ${response.headers['content-type']}`);
        
        const isJson = response.headers['content-type']?.includes('application/json');
        const isHtml = response.headers['content-type']?.includes('text/html');
        
        if (isJson) {
          console.log('   ✅ JSON response');
          try {
            const data = JSON.parse(response.data);
            console.log(`   📄 Preview: ${JSON.stringify(data).substring(0, 100)}...`);
          } catch (e) {
            console.log('   ⚠️  Invalid JSON');
          }
        } else if (isHtml) {
          console.log('   ❌ HTML response (API route not working)');
          
          // Check if it's a Next.js error page
          if (response.data.includes('Application error') || response.data.includes('500')) {
            console.log('   🔥 Server error detected');
          } else if (response.data.includes('404') || response.data.includes('not found')) {
            console.log('   🔍 Route not found');
          } else {
            console.log('   🌐 Default Next.js page');
          }
        }
        
        results.push({
          endpoint,
          statusCode: response.statusCode,
          contentType: response.headers['content-type'],
          isWorking: isJson && response.statusCode === 200
        });
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        results.push({
          endpoint,
          error: error.message,
          isWorking: false
        });
      }
    }
    
    return results;
  }

  /**
   * 🔧 Test specific MCP route variations
   */
  async testMcpRouteVariations() {
    console.log('\n🔧 TESTING MCP ROUTE VARIATIONS');
    console.log('===============================');
    
    const variations = [
      '/api/mcp',
      '/api/mcp/',
      '/api/mcp/route',
      '/app/api/mcp',
      '/mcp'
    ];
    
    for (const variation of variations) {
      try {
        console.log(`\n📍 Testing ${variation}:`);
        
        const response = await this.makeRequest(`${this.baseUrl}${variation}`);
        
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Content-Type: ${response.headers['content-type']}`);
        
        if (response.headers['content-type']?.includes('application/json')) {
          console.log('   ✅ JSON response found!');
          try {
            const data = JSON.parse(response.data);
            console.log(`   📄 Data: ${JSON.stringify(data, null, 2)}`);
          } catch (e) {
            console.log('   ⚠️  Invalid JSON');
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }

  /**
   * 📊 Analyze deployment status
   */
  analyzeDeploymentStatus(headers, apiResults) {
    console.log('\n📊 DEPLOYMENT ANALYSIS');
    console.log('======================');
    
    const workingApis = apiResults.filter(r => r.isWorking).length;
    const totalApis = apiResults.length;
    
    console.log(`Working APIs: ${workingApis}/${totalApis}`);
    
    if (workingApis === 0) {
      console.log('❌ NO API ROUTES WORKING');
      console.log('💡 Possible causes:');
      console.log('   1. Build failed to include API routes');
      console.log('   2. Next.js configuration issue');
      console.log('   3. File structure problem');
      console.log('   4. Environment variable causing startup failure');
    } else if (workingApis < totalApis) {
      console.log('⚠️  PARTIAL API FUNCTIONALITY');
      console.log('💡 Some routes working, others failing');
    } else {
      console.log('✅ ALL API ROUTES WORKING');
    }
    
    // Check if this is the expected deployment
    const vercelId = headers['x-vercel-id'];
    if (vercelId) {
      console.log(`\n🔗 Deployment ID: ${vercelId}`);
      console.log('💡 This can help identify the specific deployment in Vercel dashboard');
    }
    
    return {
      workingApis,
      totalApis,
      status: workingApis === 0 ? 'failed' : workingApis === totalApis ? 'success' : 'partial'
    };
  }

  /**
   * 🚀 Execute complete verification
   */
  async executeVerification() {
    try {
      console.log('🔍 DEPLOYMENT COMMIT VERIFICATION');
      console.log('=================================');
      console.log(`🔗 Target URL: ${this.baseUrl}`);
      console.log(`📦 Expected Commit: ${this.expectedCommit}\n`);

      // Step 1: Check deployment headers
      const headers = await this.checkDeploymentHeaders();
      
      // Step 2: Test all API endpoints
      const apiResults = await this.testAllApiEndpoints();
      
      // Step 3: Test MCP route variations
      await this.testMcpRouteVariations();
      
      // Step 4: Analyze results
      const analysis = this.analyzeDeploymentStatus(headers, apiResults);
      
      console.log('\n🎯 VERIFICATION COMPLETE');
      console.log('========================');
      console.log(`Status: ${analysis.status.toUpperCase()}`);
      
      return {
        success: analysis.status !== 'failed',
        analysis,
        headers,
        apiResults
      };
      
    } catch (error) {
      console.error('💥 Verification failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const verifier = new DeploymentCommitVerifier();
  
  verifier.executeVerification()
    .then(result => {
      console.log('\n🎯 DEPLOYMENT VERIFICATION COMPLETE');
      
      if (result.success) {
        console.log('✅ Deployment verification successful');
      } else {
        console.log('❌ Deployment has issues that need investigation');
      }
    })
    .catch(error => {
      console.error('💥 Verification execution failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentCommitVerifier;
