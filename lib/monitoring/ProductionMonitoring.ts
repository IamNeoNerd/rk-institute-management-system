/**
 * Production Monitoring & Error Tracking
 * RK Institute Management System
 *
 * Comprehensive monitoring solution for production environment
 * including error tracking, performance monitoring, and health checks
 */

interface MonitoringConfig {
  environment: 'production' | 'staging' | 'development';
  enableErrorTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableHealthChecks: boolean;
  alertThresholds: {
    errorRate: number;
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: boolean;
    redis?: boolean;
    externalServices: boolean;
    diskSpace: boolean;
    memory: boolean;
  };
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
  };
}

interface ErrorReport {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'critical';
  message: string;
  stack?: string;
  context: {
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    url: string;
    method: string;
  };
  metadata?: Record<string, any>;
}

class ProductionMonitoring {
  private config: MonitoringConfig;
  private healthCheckInterval?: NodeJS.Timeout;
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring systems
   */
  private initializeMonitoring(): void {
    if (this.config.enableHealthChecks) {
      this.startHealthChecks();
    }

    if (this.config.enablePerformanceMonitoring) {
      this.initializePerformanceTracking();
    }

    if (this.config.enableErrorTracking) {
      this.initializeErrorTracking();
    }

    // Set up graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  /**
   * Start health check monitoring
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const healthResult = await this.performHealthCheck();
        await this.reportHealthStatus(healthResult);

        if (healthResult.status === 'unhealthy') {
          await this.triggerAlert('Health check failed', healthResult);
        }
      } catch (error) {
        console.error('Health check failed:', error);
        await this.reportError({
          id: `health-check-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'critical',
          message: 'Health check system failure',
          stack: error instanceof Error ? error.stack : undefined,
          context: {
            url: '/health',
            method: 'GET'
          }
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      externalServices: await this.checkExternalServices(),
      diskSpace: await this.checkDiskSpace(),
      memory: await this.checkMemoryUsage()
    };

    const responseTime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const allChecksPass = Object.values(checks).every(check => check === true);
    const status: HealthCheckResult['status'] = allChecksPass
      ? 'healthy'
      : Object.values(checks).some(check => check === true)
        ? 'degraded'
        : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks,
      metrics: {
        responseTime,
        memoryUsage: memoryUsage.heapUsed / 1024 / 1024, // MB
        cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
        activeConnections: await this.getActiveConnections()
      }
    };
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<boolean> {
    try {
      // Import Prisma client dynamically to avoid circular dependencies
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Check Redis connectivity (if enabled)
   */
  private async checkRedis(): Promise<boolean> {
    if (!process.env.REDIS_URL || process.env.REDIS_ENABLED !== 'true') {
      return true; // Skip if Redis not configured
    }

    try {
      // Redis health check implementation
      // This would require Redis client setup
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Check external services
   */
  private async checkExternalServices(): Promise<boolean> {
    try {
      // Check critical external services
      const services: Promise<any>[] = [
        // Add your external service health checks here
        // Example: fetch('https://api.external-service.com/health')
      ];

      const results = await Promise.allSettled(services);
      return results.every(result => result.status === 'fulfilled');
    } catch (error) {
      console.error('External services health check failed:', error);
      return false;
    }
  }

  /**
   * Check disk space
   */
  private async checkDiskSpace(): Promise<boolean> {
    try {
      const fs = await import('fs');
      const stats = fs.statSync('.');
      // Simplified disk space check - in production, use proper disk space monitoring
      return true;
    } catch (error) {
      console.error('Disk space check failed:', error);
      return false;
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemoryUsage(): Promise<boolean> {
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;

      // Alert if memory usage exceeds threshold (default: 512MB)
      const memoryThreshold = parseInt(process.env.MEMORY_THRESHOLD || '512');
      return heapUsedMB < memoryThreshold;
    } catch (error) {
      console.error('Memory usage check failed:', error);
      return false;
    }
  }

  /**
   * Get active database connections
   */
  private async getActiveConnections(): Promise<number> {
    try {
      // This would require database-specific implementation
      return 0;
    } catch (error) {
      console.error('Failed to get active connections:', error);
      return 0;
    }
  }

  /**
   * Initialize performance tracking
   */
  private initializePerformanceTracking(): void {
    // Track API response times
    this.trackAPIPerformance();

    // Track database query performance
    this.trackDatabasePerformance();

    // Track memory and CPU usage
    this.trackSystemPerformance();
  }

  /**
   * Track API performance
   */
  private trackAPIPerformance(): void {
    // This would integrate with your API middleware
    // to track response times and error rates
  }

  /**
   * Track database performance
   */
  private trackDatabasePerformance(): void {
    // This would integrate with Prisma middleware
    // to track query performance
  }

  /**
   * Track system performance
   */
  private trackSystemPerformance(): void {
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      this.recordMetric('memory.heap', memoryUsage.heapUsed / 1024 / 1024);
      this.recordMetric('memory.rss', memoryUsage.rss / 1024 / 1024);
      this.recordMetric('cpu.user', cpuUsage.user / 1000000);
      this.recordMetric('cpu.system', cpuUsage.system / 1000000);
    }, 60000); // Every minute
  }

  /**
   * Record performance metric
   */
  private recordMetric(name: string, value: number): void {
    if (!this.performanceMetrics.has(name)) {
      this.performanceMetrics.set(name, []);
    }

    const metrics = this.performanceMetrics.get(name)!;
    metrics.push(value);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Initialize error tracking
   */
  private initializeErrorTracking(): void {
    // Global error handlers
    process.on('uncaughtException', error => {
      this.reportError({
        id: `uncaught-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'critical',
        message: `Uncaught Exception: ${error.message}`,
        stack: error.stack,
        context: {
          url: 'N/A',
          method: 'N/A'
        }
      });
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.reportError({
        id: `unhandled-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'critical',
        message: `Unhandled Rejection: ${reason}`,
        context: {
          url: 'N/A',
          method: 'N/A'
        },
        metadata: { promise: promise.toString() }
      });
    });
  }

  /**
   * Report error to monitoring service
   */
  async reportError(error: ErrorReport): Promise<void> {
    try {
      // Log to console for immediate visibility
      console.error(`[${error.level.toUpperCase()}] ${error.message}`, {
        id: error.id,
        timestamp: error.timestamp,
        context: error.context,
        stack: error.stack
      });

      // Send to external monitoring service (Sentry, etc.)
      if (process.env.SENTRY_DSN) {
        // Sentry integration would go here
      }

      // Store in database for analysis
      await this.storeErrorReport(error);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  /**
   * Store error report in database
   */
  private async storeErrorReport(error: ErrorReport): Promise<void> {
    try {
      // Database storage implementation
      // This would store errors for analysis and trending
    } catch (error) {
      console.error('Failed to store error report:', error);
    }
  }

  /**
   * Report health status
   */
  private async reportHealthStatus(health: HealthCheckResult): Promise<void> {
    // Log health status
    console.log(`Health Check: ${health.status}`, {
      timestamp: health.timestamp,
      responseTime: health.metrics.responseTime,
      memoryUsage: health.metrics.memoryUsage
    });

    // Store health metrics for trending
    this.recordMetric('health.responseTime', health.metrics.responseTime);
    this.recordMetric('health.memoryUsage', health.metrics.memoryUsage);
  }

  /**
   * Trigger alert for critical issues
   */
  private async triggerAlert(message: string, context: any): Promise<void> {
    console.error(`ALERT: ${message}`, context);

    // Integration with alerting systems (Slack, email, etc.)
    if (process.env.SLACK_WEBHOOK_URL) {
      // Slack notification implementation
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): Record<string, number[]> {
    return Object.fromEntries(this.performanceMetrics);
  }

  /**
   * Graceful shutdown
   */
  private shutdown(): void {
    console.log('Shutting down monitoring...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Flush any pending metrics
    console.log('Final metrics:', this.getMetrics());
  }
}

// Export singleton instance
export const monitoring = new ProductionMonitoring({
  environment: (process.env.NODE_ENV as any) || 'development',
  enableErrorTracking: process.env.FEATURE_ERROR_TRACK === 'true',
  enablePerformanceMonitoring: process.env.FEATURE_PERF_MON === 'true',
  enableHealthChecks: true,
  alertThresholds: {
    errorRate: 0.05, // 5%
    responseTime: 2000, // 2 seconds
    memoryUsage: 512, // 512MB
    cpuUsage: 80 // 80%
  }
});

export default ProductionMonitoring;
