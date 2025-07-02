/**
 * Operations Data Insights Component
 *
 * Handles all data fetching, state management, and real-time updates
 * for the Operations Hub. Provides clean separation of business logic
 * from presentation components.
 *
 * Design Features:
 * - Real-time data fetching with 30-second intervals
 * - Comprehensive error handling
 * - Loading state management
 * - SSR-safe implementation
 * - Clean callback-based state updates
 */

'use client';

import { useEffect } from 'react';

import { OperationsDataInsightsProps, AutomationStatus } from './types';

export default function OperationsDataInsights({
  onAutomationStatusUpdate,
  onLoadingChange,
  onErrorChange
}: OperationsDataInsightsProps) {
  useEffect(() => {
    // Initial data fetch
    fetchAutomationStatus();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAutomationStatus, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchAutomationStatus = async () => {
    try {
      onLoadingChange(true);
      onErrorChange(null);

      const response = await fetch('/api/automation/status');
      const data = await response.json();

      if (data.success) {
        onAutomationStatusUpdate(data.data);
        onErrorChange(null);
      } else {
        onErrorChange(data.error || 'Failed to fetch automation status');
        onAutomationStatusUpdate(null);
      }
    } catch (err) {
      const errorMessage = 'Network error while fetching automation status';
      onErrorChange(errorMessage);
      onAutomationStatusUpdate(null);
      console.error('Error fetching automation status:', err);
    } finally {
      onLoadingChange(false);
    }
  };

  // This component only handles data fetching and doesn't render anything
  return null;
}
