#!/usr/bin/env node

/**
 * 🚀 Enhanced Vercel Deployment Monitor with Build Log Integration
 * 
 * Autonomous system that captures Vercel build logs and provides
 * automated error classification and remediation suggestions.
 */

const https = require('https');

class EnhancedVercelMonitor {
  constructor() {
    this.vercelToken = process.env.VERCEL_TOKEN || 'VRg1lQ7oLLPrm4RAWOebPz9C';
    this.projectId = 'prj_SSG5WpGBBO3tRfyA0GKAtDhymr24';
    this.baseUrl = 'https://rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app';
    
    // Error classification patterns
    this.errorPatterns = {
      'Function Runtimes must have a valid version': {
        category: 'RUNTIME_CONFIGURATION',
        severity: 'HIGH',
        remediation: 'Remove invalid runtime specification from vercel.json or use correct format like "nodejs18.x"',
        autoFix: true
      },
      'Can\'t reach database server': {
        category: 'DATABASE_CONNECTION',
        severity: 'HIGH', 
        remediation: 'Database migrations should not run during build. Use build:ci script or configure environment variables.',
        autoFix: false
      },
      'Module not found': {
        category: 'DEPENDENCY_MISSING',
        severity: 'MEDIUM',
        remediation: 'Install missing dependencies or check import paths',
        autoFix: false
      },
      'Build failed': {
        category: 'BUILD_ERROR',
        severity: 'HIGH',
        remediation: 'Check build logs for specific error details',
        autoFix: false
      }
    };
  }

  /**
   * Make authenticated request to Vercel API
   */
  async makeVercelRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: 'api.vercel.com',
        path: path,
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${this.vercelToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const req = https.request(requestOptions, (res) => {
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
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  /**
   * Get deployments for a specific commit SHA
   */
  async getDeploymentByCommit(commitSha) {
    try {
      const response = await this.makeVercelRequest(
        `/v6/deployments?projectId=${this.projectId}&sha=${commitSha}&limit=5`
      );

      if (response.statusCode === 200 && response.data.deployments) {
        return response.data.deployments[0]; // Most recent deployment
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching deployment:', error.message);
      return null;
    }
  }

  /**
   * Get build logs for a deployment
   */
  async getBuildLogs(deploymentId) {
    try {
      const response = await this.makeVercelRequest(
        `/v3/deployments/${deploymentId}/events?builds=1&limit=100`
      );

      if (response.statusCode === 200) {
        return response.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error fetching build logs:', error.message);
      return [];
    }
  }

  /**
   * Analyze build logs for errors and classify them
   */
  analyzeBuildLogs(logs) {
    const errors = [];
    const warnings = [];
    let buildStatus = 'UNKNOWN';

    for (const log of logs) {
      if (log.payload && log.payload.text) {
        const text = log.payload.text;
        
        // Check for build status
        if (text.includes('Build failed') || text.includes('Error:')) {
          buildStatus = 'FAILED';
        } else if (text.includes('Build completed') || text.includes('Build successful')) {
          buildStatus = 'SUCCESS';
        }

        // Classify errors
        for (const [pattern, classification] of Object.entries(this.errorPatterns)) {
          if (text.includes(pattern)) {
            errors.push({
              message: text,
              pattern: pattern,
              classification: classification,
              timestamp: log.created || Date.now()
            });
          }
        }

        // Capture warnings
        if (text.includes('Warning:') || text.includes('WARN')) {
          warnings.push({
            message: text,
            timestamp: log.created || Date.now()
          });
        }
      }
    }

    return {
      buildStatus,
      errors,
      warnings,
      totalLogs: logs.length
    };
  }

  /**
   * Generate remediation suggestions based on error analysis
   */
  generateRemediationPlan(analysis) {
    const plan = {
      priority: 'LOW',
      actions: [],
      autoFixAvailable: false,
      estimatedTime: '5 minutes',
      specificFixes: []
    };

    if (analysis.errors.length === 0) {
      plan.actions.push('✅ No errors detected in build logs');
      return plan;
    }

    // Determine priority based on error severity
    const highSeverityErrors = analysis.errors.filter(e => e.classification.severity === 'HIGH');
    if (highSeverityErrors.length > 0) {
      plan.priority = 'HIGH';
      plan.estimatedTime = '15-30 minutes';
    }

    // Generate specific actions and auto-fixes
    for (const error of analysis.errors) {
      const action = {
        error: error.pattern,
        remediation: error.classification.remediation,
        category: error.classification.category,
        autoFix: error.classification.autoFix
      };

      plan.actions.push(action);

      if (error.classification.autoFix) {
        plan.autoFixAvailable = true;

        // Add specific auto-fix instructions
        if (error.pattern.includes('Function Runtimes must have a valid version')) {
          plan.specificFixes.push({
            file: 'vercel.json',
            action: 'remove_runtime_specification',
            description: 'Remove invalid runtime specification from functions configuration'
          });
        }
      }
    }

    return plan;
  }

  /**
   * Execute auto-fixes for detected issues
   */
  async executeAutoFixes(remediationPlan) {
    if (!remediationPlan.autoFixAvailable) {
      return { success: false, message: 'No auto-fixes available' };
    }

    console.log('\n🤖 EXECUTING AUTO-FIXES:');
    const results = [];

    for (const fix of remediationPlan.specificFixes) {
      console.log(`   🔧 ${fix.description}`);

      if (fix.action === 'remove_runtime_specification' && fix.file === 'vercel.json') {
        // This would be implemented to actually modify the file
        results.push({
          fix: fix.description,
          status: 'simulated',
          message: 'Would remove runtime specification from vercel.json'
        });
      }
    }

    return { success: true, results: results };
  }

  /**
   * Comprehensive deployment monitoring with build log analysis
   */
  async monitorDeployment(commitSha, maxWaitSeconds = 300) {
    console.log('🚀 ENHANCED VERCEL DEPLOYMENT MONITORING');
    console.log('==========================================');
    console.log(`Target Commit: ${commitSha}`);
    console.log(`Max Wait: ${maxWaitSeconds}s | Enhanced with Build Log Analysis\n`);

    const startTime = Date.now();
    let attempt = 1;

    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      console.log(`🔍 Enhanced Check ${attempt} (${elapsed}s elapsed):`);

      // Get deployment information
      const deployment = await this.getDeploymentByCommit(commitSha);
      
      if (!deployment) {
        console.log('⏳ No deployment found yet, waiting...\n');
        await this.sleep(15000);
        attempt++;
        continue;
      }

      console.log(`📦 Deployment Found: ${deployment.uid}`);
      console.log(`📊 State: ${deployment.state}`);
      console.log(`🌐 URL: ${deployment.url || 'Not available'}`);

      // Get and analyze build logs
      const buildLogs = await this.getBuildLogs(deployment.uid);
      const analysis = this.analyzeBuildLogs(buildLogs);
      
      console.log(`📋 Build Logs: ${analysis.totalLogs} entries`);
      console.log(`🔍 Build Status: ${analysis.buildStatus}`);
      console.log(`❌ Errors Found: ${analysis.errors.length}`);
      console.log(`⚠️  Warnings Found: ${analysis.warnings.length}`);

      // Generate remediation plan
      if (analysis.errors.length > 0) {
        console.log('\n🔧 ERROR ANALYSIS:');
        const plan = this.generateRemediationPlan(analysis);
        
        console.log(`Priority: ${plan.priority}`);
        console.log(`Estimated Fix Time: ${plan.estimatedTime}`);
        console.log(`Auto-fix Available: ${plan.autoFixAvailable ? '✅ Yes' : '❌ No'}`);
        
        console.log('\n📋 REMEDIATION ACTIONS:');
        for (const action of plan.actions) {
          if (typeof action === 'string') {
            console.log(`   ${action}`);
          } else {
            console.log(`   🔸 ${action.category}: ${action.remediation}`);
            if (action.autoFix) {
              console.log(`     🤖 Auto-fix available for: ${action.error}`);
            }
          }
        }
      }

      // Check if deployment is complete
      if (deployment.state === 'READY') {
        console.log('\n✅ DEPLOYMENT SUCCESSFUL');
        return {
          success: true,
          deployment: deployment,
          analysis: analysis,
          remediation: this.generateRemediationPlan(analysis)
        };
      } else if (deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
        console.log('\n❌ DEPLOYMENT FAILED');
        return {
          success: false,
          deployment: deployment,
          analysis: analysis,
          remediation: this.generateRemediationPlan(analysis)
        };
      }

      console.log('⏳ Deployment in progress, waiting...\n');
      await this.sleep(15000);
      attempt++;
    }

    console.log('\n⏰ MONITORING TIMEOUT');
    return {
      success: false,
      error: 'Timeout waiting for deployment completion',
      analysis: null,
      remediation: null
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Execute if run directly
if (require.main === module) {
  const commitSha = process.argv[2];
  const maxWait = parseInt(process.argv[3]) || 300;

  if (!commitSha) {
    console.error('❌ Usage: node enhanced-vercel-monitor.js <commit-sha> [max-wait-seconds]');
    process.exit(1);
  }

  const monitor = new EnhancedVercelMonitor();
  
  monitor.monitorDeployment(commitSha, maxWait)
    .then(result => {
      console.log('\n📊 ENHANCED MONITORING COMPLETE');
      console.log('================================');
      
      if (result.success) {
        console.log('✅ Status: SUCCESS');
        console.log(`🌐 URL: ${result.deployment.url}`);
      } else {
        console.log('❌ Status: FAILED');
        if (result.error) {
          console.log(`💥 Error: ${result.error}`);
        }
      }

      if (result.analysis && result.analysis.errors.length > 0) {
        console.log(`\n🔧 AUTONOMOUS DIAGNOSIS:`);
        console.log(`   Errors Detected: ${result.analysis.errors.length}`);
        console.log(`   Auto-fix Available: ${result.remediation.autoFixAvailable ? 'Yes' : 'No'}`);
        console.log(`   Priority: ${result.remediation.priority}`);
      }

      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Enhanced monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = EnhancedVercelMonitor;
