#!/usr/bin/env node

/**
 * Environment Variable Synchronization Script
 * 
 * Automates the synchronization of environment variables between:
 * - Local development (.env.local)
 * - GitHub Secrets (for CI/CD)
 * - Vercel Environment Variables (for deployment)
 * 
 * Usage:
 *   node scripts/sync-environment.js --target=vercel
 *   node scripts/sync-environment.js --target=github
 *   node scripts/sync-environment.js --validate
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// =============================================================================
// CONFIGURATION
// =============================================================================

const REQUIRED_PRODUCTION_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'NODE_ENV',
  'BCRYPT_ROUNDS'
];

const OPTIONAL_PRODUCTION_VARS = [
  'PORT',
  'DATABASE_POOL_MIN',
  'DATABASE_POOL_MAX',
  'DATABASE_TIMEOUT',
  'JWT_EXPIRY',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'REDIS_URL',
  'SENTRY_DSN',
  'SLACK_BOT_TOKEN',
  'GITHUB_TOKEN',
  'LINEAR_API_KEY'
];

const MCP_INTEGRATION_VARS = [
  'REDIS_URL',
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'SLACK_BOT_TOKEN',
  'SLACK_SIGNING_SECRET',
  'GITHUB_TOKEN',
  'LINEAR_API_KEY'
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Environment file not found: ${filePath}`);
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      vars[key.trim()] = value;
    }
  });
  
  return vars;
}

function validateEnvironmentVariables(vars, context = 'production') {
  console.log(`🔍 Validating environment variables for ${context}...`);
  
  const issues = [];
  const warnings = [];
  
  // Check required variables
  REQUIRED_PRODUCTION_VARS.forEach(varName => {
    if (!vars[varName]) {
      issues.push(`❌ Missing required variable: ${varName}`);
    } else if (vars[varName].includes('CHANGE_THIS') || vars[varName].includes('your-domain')) {
      issues.push(`❌ Variable needs configuration: ${varName}`);
    }
  });
  
  // Check JWT secret strength
  if (vars.JWT_SECRET && vars.JWT_SECRET.length < 32) {
    issues.push(`❌ JWT_SECRET must be at least 32 characters (current: ${vars.JWT_SECRET.length})`);
  }
  
  // Check database URL format
  if (vars.DATABASE_URL && !vars.DATABASE_URL.startsWith('postgresql://')) {
    issues.push(`❌ DATABASE_URL must be a valid PostgreSQL connection string`);
  }
  
  // Check app URL format
  if (vars.NEXT_PUBLIC_APP_URL && !vars.NEXT_PUBLIC_APP_URL.startsWith('https://')) {
    warnings.push(`⚠️  NEXT_PUBLIC_APP_URL should use HTTPS in production`);
  }
  
  // Check MCP integration variables
  const mcpVarsPresent = MCP_INTEGRATION_VARS.filter(varName => vars[varName]).length;
  if (mcpVarsPresent > 0 && mcpVarsPresent < MCP_INTEGRATION_VARS.length) {
    warnings.push(`⚠️  Partial MCP integration detected (${mcpVarsPresent}/${MCP_INTEGRATION_VARS.length} variables)`);
  }
  
  return { issues, warnings };
}

function generateVercelEnvCommands(vars) {
  console.log('📝 Generating Vercel environment variable commands...');
  
  const commands = [];
  const productionVars = [...REQUIRED_PRODUCTION_VARS, ...OPTIONAL_PRODUCTION_VARS, ...MCP_INTEGRATION_VARS];
  
  productionVars.forEach(varName => {
    if (vars[varName]) {
      // Escape special characters for shell
      const escapedValue = vars[varName].replace(/"/g, '\\"');
      commands.push(`vercel env add ${varName} production`);
      commands.push(`# Value: "${escapedValue}"`);
      commands.push('');
    }
  });
  
  return commands;
}

function generateGitHubSecretsCommands(vars) {
  console.log('📝 Generating GitHub Secrets commands...');
  
  const commands = [];
  const secretVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'REDIS_URL',
    'SENTRY_DSN',
    'SENTRY_AUTH_TOKEN',
    'SLACK_BOT_TOKEN',
    'SLACK_SIGNING_SECRET',
    'LINEAR_API_KEY'
  ];
  
  commands.push('# GitHub CLI commands to set repository secrets:');
  commands.push('# Install GitHub CLI: https://cli.github.com/');
  commands.push('');
  
  secretVars.forEach(varName => {
    if (vars[varName]) {
      commands.push(`gh secret set ${varName} --body "${vars[varName]}"`);
    }
  });
  
  return commands;
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

function validateCurrentEnvironment() {
  console.log('🔍 Environment Validation Report');
  console.log('='.repeat(50));
  
  // Load environment files
  const localVars = loadEnvFile('.env.local');
  const exampleVars = loadEnvFile('.env.example');
  
  console.log(`\n📁 Local Environment (.env.local):`);
  const localValidation = validateEnvironmentVariables(localVars, 'local development');
  
  if (localValidation.issues.length > 0) {
    console.log('\n🚨 Issues found:');
    localValidation.issues.forEach(issue => console.log(`  ${issue}`));
  }
  
  if (localValidation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    localValidation.warnings.forEach(warning => console.log(`  ${warning}`));
  }
  
  if (localValidation.issues.length === 0) {
    console.log('✅ Local environment validation passed!');
  }
  
  // Check coverage
  const requiredCount = REQUIRED_PRODUCTION_VARS.filter(v => localVars[v]).length;
  const optionalCount = OPTIONAL_PRODUCTION_VARS.filter(v => localVars[v]).length;
  const mcpCount = MCP_INTEGRATION_VARS.filter(v => localVars[v]).length;
  
  console.log('\n📊 Environment Coverage:');
  console.log(`  Required Variables: ${requiredCount}/${REQUIRED_PRODUCTION_VARS.length}`);
  console.log(`  Optional Variables: ${optionalCount}/${OPTIONAL_PRODUCTION_VARS.length}`);
  console.log(`  MCP Integration: ${mcpCount}/${MCP_INTEGRATION_VARS.length}`);
  
  return localValidation.issues.length === 0;
}

function generateSyncCommands(target) {
  const localVars = loadEnvFile('.env.local');
  
  if (Object.keys(localVars).length === 0) {
    console.error('❌ No local environment variables found in .env.local');
    process.exit(1);
  }
  
  const validation = validateEnvironmentVariables(localVars);
  if (validation.issues.length > 0) {
    console.error('❌ Environment validation failed. Fix issues before syncing:');
    validation.issues.forEach(issue => console.error(`  ${issue}`));
    process.exit(1);
  }
  
  let commands = [];
  
  switch (target) {
    case 'vercel':
      commands = generateVercelEnvCommands(localVars);
      console.log('🚀 Vercel Environment Sync Commands:');
      console.log('='.repeat(50));
      console.log('# Run these commands to sync environment variables to Vercel:');
      console.log('');
      break;
      
    case 'github':
      commands = generateGitHubSecretsCommands(localVars);
      console.log('🔐 GitHub Secrets Sync Commands:');
      console.log('='.repeat(50));
      break;
      
    default:
      console.error('❌ Invalid target. Use --target=vercel or --target=github');
      process.exit(1);
  }
  
  commands.forEach(cmd => console.log(cmd));
  
  // Save commands to file
  const outputFile = `sync-${target}-commands.sh`;
  fs.writeFileSync(outputFile, commands.join('\n'));
  console.log(`\n💾 Commands saved to: ${outputFile}`);
}

function generateProductionEnvTemplate() {
  console.log('📝 Generating production environment template...');
  
  const localVars = loadEnvFile('.env.local');
  const template = [];
  
  template.push('# =============================================================================');
  template.push('# RK Institute Management System - Production Environment');
  template.push('# =============================================================================');
  template.push('# Generated from local environment configuration');
  template.push(`# Generated on: ${new Date().toISOString()}`);
  template.push('# =============================================================================');
  template.push('');
  
  template.push('# REQUIRED PRODUCTION VARIABLES');
  template.push('# -----------------------------------------------------------------------------');
  REQUIRED_PRODUCTION_VARS.forEach(varName => {
    const value = localVars[varName] || `CONFIGURE_${varName}`;
    template.push(`${varName}="${value}"`);
  });
  
  template.push('');
  template.push('# OPTIONAL PRODUCTION VARIABLES');
  template.push('# -----------------------------------------------------------------------------');
  OPTIONAL_PRODUCTION_VARS.forEach(varName => {
    if (localVars[varName]) {
      template.push(`${varName}="${localVars[varName]}"`);
    }
  });
  
  template.push('');
  template.push('# MCP INTEGRATION VARIABLES');
  template.push('# -----------------------------------------------------------------------------');
  MCP_INTEGRATION_VARS.forEach(varName => {
    if (localVars[varName]) {
      template.push(`${varName}="${localVars[varName]}"`);
    }
  });
  
  const templateContent = template.join('\n');
  fs.writeFileSync('.env.production.template', templateContent);
  console.log('✅ Production environment template saved to: .env.production.template');
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

function main() {
  const args = process.argv.slice(2);
  const targetArg = args.find(arg => arg.startsWith('--target='));
  const validateFlag = args.includes('--validate');
  const templateFlag = args.includes('--template');
  
  console.log('🔧 RK Institute Environment Synchronization Tool');
  console.log('='.repeat(50));
  
  if (validateFlag) {
    const isValid = validateCurrentEnvironment();
    process.exit(isValid ? 0 : 1);
  }
  
  if (templateFlag) {
    generateProductionEnvTemplate();
    return;
  }
  
  if (targetArg) {
    const target = targetArg.split('=')[1];
    generateSyncCommands(target);
    return;
  }
  
  // Default: show help
  console.log('Usage:');
  console.log('  node scripts/sync-environment.js --validate     # Validate current environment');
  console.log('  node scripts/sync-environment.js --template     # Generate production template');
  console.log('  node scripts/sync-environment.js --target=vercel   # Generate Vercel sync commands');
  console.log('  node scripts/sync-environment.js --target=github   # Generate GitHub secrets commands');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/sync-environment.js --validate');
  console.log('  node scripts/sync-environment.js --target=vercel');
}

if (require.main === module) {
  main();
}

module.exports = {
  validateEnvironmentVariables,
  loadEnvFile,
  generateVercelEnvCommands,
  generateGitHubSecretsCommands
};
