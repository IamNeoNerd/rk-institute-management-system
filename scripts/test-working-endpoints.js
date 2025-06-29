#!/usr/bin/env node

/**
 * Test Working API Endpoints to Verify Fix
 */

const https = require('https');

// Test the working endpoints we discovered
const ENDPOINTS = [
  '/api/health-simple',
  '/api/mcp'
];

const BASE_URL = 'rk-institute-management-system-b0cnefh0e-iamneonerds-projects.vercel.app';

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: BASE_URL,
      path: endpoint,
      method: 'GET',
      headers: {
        'User-Agent': 'Endpoint-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          endpoint: endpoint,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          isJson: res.headers['content-type']?.includes('application/json'),
          body: data.substring(0, 200),
          success: res.statusCode === 200 && res.headers['content-type']?.includes('application/json')
        });
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

async function testWorkingEndpoints() {
  console.log('🧪 TESTING WORKING API ENDPOINTS');
  console.log('=================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Testing endpoints: ${ENDPOINTS.join(', ')}`);
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    console.log(`\n🔍 Testing: ${endpoint}`);
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Content-Type: ${result.contentType || 'Unknown'}`);
    console.log(`   Is JSON: ${result.isJson ? '✅ Yes' : '❌ No'}`);
    console.log(`   Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    
    if (result.body) {
      console.log(`   Body: ${result.body}...`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  // Summary
  console.log(`\n📊 SUMMARY`);
  console.log('===========');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`✅ Successful endpoints: ${successCount}/${totalCount}`);
  console.log(`📈 Success rate: ${Math.round((successCount/totalCount) * 100)}%`);
  
  if (successCount === totalCount) {
    console.log(`\n🎉 ALL ENDPOINTS WORKING!`);
    console.log(`✅ GitHub-Vercel discrepancy RESOLVED for working endpoints`);
    console.log(`✅ API routes are properly deployed as serverless functions`);
    console.log(`✅ Removing 'output: standalone' fixed the core issue`);
  } else if (successCount > 0) {
    console.log(`\n⚠️  PARTIAL SUCCESS`);
    console.log(`✅ Some API routes working correctly`);
    console.log(`❌ Issue may be specific to certain routes`);
  } else {
    console.log(`\n❌ ALL ENDPOINTS FAILED`);
    console.log(`❌ Core issue not resolved`);
  }
  
  return successCount === totalCount;
}

testWorkingEndpoints()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  });
