#!/usr/bin/env node

/**
 * 🚀 QUICK TEST RUNNER
 * Simple script to run comprehensive authentication tests
 */

const { ComprehensiveTestSuite } = require('./comprehensive-auth-testing.js');

async function quickTest() {
  console.log('🚀 QUICK AUTHENTICATION TEST RUNNER\n');
  
  const testSuite = new ComprehensiveTestSuite();
  
  try {
    console.log('🔍 Running essential authentication tests...\n');
    
    // Run just the critical tests
    await testSuite.testAuthentication();
    await testSuite.testAuthorization();
    
    const summary = testSuite.generateReport();
    
    if (summary.failed === 0) {
      console.log('\n🎉 All authentication tests passed!');
      console.log('✅ Your portal system is secure and working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Run full test suite for details:');
      console.log('   node scripts/comprehensive-auth-testing.js');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run quick tests
quickTest();
