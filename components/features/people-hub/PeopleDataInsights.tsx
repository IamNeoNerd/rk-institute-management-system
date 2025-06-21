'use client';

import { useEffect } from 'react';
import { PeopleDataInsightsProps } from './types';

/**
 * People Data Insights Component
 * 
 * Handles data fetching and state management for the People hub.
 * This component manages API calls, loading states, and error handling
 * while maintaining SSR compatibility.
 * 
 * Design Features:
 * - SSR-safe localStorage access with proper guards
 * - Comprehensive error handling with user-friendly messages
 * - Automatic data fetching on component mount
 * - Clean separation of data logic from presentation
 */

export default function PeopleDataInsights({
  onStatsUpdate,
  onLoadingChange,
  onErrorChange
}: PeopleDataInsightsProps) {
  
  useEffect(() => {
    fetchPeopleStats();
  }, []);

  const fetchPeopleStats = async () => {
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

      const response = await fetch('/api/people/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        onStatsUpdate(data);
      } else {
        // Try to parse error response for more specific feedback
        try {
          const errorData = await response.json();
          onErrorChange(errorData.message || `Failed to fetch people statistics (${response.status})`);
        } catch {
          onErrorChange(`Failed to fetch people statistics (${response.status})`);
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
  };

  // This component doesn't render anything visible - it's purely for data management
  return null;
}
