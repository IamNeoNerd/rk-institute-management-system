/**
 * System Health Hook
 *
 * Specialized hook for monitoring system health and performance metrics.
 * Provides health status analysis and monitoring capabilities.
 *
 * Features:
 * - Health status analysis
 * - Performance metrics calculation
 * - Real-time health monitoring
 * - Color-coded status indicators
 * - System uptime tracking
 */

'use client';

import { useMemo } from 'react';

import { AutomationStatus } from '@/components/features/operations-hub/types';

export interface HealthStatus {
  color: 'green' | 'yellow' | 'red' | 'gray';
  icon: string;
  label: string;
  severity: 'healthy' | 'warning' | 'critical' | 'unknown';
}

export interface SystemHealthMetrics {
  engineHealth: HealthStatus;
  schedulerHealth: HealthStatus;
  overallHealth: HealthStatus;
  performanceScore: number;
  uptime: string;
  lastHealthCheck: string;
}

export interface UseSystemHealthReturn {
  // Health Metrics
  healthMetrics: SystemHealthMetrics | null;

  // Utility Methods
  getHealthStatus: (status: string) => HealthStatus;
  calculatePerformanceScore: (automationStatus: AutomationStatus) => number;
  formatUptime: (timestamp: string) => string;
  isSystemHealthy: () => boolean;
}

export function useSystemHealth(
  automationStatus: AutomationStatus | null
): UseSystemHealthReturn {
  // Get health status from string
  const getHealthStatus = (status: string): HealthStatus => {
    const normalizedStatus = status.toLowerCase();

    switch (normalizedStatus) {
      case 'running':
      case 'active':
      case 'healthy':
      case 'online':
        return {
          color: 'green',
          icon: '✅',
          label: 'Healthy',
          severity: 'healthy'
        };
      case 'warning':
      case 'degraded':
      case 'slow':
        return {
          color: 'yellow',
          icon: '⚠️',
          label: 'Warning',
          severity: 'warning'
        };
      case 'error':
      case 'failed':
      case 'unhealthy':
      case 'offline':
      case 'down':
        return {
          color: 'red',
          icon: '❌',
          label: 'Critical',
          severity: 'critical'
        };
      default:
        return {
          color: 'gray',
          icon: '❓',
          label: 'Unknown',
          severity: 'unknown'
        };
    }
  };

  // Calculate performance score (0-100)
  const calculatePerformanceScore = (status: AutomationStatus): number => {
    if (!status) return 0;

    let score = 0;

    // Engine health (40 points)
    const engineHealth = getHealthStatus(status.systemStatus.automationEngine);
    if (engineHealth.severity === 'healthy') score += 40;
    else if (engineHealth.severity === 'warning') score += 20;

    // Scheduler health (40 points)
    const schedulerHealth = getHealthStatus(status.systemStatus.scheduler);
    if (schedulerHealth.severity === 'healthy') score += 40;
    else if (schedulerHealth.severity === 'warning') score += 20;

    // Job efficiency (20 points)
    const totalJobs = status.summary.totalScheduledJobs;
    const activeJobs = status.summary.activeScheduledJobs;
    if (totalJobs > 0) {
      const efficiency = (activeJobs / totalJobs) * 20;
      score += efficiency;
    } else {
      score += 10; // Partial points if no jobs configured
    }

    return Math.round(score);
  };

  // Format uptime string
  const formatUptime = (timestamp: string): string => {
    const now = new Date();
    const lastUpdate = new Date(timestamp);
    const diffMs = now.getTime() - lastUpdate.getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  // Calculate health metrics
  const healthMetrics = useMemo((): SystemHealthMetrics | null => {
    if (!automationStatus) return null;

    const engineHealth = getHealthStatus(
      automationStatus.systemStatus.automationEngine
    );
    const schedulerHealth = getHealthStatus(
      automationStatus.systemStatus.scheduler
    );

    // Determine overall health
    let overallHealth: HealthStatus;
    if (
      engineHealth.severity === 'critical' ||
      schedulerHealth.severity === 'critical'
    ) {
      overallHealth = {
        color: 'red',
        icon: '🚨',
        label: 'System Critical',
        severity: 'critical'
      };
    } else if (
      engineHealth.severity === 'warning' ||
      schedulerHealth.severity === 'warning'
    ) {
      overallHealth = {
        color: 'yellow',
        icon: '⚠️',
        label: 'System Warning',
        severity: 'warning'
      };
    } else if (
      engineHealth.severity === 'healthy' &&
      schedulerHealth.severity === 'healthy'
    ) {
      overallHealth = {
        color: 'green',
        icon: '✅',
        label: 'System Healthy',
        severity: 'healthy'
      };
    } else {
      overallHealth = {
        color: 'gray',
        icon: '❓',
        label: 'System Unknown',
        severity: 'unknown'
      };
    }

    return {
      engineHealth,
      schedulerHealth,
      overallHealth,
      performanceScore: calculatePerformanceScore(automationStatus),
      uptime: formatUptime(automationStatus.systemStatus.timestamp),
      lastHealthCheck: automationStatus.systemStatus.timestamp
    };
  }, [automationStatus]);

  // Check if system is healthy
  const isSystemHealthy = (): boolean => {
    if (!healthMetrics) return false;
    return healthMetrics.overallHealth.severity === 'healthy';
  };

  return {
    // Health Metrics
    healthMetrics,

    // Utility Methods
    getHealthStatus,
    calculatePerformanceScore,
    formatUptime,
    isSystemHealthy
  };
}
