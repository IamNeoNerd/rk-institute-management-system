'use client';

import { useEffect } from 'react';
import { PeopleDataInsightsProps } from './types';
import { usePeopleHubData } from '@/hooks';

/**
 * People Data Insights Component
 *
 * Handles data fetching and state management for the People hub using
 * the custom usePeopleHubData hook. This component now serves as a bridge
 * between the custom hook and the parent component's state management.
 *
 * Design Features:
 * - Uses custom hook for clean business logic separation
 * - Maintains compatibility with existing component interface
 * - SSR-safe data fetching through custom hook
 * - Comprehensive error handling via hook
 */

export default function PeopleDataInsights({
  onStatsUpdate,
  onLoadingChange,
  onErrorChange
}: PeopleDataInsightsProps) {

  const { stats, loading, error } = usePeopleHubData();

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
