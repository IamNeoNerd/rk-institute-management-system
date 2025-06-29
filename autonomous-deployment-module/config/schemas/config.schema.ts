/**
 * 🔧 Configuration Schema
 * 
 * TypeScript interfaces and schemas for autonomous deployment configuration.
 * Provides type safety and validation for module configuration.
 */

export interface AutonomousDeploymentConfig {
  // Project Information
  project: {
    name: string;
    version: string;
    framework: 'nextjs' | 'react' | 'vue' | 'node' | 'custom';
    platform: 'vercel' | 'netlify' | 'aws' | 'azure' | 'custom';
    repository?: string;
    deploymentUrl?: string;
  };

  // Database Configuration
  database?: {
    type: 'prisma' | 'mongodb' | 'mysql' | 'postgresql' | 'none';
    enabled: boolean;
    adapter?: string;
    healthCheck: boolean;
    connectionTimeout: number;
    retries: number;
    thresholds?: {
      slowQuery: number;
      verySlowQuery: number;
    };
  };

  // Health Check Configuration
  healthChecks: {
    enabled: boolean;
    endpoints: HealthEndpoint[];
    interval: number;
    timeout: number;
    retries: number;
    thresholds: {
      memoryDegraded: number;
      memoryUnhealthy: number;
      responseTime: number;
    };
  };

  // Monitoring Configuration
  monitoring: {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
    discrepancyDetection: boolean;
    testEndpoints?: string[];
    baseUrl?: string;
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
      aws?: {
        enabled: boolean;
        region: string;
        applicationName: string;
        accessKeyId: string;
        secretAccessKey: string;
      };
    };
    notifications?: {
      slack?: { webhook: string; channels: string[] };
      discord?: { webhook: string };
      email?: { smtp: SMTPConfig; recipients: string[] };
      teams?: { webhook: string };
    };
    intervals: {
      healthCheck: number;
      deploymentCheck: number;
      statusUpdate: number;
    };
  };

  // Automation Configuration
  automation?: {
    enabled: boolean;
    type: 'none' | 'custom';
    adapter?: any;
    thresholds?: {
      failureRate: {
        degraded: number;
        unhealthy: number;
      };
      maxJobDuration: number;
      maxQueueSize: number;
    };
  };

  // MCP Integration
  mcp?: {
    enabled: boolean;
    tools: string[];
    server: {
      port: number;
      protocol: string;
      endpoints: string[];
    };
  };

  // UI Dashboard
  ui?: {
    enabled: boolean;
    route: string;
    theme: 'light' | 'dark' | 'auto';
    autoRefresh: number;
    components: string[];
  };

  // Environment Configuration
  environment: {
    required: string[];
    optional: string[];
    validation?: EnvironmentValidation;
  };

  // General Configuration
  version?: string;
  nodeEnvironment?: string;
  deployment?: string;
  commit?: string;
}

export interface HealthEndpoint {
  path: string;
  name: string;
  critical: boolean;
  timeout: number;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EnvironmentValidation {
  [key: string]: {
    pattern?: RegExp;
    minLength?: number;
    required?: boolean;
  };
}

// Default configuration
export const DEFAULT_CONFIG: Partial<AutonomousDeploymentConfig> = {
  project: {
    name: 'unknown-project',
    version: '1.0.0',
    framework: 'custom',
    platform: 'custom'
  },
  database: {
    type: 'none',
    enabled: false,
    healthCheck: false,
    connectionTimeout: 5000,
    retries: 3
  },
  healthChecks: {
    enabled: true,
    endpoints: [
      { path: '/api/health', name: 'System Health', critical: true, timeout: 5000 }
    ],
    interval: 30000,
    timeout: 10000,
    retries: 3,
    thresholds: {
      memoryDegraded: 70,
      memoryUnhealthy: 85,
      responseTime: 2000
    }
  },
  monitoring: {
    enabled: true,
    interval: 30000,
    timeout: 10000,
    retries: 3,
    discrepancyDetection: true,
    platforms: {},
    intervals: {
      healthCheck: 30000,
      deploymentCheck: 15000,
      statusUpdate: 60000
    }
  },
  automation: {
    enabled: false,
    type: 'none'
  },
  environment: {
    required: [],
    optional: []
  }
};

// Configuration validation
export function validateConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate project configuration
  if (!config.project?.name) {
    errors.push('project.name is required');
  }

  if (!config.project?.framework) {
    errors.push('project.framework is required');
  }

  if (!config.project?.platform) {
    errors.push('project.platform is required');
  }

  // Validate health checks
  if (config.healthChecks?.enabled && !config.healthChecks?.endpoints?.length) {
    errors.push('healthChecks.endpoints is required when health checks are enabled');
  }

  // Validate monitoring
  if (config.monitoring?.enabled) {
    if (!config.monitoring.platforms || Object.keys(config.monitoring.platforms).length === 0) {
      errors.push('monitoring.platforms must have at least one platform when monitoring is enabled');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Configuration merging utility
export function mergeConfig(userConfig: any, defaultConfig = DEFAULT_CONFIG): AutonomousDeploymentConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    project: {
      ...defaultConfig.project,
      ...userConfig.project
    },
    database: {
      ...defaultConfig.database,
      ...userConfig.database
    },
    healthChecks: {
      ...defaultConfig.healthChecks,
      ...userConfig.healthChecks,
      thresholds: {
        ...defaultConfig.healthChecks?.thresholds,
        ...userConfig.healthChecks?.thresholds
      }
    },
    monitoring: {
      ...defaultConfig.monitoring,
      ...userConfig.monitoring,
      platforms: {
        ...defaultConfig.monitoring?.platforms,
        ...userConfig.monitoring?.platforms
      },
      intervals: {
        ...defaultConfig.monitoring?.intervals,
        ...userConfig.monitoring?.intervals
      }
    },
    environment: {
      ...defaultConfig.environment,
      ...userConfig.environment
    }
  } as AutonomousDeploymentConfig;
}
