/**
 * useFinancialHubData Hook
 *
 * Custom hook for Financial hub data management. Extracts all business logic
 * from the FinancialDataInsights component into a reusable hook pattern.
 *
 * Design Features:
 * - Centralized Financial hub data fetching and state management
 * - SSR-safe API calls with proper authentication
 * - Comprehensive error handling and loading states
 * - Reusable across Financial hub components
 * - Clean separation of business logic from presentation
 */

'use client';

import { useState, useCallback } from 'react';

import { FinancialStats } from '@/components/features/financial-hub/types';

import { useApiData, useApiMutation } from '../shared/useApiData';

interface UseFinancialHubDataReturn {
  stats: FinancialStats | null;
  loading: boolean;
  error: string;
  refetchStats: () => Promise<void>;
  updateStats: (newStats: FinancialStats | null) => void;
}

export function useFinancialHubData(): UseFinancialHubDataReturn {
  const {
    data: stats,
    loading,
    error,
    refetch: refetchStats,
    mutate: updateStats
  } = useApiData<FinancialStats>({
    endpoint: '/api/financials/stats',
    method: 'GET',
    requireAuth: true,
    autoFetch: true
  });

  return {
    stats,
    loading,
    error,
    refetchStats,
    updateStats
  };
}

// Hook for managing fee allocations
export function useFeeAllocations(filters?: {
  studentId?: string;
  familyId?: string;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.studentId) queryParams.append('studentId', filters.studentId);
  if (filters?.familyId) queryParams.append('familyId', filters.familyId);
  if (filters?.status) queryParams.append('status', filters.status);

  const {
    data: allocations,
    loading,
    error,
    refetch,
    mutate
  } = useApiData({
    endpoint: `/api/fees/allocations?${queryParams.toString()}`,
    method: 'GET',
    requireAuth: true,
    autoFetch: true,
    dependencies: [filters]
  });

  return {
    allocations,
    loading,
    error,
    refetch,
    updateAllocations: mutate
  };
}

// Hook for managing payments
export function usePayments(filters?: {
  familyId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.familyId) queryParams.append('familyId', filters.familyId);
  if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

  const {
    data: payments,
    loading,
    error,
    refetch,
    mutate
  } = useApiData({
    endpoint: `/api/payments?${queryParams.toString()}`,
    method: 'GET',
    requireAuth: true,
    autoFetch: true,
    dependencies: [filters]
  });

  return {
    payments,
    loading,
    error,
    refetch,
    updatePayments: mutate
  };
}

// Hook for recording new payments
export function usePaymentMutation() {
  return useApiMutation('/api/payments', {
    onSuccess: data => {
      console.log('Payment recorded successfully:', data);
    },
    onError: error => {
      console.error('Payment recording failed:', error);
    }
  });
}

// Hook for generating fee allocations
export function useFeeAllocationMutation() {
  return useApiMutation('/api/fees/allocations', {
    onSuccess: data => {
      console.log('Fee allocation generated successfully:', data);
    },
    onError: error => {
      console.error('Fee allocation generation failed:', error);
    }
  });
}

// Hook for outstanding dues management
export function useOutstandingDues(filters?: {
  overdueDays?: number;
  familyId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.overdueDays)
    queryParams.append('overdueDays', filters.overdueDays.toString());
  if (filters?.familyId) queryParams.append('familyId', filters.familyId);

  const {
    data: outstandingDues,
    loading,
    error,
    refetch,
    mutate
  } = useApiData({
    endpoint: `/api/fees/outstanding?${queryParams.toString()}`,
    method: 'GET',
    requireAuth: true,
    autoFetch: true,
    dependencies: [filters]
  });

  return {
    outstandingDues,
    loading,
    error,
    refetch,
    updateOutstandingDues: mutate
  };
}

// Hook for financial analytics and insights
export function useFinancialAnalytics(
  period?: 'monthly' | 'quarterly' | 'yearly'
) {
  const {
    data: analytics,
    loading,
    error,
    refetch
  } = useApiData({
    endpoint: `/api/financials/analytics?period=${period || 'monthly'}`,
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
