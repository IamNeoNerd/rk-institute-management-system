/**
 * Job Scheduler Hook
 *
 * Specialized hook for managing scheduled and running jobs.
 * Provides job monitoring, filtering, and analysis capabilities.
 *
 * Features:
 * - Job filtering and sorting
 * - Status analysis
 * - Performance metrics
 * - Real-time job monitoring
 * - Job history tracking
 */

'use client';

import { useMemo } from 'react';

import {
  AutomationStatus,
  RunningJob,
  ScheduledJob
} from '@/components/features/operations-hub/types';

export interface JobMetrics {
  totalRunning: number;
  totalScheduled: number;
  activeScheduled: number;
  inactiveScheduled: number;
  completedJobs: number;
  failedJobs: number;
}

export interface JobAnalysis {
  metrics: JobMetrics;
  runningJobs: RunningJob[];
  scheduledJobs: ScheduledJob[];
  activeJobs: ScheduledJob[];
  inactiveJobs: ScheduledJob[];
  recentJobs: RunningJob[];
}

export interface UseJobSchedulerReturn {
  // Job Analysis
  jobAnalysis: JobAnalysis | null;

  // Utility Methods
  formatDateTime: (dateString: string) => string;
  formatDuration: (ms: number) => string;
  getJobStatusColor: (status: string) => string;
  getJobStatusIcon: (status: string) => string;
  isJobActive: (job: ScheduledJob) => boolean;
  getJobPriority: (job: ScheduledJob) => 'high' | 'medium' | 'low';
}

export function useJobScheduler(
  automationStatus: AutomationStatus | null
): UseJobSchedulerReturn {
  // Format date and time
  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Format duration in milliseconds
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  // Get status color for jobs
  const getJobStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'RUNNING':
        return 'blue';
      case 'COMPLETED':
        return 'green';
      case 'FAILED':
      case 'ERROR':
        return 'red';
      case 'PENDING':
      case 'QUEUED':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  // Get status icon for jobs
  const getJobStatusIcon = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'RUNNING':
        return '🔄';
      case 'COMPLETED':
        return '✅';
      case 'FAILED':
      case 'ERROR':
        return '❌';
      case 'PENDING':
      case 'QUEUED':
        return '⏳';
      default:
        return '❓';
    }
  };

  // Check if scheduled job is active
  const isJobActive = (job: ScheduledJob): boolean => {
    return job.isActive;
  };

  // Get job priority based on schedule and type
  const getJobPriority = (job: ScheduledJob): 'high' | 'medium' | 'low' => {
    const name = job.name.toLowerCase();

    // High priority jobs
    if (
      name.includes('billing') ||
      name.includes('payment') ||
      name.includes('critical')
    ) {
      return 'high';
    }

    // Medium priority jobs
    if (
      name.includes('reminder') ||
      name.includes('report') ||
      name.includes('backup')
    ) {
      return 'medium';
    }

    // Low priority jobs
    return 'low';
  };

  // Calculate job analysis
  const jobAnalysis = useMemo((): JobAnalysis | null => {
    if (!automationStatus) return null;

    const { runningJobs, scheduledJobs, summary } = automationStatus;

    // Filter jobs
    const activeJobs = scheduledJobs.filter(job => job.isActive);
    const inactiveJobs = scheduledJobs.filter(job => !job.isActive);
    const completedJobs = runningJobs.filter(job => job.status === 'COMPLETED');
    const failedJobs = runningJobs.filter(
      job => job.status === 'FAILED' || job.status === 'ERROR'
    );

    // Get recent jobs (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentJobs = runningJobs.filter(job => {
      const jobDate = new Date(job.startTime);
      return jobDate >= oneDayAgo;
    });

    // Calculate metrics
    const metrics: JobMetrics = {
      totalRunning: summary.totalRunningJobs,
      totalScheduled: summary.totalScheduledJobs,
      activeScheduled: summary.activeScheduledJobs,
      inactiveScheduled: scheduledJobs.length - summary.activeScheduledJobs,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length
    };

    return {
      metrics,
      runningJobs,
      scheduledJobs,
      activeJobs,
      inactiveJobs,
      recentJobs
    };
  }, [automationStatus]);

  return {
    // Job Analysis
    jobAnalysis,

    // Utility Methods
    formatDateTime,
    formatDuration,
    getJobStatusColor,
    getJobStatusIcon,
    isJobActive,
    getJobPriority
  };
}
