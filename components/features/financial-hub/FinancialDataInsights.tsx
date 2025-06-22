'use client';

import { useEffect } from 'react';
import { FinancialDataInsightsProps } from './types';
import { useFinancialHubData } from '@/hooks';

/**
 * Financial Data Insights Component
 *
 * Handles data fetching and state management for the Financial hub using
 * the custom useFinancialHubData hook. This component now serves as a bridge
 * between the custom hook and the parent component's state management.
 *
 * Design Features:
 * - Uses custom hook for clean business logic separation
 * - Maintains compatibility with existing component interface
 * - SSR-safe data fetching through custom hook
 * - Comprehensive error handling via hook
 */

export default function FinancialDataInsights({
  onStatsUpdate,
  onLoadingChange,
  onErrorChange
}: FinancialDataInsightsProps) {

  const { stats, loading, error } = useFinancialHubData();

  // Update parent component state when hook state changes
  useEffect(() => {
    onStatsUpdate(stats);
  }, [stats, onStatsUpdate]);

  useEffect(() => {
    onLoadingChange(loading);
  }, [loading, onLoadingChange]);

  useEffect(() => {
    onErrorChange(error);
  }, [error, onErrorChange]);

  // This component doesn't render anything visible - it's purely for data management
  return null;
}
