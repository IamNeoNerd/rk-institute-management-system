'use client';

import { useState, useEffect } from 'react';

export interface TeacherStats {
  totalStudents: number;
  totalCourses: number;
  totalLogs: number;
  achievements: number;
  concerns: number;
  progressReports: number;
  activeAssignments: number;
  completedAssignments: number;
  averageGrade: number;
  recentActivity: number;
}

export interface TeacherDashboardData {
  stats: TeacherStats | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useTeacherDashboardData(): TeacherDashboardData {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // SSR-safe localStorage access (Phase 2 Critical Fix)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        // During SSR, use mock data
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }
        throw new Error('No authentication token found');
      }

      // Fetch dashboard statistics
      const [studentsRes, coursesRes, logsRes] = await Promise.all([
        fetch('/api/students', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/courses', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/academic-logs', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      let totalStudents = 0;
      let totalCourses = 0;
      let totalLogs = 0;
      let achievements = 0;
      let concerns = 0;
      let progressReports = 0;

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        totalStudents = studentsData.length;
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        totalCourses = coursesData.length;
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        totalLogs = logsData.length;
        achievements = logsData.filter((log: any) => log.logType === 'ACHIEVEMENT').length;
        concerns = logsData.filter((log: any) => log.logType === 'CONCERN').length;
        progressReports = logsData.filter((log: any) => log.logType === 'PROGRESS').length;
      }

      // Calculate additional metrics
      const activeAssignments = Math.floor(totalCourses * 2.5); // Mock calculation
      const completedAssignments = Math.floor(activeAssignments * 0.75);
      const averageGrade = 85.5; // Mock data
      const recentActivity = achievements + progressReports;

      setStats({
        totalStudents,
        totalCourses,
        totalLogs,
        achievements,
        concerns,
        progressReports,
        activeAssignments,
        completedAssignments,
        averageGrade,
        recentActivity,
      });
    } catch (error) {
      console.error('Error fetching teacher dashboard stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
      
      // Set fallback mock data on error
      setStats({
        totalStudents: 45,
        totalCourses: 3,
        totalLogs: 28,
        achievements: 12,
        concerns: 3,
        progressReports: 13,
        activeAssignments: 8,
        completedAssignments: 6,
        averageGrade: 85.5,
        recentActivity: 25,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchDashboardStats();
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshData,
  };
}
