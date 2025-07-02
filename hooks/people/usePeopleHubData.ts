/**
 * usePeopleHubData Hook
 *
 * Custom hook for People hub data management. Extracts all business logic
 * from the PeopleDataInsights component into a reusable hook pattern.
 *
 * Design Features:
 * - Centralized People hub data fetching and state management
 * - SSR-safe API calls with proper authentication
 * - Comprehensive error handling and loading states
 * - Reusable across People hub components
 * - Clean separation of business logic from presentation
 */

'use client';

import { useState, useCallback } from 'react';

import { PeopleStats } from '@/components/features/people-hub/types';

import { useApiData } from '../shared/useApiData';

interface UsePeopleHubDataReturn {
  stats: PeopleStats | null;
  loading: boolean;
  error: string;
  refetchStats: () => Promise<void>;
  updateStats: (newStats: PeopleStats | null) => void;
}

export function usePeopleHubData(): UsePeopleHubDataReturn {
  const {
    data: stats,
    loading,
    error,
    refetch: refetchStats,
    mutate: updateStats
  } = useApiData<PeopleStats>({
    endpoint: '/api/people/stats',
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

// Hook for managing individual student data
export function useStudentData(studentId?: string) {
  const {
    data: student,
    loading,
    error,
    refetch,
    mutate
  } = useApiData({
    endpoint: studentId ? `/api/students/${studentId}` : '/api/students',
    method: 'GET',
    requireAuth: true,
    autoFetch: !!studentId,
    dependencies: [studentId]
  });

  return {
    student,
    loading,
    error,
    refetch,
    updateStudent: mutate
  };
}

// Hook for managing family data
export function useFamilyData(familyId?: string) {
  const {
    data: family,
    loading,
    error,
    refetch,
    mutate
  } = useApiData({
    endpoint: familyId ? `/api/families/${familyId}` : '/api/families',
    method: 'GET',
    requireAuth: true,
    autoFetch: !!familyId,
    dependencies: [familyId]
  });

  return {
    family,
    loading,
    error,
    refetch,
    updateFamily: mutate
  };
}

// Hook for managing user data
export function useUserData(userId?: string) {
  const {
    data: user,
    loading,
    error,
    refetch,
    mutate
  } = useApiData({
    endpoint: userId ? `/api/users/${userId}` : '/api/users',
    method: 'GET',
    requireAuth: true,
    autoFetch: !!userId,
    dependencies: [userId]
  });

  return {
    user,
    loading,
    error,
    refetch,
    updateUser: mutate
  };
}

// Hook for People hub search functionality
export function usePeopleSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<
    'students' | 'families' | 'users'
  >('students');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const performSearch = useCallback(async (query: string, type: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `/api/people/search?q=${encodeURIComponent(query)}&type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const search = useCallback(
    (query: string, type?: 'students' | 'families' | 'users') => {
      const searchTypeToUse = type || searchType;
      setSearchQuery(query);
      if (type) setSearchType(type);
      performSearch(query, searchTypeToUse);
    },
    [searchType, performSearch]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    searchType,
    searchResults,
    searching,
    search,
    setSearchType,
    clearSearch
  };
}
