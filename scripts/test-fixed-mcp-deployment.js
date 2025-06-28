#!/usr/bin/env node

/**
 * 🧪 Test Fixed MCP Deployment
 * 
 * Tests the corrected MCP implementation with proper JSON-RPC 2.0 protocol
 * Based on retrospective analysis and research findings
 */

const https = require('https');

class FixedMCPDeploymentTester {
  constructor() {
    this.baseUrl = 'https://rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app';
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
          'User-Agent': 'Fixed-MCP-Test-Client/1.0'
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
   * 🧪 Test simple API endpoints
   */
  async testSimpleEndpoints() {
    console.log('🧪 TESTING SIMPLE API ENDPOINTS');
    console.log('===============================');
    
    const endpoints = [
      '/api/test',
      '/api/health-simple'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n📍 Testing ${endpoint}:`);
        
        const response = await this.makeRequest(`${this.baseUrl}${endpoint}`);
        
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Content-Type: ${response.headers['content-type']}`);
        
        const isJson = response.headers['content-type']?.includes('application/json');
        
        if (isJson && response.statusCode === 200) {
          console.log('   ✅ JSON response received');
          try {
            const data = JSON.parse(response.data);
            console.log(`   📄 Status: ${data.status}`);
            console.log(`   📄 API Working: ${data.apiRouteWorking}`);
            results.push({ endpoint, working: true, data });
          } catch (e) {
            console.log('   ⚠️  Invalid JSON');
            results.push({ endpoint, working: false, error: 'Invalid JSON' });
          }
        } else {
          console.log('   ❌ Not working properly');
          results.push({ endpoint, working: false, statusCode: response.statusCode });
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        results.push({ endpoint, working: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * 🔧 Test MCP endpoint GET request
   */
  async testMcpGet() {
    try {
      console.log('\n🔍 Testing MCP GET endpoint...');
      
      const response = await this.makeRequest(`${this.baseUrl}/api/mcp`);
      
      console.log(`📊 Status: ${response.statusCode}`);
      console.log(`📋 Content-Type: ${response.headers['content-type']}`);
      
      if (response.headers['content-type']?.includes('application/json')) {
        try {
          const data = JSON.parse(response.data);
          console.log('✅ JSON response received!');
          console.log('📄 Server Info:', JSON.stringify(data, null, 2));
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
   * 🔧 Test MCP JSON-RPC tools/list
   */
  async testMcpToolsList() {
    try {
      console.log('\n🔧 Testing MCP tools/list (JSON-RPC)...');
      
      const payload = {
        jsonrpc: "2.0",
        method: "tools/list",
        id: 1
      };
      
      console.log('📤 Sending:', JSON.stringify(payload, null, 2));
      
      const response = await this.makeRequest(`${this.baseUrl}/api/mcp`, 'POST', payload);
      
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
   * 🔧 Test MCP tool call
   */
  async testMcpToolCall(toolName, params = {}) {
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
      
      const response = await this.makeRequest(`${this.baseUrl}/api/mcp`, 'POST', payload);
      
      if (response.headers['content-type']?.includes('application/json')) {
        try {
          const data = JSON.parse(response.data);
          
          if (data.error) {
            console.log(`❌ Tool error: ${data.error.message}`);
            return { success: false, error: data.error };
          } else {
            console.log('✅ Tool call successful!');
            console.log('📄 Result preview:', JSON.stringify(data.result, null, 2).substring(0, 300) + '...');
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
      console.log('🧪 FIXED MCP DEPLOYMENT TESTING');
      console.log('================================');
      console.log(`🔗 Base URL: ${this.baseUrl}\n`);

      // Phase 1: Test simple endpoints
      const simpleResults = await this.testSimpleEndpoints();
      
      // Phase 2: Test MCP GET endpoint
      const mcpGetResult = await this.testMcpGet();
      
      // Phase 3: Test MCP JSON-RPC tools/list
      const toolsListResult = await this.testMcpToolsList();
      
      // Phase 4: Test specific tools
      const toolResults = [];
      
      if (toolsListResult.success) {
        const tools = ['deployment_status', 'database_health'];
        
        for (const tool of tools) {
          const result = await this.testMcpToolCall(tool, {});
          toolResults.push({ tool, result });
        }
      }

      // Analyze results
      const analysis = this.analyzeResults(simpleResults, mcpGetResult, toolsListResult, toolResults);
      
      console.log('\n📊 FINAL TEST RESULTS:');
      console.log('======================');
      console.log(`Overall Status: ${analysis.status.toUpperCase()}`);
      console.log(`Simple Endpoints: ${analysis.simpleEndpoints}/${simpleResults.length} working`);
      console.log(`MCP GET Endpoint: ${mcpGetResult.success ? '✅' : '❌'}`);
      console.log(`MCP JSON-RPC: ${toolsListResult.success ? '✅' : '❌'}`);
      console.log(`Working Tools: ${analysis.workingTools}/${analysis.totalTools}`);
      
      return {
        success: analysis.status === 'success',
        analysis,
        results: { simpleResults, mcpGetResult, toolsListResult, toolResults }
      };
      
    } catch (error) {
      console.error('💥 Test suite failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Analyze test results
   */
  analyzeResults(simpleResults, mcpGetResult, toolsListResult, toolResults) {
    const workingSimple = simpleResults.filter(r => r.working).length;
    const workingTools = toolResults.filter(t => t.result.success).length;
    const totalTools = toolResults.length;
    
    if (workingSimple >= 1 && mcpGetResult.success && toolsListResult.success && workingTools >= 1) {
      return {
        status: 'success',
        simpleEndpoints: workingSimple,
        workingTools,
        totalTools,
        message: 'MCP autonomous deployment fully functional!'
      };
    } else if (workingSimple >= 1 || mcpGetResult.success) {
      return {
        status: 'partial',
        simpleEndpoints: workingSimple,
        workingTools,
        totalTools,
        message: 'Some functionality working, needs investigation'
      };
    } else {
      return {
        status: 'failed',
        simpleEndpoints: workingSimple,
        workingTools,
        totalTools,
        message: 'API routes still not working properly'
      };
    }
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const tester = new FixedMCPDeploymentTester();
  
  tester.executeTestSuite()
    .then(result => {
      console.log('\n🎯 FIXED MCP DEPLOYMENT TEST COMPLETE');
      
      if (result.success) {
        console.log('🎉 MCP autonomous deployment verification successful!');
      } else {
        console.log('❌ Still needs further fixes');
      }
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = FixedMCPDeploymentTester;
