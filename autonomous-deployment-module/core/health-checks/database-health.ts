/**
 * 🗄️ Database Health Check System
 * 
 * Database-specific health monitoring with adapter pattern support.
 * Provides comprehensive database connectivity and performance metrics.
 * 
 * Extracted from RK Institute Management System for modular reuse.
 */

import { BaseHealthChecker, HealthCheckResult, DatabaseHealthCheck } from './base-health';

export interface DatabaseAdapter {
  connect(): Promise<boolean>;
  healthCheck(): Promise<{
    status: 'connected' | 'disconnected';
    responseTime: number;
    error?: string;
  }>;
  getPerformanceMetrics(): Promise<{
    queryTime: number;
    connectionPool?: {
      active: number;
      idle: number;
      total: number;
    };
  }>;
  getMetadata(): Promise<{
    database: string;
    host: string;
    ssl: boolean;
    version?: string;
  }>;
  disconnect(): Promise<void>;
}

export class DatabaseHealthChecker extends BaseHealthChecker {
  private adapter: DatabaseAdapter;

  constructor(config: any, adapter: DatabaseAdapter) {
    super(config);
    this.adapter = adapter;
  }

  async performHealthCheck(): Promise<DatabaseHealthCheck> {
    const startTime = Date.now();

    try {
      // Basic connectivity test
      const connectionCheck = await this.adapter.healthCheck();
      
      // Performance metrics
      const performanceMetrics = await this.adapter.getPerformanceMetrics();
      
      // Database metadata
      const metadata = await this.adapter.getMetadata();

      // Determine overall status
      const overallStatus = this.determineStatus(connectionCheck, performanceMetrics);

      const healthCheck: DatabaseHealthCheck = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        connection: connectionCheck,
        performance: performanceMetrics,
        metadata
      };

      return healthCheck;
    } catch (error) {
      // Error fallback
      const errorResponse: DatabaseHealthCheck = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        connection: {
          status: 'disconnected',
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown database error'
        },
        performance: {
          queryTime: 0
        },
        metadata: {
          database: 'unknown',
          host: 'unknown',
          ssl: false
        }
      };

      return errorResponse;
    }
  }

  private determineStatus(
    connectionCheck: { status: string; responseTime: number },
    performanceMetrics: { queryTime: number }
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // Connection failed
    if (connectionCheck.status === 'disconnected') {
      return 'unhealthy';
    }

    // Performance thresholds (configurable)
    const slowQueryThreshold = this.config?.thresholds?.slowQuery || 1000; // 1 second
    const verySlowQueryThreshold = this.config?.thresholds?.verySlowQuery || 5000; // 5 seconds

    // Very slow performance
    if (performanceMetrics.queryTime > verySlowQueryThreshold) {
      return 'unhealthy';
    }

    // Degraded performance
    if (performanceMetrics.queryTime > slowQueryThreshold) {
      return 'degraded';
    }

    return 'healthy';
  }
}

// No-op database adapter for projects without databases
export class NoOpDatabaseAdapter implements DatabaseAdapter {
  async connect(): Promise<boolean> {
    return true;
  }

  async healthCheck(): Promise<{
    status: 'connected' | 'disconnected';
    responseTime: number;
    error?: string;
  }> {
    return {
      status: 'connected',
      responseTime: 0
    };
  }

  async getPerformanceMetrics(): Promise<{
    queryTime: number;
    connectionPool?: {
      active: number;
      idle: number;
      total: number;
    };
  }> {
    return {
      queryTime: 0
    };
  }

  async getMetadata(): Promise<{
    database: string;
    host: string;
    ssl: boolean;
    version?: string;
  }> {
    return {
      database: 'none',
      host: 'localhost',
      ssl: false,
      version: 'N/A'
    };
  }

  async disconnect(): Promise<void> {
    // No-op
  }
}

// Database adapter factory
export class DatabaseAdapterFactory {
  static create(config: any): DatabaseAdapter {
    const databaseType = config?.database?.type || 'none';

    switch (databaseType) {
      case 'none':
        return new NoOpDatabaseAdapter();
      case 'prisma':
        // Will be implemented in adapters/database/prisma-adapter.ts
        throw new Error('Prisma adapter not yet implemented. Use adapters/database/prisma-adapter.ts');
      case 'mongodb':
        // Will be implemented in adapters/database/mongodb-adapter.ts
        throw new Error('MongoDB adapter not yet implemented. Use adapters/database/mongodb-adapter.ts');
      case 'mysql':
        // Will be implemented in adapters/database/mysql-adapter.ts
        throw new Error('MySQL adapter not yet implemented. Use adapters/database/mysql-adapter.ts');
      default:
        console.warn(`Unknown database type: ${databaseType}. Using no-op adapter.`);
        return new NoOpDatabaseAdapter();
    }
  }
}

// Utility functions for database health checks
export function formatConnectionString(connectionString: string): string {
  // Hide sensitive information in connection strings
  return connectionString.replace(/:[^:@]*@/, ':***@');
}

export function calculateConnectionPoolUtilization(pool: {
  active: number;
  idle: number;
  total: number;
}): number {
  if (pool.total === 0) return 0;
  return Math.round((pool.active / pool.total) * 100);
}

export function getDatabaseHealthThresholds(config: any) {
  return {
    slowQuery: config?.database?.thresholds?.slowQuery || 1000,
    verySlowQuery: config?.database?.thresholds?.verySlowQuery || 5000,
    connectionTimeout: config?.database?.connectionTimeout || 5000,
    retries: config?.database?.retries || 3
  };
}
