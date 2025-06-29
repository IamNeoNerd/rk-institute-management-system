#!/usr/bin/env node

/**
 * Test Vercel API Access for Enhanced Monitoring System
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
            data: parsed,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testVercelAPI() {
  console.log('🔍 TESTING VERCEL API ACCESS');
  console.log('============================');
  
  try {
    // Test 1: Get user info
    console.log('\n1. Testing user authentication...');
    const userResponse = await makeVercelRequest('/v2/user');
    console.log(`   Status: ${userResponse.statusCode}`);
    if (userResponse.statusCode === 200) {
      console.log(`   ✅ User: ${userResponse.data.username || userResponse.data.name}`);
    } else {
      console.log(`   ❌ Error: ${userResponse.data.error?.message || 'Unknown error'}`);
    }

    // Test 2: Get project info
    console.log('\n2. Testing project access...');
    const projectResponse = await makeVercelRequest(`/v9/projects/${PROJECT_ID}`);
    console.log(`   Status: ${projectResponse.statusCode}`);
    if (projectResponse.statusCode === 200) {
      console.log(`   ✅ Project: ${projectResponse.data.name}`);
    } else {
      console.log(`   ❌ Error: ${projectResponse.data.error?.message || 'Unknown error'}`);
    }

    // Test 3: Get deployments
    console.log('\n3. Testing deployments access...');
    const deploymentsResponse = await makeVercelRequest(`/v6/deployments?projectId=${PROJECT_ID}&limit=3`);
    console.log(`   Status: ${deploymentsResponse.statusCode}`);
    if (deploymentsResponse.statusCode === 200) {
      console.log(`   ✅ Deployments found: ${deploymentsResponse.data.deployments?.length || 0}`);
      if (deploymentsResponse.data.deployments?.length > 0) {
        const latest = deploymentsResponse.data.deployments[0];
        console.log(`   📦 Latest: ${latest.uid} (${latest.state})`);
        console.log(`   🔗 URL: ${latest.url}`);
        console.log(`   📅 Created: ${new Date(latest.created).toLocaleString()}`);
      }
    } else {
      console.log(`   ❌ Error: ${deploymentsResponse.data.error?.message || 'Unknown error'}`);
    }

    // Test 4: Search for specific commit
    console.log('\n4. Testing commit-specific deployment search...');
    const commitResponse = await makeVercelRequest(`/v6/deployments?projectId=${PROJECT_ID}&sha=e8ae5d6&limit=5`);
    console.log(`   Status: ${commitResponse.statusCode}`);
    if (commitResponse.statusCode === 200) {
      console.log(`   ✅ Deployments for e8ae5d6: ${commitResponse.data.deployments?.length || 0}`);
      if (commitResponse.data.deployments?.length > 0) {
        const deployment = commitResponse.data.deployments[0];
        console.log(`   📦 Found: ${deployment.uid} (${deployment.state})`);
        console.log(`   🔗 URL: ${deployment.url}`);
        
        // Test 5: Get build logs for this deployment
        console.log('\n5. Testing build logs access...');
        const logsResponse = await makeVercelRequest(`/v3/deployments/${deployment.uid}/events?builds=1&limit=10`);
        console.log(`   Status: ${logsResponse.statusCode}`);
        if (logsResponse.statusCode === 200) {
          console.log(`   ✅ Build logs found: ${logsResponse.data?.length || 0} entries`);
          if (logsResponse.data?.length > 0) {
            console.log(`   📋 Sample log: ${logsResponse.data[0].payload?.text?.substring(0, 100) || 'No text'}`);
          }
        } else {
          console.log(`   ❌ Logs Error: ${logsResponse.data.error?.message || 'Unknown error'}`);
        }
      }
    } else {
      console.log(`   ❌ Error: ${commitResponse.data.error?.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('💥 API Test Failed:', error.message);
  }
}

testVercelAPI();
