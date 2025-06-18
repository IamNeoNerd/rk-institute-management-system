'use client';

import { useState, useEffect } from 'react';

export interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  studentId: string;
  dateOfBirth: string;
  enrollmentDate: string;
  family: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface StudentStats {
  totalCourses: number;
  totalServices: number;
  currentMonthFee: number;
  outstandingDues: number;
  academicLogs: number;
  achievements: number;
  pendingAssignments: number;
  completedAssignments: number;
  averageGrade: number;
  attendanceRate: number;
  upcomingExams: number;
  recentActivity: number;
}

export interface StudentDashboardData {
  profile: StudentProfile | null;
  stats: StudentStats | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useStudentDashboardData(): StudentDashboardData {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // SSR-safe localStorage access (Phase 2 Critical Fix)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        // During SSR, use mock data
        if (typeof window === 'undefined') {
          // Set mock data and return early during SSR
          setLoading(false);
          return;
        }
        throw new Error('No authentication token found');
      }

      // In a real implementation, you would fetch student-specific data
      // For now, we'll use enhanced mock data
      
      // Mock student profile data
      const mockProfile: StudentProfile = {
        id: 'student-1',
        name: 'Emma Johnson',
        grade: 'Grade 11',
        studentId: 'STU001',
        dateOfBirth: '2007-03-12',
        enrollmentDate: '2023-08-15',
        family: {
          name: 'The Johnson Family',
          email: 'johnson.family@email.com',
          phone: '+1-217-555-0101',
        },
      };

      // Enhanced mock dashboard stats
      const mockStats: StudentStats = {
        totalCourses: 6,
        totalServices: 3,
        currentMonthFee: 8500,
        outstandingDues: 0,
        academicLogs: 12,
        achievements: 8,
        pendingAssignments: 4,
        completedAssignments: 18,
        averageGrade: 87.5,
        attendanceRate: 94.2,
        upcomingExams: 2,
        recentActivity: 15,
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProfile(mockProfile);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch student data');
      
      // Set fallback mock data on error
      setProfile({
        id: 'student-1',
        name: 'Student User',
        grade: 'Grade 10',
        studentId: 'STU001',
        dateOfBirth: '2008-01-01',
        enrollmentDate: '2023-08-01',
        family: {
          name: 'Student Family',
          email: 'family@email.com',
          phone: '+1-000-000-0000',
        },
      });
      
      setStats({
        totalCourses: 5,
        totalServices: 2,
        currentMonthFee: 7500,
        outstandingDues: 0,
        academicLogs: 8,
        achievements: 5,
        pendingAssignments: 3,
        completedAssignments: 12,
        averageGrade: 85.0,
        attendanceRate: 92.0,
        upcomingExams: 1,
        recentActivity: 10,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchStudentData();
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  return {
    profile,
    stats,
    loading,
    error,
    refreshData,
  };
}
