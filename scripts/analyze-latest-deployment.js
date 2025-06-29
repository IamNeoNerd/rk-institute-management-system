#!/usr/bin/env node

/**
 * Analyze Latest Vercel Deployment to understand the discrepancy
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

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const options = {
      hostname: url.replace('https://', '').replace('http://', ''),
      path: '/api/test',
      method: 'GET',
      headers: {
        'User-Agent': 'Deployment-Monitor/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          body: data.substring(0, 200),
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

async function analyzeDeployment() {
  console.log('🔍 ANALYZING LATEST VERCEL DEPLOYMENT');
  console.log('=====================================');
  
  try {
    // Get latest deployments
    const deploymentsResponse = await makeVercelRequest(`/v6/deployments?projectId=${PROJECT_ID}&limit=5`);
    
    if (deploymentsResponse.statusCode !== 200) {
      console.log('❌ Failed to get deployments');
      return;
    }

    const deployments = deploymentsResponse.data.deployments;
    console.log(`\n📦 Found ${deployments.length} recent deployments:`);
    
    for (let i = 0; i < deployments.length; i++) {
      const deployment = deployments[i];
      console.log(`\n${i + 1}. Deployment: ${deployment.uid}`);
      console.log(`   State: ${deployment.state}`);
      console.log(`   URL: ${deployment.url}`);
      console.log(`   Created: ${new Date(deployment.created).toLocaleString()}`);
      console.log(`   Git SHA: ${deployment.meta?.githubCommitSha || 'Unknown'}`);
      console.log(`   Branch: ${deployment.meta?.githubCommitRef || 'Unknown'}`);
      
      // Test the endpoint for this deployment
      if (deployment.url && deployment.state === 'READY') {
        console.log(`   🔍 Testing API endpoint...`);
        const endpointTest = await testEndpoint(`https://${deployment.url}`);
        console.log(`   📊 Status: ${endpointTest.statusCode}`);
        console.log(`   📋 Content-Type: ${endpointTest.contentType || 'Unknown'}`);
        console.log(`   📄 Is JSON: ${endpointTest.isJson ? '✅ Yes' : '❌ No'}`);
        if (endpointTest.body) {
          console.log(`   📝 Body Preview: ${endpointTest.body}`);
        }
        if (endpointTest.error) {
          console.log(`   ❌ Error: ${endpointTest.error}`);
        }
      }
    }

    // Analyze the latest deployment in detail
    const latest = deployments[0];
    if (latest) {
      console.log(`\n🔬 DETAILED ANALYSIS OF LATEST DEPLOYMENT`);
      console.log(`=========================================`);
      console.log(`Deployment ID: ${latest.uid}`);
      console.log(`State: ${latest.state}`);
      console.log(`URL: ${latest.url}`);
      console.log(`Git SHA: ${latest.meta?.githubCommitSha || 'Unknown'}`);
      console.log(`Branch: ${latest.meta?.githubCommitRef || 'Unknown'}`);
      
      // Get build logs
      console.log(`\n📋 BUILD LOGS:`);
      const logsResponse = await makeVercelRequest(`/v3/deployments/${latest.uid}/events?builds=1&limit=20`);
      
      if (logsResponse.statusCode === 200 && logsResponse.data) {
        console.log(`Found ${logsResponse.data.length} log entries:`);
        
        for (const log of logsResponse.data) {
          if (log.payload && log.payload.text) {
            const text = log.payload.text;
            if (text.includes('Error') || text.includes('Failed') || text.includes('Warning')) {
              console.log(`   ⚠️  ${text}`);
            } else if (text.includes('Build') || text.includes('Deploy')) {
              console.log(`   📦 ${text}`);
            }
          }
        }
      } else {
        console.log(`❌ Failed to get build logs: ${logsResponse.statusCode}`);
      }
    }

  } catch (error) {
    console.error('💥 Analysis Failed:', error.message);
  }
}

analyzeDeployment();
