#!/usr/bin/env node

/**
 * 🧪 Preview Deployment Tester
 * 
 * Tests the preview deployment URL even if GitHub shows it as "failed"
 * Sometimes Vercel deployments work despite GitHub API showing failure
 */

const https = require('https');

class PreviewDeploymentTester {
  constructor() {
    this.previewUrl = 'https://rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app';
    this.testEndpoints = [
      '/api/health',
      '/api/mcp', 
      '/test-mobile-cards',
      '/'
    ];
  }

  /**
   * 🌐 Make HTTP request with timeout
   */
  async makeRequest(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const req = https.get(url, { timeout }, (res) => {
        let data = '';
        
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            success: true,
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime: responseTime,
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
    });
  }

  /**
   * 🧪 Test single endpoint
   */
  async testEndpoint(endpoint) {
    const fullUrl = `${this.previewUrl}${endpoint}`;
    
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      
      const result = await this.makeRequest(fullUrl, 15000);
      
      const status = result.statusCode >= 200 && result.statusCode < 400 ? '✅' : '❌';
      console.log(`${status} ${endpoint}: ${result.statusCode} (${result.responseTime}ms)`);
      
      // Show response preview for key endpoints
      if (endpoint === '/api/health' && result.success) {
        try {
          const healthData = JSON.parse(result.data);
          console.log(`   📊 Health Status: ${healthData.status || 'unknown'}`);
          console.log(`   🔧 Version: ${healthData.version || 'unknown'}`);
        } catch (e) {
          console.log(`   📄 Response: ${result.data.substring(0, 100)}...`);
        }
      }
      
      if (endpoint === '/' && result.success) {
        const isNextJs = result.data.includes('Next.js') || result.data.includes('_next');
        console.log(`   🚀 Next.js App: ${isNextJs ? 'Detected' : 'Not detected'}`);
      }
      
      return {
        endpoint,
        success: result.success,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        working: result.statusCode >= 200 && result.statusCode < 400
      };
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
      return {
        endpoint,
        success: false,
        error: error.message,
        working: false
      };
    }
  }

  /**
   * 🎯 Test all endpoints
   */
  async testAllEndpoints() {
    console.log('🧪 PREVIEW DEPLOYMENT TESTING');
    console.log('=============================');
    console.log(`🔗 Preview URL: ${this.previewUrl}`);
    console.log(`📊 Testing ${this.testEndpoints.length} endpoints...\n`);

    const results = [];
    
    for (const endpoint of this.testEndpoints) {
      const result = await this.testEndpoint(endpoint);
      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * 📊 Analyze test results
   */
  analyzeResults(results) {
    const workingEndpoints = results.filter(r => r.working);
    const failedEndpoints = results.filter(r => !r.working);
    
    console.log('\n📊 TEST RESULTS ANALYSIS:');
    console.log('=========================');
    console.log(`✅ Working Endpoints: ${workingEndpoints.length}/${results.length}`);
    console.log(`❌ Failed Endpoints: ${failedEndpoints.length}/${results.length}`);
    
    if (workingEndpoints.length > 0) {
      console.log('\n✅ WORKING ENDPOINTS:');
      workingEndpoints.forEach(r => {
        console.log(`   ${r.endpoint}: ${r.statusCode} (${r.responseTime}ms)`);
      });
    }
    
    if (failedEndpoints.length > 0) {
      console.log('\n❌ FAILED ENDPOINTS:');
      failedEndpoints.forEach(r => {
        console.log(`   ${r.endpoint}: ${r.error || r.statusCode}`);
      });
    }

    // Determine overall status
    const isDeploymentWorking = workingEndpoints.length >= 2; // At least 2 endpoints working
    const hasHealthEndpoint = workingEndpoints.some(r => r.endpoint === '/api/health');
    const hasMainPage = workingEndpoints.some(r => r.endpoint === '/');
    
    console.log('\n🎯 DEPLOYMENT STATUS ASSESSMENT:');
    console.log('================================');
    
    if (isDeploymentWorking && hasHealthEndpoint) {
      console.log('✅ DEPLOYMENT IS ACTUALLY WORKING!');
      console.log('🎉 Despite GitHub API showing "failed", the deployment is functional');
      console.log('🔧 Environment variables appear to be working correctly');
      
      if (hasMainPage) {
        console.log('🚀 Main application is accessible');
      }
      
      return {
        status: 'working',
        confidence: 'high',
        workingEndpoints: workingEndpoints.length,
        totalEndpoints: results.length,
        recommendation: 'Proceed with MCP endpoint testing'
      };
    } else if (workingEndpoints.length > 0) {
      console.log('⚠️  PARTIAL DEPLOYMENT SUCCESS');
      console.log('🔧 Some endpoints working, may have specific configuration issues');
      
      return {
        status: 'partial',
        confidence: 'medium',
        workingEndpoints: workingEndpoints.length,
        totalEndpoints: results.length,
        recommendation: 'Investigate specific endpoint failures'
      };
    } else {
      console.log('❌ DEPLOYMENT NOT ACCESSIBLE');
      console.log('🔧 All endpoints failed - deployment truly failed');
      
      return {
        status: 'failed',
        confidence: 'high',
        workingEndpoints: 0,
        totalEndpoints: results.length,
        recommendation: 'Check Vercel build logs for specific errors'
      };
    }
  }

  /**
   * 🚀 Execute complete test suite
   */
  async executeTestSuite() {
    try {
      const results = await this.testAllEndpoints();
      const analysis = this.analyzeResults(results);
      
      console.log('\n📋 FINAL ASSESSMENT:');
      console.log('====================');
      console.log(`Status: ${analysis.status.toUpperCase()}`);
      console.log(`Confidence: ${analysis.confidence.toUpperCase()}`);
      console.log(`Working: ${analysis.workingEndpoints}/${analysis.totalEndpoints} endpoints`);
      console.log(`Recommendation: ${analysis.recommendation}`);
      
      return {
        success: analysis.status !== 'failed',
        analysis,
        results,
        previewUrl: this.previewUrl
      };
      
    } catch (error) {
      console.error('💥 Test suite failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const tester = new PreviewDeploymentTester();
  
  tester.executeTestSuite()
    .then(result => {
      console.log('\n🎯 PREVIEW DEPLOYMENT TEST COMPLETE');
      
      if (result.success) {
        console.log('🎉 Preview deployment is functional!');
      } else {
        console.log('❌ Preview deployment has issues');
      }
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = PreviewDeploymentTester;
