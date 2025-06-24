/**
 * Teacher Portal Data Hook
 * 
 * Main custom hook for Teacher Portal data management.
 * Handles user authentication, teacher profile, dashboard stats, and navigation state.
 * 
 * Features:
 * - User authentication and profile management
 * - Teacher dashboard statistics
 * - Tab navigation state management
 * - Logout functionality
 * - SSR-safe implementation
 */

'use client';

import { useState, useCallback } from 'react';
import { User, TeacherProfile, DashboardStats, ActiveTab } from '@/components/features/teacher-portal/types';

export interface UseTeacherPortalDataReturn {
  // Data State
  user: User | null;
  teacherProfile: TeacherProfile | null;
  stats: DashboardStats;
  loading: boolean;
  
  // UI State
  activeTab: ActiveTab;
  
  // Actions
  setUser: (user: User | null) => void;
  setTeacherProfile: (profile: TeacherProfile | null) => void;
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  handleLogout: () => Promise<void>;
}

export function useTeacherPortalData(): UseTeacherPortalDataReturn {
  // Data State
  const [user, setUser] = useState<User | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalLogs: 0,
    achievements: 0,
    concerns: 0,
    progressReports: 0
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
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear local state
        setUser(null);
        setTeacherProfile(null);
        setStats({
          totalStudents: 0,
          totalCourses: 0,
          totalLogs: 0,
          achievements: 0,
          concerns: 0,
          progressReports: 0
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
    teacherProfile,
    stats,
    loading,
    
    // UI State
    activeTab,
    
    // Actions
    setUser,
    setTeacherProfile,
    setStats,
    setLoading,
    setActiveTab,
    handleLogout,
  };
}
