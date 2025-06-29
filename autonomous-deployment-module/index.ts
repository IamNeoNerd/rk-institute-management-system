/**
 * 🚀 Autonomous Deployment Module
 * 
 * Enterprise-grade autonomous deployment monitoring and verification system.
 * Extracted from RK Institute Management System for modular reuse.
 * 
 * @version 1.0.0
 * @author Autonomous Deployment Team
 * @license MIT
 */

// Core Health Check System
export * from './core/health-checks';

// Core Monitoring System
export * from './core/monitoring';

// Configuration System
export * from './config/schemas/config.schema';

// Main Module Interface
export interface AutonomousDeploymentModule {
  healthChecks: {
    createSystemHealthChecker: (config: any) => any;
    createSimpleHealthChecker: (config: any) => any;
    createDatabaseHealthChecker: (config: any) => any;
    createAutomationHealthChecker: (config: any) => any;
  };
  monitoring: {
    createDeploymentMonitor: (config: any) => any;
    createDiscrepancyDetector: (config: any, githubAdapter: any, platformAdapter: any) => any;
    createMonitoringSystem: (config: any) => any;
  };
  adapters: {
    database: any;
    platforms: any;
    frameworks: any;
  };
  ui: {
    components: any;
    templates: any;
  };
  utils: {
    config: any;
    validation: any;
  };
}

// Version information
export const VERSION = '1.0.0';
export const MODULE_NAME = 'autonomous-deployment-module';

// Default export for easy importing
const AutonomousDeployment: AutonomousDeploymentModule = {
  healthChecks: {
    createSystemHealthChecker: (config: any) => {
      const { HealthCheckFactory } = require('./core/health-checks');
      return HealthCheckFactory.createSystemHealthChecker(config);
    },
    createSimpleHealthChecker: (config: any) => {
      const { HealthCheckFactory } = require('./core/health-checks');
      return HealthCheckFactory.createSimpleHealthChecker(config);
    },
    createDatabaseHealthChecker: (config: any) => {
      const { HealthCheckFactory } = require('./core/health-checks');
      return HealthCheckFactory.createDatabaseHealthChecker(config);
    },
    createAutomationHealthChecker: (config: any) => {
      const { HealthCheckFactory } = require('./core/health-checks');
      return HealthCheckFactory.createAutomationHealthChecker(config);
    }
  },
  monitoring: {
    createDeploymentMonitor: (config: any) => {
      const { MonitoringFactory } = require('./core/monitoring');
      return MonitoringFactory.createDeploymentMonitor(config);
    },
    createDiscrepancyDetector: (config: any, githubAdapter: any, platformAdapter: any) => {
      const { MonitoringFactory } = require('./core/monitoring');
      return MonitoringFactory.createDiscrepancyDetector(config, githubAdapter, platformAdapter);
    },
    createMonitoringSystem: (config: any) => {
      const { MonitoringFactory } = require('./core/monitoring');
      return MonitoringFactory.createMonitoringSystem(config);
    }
  },
  adapters: {
    database: null, // Will be implemented in Phase 2
    platforms: null, // Will be implemented in Phase 2
    frameworks: null // Will be implemented in Phase 2
  },
  ui: {
    components: null, // Will be implemented in Phase 3
    templates: null // Will be implemented in Phase 3
  },
  utils: {
    config: null, // Will be implemented in Phase 4
    validation: null // Will be implemented in Phase 4
  }
};

export default AutonomousDeployment;

// Convenience functions for quick setup
export function createHealthChecker(config: any) {
  const { HealthCheckFactory } = require('./core/health-checks');
  return HealthCheckFactory.createSystemHealthChecker(config);
}

export function createDeploymentMonitor(config: any) {
  const { MonitoringFactory } = require('./core/monitoring');
  return MonitoringFactory.createDeploymentMonitor(config);
}

export function createDiscrepancyDetector(config: any, githubAdapter: any, platformAdapter: any) {
  const { MonitoringFactory } = require('./core/monitoring');
  return MonitoringFactory.createDiscrepancyDetector(config, githubAdapter, platformAdapter);
}

// Module initialization function
export function initializeAutonomousDeployment(config: any) {
  console.log(`🚀 Initializing Autonomous Deployment Module v${VERSION}`);
  
  // Validate configuration
  const { HealthCheckUtils } = require('./core/health-checks');
  const { MonitoringUtils } = require('./core/monitoring');
  
  const healthValidation = HealthCheckUtils.validateConfig(config);
  if (!healthValidation.valid) {
    console.warn('⚠️  Health check configuration issues:', healthValidation.errors);
  }
  
  const monitoringValidation = MonitoringUtils.validateConfig(config);
  if (!monitoringValidation.valid) {
    console.warn('⚠️  Monitoring configuration issues:', monitoringValidation.errors);
  }
  
  // Create system components
  const healthChecker = createHealthChecker(config);
  const deploymentMonitor = createDeploymentMonitor(config);
  
  console.log('✅ Autonomous Deployment Module initialized successfully');
  
  return {
    healthChecker,
    deploymentMonitor,
    config,
    version: VERSION
  };
}

// Export types for TypeScript users
export type {
  HealthCheckResult,
  SystemHealthCheck,
  DatabaseHealthCheck
} from './core/health-checks';

export type {
  DeploymentStatus,
  MonitoringConfig,
  DiscrepancyAnalysis,
  PlatformAdapter,
  MonitoringEvent,
  MonitoringEventHandler
} from './core/monitoring';

export type {
  AutonomousDeploymentConfig,
  HealthEndpoint,
  SMTPConfig,
  EnvironmentValidation
} from './config/schemas/config.schema';
