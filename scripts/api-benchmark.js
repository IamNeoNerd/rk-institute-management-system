#!/usr/bin/env node

/**
 * API Benchmark Script (Phase 3 - Load Testing Framework)
 * Comprehensive API performance testing and analysis
 */

console.log('📈 API BENCHMARK SCRIPT - PHASE 3 LOAD TESTING');
console.log('=' .repeat(60));

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_DURATION = 30000; // 30 seconds
const CONCURRENT_REQUESTS = 10;

// Test credentials
const TEST_CREDENTIALS = {
  admin: { email: 'admin@rkinstitute.com', password: 'admin123' },
  teacher: { email: 'teacher1@rkinstitute.com', password: 'admin123' },
  student: { email: 'student@rkinstitute.com', password: 'admin123' },
  parent: { email: 'parent@rkinstitute.com', password: 'admin123' }
};

// API endpoints to test
const API_ENDPOINTS = [
  {
    name: 'Authentication - Login',
    method: 'POST',
    path: '/api/auth/login',
    body: TEST_CREDENTIALS.admin,
    expectedStatus: 200,
    timeout: 5000,
    critical: true
  },
  {
    name: 'Health Check',
    method: 'GET',
    path: '/api/health',
    expectedStatus: 200,
    timeout: 2000,
    critical: true
  },
  {
    name: 'Students List',
    method: 'GET',
    path: '/api/students',
    requiresAuth: true,
    expectedStatus: 200,
    timeout: 3000,
    critical: true
  },
  {
    name: 'Courses List',
    method: 'GET',
    path: '/api/courses',
    requiresAuth: true,
    expectedStatus: 200,
    timeout: 3000,
    critical: false
  },
  {
    name: 'Services List',
    method: 'GET',
    path: '/api/services',
    requiresAuth: true,
    expectedStatus: 200,
    timeout: 3000,
    critical: false
  },
  {
    name: 'Academic Logs',
    method: 'GET',
    path: '/api/academic-logs',
    requiresAuth: true,
    expectedStatus: 200,
    timeout: 4000,
    critical: false
  },
  {
    name: 'Revenue Report',
    method: 'GET',
    path: '/api/reports/revenue',
    requiresAuth: true,
    expectedStatus: 200,
    timeout: 5000,
    critical: false
  },
  {
    name: 'Outstanding Dues Report',
    method: 'GET',
    path: '/api/reports/outstanding-dues',
    requiresAuth: true,
    expectedStatus: 200,
    timeout: 5000,
    critical: false
  }
];

// Benchmark results storage
const benchmarkResults = {
  startTime: Date.now(),
  endTime: null,
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  endpoints: {},
  summary: {}
};

// Authentication token storage
let authToken = null;

// Utility function to make HTTP requests
function makeRequest(endpoint, token = null) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      timeout: endpoint.timeout || 5000
    };

    const startTime = process.hrtime.bigint();
    
    const req = httpModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        resolve({
          success: res.statusCode === endpoint.expectedStatus,
          statusCode: res.statusCode,
          responseTime,
          dataSize: data.length,
          error: null,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000;
      
      resolve({
        success: false,
        statusCode: 0,
        responseTime,
        dataSize: 0,
        error: error.message,
        data: null
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000;
      
      resolve({
        success: false,
        statusCode: 0,
        responseTime,
        dataSize: 0,
        error: 'Request timeout',
        data: null
      });
    });

    // Send request body for POST requests
    if (endpoint.method === 'POST' && endpoint.body) {
      req.write(JSON.stringify(endpoint.body));
    }
    
    req.end();
  });
}

// Authenticate and get token
async function authenticate() {
  console.log('🔐 Authenticating...');
  
  const authEndpoint = API_ENDPOINTS.find(ep => ep.name === 'Authentication - Login');
  const result = await makeRequest(authEndpoint);
  
  if (result.success && result.data) {
    try {
      const response = JSON.parse(result.data);
      authToken = response.token;
      console.log('✅ Authentication successful');
      return true;
    } catch (error) {
      console.log('❌ Authentication failed: Invalid response format');
      return false;
    }
  } else {
    console.log(`❌ Authentication failed: ${result.error || 'Invalid credentials'}`);
    return false;
  }
}

// Run benchmark for a single endpoint
async function benchmarkEndpoint(endpoint) {
  console.log(`\n📊 Testing: ${endpoint.name}`);
  
  const results = {
    name: endpoint.name,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    errors: [],
    avgResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    p95ResponseTime: 0,
    throughput: 0,
    errorRate: 0
  };

  const startTime = Date.now();
  const promises = [];

  // Run concurrent requests for the specified duration
  while (Date.now() - startTime < TEST_DURATION) {
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
      const token = endpoint.requiresAuth ? authToken : null;
      promises.push(
        makeRequest(endpoint, token).then(result => {
          results.totalRequests++;
          benchmarkResults.totalRequests++;
          
          if (result.success) {
            results.successfulRequests++;
            benchmarkResults.successfulRequests++;
          } else {
            results.failedRequests++;
            benchmarkResults.failedRequests++;
            results.errors.push(result.error || `Status: ${result.statusCode}`);
          }
          
          results.responseTimes.push(result.responseTime);
          results.minResponseTime = Math.min(results.minResponseTime, result.responseTime);
          results.maxResponseTime = Math.max(results.maxResponseTime, result.responseTime);
          
          return result;
        })
      );
    }
    
    // Wait a bit before next batch
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Wait for all requests to complete
  await Promise.all(promises);

  // Calculate statistics
  if (results.responseTimes.length > 0) {
    results.avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    
    // Calculate P95
    const sorted = results.responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    results.p95ResponseTime = sorted[p95Index] || 0;
    
    // Calculate throughput (requests per second)
    const durationSeconds = TEST_DURATION / 1000;
    results.throughput = results.totalRequests / durationSeconds;
    
    // Calculate error rate
    results.errorRate = (results.failedRequests / results.totalRequests) * 100;
  }

  benchmarkResults.endpoints[endpoint.name] = results;
  
  // Display results
  console.log(`   Total Requests: ${results.totalRequests}`);
  console.log(`   Successful: ${results.successfulRequests} (${((results.successfulRequests / results.totalRequests) * 100).toFixed(1)}%)`);
  console.log(`   Failed: ${results.failedRequests} (${results.errorRate.toFixed(1)}%)`);
  console.log(`   Avg Response Time: ${results.avgResponseTime.toFixed(2)}ms`);
  console.log(`   P95 Response Time: ${results.p95ResponseTime.toFixed(2)}ms`);
  console.log(`   Min/Max: ${results.minResponseTime.toFixed(2)}ms / ${results.maxResponseTime.toFixed(2)}ms`);
  console.log(`   Throughput: ${results.throughput.toFixed(2)} req/s`);
  
  if (results.errors.length > 0) {
    console.log(`   Errors: ${results.errors.slice(0, 3).join(', ')}${results.errors.length > 3 ? '...' : ''}`);
  }

  return results;
}

// Generate summary report
function generateSummary() {
  benchmarkResults.endTime = Date.now();
  const totalDuration = (benchmarkResults.endTime - benchmarkResults.startTime) / 1000;
  
  const allResponseTimes = [];
  let totalThroughput = 0;
  let criticalEndpointsFailed = 0;
  let totalEndpoints = 0;

  Object.values(benchmarkResults.endpoints).forEach(endpoint => {
    allResponseTimes.push(...endpoint.responseTimes);
    totalThroughput += endpoint.throughput;
    totalEndpoints++;
    
    // Check if critical endpoint failed
    const originalEndpoint = API_ENDPOINTS.find(ep => ep.name === endpoint.name);
    if (originalEndpoint && originalEndpoint.critical && endpoint.errorRate > 5) {
      criticalEndpointsFailed++;
    }
  });

  const overallAvgResponseTime = allResponseTimes.length > 0 
    ? allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length 
    : 0;

  const overallErrorRate = benchmarkResults.totalRequests > 0 
    ? (benchmarkResults.failedRequests / benchmarkResults.totalRequests) * 100 
    : 0;

  benchmarkResults.summary = {
    totalDuration: totalDuration.toFixed(2),
    overallThroughput: totalThroughput.toFixed(2),
    overallAvgResponseTime: overallAvgResponseTime.toFixed(2),
    overallErrorRate: overallErrorRate.toFixed(2),
    criticalEndpointsFailed,
    totalEndpoints,
    healthStatus: criticalEndpointsFailed === 0 && overallErrorRate < 5 ? 'HEALTHY' : 'NEEDS_ATTENTION'
  };

  return benchmarkResults.summary;
}

// Main benchmark execution
async function runBenchmark() {
  console.log(`🚀 Starting API Benchmark`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Test Duration: ${TEST_DURATION / 1000}s per endpoint`);
  console.log(`   Concurrent Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`   Total Endpoints: ${API_ENDPOINTS.length}`);

  // Authenticate first
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('\n❌ Benchmark aborted: Authentication failed');
    process.exit(1);
  }

  // Run benchmarks for each endpoint
  for (const endpoint of API_ENDPOINTS) {
    await benchmarkEndpoint(endpoint);
  }

  // Generate and display summary
  console.log('\n🎯 BENCHMARK SUMMARY');
  console.log('=' .repeat(50));
  
  const summary = generateSummary();
  
  console.log(`📊 Overall Performance:`);
  console.log(`   Total Duration: ${summary.totalDuration}s`);
  console.log(`   Total Requests: ${benchmarkResults.totalRequests}`);
  console.log(`   Successful Requests: ${benchmarkResults.successfulRequests}`);
  console.log(`   Failed Requests: ${benchmarkResults.failedRequests}`);
  console.log(`   Overall Throughput: ${summary.overallThroughput} req/s`);
  console.log(`   Overall Avg Response Time: ${summary.overallAvgResponseTime}ms`);
  console.log(`   Overall Error Rate: ${summary.overallErrorRate}%`);
  
  console.log(`\n🏥 Health Status: ${summary.healthStatus}`);
  console.log(`   Critical Endpoints Failed: ${summary.criticalEndpointsFailed}/${summary.totalEndpoints}`);
  
  // Performance recommendations
  console.log('\n💡 Performance Recommendations:');
  if (parseFloat(summary.overallAvgResponseTime) > 1000) {
    console.log('   ⚠️  High response times detected - consider optimization');
  }
  if (parseFloat(summary.overallErrorRate) > 1) {
    console.log('   ⚠️  Error rate above 1% - investigate failed requests');
  }
  if (parseFloat(summary.overallThroughput) < 10) {
    console.log('   ⚠️  Low throughput detected - check server capacity');
  }
  if (summary.healthStatus === 'HEALTHY') {
    console.log('   ✅ All systems performing within acceptable parameters');
  }

  console.log('\n🎉 API Benchmark completed successfully!');
  
  // Save results to file
  const fs = require('fs');
  const reportPath = `./reports/api-benchmark-${Date.now()}.json`;
  
  try {
    // Ensure reports directory exists
    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports', { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(benchmarkResults, null, 2));
    console.log(`📄 Detailed results saved to: ${reportPath}`);
  } catch (error) {
    console.log(`⚠️  Could not save report: ${error.message}`);
  }
}

// Run the benchmark
if (require.main === module) {
  runBenchmark().catch(error => {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  });
}

module.exports = { runBenchmark, benchmarkResults };
