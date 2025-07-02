'use client';

import { useEffect } from 'react';

import { useReportsHubData, useAutomationReports } from '@/hooks';

import { ReportsDataInsightsProps } from './types';

/**
 * Reports Data Insights Component
 *
 * Handles data fetching and state management for the Reports hub using
 * custom hooks. This component now serves as a bridge between the custom
 * hooks and the parent component's state management.
 *
 * Design Features:
 * - Uses custom hooks for clean business logic separation
 * - Maintains compatibility with existing component interface
 * - SSR-safe data fetching through custom hooks
 * - Tab-based dependency management via hooks
 * - Comprehensive error handling via hooks
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
  const { reportData, loading, error } = useReportsHubData(
    selectedMonth,
    selectedYear
  );
  const { automationReports } = useAutomationReports(activeTab);

  // Update parent component state when hook state changes
  useEffect(() => {
    onReportDataUpdate(reportData);
  }, [reportData, onReportDataUpdate]);

  useEffect(() => {
    onLoadingChange(loading);
  }, [loading, onLoadingChange]);

  useEffect(() => {
    onErrorChange(error);
  }, [error, onErrorChange]);

  useEffect(() => {
    onAutomationReportsUpdate(automationReports);
  }, [automationReports, onAutomationReportsUpdate]);

  // This component doesn't render anything visible - it's purely for data management
  return null;
}
