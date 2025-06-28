#!/usr/bin/env node

/**
 * MCP Endpoints Testing Script
 * 
 * Tests all MCP tools and validates autonomous deployment functionality
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const MCP_ENDPOINT = `${BASE_URL}/api/mcp`;

// =============================================================================
// MCP TEST UTILITIES
// =============================================================================

async function callMcpTool(toolName, params = {}) {
  const payload = {
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: toolName,
      arguments: params
    },
    id: Date.now()
  };

  try {
    console.log(`🔧 Testing MCP tool: ${toolName}`);
    console.log(`📤 Request:`, JSON.stringify(params, null, 2));
    
    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.error) {
      console.log(`❌ Error:`, result.error);
      return { success: false, error: result.error };
    }
    
    console.log(`✅ Success:`, result.result?.content?.[0]?.text || 'No content');
    return { success: true, result: result.result };
    
  } catch (error) {
    console.log(`❌ Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// =============================================================================
// TEST SUITE
// =============================================================================

async function testDeploymentStatus() {
  console.log('\n🚀 Testing Deployment Status Tool');
  console.log('='.repeat(50));
  
  const result = await callMcpTool('deployment_status', {
    environment: 'production',
    includeMetrics: true
  });
  
  return result.success;
}

async function testDatabaseHealth() {
  console.log('\n🗄️ Testing Database Health Tool');
  console.log('='.repeat(50));
  
  const result = await callMcpTool('database_health', {
    includeQueries: true,
    testConnection: true
  });
  
  return result.success;
}

async function testMobileOptimization() {
  console.log('\n📱 Testing Mobile Optimization Tool');
  console.log('='.repeat(50));
  
  const result = await callMcpTool('mobile_optimization_check', {
    testEndpoint: '/test-mobile-cards',
    checkPerformance: true
  });
  
  return result.success;
}

async function testDeploymentValidation() {
  console.log('\n🔍 Testing Deployment Validation Suite');
  console.log('='.repeat(50));
  
  const result = await callMcpTool('trigger_deployment_validation', {
    environment: 'staging',
    runFullSuite: true
  });
  
  return result.success;
}

async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint');
  console.log('='.repeat(50));
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    console.log(`📤 Health Check Response:`, JSON.stringify(data, null, 2));
    
    const isHealthy = data.status === 'healthy';
    console.log(`${isHealthy ? '✅' : '❌'} Health Status: ${data.status}`);
    
    return isHealthy;
  } catch (error) {
    console.log(`❌ Health Check Failed:`, error.message);
    return false;
  }
}

async function testMobileCardsEndpoint() {
  console.log('\n📱 Testing Mobile Cards Endpoint');
  console.log('='.repeat(50));
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/test-mobile-cards`);
    const responseTime = Date.now() - startTime;
    
    console.log(`📤 Mobile Cards Response: ${response.status} ${response.statusText}`);
    console.log(`⏱️ Response Time: ${responseTime}ms`);
    
    const isHealthy = response.ok && responseTime < 3000;
    console.log(`${isHealthy ? '✅' : '❌'} Performance: ${isHealthy ? 'PASSED' : 'FAILED'} (target: <3000ms)`);
    
    return isHealthy;
  } catch (error) {
    console.log(`❌ Mobile Cards Test Failed:`, error.message);
    return false;
  }
}

// =============================================================================
// COMPREHENSIVE TEST RUNNER
// =============================================================================

async function runComprehensiveTests() {
  console.log('🧪 MCP Autonomous Deployment Test Suite');
  console.log('='.repeat(60));
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`🔗 MCP Endpoint: ${MCP_ENDPOINT}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  
  const testResults = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    tests: []
  };
  
  // Test 1: Health Endpoint
  const healthResult = await testHealthEndpoint();
  testResults.tests.push({
    name: 'Health Endpoint',
    passed: healthResult,
    category: 'infrastructure'
  });
  
  // Test 2: Mobile Cards Endpoint
  const mobileResult = await testMobileCardsEndpoint();
  testResults.tests.push({
    name: 'Mobile Cards Endpoint',
    passed: mobileResult,
    category: 'mobile_optimization'
  });
  
  // Test 3: MCP Deployment Status
  const deploymentStatusResult = await testDeploymentStatus();
  testResults.tests.push({
    name: 'MCP Deployment Status',
    passed: deploymentStatusResult,
    category: 'mcp_tools'
  });
  
  // Test 4: MCP Database Health
  const databaseHealthResult = await testDatabaseHealth();
  testResults.tests.push({
    name: 'MCP Database Health',
    passed: databaseHealthResult,
    category: 'mcp_tools'
  });
  
  // Test 5: MCP Mobile Optimization
  const mobileOptResult = await testMobileOptimization();
  testResults.tests.push({
    name: 'MCP Mobile Optimization',
    passed: mobileOptResult,
    category: 'mcp_tools'
  });
  
  // Test 6: MCP Deployment Validation
  const validationResult = await testDeploymentValidation();
  testResults.tests.push({
    name: 'MCP Deployment Validation',
    passed: validationResult,
    category: 'mcp_tools'
  });
  
  // Calculate results
  const totalTests = testResults.tests.length;
  const passedTests = testResults.tests.filter(test => test.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  // Generate report
  console.log('\n📊 Test Results Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${failedTests}/${totalTests} tests`);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log(`⏰ Completed: ${new Date().toISOString()}`);
  
  // Detailed results
  console.log('\n📋 Detailed Test Results:');
  testResults.tests.forEach(test => {
    const status = test.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`  ${status} - ${test.name} (${test.category})`);
  });
  
  // Deployment readiness assessment
  console.log('\n🚀 Deployment Readiness Assessment:');
  const infrastructureTests = testResults.tests.filter(t => t.category === 'infrastructure');
  const mcpTests = testResults.tests.filter(t => t.category === 'mcp_tools');
  const mobileTests = testResults.tests.filter(t => t.category === 'mobile_optimization');
  
  const infrastructurePassed = infrastructureTests.every(t => t.passed);
  const mcpPassed = mcpTests.filter(t => t.passed).length >= Math.ceil(mcpTests.length * 0.8); // 80% threshold
  const mobilePassed = mobileTests.every(t => t.passed);
  
  console.log(`  🏗️ Infrastructure: ${infrastructurePassed ? '✅ READY' : '❌ NOT READY'}`);
  console.log(`  🤖 MCP Tools: ${mcpPassed ? '✅ READY' : '❌ NOT READY'} (${mcpTests.filter(t => t.passed).length}/${mcpTests.length})`);
  console.log(`  📱 Mobile Optimization: ${mobilePassed ? '✅ READY' : '❌ NOT READY'}`);
  
  const overallReady = infrastructurePassed && mcpPassed && mobilePassed;
  console.log(`\n🎯 Overall Status: ${overallReady ? '✅ DEPLOYMENT READY' : '❌ DEPLOYMENT BLOCKED'}`);
  
  if (overallReady) {
    console.log('\n🚀 Recommendation: Proceed with autonomous deployment implementation');
    console.log('   - All critical systems operational');
    console.log('   - MCP tools functioning correctly');
    console.log('   - Mobile optimization validated');
  } else {
    console.log('\n⚠️ Recommendation: Resolve issues before deployment');
    console.log('   - Check failed tests above');
    console.log('   - Ensure all systems are operational');
    console.log('   - Re-run tests after fixes');
  }
  
  // Save results
  const fs = require('fs');
  fs.writeFileSync('mcp-test-results.json', JSON.stringify(testResults, null, 2));
  console.log('\n💾 Test results saved to: mcp-test-results.json');
  
  return overallReady;
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('MCP Endpoints Testing Script');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/test-mcp-endpoints.js           # Run all tests');
    console.log('  node scripts/test-mcp-endpoints.js --quick   # Run quick tests only');
    console.log('  node scripts/test-mcp-endpoints.js --help    # Show this help');
    return;
  }
  
  const isQuick = args.includes('--quick');
  
  if (isQuick) {
    console.log('🏃‍♂️ Running Quick Test Suite...');
    const healthOk = await testHealthEndpoint();
    const mobileOk = await testMobileCardsEndpoint();
    
    console.log(`\n📊 Quick Test Results: ${healthOk && mobileOk ? '✅ PASSED' : '❌ FAILED'}`);
    process.exit(healthOk && mobileOk ? 0 : 1);
  } else {
    const success = await runComprehensiveTests();
    process.exit(success ? 0 : 1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  callMcpTool,
  testDeploymentStatus,
  testDatabaseHealth,
  testMobileOptimization,
  testDeploymentValidation,
  runComprehensiveTests
};
