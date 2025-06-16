'use client';

import { useState, useEffect } from 'react';
import { PeopleStats } from '@/components/features/people-hub/types';

// Mock data for demonstration when API is not available
const getMockStats = (): PeopleStats => ({
  totalStudents: 156,
  totalFamilies: 89,
  totalUsers: 23,
  activeStudents: 142,
  recentEnrollments: 12,
  pendingUsers: 3,
  gradeDistribution: [
    { name: 'Grade 1-3', value: 45, color: '#3B82F6' },
    { name: 'Grade 4-6', value: 52, color: '#10B981' },
    { name: 'Grade 7-9', value: 38, color: '#8B5CF6' },
    { name: 'Grade 10-12', value: 21, color: '#F59E0B' }
  ],
  enrollmentTrends: [
    { name: 'Jan', value: 12, color: '#3B82F6' },
    { name: 'Feb', value: 8, color: '#3B82F6' },
    { name: 'Mar', value: 15, color: '#3B82F6' },
    { name: 'Apr', value: 18, color: '#3B82F6' },
    { name: 'May', value: 22, color: '#3B82F6' },
    { name: 'Jun', value: 12, color: '#3B82F6' }
  ],
  familySizeDistribution: [
    { name: '1 Child', value: 32, color: '#EF4444' },
    { name: '2 Children', value: 38, color: '#3B82F6' },
    { name: '3+ Children', value: 19, color: '#10B981' }
  ],
  userRoleDistribution: [
    { name: 'Parents', value: 15, color: '#8B5CF6' },
    { name: 'Teachers', value: 6, color: '#10B981' },
    { name: 'Admin', value: 2, color: '#F59E0B' }
  ]
});

interface UsePeopleHubDataReturn {
  stats: PeopleStats | null;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

export function usePeopleHubData(): UsePeopleHubDataReturn {
  const [stats, setStats] = useState<PeopleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPeopleStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('/api/people/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Use mock data for demonstration when API is not available
        setStats(getMockStats());
      }
    } catch (error) {
      // Use mock data on error for demonstration
      setStats(getMockStats());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeopleStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchPeopleStats
  };
}
