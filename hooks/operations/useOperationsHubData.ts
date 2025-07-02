/**
 * Operations Hub Data Hook
 *
 * Main custom hook for Operations Hub data management.
 * Handles automation status fetching, real-time updates, and state management.
 *
 * Features:
 * - Real-time automation status monitoring
 * - 30-second auto-refresh intervals
 * - Comprehensive error handling
 * - Loading state management
 * - SSR-safe implementation
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  AutomationStatus,
  ActiveTab
} from '@/components/features/operations-hub/types';

export interface UseOperationsHubDataReturn {
  // Data State
  automationStatus: AutomationStatus | null;
  loading: boolean;
  error: string | null;

  // UI State
  activeTab: ActiveTab;
  triggeringJob: string | null;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  refreshStatus: () => Promise<void>;

  // Job Triggering
  triggerMonthlyBilling: () => Promise<void>;
  triggerFeeReminder: (type: 'early' | 'due' | 'overdue') => Promise<void>;
  triggerReport: (type: 'weekly' | 'monthly' | 'outstanding') => Promise<void>;
}

export function useOperationsHubData(): UseOperationsHubDataReturn {
  // Data State
  const [automationStatus, setAutomationStatus] =
    useState<AutomationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);

  // Fetch automation status
  const fetchAutomationStatus = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('/api/automation/status');
      const data = await response.json();

      if (data.success) {
        setAutomationStatus(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch automation status');
        setAutomationStatus(null);
      }
    } catch (err) {
      const errorMessage = 'Network error while fetching automation status';
      setError(errorMessage);
      setAutomationStatus(null);
      console.error('Error fetching automation status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh status (public method)
  const refreshStatus = useCallback(async () => {
    setLoading(true);
    await fetchAutomationStatus();
  }, [fetchAutomationStatus]);

  // Trigger monthly billing
  const triggerMonthlyBilling = useCallback(async () => {
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

      if (data.success) {
        alert(
          `Monthly billing completed successfully!\n\nGenerated ${data.data.successfulBills} bills out of ${data.data.totalStudents} students.\nExecution time: ${data.data.executionTime}ms`
        );
        await fetchAutomationStatus(); // Refresh status
      } else {
        alert(
          `Monthly billing failed: ${data.error}\n\nDetails: ${data.details || 'No additional details'}`
        );
      }
    } catch (err) {
      alert('Network error while triggering monthly billing');
      console.error('Error triggering monthly billing:', err);
    } finally {
      setTriggeringJob(null);
    }
  }, [fetchAutomationStatus]);

  // Trigger fee reminder
  const triggerFeeReminder = useCallback(
    async (reminderType: 'early' | 'due' | 'overdue') => {
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

        if (data.success) {
          alert(
            `Fee reminders (${reminderType}) sent successfully!\n\nSent ${data.data.successfulReminders} reminders out of ${data.data.totalAllocations} due allocations.\nExecution time: ${data.data.executionTime}ms`
          );
          await fetchAutomationStatus(); // Refresh status
        } else {
          alert(
            `Fee reminders (${reminderType}) failed: ${data.error}\n\nDetails: ${data.details || 'No additional details'}`
          );
        }
      } catch (err) {
        alert('Network error while triggering fee reminders');
        console.error('Error triggering fee reminders:', err);
      } finally {
        setTriggeringJob(null);
      }
    },
    [fetchAutomationStatus]
  );

  // Trigger report generation
  const triggerReport = useCallback(
    async (reportType: 'weekly' | 'monthly' | 'outstanding') => {
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

        if (data.success) {
          alert(
            `Report (${reportType}) generated successfully!\n\nExecution time: ${data.data.executionTime}ms\n\nCheck the server logs for report details.`
          );
          await fetchAutomationStatus(); // Refresh status
        } else {
          alert(
            `Report generation (${reportType}) failed: ${data.error}\n\nDetails: ${data.details || 'No additional details'}`
          );
        }
      } catch (err) {
        alert('Network error while triggering report generation');
        console.error('Error triggering report generation:', err);
      } finally {
        setTriggeringJob(null);
      }
    },
    [fetchAutomationStatus]
  );

  // Initial data fetch and real-time updates
  useEffect(() => {
    fetchAutomationStatus();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAutomationStatus, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchAutomationStatus]);

  return {
    // Data State
    automationStatus,
    loading,
    error,

    // UI State
    activeTab,
    triggeringJob,

    // Actions
    setActiveTab,
    refreshStatus,

    // Job Triggering
    triggerMonthlyBilling,
    triggerFeeReminder,
    triggerReport
  };
}
