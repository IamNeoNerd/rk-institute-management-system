'use client';

import { useEffect, useCallback } from 'react';
import { ReportsDataInsightsProps, ReportType } from './types';

/**
 * Reports Data Insights Component
 * 
 * Handles data fetching and state management for the Reports hub.
 * This component manages API calls, loading states, and error handling
 * while maintaining SSR compatibility.
 * 
 * Design Features:
 * - SSR-safe localStorage access with proper guards
 * - Comprehensive error handling with user-friendly messages
 * - Automatic data fetching on component mount and dependency changes
 * - Clean separation of data logic from presentation
 * - Reports-specific API endpoint integration
 * - Automated reports generation and management
 */

export default function ReportsDataInsights({
  selectedMonth,
  selectedYear,
  activeTab,
  onReportDataUpdate,
  onLoadingChange,
  onErrorChange,
  onAutomationReportsUpdate
}: ReportsDataInsightsProps) {
  
  const fetchReportData = useCallback(async () => {
    try {
      onLoadingChange(true);
      onErrorChange('');

      // SSR-safe localStorage access
      if (typeof window === 'undefined') {
        onLoadingChange(false);
        return;
      }

      const token = localStorage.getItem('token');

      // Check if token exists before making API call
      if (!token) {
        onErrorChange('Authentication required. Please log in again.');
        onLoadingChange(false);
        return;
      }

      const response = await fetch(`/api/reports?month=${selectedMonth}&year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        onReportDataUpdate(data);
      } else {
        // Try to parse error response for more specific feedback
        try {
          const errorData = await response.json();
          onErrorChange(errorData.message || `Failed to fetch report data (${response.status})`);
        } catch {
          onErrorChange(`Failed to fetch report data (${response.status})`);
        }
      }
    } catch (error) {
      // Provide more specific error messages
      if (error instanceof Error) {
        onErrorChange(`Network error: ${error.message}`);
      } else {
        onErrorChange('Network error: Unable to connect to server');
      }
    } finally {
      onLoadingChange(false);
    }
  }, [selectedMonth, selectedYear, onReportDataUpdate, onLoadingChange, onErrorChange]);

  const fetchAutomationReports = useCallback(async () => {
    try {
      // SSR-safe localStorage access
      if (typeof window === 'undefined') {
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      const response = await fetch('/api/reports/stored', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        onAutomationReportsUpdate(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch automation reports:', error);
    }
  }, [onAutomationReportsUpdate]);

  // Effect for fetching report data
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Effect for fetching automation reports when on automated tab
  useEffect(() => {
    if (activeTab === 'automated') {
      fetchAutomationReports();
    }
  }, [fetchAutomationReports, activeTab]);

  // This component doesn't render anything visible - it's purely for data management
  return null;
}
