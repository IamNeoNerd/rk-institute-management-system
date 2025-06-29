/**
 * 🔍 GitHub-Platform Discrepancy Detector
 * 
 * Intelligent detection of synchronization issues between GitHub and deployment platforms.
 * Provides comprehensive analysis and automated remediation suggestions.
 * 
 * Extracted from RK Institute Management System for modular reuse.
 */

export interface DiscrepancyAnalysis {
  type: DiscrepancyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  githubStatus: {
    found: boolean;
    success: boolean;
    commit?: string;
    timestamp?: string;
  };
  platformStatus: {
    success: boolean;
    workingEndpoints: number;
    totalEndpoints: number;
    htmlResponses: number;
  };
  recommendations: string[];
  autoFixAvailable: boolean;
}

export type DiscrepancyType = 
  | 'github_success_platform_html'
  | 'github_not_found'
  | 'platform_deployment_lag'
  | 'endpoint_configuration_mismatch'
  | 'build_configuration_issue'
  | 'environment_variable_mismatch'
  | 'no_discrepancy';

export interface EndpointTestResult {
  endpoint: string;
  statusCode: number;
  isJson: boolean;
  responseTime: number;
  success: boolean;
  error?: string;
}

export interface GitHubStatusResult {
  found: boolean;
  success: boolean;
  commit?: string;
  timestamp?: string;
  error?: string;
}

export interface PlatformStatusResult {
  functionalSuccess: boolean;
  workingCount: number;
  totalCount: number;
  discrepancyCount: number;
  endpoints: EndpointTestResult[];
}

export class DiscrepancyDetector {
  private config: any;
  private githubAdapter: any;
  private platformAdapter: any;

  constructor(config: any, githubAdapter: any, platformAdapter: any) {
    this.config = config;
    this.githubAdapter = githubAdapter;
    this.platformAdapter = platformAdapter;
  }

  /**
   * Perform comprehensive discrepancy analysis
   */
  async analyzeDiscrepancy(targetCommit: string): Promise<DiscrepancyAnalysis> {
    console.log(`🔍 Analyzing discrepancy for commit: ${targetCommit}`);

    try {
      // Phase 1: GitHub status check
      const githubStatus = await this.getGitHubStatus(targetCommit);
      
      // Phase 2: Platform endpoint testing
      const platformStatus = await this.testPlatformEndpoints();
      
      // Phase 3: Discrepancy classification
      const discrepancyType = this.classifyDiscrepancy(githubStatus, platformStatus);
      
      // Phase 4: Generate analysis and recommendations
      const analysis = this.generateAnalysis(discrepancyType, githubStatus, platformStatus);
      
      return analysis;
    } catch (error) {
      return {
        type: 'github_not_found',
        severity: 'critical',
        description: 'Failed to perform discrepancy analysis',
        githubStatus: { found: false, success: false },
        platformStatus: { success: false, workingEndpoints: 0, totalEndpoints: 0, htmlResponses: 0 },
        recommendations: ['Check network connectivity', 'Verify API tokens', 'Retry analysis'],
        autoFixAvailable: false
      };
    }
  }

  /**
   * Get GitHub deployment status
   */
  private async getGitHubStatus(targetCommit: string): Promise<GitHubStatusResult> {
    try {
      if (!this.githubAdapter) {
        return { found: false, success: false, error: 'GitHub adapter not configured' };
      }

      const deployments = await this.githubAdapter.getDeployments();
      const targetDeployment = deployments.find((d: any) => 
        d.commit?.sha?.startsWith(targetCommit)
      );

      if (!targetDeployment) {
        return { found: false, success: false, error: 'Deployment not found' };
      }

      return {
        found: true,
        success: targetDeployment.state === 'ready' || targetDeployment.state === 'success',
        commit: targetDeployment.commit?.sha,
        timestamp: targetDeployment.createdAt
      };
    } catch (error) {
      return {
        found: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown GitHub error'
      };
    }
  }

  /**
   * Test platform endpoints for functionality
   */
  private async testPlatformEndpoints(): Promise<PlatformStatusResult> {
    const testEndpoints = this.config.monitoring?.testEndpoints || [
      '/api/health',
      '/api/health-simple',
      '/api/mcp'
    ];

    const results: EndpointTestResult[] = [];
    let workingCount = 0;
    let htmlResponses = 0;

    for (const endpoint of testEndpoints) {
      try {
        const result = await this.testEndpoint(endpoint);
        results.push(result);

        if (result.success && result.isJson) {
          workingCount++;
        }

        if (!result.isJson && result.statusCode === 404) {
          htmlResponses++;
        }
      } catch (error) {
        results.push({
          endpoint,
          statusCode: 0,
          isJson: false,
          responseTime: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      functionalSuccess: workingCount > 0,
      workingCount,
      totalCount: testEndpoints.length,
      discrepancyCount: htmlResponses,
      endpoints: results
    };
  }

  /**
   * Test individual endpoint
   */
  private async testEndpoint(endpoint: string): Promise<EndpointTestResult> {
    const startTime = Date.now();
    const baseUrl = this.config.project?.deploymentUrl || this.config.monitoring?.baseUrl;

    if (!baseUrl) {
      throw new Error('No base URL configured for endpoint testing');
    }

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: { 'User-Agent': 'DiscrepancyDetector/1.0' }
      });

      const responseTime = Date.now() - startTime;
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      return {
        endpoint,
        statusCode: response.status,
        isJson,
        responseTime,
        success: response.ok && isJson
      };
    } catch (error) {
      return {
        endpoint,
        statusCode: 0,
        isJson: false,
        responseTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Classify the type of discrepancy
   */
  private classifyDiscrepancy(
    githubStatus: GitHubStatusResult,
    platformStatus: PlatformStatusResult
  ): DiscrepancyType {
    // No GitHub deployment found
    if (!githubStatus.found) {
      return 'github_not_found';
    }

    // GitHub success but platform serving HTML instead of JSON
    if (githubStatus.success && !platformStatus.functionalSuccess && platformStatus.discrepancyCount > 0) {
      return 'github_success_platform_html';
    }

    // GitHub success but platform endpoints not working
    if (githubStatus.success && !platformStatus.functionalSuccess) {
      return 'endpoint_configuration_mismatch';
    }

    // GitHub not successful yet (deployment lag)
    if (!githubStatus.success && !platformStatus.functionalSuccess) {
      return 'platform_deployment_lag';
    }

    // Both successful - no discrepancy
    if (githubStatus.success && platformStatus.functionalSuccess) {
      return 'no_discrepancy';
    }

    // Default to build configuration issue
    return 'build_configuration_issue';
  }

  /**
   * Generate comprehensive analysis and recommendations
   */
  private generateAnalysis(
    type: DiscrepancyType,
    githubStatus: GitHubStatusResult,
    platformStatus: PlatformStatusResult
  ): DiscrepancyAnalysis {
    const analysisMap: Record<DiscrepancyType, Omit<DiscrepancyAnalysis, 'githubStatus' | 'platformStatus'>> = {
      'github_success_platform_html': {
        type: 'github_success_platform_html',
        severity: 'high',
        description: 'GitHub reports successful deployment but platform endpoints return HTML instead of JSON',
        recommendations: [
          'Check API route configuration in next.config.js',
          'Verify serverless function deployment settings',
          'Remove output: "standalone" if present in Next.js config',
          'Check Vercel function runtime configuration'
        ],
        autoFixAvailable: true
      },
      'github_not_found': {
        type: 'github_not_found',
        severity: 'critical',
        description: 'No deployment found in GitHub for the specified commit',
        recommendations: [
          'Verify the commit SHA is correct',
          'Check if deployment was triggered',
          'Verify GitHub API access and permissions',
          'Check repository and branch configuration'
        ],
        autoFixAvailable: false
      },
      'platform_deployment_lag': {
        type: 'platform_deployment_lag',
        severity: 'medium',
        description: 'Deployment is still in progress on the platform',
        recommendations: [
          'Wait for deployment to complete (typically 2-3 minutes)',
          'Monitor deployment logs for errors',
          'Check platform status page for issues'
        ],
        autoFixAvailable: false
      },
      'endpoint_configuration_mismatch': {
        type: 'endpoint_configuration_mismatch',
        severity: 'high',
        description: 'Platform deployment successful but API endpoints not responding correctly',
        recommendations: [
          'Check API route file structure and naming',
          'Verify export statements in API routes',
          'Check platform-specific configuration files',
          'Review build logs for API route compilation errors'
        ],
        autoFixAvailable: true
      },
      'build_configuration_issue': {
        type: 'build_configuration_issue',
        severity: 'high',
        description: 'Build configuration preventing proper deployment',
        recommendations: [
          'Check build scripts and configuration',
          'Verify environment variables',
          'Review platform-specific settings',
          'Check for TypeScript or compilation errors'
        ],
        autoFixAvailable: true
      },
      'environment_variable_mismatch': {
        type: 'environment_variable_mismatch',
        severity: 'medium',
        description: 'Environment variables may not be properly configured',
        recommendations: [
          'Verify all required environment variables are set',
          'Check environment variable names and values',
          'Ensure secrets are properly configured',
          'Review platform environment settings'
        ],
        autoFixAvailable: true
      },
      'no_discrepancy': {
        type: 'no_discrepancy',
        severity: 'low',
        description: 'No discrepancy detected - both GitHub and platform report success',
        recommendations: [
          'System is functioning correctly',
          'Continue monitoring for future deployments'
        ],
        autoFixAvailable: false
      }
    };

    const baseAnalysis = analysisMap[type];

    return {
      ...baseAnalysis,
      githubStatus: {
        found: githubStatus.found,
        success: githubStatus.success,
        commit: githubStatus.commit,
        timestamp: githubStatus.timestamp
      },
      platformStatus: {
        success: platformStatus.functionalSuccess,
        workingEndpoints: platformStatus.workingCount,
        totalEndpoints: platformStatus.totalCount,
        htmlResponses: platformStatus.discrepancyCount
      }
    };
  }

  /**
   * Monitor for discrepancy resolution
   */
  async monitorUntilResolved(
    targetCommit: string,
    maxWaitSeconds: number = 300,
    checkInterval: number = 15
  ): Promise<{ resolved: boolean; finalAnalysis: DiscrepancyAnalysis; attempts: number }> {
    const startTime = Date.now();
    const maxWaitMs = maxWaitSeconds * 1000;
    let attempts = 0;

    console.log(`🔍 Monitoring discrepancy resolution for commit: ${targetCommit}`);
    console.log(`⏰ Max wait: ${maxWaitSeconds}s | Check interval: ${checkInterval}s`);

    while (Date.now() - startTime < maxWaitMs) {
      attempts++;
      console.log(`\n🔍 Check ${attempts} (${Math.floor((Date.now() - startTime) / 1000)}s elapsed):`);

      const analysis = await this.analyzeDiscrepancy(targetCommit);

      if (analysis.type === 'no_discrepancy') {
        console.log('✅ Discrepancy resolved!');
        return { resolved: true, finalAnalysis: analysis, attempts };
      }

      console.log(`⚠️  Discrepancy persists: ${analysis.type}`);
      console.log(`   GitHub Success: ${analysis.githubStatus.success}`);
      console.log(`   Platform Success: ${analysis.platformStatus.success}`);
      console.log(`   Working Endpoints: ${analysis.platformStatus.workingEndpoints}/${analysis.platformStatus.totalEndpoints}`);

      if (attempts < Math.floor(maxWaitSeconds / checkInterval)) {
        console.log(`   ⏳ Waiting ${checkInterval}s...`);
        await new Promise(resolve => setTimeout(resolve, checkInterval * 1000));
      }
    }

    console.log(`\n⏰ Timeout reached after ${attempts} attempts`);
    const finalAnalysis = await this.analyzeDiscrepancy(targetCommit);
    return { resolved: false, finalAnalysis, attempts };
  }
}
