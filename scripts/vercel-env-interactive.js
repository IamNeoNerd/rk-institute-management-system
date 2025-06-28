#!/usr/bin/env node

/**
 * 🔧 Interactive Vercel Environment Variable Manager
 * 
 * Interactive version that prompts for Vercel API token
 * Automated solution for MCP autonomous deployment environment setup
 */

const readline = require('readline');
const VercelEnvManager = require('./vercel-env-manager');

class InteractiveVercelSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * 🔐 Prompt for Vercel API token
   */
  async promptForToken() {
    return new Promise((resolve) => {
      console.log('🔐 VERCEL API TOKEN REQUIRED');
      console.log('============================\n');
      console.log('To add environment variables programmatically, we need your Vercel API token.\n');
      console.log('📋 How to get your token:');
      console.log('   1. Go to: https://vercel.com/account/tokens');
      console.log('   2. Click "Create Token"');
      console.log('   3. Name: "MCP-Autonomous-Deployment"');
      console.log('   4. Copy the token (starts with "vercel_")\n');
      
      this.rl.question('🔑 Enter your Vercel API token: ', (token) => {
        resolve(token.trim());
      });
    });
  }

  /**
   * ✅ Validate token format
   */
  validateToken(token) {
    if (!token) {
      return { valid: false, message: 'Token is required' };
    }
    
    if (!token.startsWith('vercel_')) {
      return { valid: false, message: 'Token should start with "vercel_"' };
    }
    
    if (token.length < 20) {
      return { valid: false, message: 'Token appears to be too short' };
    }
    
    return { valid: true, message: 'Token format looks correct' };
  }

  /**
   * 🚀 Run interactive setup
   */
  async runInteractiveSetup() {
    try {
      console.log('🚀 INTERACTIVE MCP ENVIRONMENT SETUP');
      console.log('====================================\n');

      // Step 1: Get token
      const token = await this.promptForToken();
      
      // Step 2: Validate token
      const validation = this.validateToken(token);
      if (!validation.valid) {
        console.log(`❌ Invalid token: ${validation.message}`);
        this.rl.close();
        return { success: false, error: validation.message };
      }
      
      console.log(`✅ ${validation.message}\n`);

      // Step 3: Initialize manager with token
      const projectId = 'prj_SSG5WpGBBO3tRfyA0GKAtDhymr24';
      const manager = new VercelEnvManager(projectId, token);

      console.log('🔧 Starting environment variable configuration...\n');

      // Step 4: Run automated setup
      const result = await manager.setupMCPEnvironment();

      this.rl.close();
      return result;

    } catch (error) {
      console.error('💥 Interactive setup failed:', error.message);
      this.rl.close();
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 Display results
   */
  displayResults(result) {
    console.log('\n📊 SETUP RESULTS:');
    console.log('=================');
    
    if (result.success) {
      console.log('🎉 SUCCESS! Environment variables configured successfully\n');
      
      if (result.environmentVariables?.verification) {
        const v = result.environmentVariables.verification;
        console.log('📊 Environment Variable Status:');
        console.log(`   Total Variables: ${v.total}`);
        console.log(`   JWT_SECRET: ${v.jwt_secret}`);
        console.log(`   JWT_EXPIRY: ${v.jwt_expiry}\n`);
      }
      
      if (result.nextSteps) {
        console.log('🔧 NEXT STEPS:');
        result.nextSteps.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step}`);
        });
      }
      
      console.log('\n⏱️  Expected Timeline:');
      console.log('   • New deployment: 1-2 minutes');
      console.log('   • Build completion: 2-3 minutes');
      console.log('   • Ready for testing: 3-5 minutes total\n');
      
    } else {
      console.log('❌ SETUP FAILED\n');
      console.log(`Error: ${result.error}\n`);
      
      console.log('💡 TROUBLESHOOTING:');
      console.log('   1. Verify your Vercel API token is correct');
      console.log('   2. Check token has not expired');
      console.log('   3. Ensure token has project access permissions');
      console.log('   4. Try regenerating the token if issues persist\n');
    }
  }
}

// 🚀 Execute interactive setup
async function main() {
  const setup = new InteractiveVercelSetup();
  
  try {
    const result = await setup.runInteractiveSetup();
    setup.displayResults(result);
    
    if (result.success) {
      console.log('🚀 MCP autonomous deployment environment is now ready!');
      process.exit(0);
    } else {
      console.log('❌ Setup incomplete - please resolve issues and try again');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = InteractiveVercelSetup;
