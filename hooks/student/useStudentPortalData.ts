/**
 * Student Portal Data Hook
 *
 * Main custom hook for Student Portal data management.
 * Handles user authentication, student profile, dashboard stats, and navigation state.
 *
 * Features:
 * - User authentication and profile management
 * - Student dashboard statistics
 * - Tab navigation state management
 * - Logout functionality
 * - SSR-safe implementation
 */

'use client';

import { useState, useCallback } from 'react';

import {
  User,
  StudentProfile,
  DashboardStats,
  ActiveTab
} from '@/components/features/student-portal/types';

export interface UseStudentPortalDataReturn {
  // Data State
  user: User | null;
  studentProfile: StudentProfile | null;
  stats: DashboardStats;
  loading: boolean;

  // UI State
  activeTab: ActiveTab;

  // Actions
  setUser: (user: User | null) => void;
  setStudentProfile: (profile: StudentProfile | null) => void;
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  handleLogout: () => Promise<void>;
}

export function useStudentPortalData(): UseStudentPortalDataReturn {
  // Data State
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalServices: 0,
    currentMonthFee: 0,
    outstandingDues: 0,
    academicLogs: 0,
    achievements: 0
  });
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

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
        setStudentProfile(null);
        setStats({
          totalCourses: 0,
          totalServices: 0,
          currentMonthFee: 0,
          outstandingDues: 0,
          academicLogs: 0,
          achievements: 0
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
    studentProfile,
    stats,
    loading,

    // UI State
    activeTab,

    // Actions
    setUser,
    setStudentProfile,
    setStats,
    setLoading,
    setActiveTab,
    handleLogout
  };
}
