#!/usr/bin/env node

/**
 * 🔍 Debug MCP Endpoint Response
 * 
 * Investigates what the MCP endpoint is actually returning
 * to understand why JSON parsing is failing
 */

const https = require('https');

class MCPEndpointDebugger {
  constructor() {
    this.baseUrl = 'https://rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app';
    this.mcpEndpoint = `${this.baseUrl}/api/mcp`;
  }

  /**
   * 🌐 Test basic GET request to MCP endpoint
   */
  async testGetRequest() {
    return new Promise((resolve, reject) => {
      console.log('🔍 Testing GET request to MCP endpoint...');
      
      const options = {
        hostname: 'rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app',
        port: 443,
        path: '/api/mcp',
        method: 'GET',
        headers: {
          'User-Agent': 'MCP-Debug-Client/1.0',
          'Accept': 'application/json'
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log(`📄 Raw Response (${data.length} chars):`);
          console.log('─'.repeat(50));
          console.log(data.substring(0, 1000)); // First 1000 chars
          if (data.length > 1000) {
            console.log('... (truncated)');
          }
          console.log('─'.repeat(50));
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
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

      req.end();
    });
  }

  /**
   * 🧪 Test POST request with simple payload
   */
  async testPostRequest() {
    return new Promise((resolve, reject) => {
      console.log('\n🔍 Testing POST request to MCP endpoint...');
      
      const payload = {
        jsonrpc: "2.0",
        method: "tools/list",
        id: 1
      };
      
      const postData = JSON.stringify(payload);
      console.log(`📤 Sending payload: ${postData}`);
      
      const options = {
        hostname: 'rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app',
        port: 443,
        path: '/api/mcp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'MCP-Debug-Client/1.0'
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log(`📄 Raw Response (${data.length} chars):`);
          console.log('─'.repeat(50));
          console.log(data.substring(0, 1000)); // First 1000 chars
          if (data.length > 1000) {
            console.log('... (truncated)');
          }
          console.log('─'.repeat(50));
          
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(data);
            console.log('✅ JSON parsing successful!');
            console.log('📊 Parsed object:', JSON.stringify(parsed, null, 2));
          } catch (error) {
            console.log('❌ JSON parsing failed:', error.message);
            
            // Check if it's HTML
            if (data.includes('<html') || data.includes('<!DOCTYPE')) {
              console.log('🌐 Response appears to be HTML (likely error page)');
            }
          }
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
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

      req.write(postData);
      req.end();
    });
  }

  /**
   * 🔍 Test other API endpoints for comparison
   */
  async testOtherEndpoints() {
    console.log('\n🔍 Testing other API endpoints for comparison...');
    
    const endpoints = ['/api/health', '/'];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n📍 Testing ${endpoint}:`);
        
        const result = await new Promise((resolve, reject) => {
          const options = {
            hostname: 'rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app',
            port: 443,
            path: endpoint,
            method: 'GET',
            timeout: 5000
          };

          const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
              resolve({
                statusCode: res.statusCode,
                data: data.substring(0, 200) + (data.length > 200 ? '...' : '')
              });
            });
          });

          req.on('error', reject);
          req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
          });
          
          req.end();
        });
        
        console.log(`   Status: ${result.statusCode}`);
        console.log(`   Response: ${result.data}`);
        
      } catch (error) {
        console.log(`   Error: ${error.message}`);
      }
    }
  }

  /**
   * 🚀 Execute complete debugging suite
   */
  async executeDebugSuite() {
    try {
      console.log('🔍 MCP ENDPOINT DEBUGGING SUITE');
      console.log('===============================');
      console.log(`🔗 Target URL: ${this.mcpEndpoint}\n`);

      // Test 1: GET request
      await this.testGetRequest();
      
      // Test 2: POST request
      await this.testPostRequest();
      
      // Test 3: Other endpoints
      await this.testOtherEndpoints();
      
      console.log('\n🎯 DEBUGGING COMPLETE');
      console.log('====================');
      console.log('Check the responses above to understand the MCP endpoint behavior');
      
    } catch (error) {
      console.error('💥 Debug suite failed:', error.message);
    }
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const mcpDebugger = new MCPEndpointDebugger();
  mcpDebugger.executeDebugSuite();
}

module.exports = MCPEndpointDebugger;
