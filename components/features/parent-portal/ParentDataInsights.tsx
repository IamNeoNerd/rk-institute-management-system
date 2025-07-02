/**
 * Parent Data Insights Component
 *
 * Handles all data fetching, state management, and real-time updates
 * for the Parent Portal. Provides clean separation of business logic
 * from presentation components.
 *
 * Design Features:
 * - Real-time data fetching with authentication
 * - Comprehensive error handling
 * - Loading state management
 * - SSR-safe implementation
 * - Clean callback-based state updates
 */

'use client';

import { useEffect } from 'react';

import {
  ParentDataInsightsProps,
  User,
  FamilyProfile,
  DashboardStats
} from './types';

export default function ParentDataInsights({
  onUserUpdate,
  onFamilyProfileUpdate,
  onStatsUpdate,
  onLoadingChange
}: ParentDataInsightsProps) {
  useEffect(() => {
    // Initial data fetch
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      onLoadingChange(true);

      // Fetch user data
      const userResponse = await fetch('/api/auth/me');
      const userData = await userResponse.json();

      if (userData.success) {
        onUserUpdate(userData.user);

        // Fetch family profile
        const profileResponse = await fetch('/api/parents/profile');
        const profileData = await profileResponse.json();

        if (profileData.success) {
          onFamilyProfileUpdate(profileData.family);
        }

        // Fetch dashboard stats
        const statsResponse = await fetch('/api/parents/dashboard-stats');
        const statsData = await statsResponse.json();

        if (statsData.success) {
          onStatsUpdate(statsData.stats);
        } else {
          // Provide default stats if API fails
          onStatsUpdate({
            totalChildren: 0,
            totalMonthlyFee: 0,
            outstandingDues: 0,
            totalAchievements: 0,
            totalConcerns: 0,
            lastPaymentDate: ''
          });
        }
      } else {
        onUserUpdate(null);
        onFamilyProfileUpdate(null);
        onStatsUpdate({
          totalChildren: 0,
          totalMonthlyFee: 0,
          outstandingDues: 0,
          totalAchievements: 0,
          totalConcerns: 0,
          lastPaymentDate: ''
        });
      }
    } catch (err) {
      console.error('Error fetching family data:', err);
      onUserUpdate(null);
      onFamilyProfileUpdate(null);
      onStatsUpdate({
        totalChildren: 0,
        totalMonthlyFee: 0,
        outstandingDues: 0,
        totalAchievements: 0,
        totalConcerns: 0,
        lastPaymentDate: ''
      });
    } finally {
      onLoadingChange(false);
    }
  };

  // This component only handles data fetching and doesn't render anything
  return null;
}
