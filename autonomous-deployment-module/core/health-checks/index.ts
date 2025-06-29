/**
 * 🏥 Health Check System - Main Export
 * 
 * Centralized exports for the autonomous deployment health check system.
 * Provides all health check interfaces, classes, and utilities.
 * 
 * Extracted from RK Institute Management System for modular reuse.
 */

// Base health check system
export {
  HealthCheckResult,
  SystemHealthCheck,
  MemoryHealthCheck,
  UptimeHealthCheck,
  DatabaseHealthCheck,
  BaseHealthChecker,
  SystemHealthChecker,
  SimpleHealthChecker,
  HEALTH_CHECK_HEADERS
} from './base-health';

// Database health check system
export {
  DatabaseAdapter,
  DatabaseHealthChecker,
  NoOpDatabaseAdapter,
  DatabaseAdapterFactory,
  formatConnectionString,
  calculateConnectionPoolUtilization,
  getDatabaseHealthThresholds
} from './database-health';

// Automation health check system
export {
  AutomationJob,
  ScheduledJob,
  AutomationHealthCheck,
  AutomationAdapter,
  AutomationHealthChecker,
  NoOpAutomationAdapter,
  AutomationAdapterFactory,
  calculateJobSuccessRate,
  getJobDuration,
  formatJobDuration,
  getAutomationHealthThresholds
} from './automation-health';

// Health check factory for easy setup
export class HealthCheckFactory {
  static createSystemHealthChecker(config: any): SystemHealthChecker {
    // Create database adapter if configured
    let databaseChecker: DatabaseHealthChecker | undefined;
    if (config?.database?.enabled !== false) {
      try {
        const databaseAdapter = DatabaseAdapterFactory.create(config);
        databaseChecker = new DatabaseHealthChecker(config, databaseAdapter);
      } catch (error) {
        console.warn('Database health checker creation failed:', error);
      }
    }

    // Create automation adapter if configured
    let automationChecker: AutomationHealthChecker | undefined;
    if (config?.automation?.enabled !== false) {
      try {
        const automationAdapter = AutomationAdapterFactory.create(config);
        automationChecker = new AutomationHealthChecker(config, automationAdapter);
      } catch (error) {
        console.warn('Automation health checker creation failed:', error);
      }
    }

    return new SystemHealthChecker(config, databaseChecker, automationChecker);
  }

  static createSimpleHealthChecker(config: any): SimpleHealthChecker {
    return new SimpleHealthChecker(config);
  }

  static createDatabaseHealthChecker(config: any): DatabaseHealthChecker {
    const databaseAdapter = DatabaseAdapterFactory.create(config);
    return new DatabaseHealthChecker(config, databaseAdapter);
  }

  static createAutomationHealthChecker(config: any): AutomationHealthChecker {
    const automationAdapter = AutomationAdapterFactory.create(config);
    return new AutomationHealthChecker(config, automationAdapter);
  }
}

// Default health check configuration
export const DEFAULT_HEALTH_CONFIG = {
  thresholds: {
    memoryDegraded: 70,
    memoryUnhealthy: 85,
    slowQuery: 1000,
    verySlowQuery: 5000,
    failureRate: {
      degraded: 0.1,
      unhealthy: 0.25
    }
  },
  database: {
    enabled: true,
    type: 'none',
    connectionTimeout: 5000,
    retries: 3
  },
  automation: {
    enabled: false,
    type: 'none'
  },
  version: '1.0.0',
  environment: 'development'
};

// Health check utilities
export class HealthCheckUtils {
  static mergeConfig(userConfig: any, defaultConfig = DEFAULT_HEALTH_CONFIG): any {
    return {
      ...defaultConfig,
      ...userConfig,
      thresholds: {
        ...defaultConfig.thresholds,
        ...userConfig?.thresholds
      },
      database: {
        ...defaultConfig.database,
        ...userConfig?.database
      },
      automation: {
        ...defaultConfig.automation,
        ...userConfig?.automation
      }
    };
  }

  static validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!config.version) {
      errors.push('config.version is required');
    }

    if (!config.environment) {
      errors.push('config.environment is required');
    }

    // Validate thresholds
    if (config.thresholds) {
      if (config.thresholds.memoryDegraded && (config.thresholds.memoryDegraded < 0 || config.thresholds.memoryDegraded > 100)) {
        errors.push('config.thresholds.memoryDegraded must be between 0 and 100');
      }

      if (config.thresholds.memoryUnhealthy && (config.thresholds.memoryUnhealthy < 0 || config.thresholds.memoryUnhealthy > 100)) {
        errors.push('config.thresholds.memoryUnhealthy must be between 0 and 100');
      }
    }

    // Validate database config
    if (config.database?.enabled && !config.database.type) {
      errors.push('config.database.type is required when database is enabled');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static formatHealthResponse(healthCheck: any, httpStatusCode?: boolean): any {
    const response = {
      ...healthCheck,
      timestamp: healthCheck.timestamp || new Date().toISOString()
    };

    if (httpStatusCode) {
      const statusCode = healthCheck.status === 'healthy' ? 200 :
                        healthCheck.status === 'degraded' ? 200 :
                        503;
      return { ...response, statusCode };
    }

    return response;
  }
}
