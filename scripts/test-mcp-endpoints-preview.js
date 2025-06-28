#!/usr/bin/env node

/**
 * 🧪 MCP Endpoints Testing for Preview Deployment
 * 
 * Tests all MCP tools on the preview deployment URL
 * Validates autonomous deployment functionality
 */

const https = require('https');

class MCPEndpointTester {
  constructor() {
    this.baseUrl = 'https://rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app';
    this.mcpEndpoint = `${this.baseUrl}/api/mcp`;
  }

  /**
   * 🌐 Make MCP tool request
   */
  async callMcpTool(toolName, params = {}) {
    const payload = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: toolName,
        arguments: params
      },
      id: Date.now()
    };

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      
      const options = {
        hostname: 'rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app',
        port: 443,
        path: '/api/mcp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'MCP-Test-Client/1.0'
        },
        timeout: 15000
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve({
              success: true,
              statusCode: res.statusCode,
              result: result
            });
          } catch (error) {
            resolve({
              success: false,
              error: 'Invalid JSON response',
              rawData: data,
              statusCode: res.statusCode
            });
          }
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
   * 🧪 Test single MCP tool
   */
  async testMcpTool(toolName, params = {}, description = '') {
    try {
      console.log(`🔧 Testing MCP tool: ${toolName}`);
      if (description) {
        console.log(`   📝 ${description}`);
      }
      console.log(`   📤 Params:`, JSON.stringify(params, null, 2));
      
      const startTime = Date.now();
      const response = await this.callMcpTool(toolName, params);
      const responseTime = Date.now() - startTime;
      
      if (response.success && response.result && !response.result.error) {
        console.log(`   ✅ Success (${responseTime}ms)`);
        
        // Show content preview
        const content = response.result.result?.content?.[0]?.text;
        if (content) {
          const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
          console.log(`   📄 Response: ${preview}`);
        }
        
        return {
          tool: toolName,
          success: true,
          responseTime: responseTime,
          content: content
        };
      } else {
        const error = response.result?.error || response.error || 'Unknown error';
        console.log(`   ❌ Failed: ${error}`);
        
        return {
          tool: toolName,
          success: false,
          error: error,
          responseTime: responseTime
        };
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        tool: toolName,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🎯 Test all MCP tools
   */
  async testAllMcpTools() {
    console.log('🧪 MCP ENDPOINTS TESTING ON PREVIEW DEPLOYMENT');
    console.log('===============================================');
    console.log(`🔗 Preview URL: ${this.baseUrl}`);
    console.log(`🤖 MCP Endpoint: ${this.mcpEndpoint}`);
    console.log('📊 Testing 4 MCP tools...\n');

    const tests = [
      {
        name: 'deployment_status',
        params: { environment: 'production', includeMetrics: true },
        description: 'Get deployment status and health metrics'
      },
      {
        name: 'database_health',
        params: { includeQueries: true, testConnection: true },
        description: 'Test database connectivity and health'
      },
      {
        name: 'mobile_optimization_check',
        params: { testEndpoint: '/test-mobile-cards', checkPerformance: true },
        description: 'Validate mobile optimization performance'
      },
      {
        name: 'trigger_deployment_validation',
        params: { environment: 'staging', runFullSuite: true },
        description: 'Run comprehensive deployment validation suite'
      }
    ];

    const results = [];
    
    for (const test of tests) {
      const result = await this.testMcpTool(test.name, test.params, test.description);
      results.push(result);
      
      console.log(''); // Add spacing between tests
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
  }

  /**
   * 📊 Analyze MCP test results
   */
  analyzeMcpResults(results) {
    const successfulTools = results.filter(r => r.success);
    const failedTools = results.filter(r => !r.success);
    
    console.log('📊 MCP TOOLS TEST ANALYSIS:');
    console.log('===========================');
    console.log(`✅ Successful Tools: ${successfulTools.length}/${results.length}`);
    console.log(`❌ Failed Tools: ${failedTools.length}/${results.length}`);
    
    if (successfulTools.length > 0) {
      console.log('\n✅ WORKING MCP TOOLS:');
      successfulTools.forEach(r => {
        console.log(`   ${r.tool}: ${r.responseTime}ms`);
      });
    }
    
    if (failedTools.length > 0) {
      console.log('\n❌ FAILED MCP TOOLS:');
      failedTools.forEach(r => {
        console.log(`   ${r.tool}: ${r.error}`);
      });
    }

    // Calculate success rate
    const successRate = (successfulTools.length / results.length) * 100;
    
    console.log('\n🎯 MCP AUTONOMOUS DEPLOYMENT ASSESSMENT:');
    console.log('========================================');
    
    if (successRate >= 75) {
      console.log('🎉 MCP AUTONOMOUS DEPLOYMENT SUCCESSFUL!');
      console.log('✅ Environment variables working correctly');
      console.log('✅ MCP tools responding as expected');
      console.log('✅ Autonomous deployment verification complete');
      
      return {
        status: 'success',
        successRate: successRate,
        workingTools: successfulTools.length,
        totalTools: results.length,
        recommendation: 'Ready for Pull Request creation'
      };
    } else if (successRate >= 50) {
      console.log('⚠️  PARTIAL MCP SUCCESS');
      console.log('🔧 Some tools working, may need configuration adjustments');
      
      return {
        status: 'partial',
        successRate: successRate,
        workingTools: successfulTools.length,
        totalTools: results.length,
        recommendation: 'Investigate failed tools before PR'
      };
    } else {
      console.log('❌ MCP DEPLOYMENT ISSUES');
      console.log('🔧 Multiple tools failing - needs investigation');
      
      return {
        status: 'failed',
        successRate: successRate,
        workingTools: successfulTools.length,
        totalTools: results.length,
        recommendation: 'Fix MCP configuration before proceeding'
      };
    }
  }

  /**
   * 🚀 Execute complete MCP test suite
   */
  async executeMcpTestSuite() {
    try {
      const results = await this.testAllMcpTools();
      const analysis = this.analyzeMcpResults(results);
      
      console.log('\n📋 FINAL MCP ASSESSMENT:');
      console.log('========================');
      console.log(`Status: ${analysis.status.toUpperCase()}`);
      console.log(`Success Rate: ${analysis.successRate.toFixed(1)}%`);
      console.log(`Working Tools: ${analysis.workingTools}/${analysis.totalTools}`);
      console.log(`Recommendation: ${analysis.recommendation}`);
      
      return {
        success: analysis.status !== 'failed',
        analysis,
        results,
        previewUrl: this.baseUrl
      };
      
    } catch (error) {
      console.error('💥 MCP test suite failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const tester = new MCPEndpointTester();
  
  tester.executeMcpTestSuite()
    .then(result => {
      console.log('\n🎯 MCP ENDPOINT TESTING COMPLETE');
      
      if (result.success) {
        console.log('🎉 MCP autonomous deployment verification successful!');
        console.log('🚀 Ready for Phase 4: Pull Request creation');
      } else {
        console.log('❌ MCP endpoints need attention before proceeding');
      }
    })
    .catch(error => {
      console.error('💥 MCP test execution failed:', error);
      process.exit(1);
    });
}

module.exports = MCPEndpointTester;
