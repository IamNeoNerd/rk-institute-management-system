/**
 * Automation Jobs Hook
 *
 * Specialized hook for managing automation job triggering and monitoring.
 * Provides clean separation of job management logic from UI components.
 *
 * Features:
 * - Job triggering with loading states
 * - Comprehensive error handling
 * - Success/failure notifications
 * - Real-time status updates
 * - Type-safe job management
 */

'use client';

import { useState, useCallback } from 'react';

import { JobTriggerResult } from '@/components/features/operations-hub/types';

export interface UseAutomationJobsReturn {
  // State
  triggeringJob: string | null;

  // Job Triggering Methods
  triggerMonthlyBilling: () => Promise<JobTriggerResult>;
  triggerFeeReminder: (
    type: 'early' | 'due' | 'overdue'
  ) => Promise<JobTriggerResult>;
  triggerReport: (
    type: 'weekly' | 'monthly' | 'outstanding'
  ) => Promise<JobTriggerResult>;

  // Utility Methods
  isJobTriggering: (jobId: string) => boolean;
  clearTriggeringJob: () => void;
}

export function useAutomationJobs(): UseAutomationJobsReturn {
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);

  // Trigger monthly billing
  const triggerMonthlyBilling =
    useCallback(async (): Promise<JobTriggerResult> => {
      setTriggeringJob('monthly-billing');
      try {
        const response = await fetch('/api/automation/monthly-billing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({}) // Use current month/year
        });

        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Error triggering monthly billing:', err);
        return {
          success: false,
          error: 'Network error while triggering monthly billing'
        };
      } finally {
        setTriggeringJob(null);
      }
    }, []);

  // Trigger fee reminder
  const triggerFeeReminder = useCallback(
    async (
      reminderType: 'early' | 'due' | 'overdue'
    ): Promise<JobTriggerResult> => {
      setTriggeringJob(`fee-reminder-${reminderType}`);
      try {
        const response = await fetch('/api/automation/fee-reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reminderType })
        });

        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Error triggering fee reminders:', err);
        return {
          success: false,
          error: 'Network error while triggering fee reminders'
        };
      } finally {
        setTriggeringJob(null);
      }
    },
    []
  );

  // Trigger report generation
  const triggerReport = useCallback(
    async (
      reportType: 'weekly' | 'monthly' | 'outstanding'
    ): Promise<JobTriggerResult> => {
      setTriggeringJob(`report-${reportType}`);
      try {
        const response = await fetch('/api/automation/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reportType })
        });

        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Error triggering report generation:', err);
        return {
          success: false,
          error: 'Network error while triggering report generation'
        };
      } finally {
        setTriggeringJob(null);
      }
    },
    []
  );

  // Check if a specific job is triggering
  const isJobTriggering = useCallback(
    (jobId: string): boolean => {
      return triggeringJob === jobId;
    },
    [triggeringJob]
  );

  // Clear triggering job state
  const clearTriggeringJob = useCallback(() => {
    setTriggeringJob(null);
  }, []);

  return {
    // State
    triggeringJob,

    // Job Triggering Methods
    triggerMonthlyBilling,
    triggerFeeReminder,
    triggerReport,

    // Utility Methods
    isJobTriggering,
    clearTriggeringJob
  };
}
