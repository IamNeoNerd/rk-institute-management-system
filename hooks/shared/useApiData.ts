/**
 * useApiData Hook
 *
 * Generic API data fetching hook that provides consistent data fetching patterns
 * across all components. Handles authentication, error states, and loading management.
 *
 * Design Features:
 * - SSR-safe API calls with proper guards
 * - Automatic authentication token management
 * - Comprehensive error handling with user-friendly messages
 * - Configurable auto-fetching and dependencies
 * - Manual refetch and data mutation capabilities
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

import { DataHookReturn, ApiHookConfig } from './types';
import { useAuth } from './useAuth';

export function useApiData<T>(config: ApiHookConfig): DataHookReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { token, isAuthenticated } = useAuth();

  const fetchData = useCallback(async (): Promise<void> => {
    // Skip if SSR
    if (typeof window === 'undefined') return;

    // Check authentication requirement
    if (config.requireAuth !== false && !isAuthenticated) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add authentication header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(config.endpoint, {
        method: config.method || 'GET',
        headers
      });

      if (response.ok) {
        const responseData = await response.json();
        setData(responseData);
      } else {
        // Try to parse error response for more specific feedback
        try {
          const errorData = await response.json();
          setError(
            errorData.message || `API request failed (${response.status})`
          );
        } catch {
          setError(`API request failed (${response.status})`);
        }
      }
    } catch (error) {
      // Provide more specific error messages
      if (error instanceof Error) {
        setError(`Network error: ${error.message}`);
      } else {
        setError('Network error: Unable to connect to server');
      }
    } finally {
      setLoading(false);
    }
  }, [
    config.endpoint,
    config.method,
    config.requireAuth,
    token,
    isAuthenticated
  ]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (config.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, ...(config.dependencies || [])]);

  // Manual data mutation
  const mutate = useCallback((newData: T | null) => {
    setData(newData);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate
  };
}

// Specialized hook for POST requests
export function useApiMutation<TData, TVariables>(
  endpoint: string,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: string) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      if (typeof window === 'undefined') return null;

      setLoading(true);
      setError('');

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(variables)
        });

        if (response.ok) {
          const data = await response.json();
          options?.onSuccess?.(data);
          return data;
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.message || `Request failed (${response.status})`;
          setError(errorMessage);
          options?.onError?.(errorMessage);
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Network error';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, token, options]
  );

  return {
    mutate,
    loading,
    error
  };
}
