#!/usr/bin/env node

/**
 * 🧪 Test New MCP Deployment
 * 
 * Tests the latest deployment with the fixed MCP endpoint
 * Validates that JSON-RPC is now working correctly
 */

const https = require('https');

class NewMCPDeploymentTester {
  constructor() {
    // Generate the new preview URL based on the commit SHA
    this.commitSha = '4f036ac3e3044de23b2024aa399511cdad9b8ce5';
    this.shortSha = this.commitSha.substring(0, 8);
    
    // Possible URL patterns for the new deployment
    this.possibleUrls = [
      'https://rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app', // Same as before
      `https://rk-institute-management-system-git-feature-mcp-autonomous-deployment-iamneonerd.vercel.app`,
      `https://rk-institute-management-system-${this.shortSha}.vercel.app`,
      `https://rk-institute-management-system-git-${this.shortSha}-iamneonerd.vercel.app`
    ];
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
          'User-Agent': 'MCP-Test-Client/1.0'
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
   * 🔍 Find working deployment URL
   */
  async findWorkingUrl() {
    console.log('🔍 FINDING WORKING DEPLOYMENT URL');
    console.log('=================================');
    
    for (const url of this.possibleUrls) {
      try {
        console.log(`🧪 Testing: ${url}`);
        
        const response = await this.makeRequest(`${url}/api/health`);
        
        if (response.statusCode === 200) {
          console.log(`✅ Working URL found: ${url}`);
          return url;
        } else {
          console.log(`❌ Status ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    console.log('⚠️  No working URL found, using first option');
    return this.possibleUrls[0];
  }

  /**
   * 🧪 Test MCP endpoint GET request
   */
  async testMcpGet(baseUrl) {
    try {
      console.log('\n🔍 Testing MCP GET endpoint...');
      
      const response = await this.makeRequest(`${baseUrl}/api/mcp`);
      
      console.log(`📊 Status: ${response.statusCode}`);
      console.log(`📋 Content-Type: ${response.headers['content-type']}`);
      
      if (response.headers['content-type']?.includes('application/json')) {
        try {
          const data = JSON.parse(response.data);
          console.log('✅ JSON response received!');
          console.log('📄 Response:', JSON.stringify(data, null, 2));
          return { success: true, data };
        } catch (error) {
          console.log('❌ JSON parsing failed');
          return { success: false, error: 'Invalid JSON' };
        }
      } else {
        console.log('❌ Not JSON response');
        console.log('📄 Response preview:', response.data.substring(0, 200) + '...');
        return { success: false, error: 'Not JSON response' };
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🧪 Test MCP endpoint POST request (JSON-RPC)
   */
  async testMcpPost(baseUrl) {
    try {
      console.log('\n🔍 Testing MCP POST endpoint (JSON-RPC)...');
      
      const payload = {
        jsonrpc: "2.0",
        method: "tools/list",
        id: 1
      };
      
      console.log('📤 Sending:', JSON.stringify(payload, null, 2));
      
      const response = await this.makeRequest(`${baseUrl}/api/mcp`, 'POST', payload);
      
      console.log(`📊 Status: ${response.statusCode}`);
      console.log(`📋 Content-Type: ${response.headers['content-type']}`);
      
      if (response.headers['content-type']?.includes('application/json')) {
        try {
          const data = JSON.parse(response.data);
          console.log('✅ JSON-RPC response received!');
          console.log('📄 Response:', JSON.stringify(data, null, 2));
          return { success: true, data };
        } catch (error) {
          console.log('❌ JSON parsing failed');
          return { success: false, error: 'Invalid JSON' };
        }
      } else {
        console.log('❌ Not JSON response');
        console.log('📄 Response preview:', response.data.substring(0, 200) + '...');
        return { success: false, error: 'Not JSON response' };
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🧪 Test MCP tool call
   */
  async testMcpTool(baseUrl, toolName, params = {}) {
    try {
      console.log(`\n🔧 Testing MCP tool: ${toolName}`);
      
      const payload = {
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: toolName,
          arguments: params
        },
        id: Date.now()
      };
      
      console.log('📤 Sending:', JSON.stringify(payload, null, 2));
      
      const response = await this.makeRequest(`${baseUrl}/api/mcp`, 'POST', payload);
      
      if (response.headers['content-type']?.includes('application/json')) {
        try {
          const data = JSON.parse(response.data);
          
          if (data.error) {
            console.log(`❌ Tool error: ${data.error.message}`);
            return { success: false, error: data.error };
          } else {
            console.log('✅ Tool call successful!');
            console.log('📄 Result:', JSON.stringify(data.result, null, 2));
            return { success: true, data: data.result };
          }
        } catch (error) {
          console.log('❌ JSON parsing failed');
          return { success: false, error: 'Invalid JSON' };
        }
      } else {
        console.log('❌ Not JSON response');
        return { success: false, error: 'Not JSON response' };
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🚀 Execute complete test suite
   */
  async executeTestSuite() {
    try {
      console.log('🧪 NEW MCP DEPLOYMENT TESTING');
      console.log('=============================');
      console.log(`🔗 Commit SHA: ${this.commitSha}`);
      console.log(`📦 Short SHA: ${this.shortSha}\n`);

      // Step 1: Find working URL
      const baseUrl = await this.findWorkingUrl();
      
      // Step 2: Test GET endpoint
      const getResult = await this.testMcpGet(baseUrl);
      
      // Step 3: Test POST endpoint (tools/list)
      const postResult = await this.testMcpPost(baseUrl);
      
      // Step 4: Test specific tools
      const toolResults = [];
      
      if (postResult.success) {
        const tools = ['deployment_status', 'database_health', 'mobile_optimization_check'];
        
        for (const tool of tools) {
          const result = await this.testMcpTool(baseUrl, tool, {});
          toolResults.push({ tool, result });
        }
      }

      // Step 5: Analyze results
      const analysis = this.analyzeResults(getResult, postResult, toolResults);
      
      console.log('\n📊 FINAL TEST RESULTS:');
      console.log('======================');
      console.log(`Status: ${analysis.status.toUpperCase()}`);
      console.log(`Working URL: ${baseUrl}`);
      console.log(`GET Endpoint: ${getResult.success ? '✅' : '❌'}`);
      console.log(`POST Endpoint: ${postResult.success ? '✅' : '❌'}`);
      console.log(`Working Tools: ${analysis.workingTools}/${analysis.totalTools}`);
      
      return {
        success: analysis.status === 'success',
        baseUrl,
        analysis,
        results: { getResult, postResult, toolResults }
      };
      
    } catch (error) {
      console.error('💥 Test suite failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Analyze test results
   */
  analyzeResults(getResult, postResult, toolResults) {
    const workingTools = toolResults.filter(t => t.result.success).length;
    const totalTools = toolResults.length;
    
    if (getResult.success && postResult.success && workingTools >= 2) {
      return {
        status: 'success',
        workingTools,
        totalTools,
        message: 'MCP endpoint fully functional!'
      };
    } else if (getResult.success || postResult.success) {
      return {
        status: 'partial',
        workingTools,
        totalTools,
        message: 'MCP endpoint partially working'
      };
    } else {
      return {
        status: 'failed',
        workingTools,
        totalTools,
        message: 'MCP endpoint not working'
      };
    }
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const tester = new NewMCPDeploymentTester();
  
  tester.executeTestSuite()
    .then(result => {
      console.log('\n🎯 MCP DEPLOYMENT TEST COMPLETE');
      
      if (result.success) {
        console.log('🎉 MCP autonomous deployment verification successful!');
      } else {
        console.log('❌ MCP deployment needs further investigation');
      }
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = NewMCPDeploymentTester;
