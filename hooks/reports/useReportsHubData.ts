/**
 * useReportsHubData Hook
 * 
 * Custom hook for Reports hub data management. Extracts all business logic
 * from the ReportsDataInsights component into a reusable hook pattern.
 * 
 * Design Features:
 * - Centralized Reports hub data fetching and state management
 * - SSR-safe API calls with proper authentication
 * - Tab-based dependency management for different report types
 * - Comprehensive error handling and loading states
 * - Reusable across Reports hub components
 */

'use client';

import { useState, useCallback } from 'react';
import { useApiData, useApiMutation } from '../shared/useApiData';
import { ReportData, AutomationReport, ActiveTab, ReportType } from '@/components/features/reports-hub/types';

interface UseReportsHubDataReturn {
  reportData: ReportData | null;
  loading: boolean;
  error: string;
  refetchReportData: () => Promise<void>;
  updateReportData: (newData: ReportData | null) => void;
}

export function useReportsHubData(selectedMonth: number, selectedYear: number): UseReportsHubDataReturn {
  const {
    data: reportData,
    loading,
    error,
    refetch: refetchReportData,
    mutate: updateReportData
  } = useApiData<ReportData>({
    endpoint: `/api/reports?month=${selectedMonth}&year=${selectedYear}`,
    method: 'GET',
    requireAuth: true,
    autoFetch: true,
    dependencies: [selectedMonth, selectedYear]
  });

  return {
    reportData,
    loading,
    error,
    refetchReportData,
    updateReportData
  };
}

// Hook for automation reports management
export function useAutomationReports(activeTab: ActiveTab) {
  const {
    data: automationReports,
    loading,
    error,
    refetch,
    mutate
  } = useApiData<{ reports: AutomationReport[] }>({
    endpoint: '/api/reports/stored',
    method: 'GET',
    requireAuth: true,
    autoFetch: activeTab === 'automated',
    dependencies: [activeTab]
  });

  return {
    automationReports: automationReports?.reports || [],
    loading,
    error,
    refetch,
    updateAutomationReports: (reports: AutomationReport[]) => mutate({ reports })
  };
}

// Hook for generating automation reports
export function useReportGeneration() {
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const { mutate: generateReport, loading, error } = useApiMutation<any, { reportType: ReportType }>(
    '/api/automation/reports',
    {
      onSuccess: (data) => {
        console.log('Report generated successfully:', data);
        setGeneratingReport(null);
      },
      onError: (error) => {
        console.error('Report generation failed:', error);
        setGeneratingReport(null);
      }
    }
  );

  const generateAutomationReport = useCallback(async (reportType: ReportType) => {
    setGeneratingReport(reportType);
    try {
      const result = await generateReport({ reportType });
      if (result?.success) {
        // Show success message
        if (typeof window !== 'undefined') {
          alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);
        }
        return true;
      } else {
        if (typeof window !== 'undefined') {
          alert(`Failed to generate ${reportType} report`);
        }
        return false;
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        alert('Network error while generating report');
      }
      return false;
    }
  }, [generateReport]);

  return {
    generateAutomationReport,
    generatingReport,
    loading,
    error
  };
}

// Hook for report history management
export function useReportHistory() {
  const {
    data: reportHistory,
    loading,
    error,
    refetch
  } = useApiData({
    endpoint: '/api/reports/history',
    method: 'GET',
    requireAuth: true,
    autoFetch: false // Only fetch when explicitly requested
  });

  return {
    reportHistory,
    loading,
    error,
    fetchHistory: refetch
  };
}

// Hook for report download functionality
export function useReportDownload() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadReport = useCallback(async (reportId: string, reportName?: string) => {
    if (typeof window === 'undefined') return;

    setDownloading(reportId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/download/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = reportName || `report-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download report');
      }
    } catch (error) {
      alert('Network error while downloading report');
    } finally {
      setDownloading(null);
    }
  }, []);

  return {
    downloadReport,
    downloading
  };
}

// Hook for report analytics and insights
export function useReportAnalytics(period?: 'weekly' | 'monthly' | 'quarterly') {
  const {
    data: analytics,
    loading,
    error,
    refetch
  } = useApiData({
    endpoint: `/api/reports/analytics?period=${period || 'monthly'}`,
    method: 'GET',
    requireAuth: true,
    autoFetch: true,
    dependencies: [period]
  });

  return {
    analytics,
    loading,
    error,
    refetch
  };
}
