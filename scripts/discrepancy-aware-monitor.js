#!/usr/bin/env node

/**
 * 🔍 Discrepancy-Aware Deployment Monitor v1.0
 * 
 * Specifically designed to handle GitHub-Vercel synchronization discrepancies
 * Implements dual-verification with enhanced discrepancy detection
 * 
 * Addresses RK-16: GitHub API vs Vercel Synchronization Issue
 */

const https = require('https');

class DiscrepancyAwareMonitor {
  constructor() {
    this.baseUrl = 'https://rk-institute-management-system-dlyvkh090-iamneonerds-projects.vercel.app';
    this.githubRepo = 'IamNeoNerd/rk-institute-management-system';
    this.maxWaitTime = 300; // 5 minutes
    this.checkInterval = 15; // 15 seconds
  }

  /**
   * 🌐 HTTP request helper
   */
  async makeRequest(url, method = 'GET', data = null, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.protocol === 'https:' ? 443 : 80,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: { 'User-Agent': 'Discrepancy-Aware-Monitor/1.0' },
        timeout
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = (urlObj.protocol === 'https:' ? https : require('http')).request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
            url: url
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      req.on('error', reject);

      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  /**
   * 📋 Get GitHub deployment status
   */
  async getGitHubStatus(targetCommit) {
    try {
      const response = await this.makeRequest(
        `https://api.github.com/repos/${this.githubRepo}/deployments?per_page=10`
      );
      
      if (response.statusCode === 200) {
        const deployments = JSON.parse(response.data);
        const targetDeployment = deployments.find(d => 
          d.sha.startsWith(targetCommit) || d.sha === targetCommit
        );
        
        if (targetDeployment) {
          const statusResponse = await this.makeRequest(
            `https://api.github.com/repos/${this.githubRepo}/deployments/${targetDeployment.id}/statuses`
          );
          
          if (statusResponse.statusCode === 200) {
            const statuses = JSON.parse(statusResponse.data);
            const latestStatus = statuses.length > 0 ? statuses[0] : null;
            
            return {
              found: true,
              deployment: targetDeployment,
              status: latestStatus,
              success: latestStatus && latestStatus.state === 'success'
            };
          }
        }
      }
      
      return { found: false, success: false };
    } catch (error) {
      console.error('GitHub API error:', error.message);
      return { found: false, success: false, error: error.message };
    }
  }

  /**
   * 🧪 Test Vercel endpoint functionality
   */
  async testVercelEndpoints() {
    const endpoints = ['/api/test', '/api/health-simple', '/api/mcp'];
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(`${this.baseUrl}${endpoint}`, 'GET', null, 8000);
        
        const contentType = response.headers['content-type'] || '';
        const isJson = contentType.includes('application/json');
        const isHtml = contentType.includes('text/html');
        
        // Key discrepancy detection: expecting JSON but getting HTML
        const discrepancy = response.statusCode === 200 && isHtml && !isJson;
        const working = response.statusCode === 200 && isJson;
        
        results.push({
          endpoint,
          statusCode: response.statusCode,
          contentType,
          isJson,
          isHtml,
          working,
          discrepancy,
          preview: response.data.substring(0, 100) + '...'
        });
      } catch (error) {
        results.push({
          endpoint,
          statusCode: 0,
          contentType: 'error',
          isJson: false,
          isHtml: false,
          working: false,
          discrepancy: false,
          preview: error.message
        });
      }
    }
    
    const workingCount = results.filter(r => r.working).length;
    const discrepancyCount = results.filter(r => r.discrepancy).length;
    
    return {
      results,
      workingCount,
      totalCount: endpoints.length,
      discrepancyCount,
      functionalSuccess: workingCount > 0
    };
  }

  /**
   * 🔍 Comprehensive verification with discrepancy detection
   */
  async verifyDeployment(targetCommit) {
    console.log(`🔍 Verifying deployment for commit: ${targetCommit}`);
    
    // Phase 1: GitHub API check
    const githubStatus = await this.getGitHubStatus(targetCommit);
    
    // Phase 2: Functional endpoint check
    const vercelStatus = await this.testVercelEndpoints();
    
    // Phase 3: Discrepancy analysis
    const analysis = {
      githubFound: githubStatus.found,
      githubSuccess: githubStatus.success,
      vercelSuccess: vercelStatus.functionalSuccess,
      workingEndpoints: vercelStatus.workingCount,
      totalEndpoints: vercelStatus.totalCount,
      discrepanciesDetected: vercelStatus.discrepancyCount,
      timestamp: new Date().toISOString()
    };
    
    // Determine overall status
    let overallSuccess = false;
    let reason = '';
    let discrepancyType = 'none';
    
    if (githubStatus.success && vercelStatus.functionalSuccess) {
      overallSuccess = true;
      reason = 'Both GitHub API and Vercel endpoints working';
      discrepancyType = 'none';
    } else if (githubStatus.success && !vercelStatus.functionalSuccess && vercelStatus.discrepancyCount > 0) {
      overallSuccess = false;
      reason = 'GitHub reports success but Vercel endpoints return HTML (RK-16 discrepancy)';
      discrepancyType = 'github_success_vercel_html';
    } else if (githubStatus.success && !vercelStatus.functionalSuccess) {
      overallSuccess = false;
      reason = 'GitHub reports success but Vercel endpoints not working';
      discrepancyType = 'github_success_vercel_failed';
    } else if (!githubStatus.success && vercelStatus.functionalSuccess) {
      overallSuccess = true;
      reason = 'Vercel working despite GitHub API status (possible API lag)';
      discrepancyType = 'github_failed_vercel_working';
    } else {
      overallSuccess = false;
      reason = 'Both GitHub and Vercel indicate deployment failure';
      discrepancyType = 'both_failed';
    }
    
    return {
      success: overallSuccess,
      reason,
      discrepancyType,
      analysis,
      githubData: githubStatus,
      vercelData: vercelStatus
    };
  }

  /**
   * 🕐 Monitor with enhanced discrepancy handling
   */
  async monitor(targetCommit, maxWaitSeconds = 180) {
    console.log('🚀 DISCREPANCY-AWARE DEPLOYMENT MONITORING');
    console.log('==========================================');
    console.log(`Target Commit: ${targetCommit}`);
    console.log(`Max Wait: ${maxWaitSeconds}s | Check Interval: ${this.checkInterval}s\n`);

    const startTime = Date.now();
    let attempt = 1;
    
    while (true) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`🔍 Check ${attempt} (${elapsed}s elapsed):`);
      
      const result = await this.verifyDeployment(targetCommit);
      
      // Enhanced logging for discrepancies
      if (result.discrepancyType !== 'none') {
        console.log(`⚠️  DISCREPANCY DETECTED: ${result.discrepancyType}`);
        console.log(`   GitHub Success: ${result.analysis.githubSuccess}`);
        console.log(`   Vercel Success: ${result.analysis.vercelSuccess}`);
        console.log(`   HTML Responses: ${result.analysis.discrepanciesDetected}/${result.analysis.totalEndpoints}`);
      }
      
      console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`   Reason: ${result.reason}`);
      
      if (result.success) {
        console.log(`\n🎉 DEPLOYMENT VERIFIED after ${elapsed} seconds!`);
        if (result.discrepancyType !== 'none') {
          console.log(`⚠️  Note: Discrepancy type '${result.discrepancyType}' was detected but resolved`);
        }
        return result;
      }
      
      if (elapsed >= maxWaitSeconds) {
        console.log(`\n⏰ TIMEOUT after ${elapsed} seconds`);
        console.log(`Final discrepancy type: ${result.discrepancyType}`);
        return result;
      }
      
      console.log(`   ⏳ Waiting ${this.checkInterval}s...\n`);
      await new Promise(resolve => setTimeout(resolve, this.checkInterval * 1000));
      attempt++;
    }
  }
}

// 🚀 Execute if run directly
if (require.main === module) {
  const monitor = new DiscrepancyAwareMonitor();
  const targetCommit = process.argv[2] || 'c942fe53';
  const maxWait = parseInt(process.argv[3]) || 180;
  
  monitor.monitor(targetCommit, maxWait)
    .then(result => {
      console.log('\n📊 MONITORING COMPLETE');
      console.log(`Success: ${result.success}`);
      console.log(`Discrepancy Type: ${result.discrepancyType}`);
      
      if (result.discrepancyType === 'github_success_vercel_html') {
        console.log('\n🚨 RK-16 DISCREPANCY CONFIRMED:');
        console.log('   GitHub API reports success but Vercel serves HTML instead of JSON');
        console.log('   This indicates a build/routing issue not detected by GitHub');
      }
      
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = DiscrepancyAwareMonitor;
