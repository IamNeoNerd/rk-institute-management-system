/**
 * Parent Portal Data Hook
 *
 * Main custom hook for Parent Portal data management.
 * Handles user authentication, family profile, dashboard stats, and navigation state.
 *
 * Features:
 * - User authentication and profile management
 * - Family dashboard statistics
 * - Tab navigation state management
 * - Child selection state management
 * - Logout functionality
 * - SSR-safe implementation
 */

'use client';

import { useState, useCallback } from 'react';

import {
  User,
  FamilyProfile,
  DashboardStats,
  ActiveTab
} from '@/components/features/parent-portal/types';

export interface UseParentPortalDataReturn {
  // Data State
  user: User | null;
  familyProfile: FamilyProfile | null;
  stats: DashboardStats;
  loading: boolean;

  // UI State
  activeTab: ActiveTab;
  selectedChild: string;

  // Actions
  setUser: (user: User | null) => void;
  setFamilyProfile: (profile: FamilyProfile | null) => void;
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedChild: (childId: string) => void;
  handleLogout: () => Promise<void>;
}

export function useParentPortalData(): UseParentPortalDataReturn {
  // Data State
  const [user, setUser] = useState<User | null>(null);
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(
    null
  );
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    totalMonthlyFee: 0,
    outstandingDues: 0,
    totalAchievements: 0,
    totalConcerns: 0,
    lastPaymentDate: ''
  });
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedChild, setSelectedChild] = useState<string>('all');

  // Logout functionality
  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Clear local state
        setUser(null);
        setFamilyProfile(null);
        setStats({
          totalChildren: 0,
          totalMonthlyFee: 0,
          outstandingDues: 0,
          totalAchievements: 0,
          totalConcerns: 0,
          lastPaymentDate: ''
        });

        // Redirect to login
        window.location.href = '/login';
      } else {
        console.error('Logout failed');
        // Force redirect anyway for security
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Error during logout:', err);
      // Force redirect for security
      window.location.href = '/login';
    }
  }, []);

  return {
    // Data State
    user,
    familyProfile,
    stats,
    loading,

    // UI State
    activeTab,
    selectedChild,

    // Actions
    setUser,
    setFamilyProfile,
    setStats,
    setLoading,
    setActiveTab,
    setSelectedChild,
    handleLogout
  };
}
