#!/usr/bin/env node

/**
 * 🔧 Vercel Environment Variable Manager
 * 
 * Automated solution for managing Vercel environment variables via API
 * Bypasses dashboard interface issues for MCP autonomous deployment
 */

const https = require('https');

class VercelEnvManager {
  constructor(projectId, apiToken = null) {
    this.projectId = projectId;
    this.apiToken = apiToken || process.env.VERCEL_TOKEN || 'VRg1lQ7oLLPrm4RAWOebPz9C';
    this.baseUrl = 'api.vercel.com';
  }

  /**
   * 🌐 Make Vercel API request
   */
  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: path,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MCP-Autonomous-Deployment/1.0'
        }
      };

      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({
                success: true,
                status: res.statusCode,
                data: parsedData
              });
            } else {
              reject({
                success: false,
                status: res.statusCode,
                error: parsedData,
                message: parsedData.error?.message || 'API request failed'
              });
            }
          } catch (error) {
            reject({
              success: false,
              status: res.statusCode,
              error: 'Invalid JSON response',
              rawData: responseData
            });
          }
        });
      });

      req.on('error', (error) => {
        reject({
          success: false,
          error: 'Network error',
          details: error.message
        });
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * 📋 List existing environment variables
   */
  async listEnvironmentVariables() {
    try {
      console.log('📋 Fetching existing environment variables...');
      
      const response = await this.makeRequest('GET', `/v9/projects/${this.projectId}/env`);
      
      console.log(`✅ Found ${response.data.envs.length} existing environment variables`);
      
      response.data.envs.forEach((env, index) => {
        console.log(`   ${index + 1}. ${env.key} (${env.target.join(', ')})`);
      });

      return response.data.envs;
    } catch (error) {
      console.error('❌ Failed to list environment variables:', error.message);
      throw error;
    }
  }

  /**
   * ➕ Add environment variable
   */
  async addEnvironmentVariable(key, value, targets = ['preview', 'development']) {
    try {
      console.log(`➕ Adding environment variable: ${key}`);
      
      const data = {
        key: key,
        value: value,
        target: targets,
        type: 'encrypted'
      };

      const response = await this.makeRequest('POST', `/v10/projects/${this.projectId}/env`, data);
      
      console.log(`✅ Successfully added ${key}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to add ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * 🔄 Update environment variable
   */
  async updateEnvironmentVariable(envId, key, value, targets = ['preview', 'development']) {
    try {
      console.log(`🔄 Updating environment variable: ${key}`);
      
      const data = {
        key: key,
        value: value,
        target: targets,
        type: 'encrypted'
      };

      const response = await this.makeRequest('PATCH', `/v9/projects/${this.projectId}/env/${envId}`, data);
      
      console.log(`✅ Successfully updated ${key}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * 🔍 Check if environment variable exists
   */
  findEnvironmentVariable(envVars, key) {
    return envVars.find(env => env.key === key);
  }

  /**
   * 🚀 Add missing MCP environment variables
   */
  async addMCPEnvironmentVariables() {
    try {
      console.log('🚀 MCP ENVIRONMENT VARIABLE CONFIGURATION STARTED');
      console.log('=================================================\n');

      // Step 1: List existing variables
      const existingVars = await this.listEnvironmentVariables();
      
      // Step 2: Define required variables
      const requiredVars = [
        {
          key: 'JWT_SECRET',
          value: 'mcp_autonomous_deployment_jwt_secret_key_2025',
          targets: ['preview', 'development', 'production']
        },
        {
          key: 'JWT_EXPIRY',
          value: '4h',
          targets: ['preview', 'development', 'production']
        }
      ];

      console.log('\n🔧 Processing required environment variables...');

      const results = [];

      // Step 3: Add or update each required variable
      for (const reqVar of requiredVars) {
        const existing = this.findEnvironmentVariable(existingVars, reqVar.key);
        
        if (existing) {
          console.log(`🔄 ${reqVar.key} exists, updating...`);
          try {
            const result = await this.updateEnvironmentVariable(
              existing.id, 
              reqVar.key, 
              reqVar.value, 
              reqVar.targets
            );
            results.push({ key: reqVar.key, action: 'updated', success: true, data: result });
          } catch (error) {
            results.push({ key: reqVar.key, action: 'update_failed', success: false, error: error.message });
          }
        } else {
          console.log(`➕ ${reqVar.key} missing, adding...`);
          try {
            const result = await this.addEnvironmentVariable(
              reqVar.key, 
              reqVar.value, 
              reqVar.targets
            );
            results.push({ key: reqVar.key, action: 'added', success: true, data: result });
          } catch (error) {
            results.push({ key: reqVar.key, action: 'add_failed', success: false, error: error.message });
          }
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Step 4: Verify configuration
      console.log('\n🔍 Verifying environment variable configuration...');
      const updatedVars = await this.listEnvironmentVariables();
      
      const verification = {
        total: updatedVars.length,
        jwt_secret: this.findEnvironmentVariable(updatedVars, 'JWT_SECRET') ? '✅' : '❌',
        jwt_expiry: this.findEnvironmentVariable(updatedVars, 'JWT_EXPIRY') ? '✅' : '❌'
      };

      console.log('\n📊 CONFIGURATION VERIFICATION:');
      console.log(`   Total Variables: ${verification.total}`);
      console.log(`   JWT_SECRET: ${verification.jwt_secret}`);
      console.log(`   JWT_EXPIRY: ${verification.jwt_expiry}`);

      return {
        success: true,
        results: results,
        verification: verification,
        totalVariables: verification.total
      };

    } catch (error) {
      console.error('\n💥 MCP environment variable configuration failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🚀 Trigger deployment
   */
  async triggerDeployment() {
    try {
      console.log('\n🚀 Triggering new deployment...');
      
      // Note: Vercel typically auto-deploys when env vars change
      // But we can also trigger via deployments API if needed
      console.log('ℹ️  Vercel should automatically trigger deployment when environment variables change');
      console.log('⏱️  New deployment should appear within 1-2 minutes');
      
      return {
        success: true,
        message: 'Deployment will be triggered automatically by Vercel'
      };
    } catch (error) {
      console.error('❌ Failed to trigger deployment:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🎯 Complete MCP environment setup
   */
  async setupMCPEnvironment() {
    try {
      console.log('🎯 COMPLETE MCP ENVIRONMENT SETUP');
      console.log('=================================\n');

      // Step 1: Configure environment variables
      const envResult = await this.addMCPEnvironmentVariables();
      
      if (!envResult.success) {
        throw new Error(`Environment configuration failed: ${envResult.error}`);
      }

      // Step 2: Trigger deployment
      const deployResult = await this.triggerDeployment();

      // Step 3: Return comprehensive result
      return {
        success: true,
        environmentVariables: envResult,
        deployment: deployResult,
        nextSteps: [
          '🔍 Monitor GitHub API for new deployment',
          '⏱️  Wait 2-3 minutes for deployment completion',
          '🧪 Test MCP endpoints on preview URL',
          '📱 Validate mobile optimization performance',
          '🚀 Create Pull Request for autonomous deployment'
        ]
      };

    } catch (error) {
      console.error('💥 Complete MCP setup failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const projectId = 'prj_SSG5WpGBBO3tRfyA0GKAtDhymr24';
  const manager = new VercelEnvManager(projectId);
  
  manager.setupMCPEnvironment()
    .then(result => {
      console.log('\n📊 FINAL RESULT:');
      console.log('================');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\n🎉 MCP ENVIRONMENT SETUP COMPLETE!');
        console.log('\n🔧 NEXT STEPS:');
        result.nextSteps.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step}`);
        });
      } else {
        console.log('\n❌ SETUP FAILED - Check error details above');
      }
    })
    .catch(error => {
      console.error('💥 Script execution failed:', error);
      process.exit(1);
    });
}

module.exports = VercelEnvManager;
