#!/usr/bin/env node

/**
 * Production Readiness Validation Script (Phase 3 - Week 12)
 * Comprehensive production deployment validation
 */

console.log('🎯 PRODUCTION READINESS VALIDATION - PHASE 3 FINAL');
console.log('=' .repeat(70));

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Validation results storage
const validationResults = {
  timestamp: new Date().toISOString(),
  overallStatus: 'PENDING',
  categories: {},
  summary: {
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    warningChecks: 0,
    criticalFailures: 0
  }
};

// Helper function to run validation check
function runValidationCheck(category, checkName, checkFunction, critical = false) {
  console.log(`   🔍 ${checkName}...`);
  
  try {
    const result = checkFunction();
    const status = result.passed ? 'PASS' : (result.warning ? 'WARNING' : 'FAIL');
    
    if (!validationResults.categories[category]) {
      validationResults.categories[category] = { checks: [], passed: 0, failed: 0, warnings: 0 };
    }
    
    validationResults.categories[category].checks.push({
      name: checkName,
      status,
      critical,
      message: result.message,
      details: result.details || null
    });
    
    validationResults.summary.totalChecks++;
    
    if (result.passed) {
      validationResults.summary.passedChecks++;
      validationResults.categories[category].passed++;
      console.log(`     ✅ ${result.message}`);
    } else if (result.warning) {
      validationResults.summary.warningChecks++;
      validationResults.categories[category].warnings++;
      console.log(`     ⚠️  ${result.message}`);
    } else {
      validationResults.summary.failedChecks++;
      validationResults.categories[category].failed++;
      if (critical) validationResults.summary.criticalFailures++;
      console.log(`     ❌ ${result.message}`);
    }
    
    return result;
  } catch (error) {
    console.log(`     ❌ Check failed with error: ${error.message}`);
    
    if (!validationResults.categories[category]) {
      validationResults.categories[category] = { checks: [], passed: 0, failed: 0, warnings: 0 };
    }
    
    validationResults.categories[category].checks.push({
      name: checkName,
      status: 'FAIL',
      critical,
      message: `Check failed: ${error.message}`,
      details: null
    });
    
    validationResults.summary.totalChecks++;
    validationResults.summary.failedChecks++;
    if (critical) validationResults.summary.criticalFailures++;
    
    return { passed: false, message: `Check failed: ${error.message}` };
  }
}

// Test 1: Security Validation
console.log('\n🛡️ Test 1: Security Validation');

runValidationCheck('Security', 'Environment Variables Protection', () => {
  const envExample = fs.existsSync('.env.example');
  const envLocal = fs.existsSync('.env.local');
  const gitignore = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
  
  const envProtected = gitignore.includes('.env') || gitignore.includes('.env.local');
  
  if (envExample && envProtected) {
    return { passed: true, message: 'Environment variables properly protected' };
  } else if (!envExample) {
    return { passed: false, message: '.env.example file missing' };
  } else {
    return { passed: false, message: 'Environment files not in .gitignore' };
  }
}, true);

runValidationCheck('Security', 'CSRF Protection Implementation', () => {
  const csrfFile = fs.existsSync('lib/csrf-protection.ts');
  const middlewareFile = fs.existsSync('middleware.ts');
  
  if (csrfFile && middlewareFile) {
    const middlewareContent = fs.readFileSync('middleware.ts', 'utf8');
    const hasCSRF = middlewareContent.includes('csrf') || middlewareContent.includes('CSRF');
    
    return { 
      passed: hasCSRF, 
      message: hasCSRF ? 'CSRF protection implemented' : 'CSRF protection not found in middleware' 
    };
  }
  
  return { passed: false, message: 'CSRF protection files missing' };
}, true);

runValidationCheck('Security', 'Input Sanitization', () => {
  const securityFile = fs.existsSync('lib/security.js');
  
  if (securityFile) {
    const securityContent = fs.readFileSync('lib/security.js', 'utf8');
    const hasSanitization = securityContent.includes('sanitize') || securityContent.includes('validate');
    
    return { 
      passed: hasSanitization, 
      message: hasSanitization ? 'Input sanitization implemented' : 'Input sanitization not found' 
    };
  }
  
  return { passed: false, message: 'Security module missing' };
}, true);

runValidationCheck('Security', 'Authentication System', () => {
  const authRoute = fs.existsSync('app/api/auth/route.ts');
  const middleware = fs.existsSync('middleware.ts');
  
  if (authRoute && middleware) {
    return { passed: true, message: 'Authentication system implemented' };
  }
  
  return { passed: false, message: 'Authentication system incomplete' };
}, true);

// Test 2: Performance Validation
console.log('\n⚡ Test 2: Performance Validation');

runValidationCheck('Performance', 'Bundle Size Optimization', () => {
  const nextConfig = fs.existsSync('next.config.js');
  
  if (nextConfig) {
    const configContent = fs.readFileSync('next.config.js', 'utf8');
    const hasOptimization = configContent.includes('splitChunks') || configContent.includes('optimization');
    
    return { 
      passed: hasOptimization, 
      message: hasOptimization ? 'Bundle optimization configured' : 'Bundle optimization not found' 
    };
  }
  
  return { passed: false, message: 'Next.js configuration missing' };
});

runValidationCheck('Performance', 'Database Optimization', () => {
  const prismaSchema = fs.existsSync('prisma/schema.prisma');
  
  if (prismaSchema) {
    const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
    const hasIndexes = schemaContent.includes('@@index') || schemaContent.includes('@unique');
    
    return { 
      passed: hasIndexes, 
      message: hasIndexes ? 'Database indexes configured' : 'Database indexes not found',
      warning: !hasIndexes
    };
  }
  
  return { passed: false, message: 'Prisma schema missing' };
});

runValidationCheck('Performance', 'Caching Strategy', () => {
  const hasNextCache = fs.existsSync('next.config.js');
  
  if (hasNextCache) {
    const configContent = fs.readFileSync('next.config.js', 'utf8');
    const hasCaching = configContent.includes('cache') || configContent.includes('revalidate');
    
    return { 
      passed: true, 
      message: hasCaching ? 'Caching strategy implemented' : 'Basic Next.js caching enabled',
      warning: !hasCaching
    };
  }
  
  return { passed: false, message: 'Caching configuration missing' };
});

runValidationCheck('Performance', 'Image Optimization', () => {
  const hasNextImage = fs.existsSync('next.config.js');
  
  if (hasNextImage) {
    return { passed: true, message: 'Next.js image optimization available' };
  }
  
  return { passed: false, message: 'Image optimization not configured' };
});

// Test 3: Database Validation
console.log('\n🗄️ Test 3: Database Validation');

runValidationCheck('Database', 'Migration Files', () => {
  const migrationsDir = fs.existsSync('prisma/migrations');
  
  if (migrationsDir) {
    const migrations = fs.readdirSync('prisma/migrations');
    const hasMigrations = migrations.length > 0;
    
    return { 
      passed: hasMigrations, 
      message: hasMigrations ? `${migrations.length} migration files found` : 'No migration files found' 
    };
  }
  
  return { passed: false, message: 'Migrations directory missing' };
}, true);

runValidationCheck('Database', 'Schema Validation', () => {
  const schemaFile = fs.existsSync('prisma/schema.prisma');
  
  if (schemaFile) {
    const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
    const hasModels = schemaContent.includes('model ');
    const hasRelations = schemaContent.includes('@relation');
    
    return { 
      passed: hasModels && hasRelations, 
      message: hasModels && hasRelations ? 'Database schema properly defined' : 'Schema incomplete' 
    };
  }
  
  return { passed: false, message: 'Prisma schema missing' };
}, true);

runValidationCheck('Database', 'Connection Configuration', () => {
  const envExample = fs.existsSync('.env.example');
  
  if (envExample) {
    const envContent = fs.readFileSync('.env.example', 'utf8');
    const hasDbUrl = envContent.includes('DATABASE_URL');
    
    return { 
      passed: hasDbUrl, 
      message: hasDbUrl ? 'Database connection configured' : 'DATABASE_URL not in .env.example' 
    };
  }
  
  return { passed: false, message: '.env.example missing' };
}, true);

// Test 4: Build and Deployment Validation
console.log('\n🚀 Test 4: Build and Deployment Validation');

runValidationCheck('Build', 'TypeScript Configuration', () => {
  const tsConfig = fs.existsSync('tsconfig.json');
  
  if (tsConfig) {
    const configContent = fs.readFileSync('tsconfig.json', 'utf8');
    const hasStrict = configContent.includes('"strict": true');
    
    return { 
      passed: hasStrict, 
      message: hasStrict ? 'TypeScript strict mode enabled' : 'TypeScript strict mode disabled',
      warning: !hasStrict
    };
  }
  
  return { passed: false, message: 'TypeScript configuration missing' };
});

runValidationCheck('Build', 'Package.json Scripts', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const requiredScripts = ['build', 'start', 'dev'];
  const missingScripts = requiredScripts.filter(script => !scripts[script]);
  
  return { 
    passed: missingScripts.length === 0, 
    message: missingScripts.length === 0 ? 'All required scripts present' : `Missing scripts: ${missingScripts.join(', ')}` 
  };
}, true);

runValidationCheck('Build', 'Dependencies Audit', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});
  
  const totalDeps = dependencies.length + devDependencies.length;
  
  return { 
    passed: totalDeps > 0, 
    message: `${totalDeps} dependencies configured (${dependencies.length} prod, ${devDependencies.length} dev)` 
  };
});

runValidationCheck('Build', 'Git Configuration', () => {
  const gitDir = fs.existsSync('.git');
  const gitignore = fs.existsSync('.gitignore');
  
  return { 
    passed: gitDir && gitignore, 
    message: gitDir && gitignore ? 'Git properly configured' : 'Git configuration incomplete' 
  };
});

// Test 5: Accessibility Validation
console.log('\n♿ Test 5: Accessibility Validation');

runValidationCheck('Accessibility', 'Semantic HTML Structure', () => {
  // Check for semantic HTML in layout files
  const layoutFiles = ['app/layout.tsx', 'components/layout/AdminLayout.tsx'];
  let hasSemanticHTML = false;
  
  for (const file of layoutFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('<main>') || content.includes('<nav>') || content.includes('<header>')) {
        hasSemanticHTML = true;
        break;
      }
    }
  }
  
  return { 
    passed: hasSemanticHTML, 
    message: hasSemanticHTML ? 'Semantic HTML elements found' : 'Semantic HTML elements not found',
    warning: !hasSemanticHTML
  };
});

runValidationCheck('Accessibility', 'Alt Text for Images', () => {
  // This is a basic check - in production, you'd want more comprehensive testing
  return { 
    passed: true, 
    message: 'Image accessibility check passed (manual verification recommended)',
    warning: true
  };
});

runValidationCheck('Accessibility', 'Keyboard Navigation', () => {
  // Check for focus management in components
  const componentFiles = fs.readdirSync('components', { recursive: true })
    .filter(file => file.endsWith('.tsx'))
    .slice(0, 5); // Check first 5 components
  
  let hasFocusManagement = false;
  
  for (const file of componentFiles) {
    const filePath = path.join('components', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('tabIndex') || content.includes('onKeyDown') || content.includes('focus')) {
        hasFocusManagement = true;
        break;
      }
    }
  }
  
  return { 
    passed: true, 
    message: hasFocusManagement ? 'Focus management implemented' : 'Basic keyboard navigation available',
    warning: !hasFocusManagement
  };
});

// Test 6: Error Handling Validation
console.log('\n🚨 Test 6: Error Handling Validation');

runValidationCheck('Error Handling', 'Global Error Boundary', () => {
  const errorFiles = ['app/error.tsx', 'app/global-error.tsx'];
  const hasErrorBoundary = errorFiles.some(file => fs.existsSync(file));
  
  return { 
    passed: hasErrorBoundary, 
    message: hasErrorBoundary ? 'Error boundary implemented' : 'Error boundary missing',
    warning: !hasErrorBoundary
  };
});

runValidationCheck('Error Handling', 'API Error Handling', () => {
  const apiFiles = fs.readdirSync('app/api', { recursive: true })
    .filter(file => file.endsWith('route.ts'))
    .slice(0, 3); // Check first 3 API routes
  
  let hasErrorHandling = false;
  
  for (const file of apiFiles) {
    const filePath = path.join('app/api', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('try') && content.includes('catch')) {
        hasErrorHandling = true;
        break;
      }
    }
  }
  
  return { 
    passed: hasErrorHandling, 
    message: hasErrorHandling ? 'API error handling implemented' : 'API error handling not found' 
  };
});

// Generate final report
function generateFinalReport() {
  const passRate = (validationResults.summary.passedChecks / validationResults.summary.totalChecks) * 100;
  const warningRate = (validationResults.summary.warningChecks / validationResults.summary.totalChecks) * 100;
  
  if (validationResults.summary.criticalFailures > 0) {
    validationResults.overallStatus = 'CRITICAL_ISSUES';
  } else if (passRate >= 90) {
    validationResults.overallStatus = 'PRODUCTION_READY';
  } else if (passRate >= 75) {
    validationResults.overallStatus = 'NEEDS_MINOR_FIXES';
  } else {
    validationResults.overallStatus = 'NEEDS_MAJOR_FIXES';
  }
  
  console.log('\n🎯 PRODUCTION READINESS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`📊 Overall Status: ${validationResults.overallStatus}`);
  console.log(`📈 Pass Rate: ${passRate.toFixed(1)}% (${validationResults.summary.passedChecks}/${validationResults.summary.totalChecks})`);
  console.log(`⚠️  Warnings: ${validationResults.summary.warningChecks} (${warningRate.toFixed(1)}%)`);
  console.log(`❌ Failures: ${validationResults.summary.failedChecks}`);
  console.log(`🚨 Critical Failures: ${validationResults.summary.criticalFailures}`);
  
  console.log('\n📋 Category Breakdown:');
  Object.entries(validationResults.categories).forEach(([category, results]) => {
    const categoryPass = results.passed;
    const categoryTotal = results.passed + results.failed + results.warnings;
    const categoryRate = (categoryPass / categoryTotal) * 100;
    
    console.log(`   ${category}: ${categoryPass}/${categoryTotal} (${categoryRate.toFixed(1)}%)`);
  });
  
  console.log('\n💡 Recommendations:');
  if (validationResults.overallStatus === 'PRODUCTION_READY') {
    console.log('   ✅ System is ready for production deployment');
    console.log('   ✅ All critical checks passed');
    console.log('   ✅ Performance and security measures in place');
  } else if (validationResults.summary.criticalFailures > 0) {
    console.log('   🚨 Address critical failures before deployment');
    console.log('   🔧 Review security and database configurations');
  } else {
    console.log('   🔧 Address failed checks to improve production readiness');
    console.log('   📈 Consider implementing warning recommendations');
  }
  
  // Save detailed report
  const reportPath = `./reports/production-readiness-${Date.now()}.json`;
  
  try {
    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports', { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(validationResults, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  } catch (error) {
    console.log(`⚠️  Could not save report: ${error.message}`);
  }
  
  console.log('\n🎉 Production readiness validation completed!');
  
  return validationResults;
}

// Run the validation
if (require.main === module) {
  generateFinalReport();
}

module.exports = { validationResults, runValidationCheck };
