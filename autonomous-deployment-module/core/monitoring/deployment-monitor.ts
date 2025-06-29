/**
 * 🔍 Core Deployment Monitor
 * 
 * Real-time deployment monitoring with platform-agnostic design.
 * Provides continuous monitoring of deployment status and health.
 * 
 * Extracted from RK Institute Management System for modular reuse.
 */

export interface DeploymentStatus {
  id: string;
  state: 'pending' | 'building' | 'ready' | 'error' | 'canceled';
  url?: string;
  createdAt: string;
  updatedAt: string;
  commit?: {
    sha: string;
    message: string;
    author: string;
  };
  environment: string;
  duration?: number;
  error?: string;
}

export interface MonitoringConfig {
  project: {
    name: string;
    repository: string;
    platform: string;
  };
  monitoring: {
    interval: number;
    timeout: number;
    retries: number;
    platforms: {
      github?: {
        enabled: boolean;
        repository: string;
        token: string;
        branch?: string;
      };
      vercel?: {
        enabled: boolean;
        projectId: string;
        token: string;
        orgId?: string;
      };
      netlify?: {
        enabled: boolean;
        siteId: string;
        token: string;
      };
    };
  };
}

export interface PlatformAdapter {
  getDeployments(limit?: number): Promise<DeploymentStatus[]>;
  getDeploymentStatus(id: string): Promise<DeploymentStatus>;
  getLatestDeployment(): Promise<DeploymentStatus | null>;
  triggerDeployment?(): Promise<string>;
}

export class DeploymentMonitor {
  private config: MonitoringConfig;
  private platformAdapters: Map<string, PlatformAdapter>;
  private monitoringActive: boolean = false;
  private lastDeploymentId: string | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.platformAdapters = new Map();
  }

  /**
   * Register a platform adapter for monitoring
   */
  registerPlatformAdapter(platform: string, adapter: PlatformAdapter): void {
    this.platformAdapters.set(platform, adapter);
  }

  /**
   * Check for new deployments across all registered platforms
   */
  async checkForNewDeployments(): Promise<DeploymentStatus | null> {
    try {
      for (const [platform, adapter] of this.platformAdapters) {
        const latestDeployment = await adapter.getLatestDeployment();
        
        if (latestDeployment && latestDeployment.id !== this.lastDeploymentId) {
          this.lastDeploymentId = latestDeployment.id;
          return latestDeployment;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for new deployments:', error);
      return null;
    }
  }

  /**
   * Handle new deployment detection
   */
  private handleNewDeployment(deployment: DeploymentStatus): void {
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`\n🚀 NEW DEPLOYMENT DETECTED [${timestamp}]`);
    console.log('=====================================');
    console.log(`📦 ID: ${deployment.id}`);
    console.log(`🔄 State: ${deployment.state}`);
    console.log(`🌐 URL: ${deployment.url || 'Not available'}`);
    console.log(`📅 Created: ${new Date(deployment.createdAt).toLocaleString()}`);
    
    if (deployment.commit) {
      console.log(`📝 Commit: ${deployment.commit.sha.substring(0, 8)} - ${deployment.commit.message}`);
      console.log(`👤 Author: ${deployment.commit.author}`);
    }
    
    if (deployment.duration) {
      console.log(`⏱️  Duration: ${Math.round(deployment.duration / 1000)}s`);
    }
    
    if (deployment.error) {
      console.log(`❌ Error: ${deployment.error}`);
    }
    
    console.log('');
  }

  /**
   * Start continuous monitoring
   */
  async startMonitoring(intervalSeconds: number = 30): Promise<void> {
    console.log('🤖 DEPLOYMENT MONITOR STARTED');
    console.log('============================');
    console.log(`⏱️  Checking every ${intervalSeconds} seconds`);
    console.log(`🔍 Monitoring platforms: ${Array.from(this.platformAdapters.keys()).join(', ')}`);
    console.log('🔍 Monitoring for new deployments...\n');

    this.monitoringActive = true;

    // Initial check
    const initialResult = await this.checkForNewDeployments();
    if (initialResult) {
      this.handleNewDeployment(initialResult);
    } else {
      console.log('📋 No new deployments detected. Monitoring...');
    }

    // Set up interval monitoring
    this.monitoringInterval = setInterval(async () => {
      if (!this.monitoringActive) {
        this.stopMonitoring();
        return;
      }

      const result = await this.checkForNewDeployments();
      if (result) {
        this.handleNewDeployment(result);
        
        // If deployment is successful, we can stop monitoring (optional)
        if (result.state === 'ready') {
          console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
          if (this.config.monitoring.platforms.github?.enabled) {
            console.log('✅ Ready for autonomous verification');
          }
        } else if (result.state === 'error') {
          console.log('\n❌ DEPLOYMENT FAILED!');
          console.log('🔧 Check deployment logs for details');
        }
      } else {
        process.stdout.write('.');
      }
    }, intervalSeconds * 1000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Monitoring stopped by user');
      this.stopMonitoring();
      process.exit(0);
    });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.monitoringActive = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('🛑 Deployment monitoring stopped');
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    active: boolean;
    lastDeploymentId: string | null;
    platforms: string[];
    config: MonitoringConfig;
  } {
    return {
      active: this.monitoringActive,
      lastDeploymentId: this.lastDeploymentId,
      platforms: Array.from(this.platformAdapters.keys()),
      config: this.config
    };
  }

  /**
   * Monitor specific deployment until completion
   */
  async monitorDeployment(deploymentId: string, maxWaitSeconds: number = 300): Promise<{
    success: boolean;
    deployment?: DeploymentStatus;
    error?: string;
    timeout?: boolean;
  }> {
    const startTime = Date.now();
    const maxWaitMs = maxWaitSeconds * 1000;

    console.log(`🔍 Monitoring deployment: ${deploymentId}`);
    console.log(`⏰ Max wait time: ${maxWaitSeconds} seconds`);

    while (Date.now() - startTime < maxWaitMs) {
      try {
        // Check deployment status across all platforms
        for (const [platform, adapter] of this.platformAdapters) {
          try {
            const deployment = await adapter.getDeploymentStatus(deploymentId);
            
            if (deployment.state === 'ready') {
              console.log(`\n✅ Deployment ${deploymentId} completed successfully!`);
              return { success: true, deployment };
            } else if (deployment.state === 'error') {
              console.log(`\n❌ Deployment ${deploymentId} failed!`);
              return { success: false, deployment, error: deployment.error };
            } else {
              console.log(`⏳ Deployment ${deploymentId} status: ${deployment.state}`);
            }
          } catch (error) {
            console.log(`⚠️  Error checking ${platform}:`, error);
          }
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
      } catch (error) {
        console.error('Error monitoring deployment:', error);
      }
    }

    console.log(`\n⏰ Timeout reached for deployment ${deploymentId}`);
    return { success: false, timeout: true };
  }

  /**
   * Get deployment history
   */
  async getDeploymentHistory(limit: number = 10): Promise<DeploymentStatus[]> {
    const allDeployments: DeploymentStatus[] = [];

    for (const [platform, adapter] of this.platformAdapters) {
      try {
        const deployments = await adapter.getDeployments(limit);
        allDeployments.push(...deployments);
      } catch (error) {
        console.error(`Error getting deployments from ${platform}:`, error);
      }
    }

    // Sort by creation date (newest first)
    return allDeployments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

// Utility functions
export function formatDeploymentDuration(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function getDeploymentStatusEmoji(state: string): string {
  switch (state) {
    case 'ready': return '✅';
    case 'building': return '🔄';
    case 'pending': return '⏳';
    case 'error': return '❌';
    case 'canceled': return '🚫';
    default: return '❓';
  }
}

export function isDeploymentComplete(state: string): boolean {
  return ['ready', 'error', 'canceled'].includes(state);
}

export function isDeploymentSuccessful(state: string): boolean {
  return state === 'ready';
}
