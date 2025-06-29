#!/usr/bin/env node

/**
 * Detailed Build Log Analysis for Latest Deployment
 */

const https = require('https');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'VRg1lQ7oLLPrm4RAWOebPz9C';
const PROJECT_ID = 'prj_SSG5WpGBBO3tRfyA0GKAtDhymr24';

async function makeVercelRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: parsed
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function analyzeBuildLogs() {
  console.log('🔍 DETAILED BUILD LOG ANALYSIS');
  console.log('===============================');
  
  try {
    // Get latest deployment
    const deploymentsResponse = await makeVercelRequest(`/v6/deployments?projectId=${PROJECT_ID}&limit=1`);
    
    if (deploymentsResponse.statusCode !== 200) {
      console.log('❌ Failed to get deployments');
      return;
    }

    const deployment = deploymentsResponse.data.deployments[0];
    console.log(`\n📦 LATEST DEPLOYMENT ANALYSIS`);
    console.log(`Deployment ID: ${deployment.uid}`);
    console.log(`State: ${deployment.state}`);
    console.log(`URL: ${deployment.url}`);
    console.log(`Git SHA: ${deployment.meta?.githubCommitSha || 'Unknown'}`);
    console.log(`Created: ${new Date(deployment.created).toLocaleString()}`);

    // Get detailed build logs
    console.log(`\n📋 COMPLETE BUILD LOGS:`);
    const logsResponse = await makeVercelRequest(`/v3/deployments/${deployment.uid}/events?builds=1&limit=100`);
    
    if (logsResponse.statusCode === 200 && logsResponse.data) {
      console.log(`Found ${logsResponse.data.length} log entries:\n`);
      
      for (const log of logsResponse.data) {
        if (log.payload && log.payload.text) {
          const text = log.payload.text;
          const timestamp = new Date(log.created).toLocaleTimeString();
          
          // Categorize log entries
          if (text.includes('Error') || text.includes('Failed') || text.includes('ERROR')) {
            console.log(`🔴 [${timestamp}] ERROR: ${text}`);
          } else if (text.includes('Warning') || text.includes('WARN')) {
            console.log(`🟡 [${timestamp}] WARNING: ${text}`);
          } else if (text.includes('Build') || text.includes('Building') || text.includes('Compiling')) {
            console.log(`🔵 [${timestamp}] BUILD: ${text}`);
          } else if (text.includes('API') || text.includes('route') || text.includes('function')) {
            console.log(`🟢 [${timestamp}] API: ${text}`);
          } else if (text.includes('Deploy') || text.includes('Ready')) {
            console.log(`✅ [${timestamp}] DEPLOY: ${text}`);
          } else {
            console.log(`⚪ [${timestamp}] INFO: ${text}`);
          }
        }
      }
    } else {
      console.log(`❌ Failed to get build logs: ${logsResponse.statusCode}`);
      if (logsResponse.data.error) {
        console.log(`Error: ${logsResponse.data.error.message}`);
      }
    }

    // Test the specific API endpoints
    console.log(`\n🧪 API ENDPOINT TESTING:`);
    const endpoints = ['/api/test', '/api/health-simple', '/api/mcp'];
    
    for (const endpoint of endpoints) {
      console.log(`\nTesting: ${endpoint}`);
      const testResult = await testEndpoint(`https://${deployment.url}${endpoint}`);
      console.log(`  Status: ${testResult.statusCode}`);
      console.log(`  Content-Type: ${testResult.contentType || 'Unknown'}`);
      console.log(`  Is JSON: ${testResult.isJson ? '✅ Yes' : '❌ No'}`);
      if (testResult.body && testResult.body.length > 0) {
        console.log(`  Body: ${testResult.body.substring(0, 100)}...`);
      }
      if (testResult.error) {
        console.log(`  Error: ${testResult.error}`);
      }
    }

  } catch (error) {
    console.error('💥 Analysis Failed:', error.message);
  }
}

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Build-Analysis/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          body: data,
          isJson: res.headers['content-type']?.includes('application/json')
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        statusCode: 0,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        statusCode: 0,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

analyzeBuildLogs();
