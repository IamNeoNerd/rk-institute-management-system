#!/usr/bin/env node

/**
 * 🚀 COMPREHENSIVE TESTING RUNNER
 * Quick execution script for RK Institute Management System testing
 */

const { ComprehensiveRoleTestSuite } = require('./comprehensive-role-testing.js');

async function runQuickTest() {
  console.log('🚀 QUICK COMPREHENSIVE TEST RUNNER');
  console.log('🏫 RK Institute Management System');
  console.log('📚 Academic Year 2024-25 | CBSE Curriculum\n');
  
  const testSuite = new ComprehensiveRoleTestSuite();
  
  try {
    console.log('🔍 Running essential tests across all user roles...\n');
    
    // Run authentication tests
    await testSuite.testAuthentication();
    
    // Run basic workflow tests for each role
    if (testSuite.tokens.ADMIN) {
      console.log('\n👨‍💼 Testing Admin workflows...');
      await testSuite.testAdminWorkflows();
    }
    
    if (testSuite.tokens.TEACHER) {
      console.log('\n👩‍🏫 Testing Teacher workflows...');
      await testSuite.testTeacherWorkflows();
    }
    
    if (testSuite.tokens.PARENT) {
      console.log('\n👨‍👩‍👧‍👦 Testing Parent workflows...');
      await testSuite.testParentWorkflows();
    }
    
    if (testSuite.tokens.STUDENT) {
      console.log('\n🎓 Testing Student workflows...');
      await testSuite.testStudentWorkflows();
    }
    
    // Run security tests
    await testSuite.testCrossRoleAccess();
    
    const summary = await testSuite.generateComprehensiveReport();
    
    if (summary.failed === 0 && testSuite.securityFindings.length === 0) {
      console.log('\n🎉 All essential tests passed!');
      console.log('✅ Your RK Institute Management System is working correctly.');
      console.log('\n💡 To run the full comprehensive test suite:');
      console.log('   node scripts/comprehensive-role-testing.js');
    } else {
      console.log('\n⚠️ Some issues detected. Run full test suite for details:');
      console.log('   node scripts/comprehensive-role-testing.js');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure the development server is running (npm run dev)');
    console.log('2. Check database connectivity');
    console.log('3. Verify test credentials are properly seeded');
    process.exit(1);
  }
}

// Educational context information
function showEducationalContext() {
  console.log('\n📚 EDUCATIONAL CONTEXT INFORMATION:');
  console.log('=' .repeat(50));
  console.log('🏫 Institution: RK Institute');
  console.log('📅 Academic Year: 2024-25');
  console.log('📖 Curriculum: CBSE (Central Board of Secondary Education)');
  console.log('🎓 Classes: X (Grade 10) and XII (Grade 12)');
  console.log('📝 Subjects: Mathematics, Physics, Chemistry, Biology, English, Hindi');
  console.log('👥 Test Users:');
  console.log('   • Dr. Rajesh Kumar Sharma (Principal/Admin)');
  console.log('   • Mrs. Priya Mehta (Mathematics & Physics Teacher)');
  console.log('   • Mr. Suresh Patel (Parent - Software Engineer)');
  console.log('   • Aarav Patel (Student - Class X-A, Roll: RK2024001)');
  console.log('   • Diya Patel (Student - Class VIII-B, Roll: RK2024045)');
  console.log('=' .repeat(50));
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('🧪 RK Institute Management System - Testing Suite');
  console.log('\nUsage:');
  console.log('  node scripts/run-comprehensive-tests.js          # Run quick tests');
  console.log('  node scripts/run-comprehensive-tests.js --info   # Show educational context');
  console.log('  node scripts/comprehensive-role-testing.js       # Run full test suite');
  console.log('\nOptions:');
  console.log('  --help, -h     Show this help message');
  console.log('  --info, -i     Show educational context information');
  process.exit(0);
}

if (args.includes('--info') || args.includes('-i')) {
  showEducationalContext();
  process.exit(0);
}

// Run the quick tests
runQuickTest();
