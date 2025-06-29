/**
 * 🏥 Base Health Check System
 * 
 * Core interfaces and base classes for the autonomous deployment health check system.
 * Provides framework-agnostic health monitoring with adapter pattern support.
 * 
 * Extracted from RK Institute Management System for modular reuse.
 */

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  responseTime: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database?: HealthCheckResult;
    memory?: MemoryHealthCheck;
    uptime?: UptimeHealthCheck;
    automation?: HealthCheckResult;
  };
  metadata: {
    nodeVersion: string;
    platform: string;
    architecture: string;
  };
}

export interface MemoryHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  usage: number;
  limit: number;
  percentage: number;
}

export interface UptimeHealthCheck {
  status: 'healthy';
  seconds: number;
  formatted: string;
}

export interface DatabaseHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  connection: {
    status: 'connected' | 'disconnected';
    responseTime: number;
    error?: string;
  };
  performance: {
    queryTime: number;
    connectionPool?: {
      active: number;
      idle: number;
      total: number;
    };
  };
  metadata: {
    database: string;
    host: string;
    ssl: boolean;
    version?: string;
  };
}

export abstract class BaseHealthChecker {
  protected config: any;

  constructor(config: any) {
    this.config = config;
  }

  abstract performHealthCheck(): Promise<any>;

  protected formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  protected getMemoryHealth(): MemoryHealthCheck {
    const memoryUsage = process.memoryUsage();
    const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const percentage = Math.round((usedMB / totalMB) * 100);

    // Memory health thresholds (configurable)
    const degradedThreshold = this.config?.thresholds?.memoryDegraded || 70;
    const unhealthyThreshold = this.config?.thresholds?.memoryUnhealthy || 85;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (percentage >= unhealthyThreshold) {
      status = 'unhealthy';
    } else if (percentage >= degradedThreshold) {
      status = 'degraded';
    }

    return {
      status,
      usage: usedMB,
      limit: totalMB,
      percentage
    };
  }

  protected getUptimeHealth(): UptimeHealthCheck {
    const uptimeSeconds = Math.floor(process.uptime());
    
    return {
      status: 'healthy',
      seconds: uptimeSeconds,
      formatted: this.formatUptime(uptimeSeconds)
    };
  }

  protected determineOverallStatus(checks: Record<string, HealthCheckResult | any>): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Object.values(checks).map(check => check.status);
    
    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    } else if (statuses.includes('degraded')) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  protected getHttpStatusCode(status: 'healthy' | 'degraded' | 'unhealthy'): number {
    switch (status) {
      case 'healthy': return 200;
      case 'degraded': return 200; // Still operational
      case 'unhealthy': return 503; // Service unavailable
      default: return 500;
    }
  }
}

export class SystemHealthChecker extends BaseHealthChecker {
  private databaseChecker?: BaseHealthChecker;
  private automationChecker?: BaseHealthChecker;

  constructor(config: any, databaseChecker?: BaseHealthChecker, automationChecker?: BaseHealthChecker) {
    super(config);
    this.databaseChecker = databaseChecker;
    this.automationChecker = automationChecker;
  }

  async performHealthCheck(): Promise<SystemHealthCheck> {
    const startTime = Date.now();

    try {
      // Perform all health checks
      const checks: SystemHealthCheck['checks'] = {
        memory: this.getMemoryHealth(),
        uptime: this.getUptimeHealth()
      };

      // Database health check (if available)
      if (this.databaseChecker) {
        try {
          const dbResult = await this.databaseChecker.performHealthCheck();
          checks.database = dbResult;
        } catch (error) {
          checks.database = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown database error'
          };
        }
      }

      // Automation health check (if available)
      if (this.automationChecker) {
        try {
          const automationResult = await this.automationChecker.performHealthCheck();
          checks.automation = automationResult;
        } catch (error) {
          checks.automation = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown automation error'
          };
        }
      }

      // Determine overall status
      const overallStatus = this.determineOverallStatus(checks);

      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: this.config.version || process.env.npm_package_version || '1.0.0',
        environment: this.config.environment || process.env.NODE_ENV || 'development',
        checks,
        metadata: {
          nodeVersion: process.version,
          platform: process.platform,
          architecture: process.arch
        }
      };
    } catch (error) {
      // Fallback error response
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: this.config.version || '1.0.0',
        environment: this.config.environment || 'unknown',
        checks: {
          memory: { status: 'unhealthy', usage: 0, limit: 0, percentage: 0 },
          uptime: { status: 'healthy', seconds: Math.floor(process.uptime()), formatted: this.formatUptime(Math.floor(process.uptime())) }
        },
        metadata: {
          nodeVersion: process.version,
          platform: process.platform,
          architecture: process.arch
        }
      };
    }
  }
}

export class SimpleHealthChecker extends BaseHealthChecker {
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const memoryHealth = this.getMemoryHealth();
      const uptimeHealth = this.getUptimeHealth();

      const health = {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        metadata: {
          uptime: uptimeHealth.seconds,
          environment: this.config.environment || process.env.NODE_ENV || 'unknown',
          deployment: this.config.deployment || 'autonomous-deployment',
          commit: this.config.commit || 'unknown',
          services: {
            api: 'operational',
            server: 'running'
          },
          memory: {
            used: memoryHealth.usage,
            total: memoryHealth.limit
          },
          apiRouteWorking: true
        }
      };

      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          apiRouteWorking: false
        }
      };
    }
  }
}

// Health check response headers
export const HEALTH_CHECK_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
} as const;
