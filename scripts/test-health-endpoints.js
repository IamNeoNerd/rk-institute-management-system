#!/usr/bin/env node

/**
 * Test All Health Check Endpoints
 * Step 1.4 of Phase 2: Health Check Enhancement
 */

const https = require('https');

const BASE_URL = 'rk-institute-management-system-b0cnefh0e-iamneonerds-projects.vercel.app';

const HEALTH_ENDPOINTS = [
  '/api/health-simple',
  '/api/health',
  '/api/health/database',
  '/api/health/automation'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: BASE_URL,
      path: endpoint,
      method: 'GET',
      headers: {
        'User-Agent': 'Health-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            endpoint: endpoint,
            statusCode: res.statusCode,
            contentType: res.headers['content-type'],
            isJson: true,
            data: jsonData,
            success: res.statusCode === 200,
            responseSize: data.length
          });
        } catch (error) {
          resolve({
            endpoint: endpoint,
            statusCode: res.statusCode,
            contentType: res.headers['content-type'],
            isJson: false,
            body: data.substring(0, 200),
            success: false,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint: endpoint,
        statusCode: 0,
        error: error.message,
        success: false
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        endpoint: endpoint,
        statusCode: 0,
        error: 'Timeout',
        success: false
      });
    });

    req.end();
  });
}

async function testAllHealthEndpoints() {
  console.log('🏥 TESTING ALL HEALTH CHECK ENDPOINTS');
  console.log('=====================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Testing ${HEALTH_ENDPOINTS.length} endpoints...\n`);
  
  const results = [];
  
  for (const endpoint of HEALTH_ENDPOINTS) {
    console.log(`🔍 Testing: ${endpoint}`);
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Content-Type: ${result.contentType || 'Unknown'}`);
    console.log(`   Is JSON: ${result.isJson ? '✅ Yes' : '❌ No'}`);
    console.log(`   Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    
    if (result.success && result.data) {
      console.log(`   Health Status: ${result.data.status || 'Unknown'}`);
      if (result.data.checks) {
        console.log(`   Database: ${result.data.checks.database?.status || 'Unknown'}`);
        console.log(`   Memory: ${result.data.checks.memory?.status || 'Unknown'}`);
      }
      if (result.data.connection) {
        console.log(`   DB Response Time: ${result.data.connection.responseTime}ms`);
      }
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    console.log('');
  }
  
  // Summary
  console.log(`📊 HEALTH ENDPOINTS SUMMARY`);
  console.log('============================');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`✅ Working endpoints: ${successCount}/${totalCount}`);
  console.log(`📈 Success rate: ${Math.round((successCount/totalCount) * 100)}%`);
  
  // Detailed analysis
  console.log(`\n🔍 DETAILED ANALYSIS:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.endpoint} - ${result.statusCode}`);
  });
  
  // Recommendations
  console.log(`\n📋 NEXT STEPS:`);
  if (successCount === totalCount) {
    console.log(`✅ All health endpoints working - Ready for monitoring dashboard`);
    console.log(`✅ Proceed to Step 2: Monitoring Dashboard Implementation`);
  } else if (successCount > 0) {
    console.log(`⚠️  Some endpoints need attention`);
    console.log(`✅ Working endpoints can be used for monitoring`);
    console.log(`🔧 Fix failing endpoints before dashboard implementation`);
  } else {
    console.log(`❌ All health endpoints failing`);
    console.log(`🔧 Need to investigate and fix health check system`);
  }
  
  return successCount === totalCount;
}

testAllHealthEndpoints()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Health test failed:', error.message);
    process.exit(1);
  });
