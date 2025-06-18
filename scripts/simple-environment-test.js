#!/usr/bin/env node

/**
 * Simple Environment Test
 * Tests basic functionality without complex dependencies
 */

console.log('🧪 SIMPLE ENVIRONMENT TEST');
console.log('=' .repeat(50));

// Test 1: Basic Node.js
console.log('✅ Node.js version:', process.version);
console.log('✅ Current directory:', process.cwd());

// Test 2: File system access
const fs = require('fs');
const path = require('path');

try {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageExists = fs.existsSync(packagePath);
  console.log('✅ Package.json exists:', packageExists);
} catch (error) {
  console.log('❌ File system error:', error.message);
}

// Test 3: Environment variables
console.log('✅ NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('✅ PORT:', process.env.PORT || 'undefined');

// Test 4: Memory usage
const memUsage = process.memoryUsage();
console.log('✅ Memory usage:');
console.log('  - RSS:', Math.round(memUsage.rss / 1024 / 1024), 'MB');
console.log('  - Heap Used:', Math.round(memUsage.heapUsed / 1024 / 1024), 'MB');
console.log('  - Heap Total:', Math.round(memUsage.heapTotal / 1024 / 1024), 'MB');

// Test 5: Simple async operation
console.log('🔄 Testing async operation...');
setTimeout(() => {
  console.log('✅ Async operation completed');
  console.log('🎉 Simple environment test completed successfully');
  process.exit(0);
}, 100);
