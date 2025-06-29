/**
 * 🔍 Monitoring System - Main Export
 * 
 * Centralized exports for the autonomous deployment monitoring system.
 * Provides deployment monitoring, discrepancy detection, and platform integration.
 * 
 * Extracted from RK Institute Management System for modular reuse.
 */

// Core deployment monitoring
export {
  DeploymentStatus,
  MonitoringConfig,
  PlatformAdapter,
  DeploymentMonitor,
  formatDeploymentDuration,
  getDeploymentStatusEmoji,
  isDeploymentComplete,
  isDeploymentSuccessful
} from './deployment-monitor';

// Discrepancy detection system
export {
  DiscrepancyAnalysis,
  DiscrepancyType,
  EndpointTestResult,
  GitHubStatusResult,
  PlatformStatusResult,
  DiscrepancyDetector
} from './discrepancy-detector';

// Monitoring factory for easy setup
export class MonitoringFactory {
  static createDeploymentMonitor(config: MonitoringConfig): DeploymentMonitor {
    return new DeploymentMonitor(config);
  }

  static createDiscrepancyDetector(
    config: any,
    githubAdapter: any,
    platformAdapter: any
  ): DiscrepancyDetector {
    return new DiscrepancyDetector(config, githubAdapter, platformAdapter);
  }

  static createMonitoringSystem(config: MonitoringConfig): {
    deploymentMonitor: DeploymentMonitor;
    discrepancyDetector?: DiscrepancyDetector;
  } {
    const deploymentMonitor = new DeploymentMonitor(config);

    // Create discrepancy detector if GitHub monitoring is enabled
    let discrepancyDetector: DiscrepancyDetector | undefined;
    if (config.monitoring.platforms.github?.enabled) {
      // Note: Adapters need to be provided by the host application
      console.log('GitHub monitoring enabled - discrepancy detection available');
    }

    return {
      deploymentMonitor,
      discrepancyDetector
    };
  }
}

// Default monitoring configuration
export const DEFAULT_MONITORING_CONFIG: Partial<MonitoringConfig> = {
  monitoring: {
    interval: 30000, // 30 seconds
    timeout: 10000,  // 10 seconds
    retries: 3,
    platforms: {}
  }
};

// Monitoring utilities
export class MonitoringUtils {
  static mergeConfig(userConfig: Partial<MonitoringConfig>): MonitoringConfig {
    return {
      project: {
        name: userConfig.project?.name || 'unknown-project',
        repository: userConfig.project?.repository || 'unknown/repository',
        platform: userConfig.project?.platform || 'unknown'
      },
      monitoring: {
        ...DEFAULT_MONITORING_CONFIG.monitoring!,
        ...userConfig.monitoring,
        platforms: {
          ...DEFAULT_MONITORING_CONFIG.monitoring!.platforms,
          ...userConfig.monitoring?.platforms
        }
      }
    };
  }

  static validateConfig(config: MonitoringConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate project configuration
    if (!config.project.name) {
      errors.push('project.name is required');
    }

    if (!config.project.repository) {
      errors.push('project.repository is required');
    }

    if (!config.project.platform) {
      errors.push('project.platform is required');
    }

    // Validate monitoring configuration
    if (config.monitoring.interval < 1000) {
      errors.push('monitoring.interval must be at least 1000ms');
    }

    if (config.monitoring.timeout < 1000) {
      errors.push('monitoring.timeout must be at least 1000ms');
    }

    if (config.monitoring.retries < 1) {
      errors.push('monitoring.retries must be at least 1');
    }

    // Validate platform configurations
    const platforms = config.monitoring.platforms;

    if (platforms.github?.enabled) {
      if (!platforms.github.repository) {
        errors.push('monitoring.platforms.github.repository is required when GitHub is enabled');
      }
      if (!platforms.github.token) {
        errors.push('monitoring.platforms.github.token is required when GitHub is enabled');
      }
    }

    if (platforms.vercel?.enabled) {
      if (!platforms.vercel.projectId) {
        errors.push('monitoring.platforms.vercel.projectId is required when Vercel is enabled');
      }
      if (!platforms.vercel.token) {
        errors.push('monitoring.platforms.vercel.token is required when Vercel is enabled');
      }
    }

    if (platforms.netlify?.enabled) {
      if (!platforms.netlify.siteId) {
        errors.push('monitoring.platforms.netlify.siteId is required when Netlify is enabled');
      }
      if (!platforms.netlify.token) {
        errors.push('monitoring.platforms.netlify.token is required when Netlify is enabled');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static getEnabledPlatforms(config: MonitoringConfig): string[] {
    const platforms: string[] = [];

    if (config.monitoring.platforms.github?.enabled) {
      platforms.push('github');
    }

    if (config.monitoring.platforms.vercel?.enabled) {
      platforms.push('vercel');
    }

    if (config.monitoring.platforms.netlify?.enabled) {
      platforms.push('netlify');
    }

    return platforms;
  }

  static formatMonitoringStatus(status: any): string {
    const lines = [
      '🔍 MONITORING STATUS',
      '==================',
      `Active: ${status.active ? '✅ Yes' : '❌ No'}`,
      `Last Deployment: ${status.lastDeploymentId || 'None'}`,
      `Platforms: ${status.platforms.join(', ') || 'None'}`,
      `Interval: ${status.config.monitoring.interval / 1000}s`,
      `Timeout: ${status.config.monitoring.timeout / 1000}s`,
      `Retries: ${status.config.monitoring.retries}`
    ];

    return lines.join('\n');
  }

  static createTestEndpoints(baseUrl: string, endpoints: string[] = ['/api/health']): string[] {
    return endpoints.map(endpoint => {
      if (endpoint.startsWith('http')) {
        return endpoint;
      }
      return `${baseUrl.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    });
  }

  static calculateSuccessRate(deployments: DeploymentStatus[]): number {
    if (deployments.length === 0) return 100;

    const successfulDeployments = deployments.filter(d => d.state === 'ready').length;
    return Math.round((successfulDeployments / deployments.length) * 100);
  }

  static getAverageDeploymentTime(deployments: DeploymentStatus[]): number {
    const completedDeployments = deployments.filter(d => d.duration && d.duration > 0);
    
    if (completedDeployments.length === 0) return 0;

    const totalDuration = completedDeployments.reduce((sum, d) => sum + (d.duration || 0), 0);
    return Math.round(totalDuration / completedDeployments.length);
  }

  static groupDeploymentsByStatus(deployments: DeploymentStatus[]): Record<string, number> {
    const groups: Record<string, number> = {
      ready: 0,
      building: 0,
      pending: 0,
      error: 0,
      canceled: 0
    };

    deployments.forEach(deployment => {
      groups[deployment.state] = (groups[deployment.state] || 0) + 1;
    });

    return groups;
  }
}

// Monitoring event types for extensibility
export interface MonitoringEvent {
  type: 'deployment_started' | 'deployment_completed' | 'deployment_failed' | 'discrepancy_detected' | 'discrepancy_resolved';
  timestamp: string;
  data: any;
}

export type MonitoringEventHandler = (event: MonitoringEvent) => void | Promise<void>;

// Event-driven monitoring system
export class MonitoringEventEmitter {
  private handlers: Map<string, MonitoringEventHandler[]> = new Map();

  on(eventType: MonitoringEvent['type'], handler: MonitoringEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  off(eventType: MonitoringEvent['type'], handler: MonitoringEventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  async emit(event: MonitoringEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in monitoring event handler for ${event.type}:`, error);
      }
    }
  }
}
