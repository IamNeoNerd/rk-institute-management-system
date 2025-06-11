/**
 * Simple test script to verify automation engine functionality
 * Run with: node test-automation.js
 */

const { exec } = require('child_process');

console.log('🧪 Testing Core Automation Engine');
console.log('='.repeat(50));

// Test 1: Check if the automation health endpoint works
console.log('\n1. Testing automation health endpoint...');
exec(
  'curl -s http://localhost:3000/api/health/automation',
  (error, stdout, stderr) => {
    if (error) {
      console.log(
        '❌ Health endpoint test failed (server might not be running)'
      );
      console.log('   Start the server with: npm run dev');
    } else {
      try {
        const response = JSON.parse(stdout);
        console.log('✅ Health endpoint working');
        console.log(`   Status: ${response.status}`);
        console.log(
          `   Components: ${Object.keys(response.components || {}).join(', ')}`
        );
      } catch (e) {
        console.log('❌ Health endpoint returned invalid JSON');
      }
    }
  }
);

// Test 2: Check if automation status endpoint works
console.log('\n2. Testing automation status endpoint...');
setTimeout(() => {
  exec(
    'curl -s http://localhost:3000/api/automation/status',
    (error, stdout, stderr) => {
      if (error) {
        console.log(
          '❌ Status endpoint test failed (server might not be running)'
        );
      } else {
        try {
          const response = JSON.parse(stdout);
          console.log('✅ Status endpoint working');
          console.log(
            `   Running jobs: ${response.data?.runningJobs?.length || 0}`
          );
          console.log(
            `   Scheduled jobs: ${response.data?.scheduledJobs?.length || 0}`
          );
        } catch (e) {
          console.log('❌ Status endpoint returned invalid JSON');
        }
      }
    }
  );
}, 1000);

// Test 3: Test manual monthly billing trigger (commented out to avoid accidental execution)
console.log('\n3. Manual billing trigger test (commented out for safety)');
console.log(
  '   To test manually: curl -X POST http://localhost:3000/api/automation/monthly-billing -H "Content-Type: application/json" -d "{}"'
);

console.log('\n📋 Test Summary:');
console.log('   - Health check endpoint: /api/health/automation');
console.log('   - Status endpoint: /api/automation/status');
console.log('   - Manual trigger: POST /api/automation/monthly-billing');
console.log('   - Operations dashboard: /admin/operations');
console.log('\n🚀 Start the server with: npm run dev');
console.log(
  '📱 Access operations dashboard at: http://localhost:3000/admin/operations'
);
