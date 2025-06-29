/**
 * 🤖 Automation Health Check System
 * 
 * Automation and scheduler health monitoring for autonomous deployment systems.
 * Provides comprehensive monitoring of background jobs and scheduled tasks.
 * 
 * Extracted from RK Institute Management System for modular reuse.
 */

import { BaseHealthChecker, HealthCheckResult } from './base-health';

export interface AutomationJob {
  id: string;
  type: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime: string;
  endTime?: string;
  duration?: number;
  error?: string;
}

export interface ScheduledJob {
  id: string;
  name: string;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface AutomationHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  components: {
    automationEngine: {
      status: 'operational' | 'degraded' | 'down';
      runningJobs: number;
      failedJobs: number;
      details: AutomationJob[];
    };
    scheduler: {
      status: 'operational' | 'degraded' | 'down';
      totalJobs: number;
      activeJobs: number;
      failedJobs: number;
      details: ScheduledJob[];
    };
  };
  uptime: number;
  version: string;
}

export interface AutomationAdapter {
  getRunningJobs(): Promise<AutomationJob[]>;
  getScheduledJobs(): Promise<ScheduledJob[]>;
  getEngineStatus(): Promise<'operational' | 'degraded' | 'down'>;
  getSchedulerStatus(): Promise<'operational' | 'degraded' | 'down'>;
}

export class AutomationHealthChecker extends BaseHealthChecker {
  private adapter: AutomationAdapter;

  constructor(config: any, adapter: AutomationAdapter) {
    super(config);
    this.adapter = adapter;
  }

  async performHealthCheck(): Promise<AutomationHealthCheck> {
    const timestamp = new Date().toISOString();

    try {
      // Get automation engine status
      const runningJobs = await this.adapter.getRunningJobs();
      const engineStatus = await this.adapter.getEngineStatus();
      
      // Get scheduler status
      const scheduledJobs = await this.adapter.getScheduledJobs();
      const schedulerStatus = await this.adapter.getSchedulerStatus();

      // Calculate metrics
      const failedRunningJobs = runningJobs.filter(job => job.status === 'failed').length;
      const activeScheduledJobs = scheduledJobs.filter(job => job.isActive).length;
      const failedScheduledJobs = scheduledJobs.filter(job => job.status === 'failed').length;

      // Determine overall health
      const isHealthy = this.determineOverallHealth(
        engineStatus,
        schedulerStatus,
        failedRunningJobs,
        failedScheduledJobs,
        runningJobs.length,
        scheduledJobs.length
      );

      const healthData: AutomationHealthCheck = {
        status: isHealthy,
        timestamp,
        components: {
          automationEngine: {
            status: engineStatus,
            runningJobs: runningJobs.length,
            failedJobs: failedRunningJobs,
            details: runningJobs.map(job => ({
              id: job.id,
              type: job.type,
              status: job.status,
              startTime: job.startTime,
              endTime: job.endTime,
              duration: job.duration,
              error: job.error
            }))
          },
          scheduler: {
            status: schedulerStatus,
            totalJobs: scheduledJobs.length,
            activeJobs: activeScheduledJobs,
            failedJobs: failedScheduledJobs,
            details: scheduledJobs.map(job => ({
              id: job.id,
              name: job.name,
              isActive: job.isActive,
              lastRun: job.lastRun,
              nextRun: job.nextRun,
              status: job.status,
              error: job.error
            }))
          }
        },
        uptime: process.uptime(),
        version: this.config.version || '1.0.0'
      };

      return healthData;
    } catch (error) {
      // Error fallback
      return {
        status: 'unhealthy',
        timestamp,
        components: {
          automationEngine: {
            status: 'down',
            runningJobs: 0,
            failedJobs: 0,
            details: []
          },
          scheduler: {
            status: 'down',
            totalJobs: 0,
            activeJobs: 0,
            failedJobs: 0,
            details: []
          }
        },
        uptime: process.uptime(),
        version: this.config.version || '1.0.0'
      };
    }
  }

  private determineOverallHealth(
    engineStatus: string,
    schedulerStatus: string,
    failedRunningJobs: number,
    failedScheduledJobs: number,
    totalRunningJobs: number,
    totalScheduledJobs: number
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // If either component is down, system is unhealthy
    if (engineStatus === 'down' || schedulerStatus === 'down') {
      return 'unhealthy';
    }

    // Calculate failure rates
    const runningJobFailureRate = totalRunningJobs > 0 ? (failedRunningJobs / totalRunningJobs) : 0;
    const scheduledJobFailureRate = totalScheduledJobs > 0 ? (failedScheduledJobs / totalScheduledJobs) : 0;

    // Thresholds (configurable)
    const degradedThreshold = this.config?.thresholds?.failureRate?.degraded || 0.1; // 10%
    const unhealthyThreshold = this.config?.thresholds?.failureRate?.unhealthy || 0.25; // 25%

    // Check if failure rates exceed thresholds
    const maxFailureRate = Math.max(runningJobFailureRate, scheduledJobFailureRate);

    if (maxFailureRate >= unhealthyThreshold) {
      return 'unhealthy';
    } else if (maxFailureRate >= degradedThreshold || engineStatus === 'degraded' || schedulerStatus === 'degraded') {
      return 'degraded';
    }

    return 'healthy';
  }
}

// No-op automation adapter for projects without automation systems
export class NoOpAutomationAdapter implements AutomationAdapter {
  async getRunningJobs(): Promise<AutomationJob[]> {
    return [];
  }

  async getScheduledJobs(): Promise<ScheduledJob[]> {
    return [];
  }

  async getEngineStatus(): Promise<'operational' | 'degraded' | 'down'> {
    return 'operational';
  }

  async getSchedulerStatus(): Promise<'operational' | 'degraded' | 'down'> {
    return 'operational';
  }
}

// Automation adapter factory
export class AutomationAdapterFactory {
  static create(config: any): AutomationAdapter {
    const automationType = config?.automation?.type || 'none';

    switch (automationType) {
      case 'none':
        return new NoOpAutomationAdapter();
      case 'custom':
        // Custom automation adapter provided by the host project
        if (config?.automation?.adapter) {
          return config.automation.adapter;
        }
        throw new Error('Custom automation adapter not provided in config.automation.adapter');
      default:
        console.warn(`Unknown automation type: ${automationType}. Using no-op adapter.`);
        return new NoOpAutomationAdapter();
    }
  }
}

// Utility functions for automation health checks
export function calculateJobSuccessRate(jobs: (AutomationJob | ScheduledJob)[]): number {
  if (jobs.length === 0) return 100;
  
  const successfulJobs = jobs.filter(job => 
    job.status === 'completed' || job.status === 'running'
  ).length;
  
  return Math.round((successfulJobs / jobs.length) * 100);
}

export function getJobDuration(job: AutomationJob): number {
  if (!job.startTime) return 0;
  
  const startTime = new Date(job.startTime).getTime();
  const endTime = job.endTime ? new Date(job.endTime).getTime() : Date.now();
  
  return endTime - startTime;
}

export function formatJobDuration(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function getAutomationHealthThresholds(config: any) {
  return {
    failureRate: {
      degraded: config?.automation?.thresholds?.failureRate?.degraded || 0.1,
      unhealthy: config?.automation?.thresholds?.failureRate?.unhealthy || 0.25
    },
    maxJobDuration: config?.automation?.thresholds?.maxJobDuration || 300000, // 5 minutes
    maxQueueSize: config?.automation?.thresholds?.maxQueueSize || 100
  };
}
