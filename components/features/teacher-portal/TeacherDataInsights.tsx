/**
 * Teacher Data Insights Component
 * 
 * Handles all data fetching, state management, and real-time updates
 * for the Teacher Portal. Provides clean separation of business logic
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
import { TeacherDataInsightsProps, User, TeacherProfile, DashboardStats } from './types';

export default function TeacherDataInsights({
  onUserUpdate,
  onTeacherProfileUpdate,
  onStatsUpdate,
  onLoadingChange
}: TeacherDataInsightsProps) {

  useEffect(() => {
    // Initial data fetch
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      onLoadingChange(true);

      // Fetch user data
      const userResponse = await fetch('/api/auth/me');
      const userData = await userResponse.json();
      
      if (userData.success) {
        onUserUpdate(userData.user);
        
        // Fetch teacher profile
        const profileResponse = await fetch('/api/teachers/profile');
        const profileData = await profileResponse.json();
        
        if (profileData.success) {
          onTeacherProfileUpdate(profileData.teacher);
        }

        // Fetch dashboard stats
        await fetchDashboardStats();
      } else {
        onUserUpdate(null);
        onTeacherProfileUpdate(null);
        onStatsUpdate({
          totalStudents: 0,
          totalCourses: 0,
          totalLogs: 0,
          achievements: 0,
          concerns: 0,
          progressReports: 0
        });
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err);
      onUserUpdate(null);
      onTeacherProfileUpdate(null);
      onStatsUpdate({
        totalStudents: 0,
        totalCourses: 0,
        totalLogs: 0,
        achievements: 0,
        concerns: 0,
        progressReports: 0
      });
    } finally {
      onLoadingChange(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
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

      onStatsUpdate({
        totalStudents,
        totalCourses,
        totalLogs,
        achievements,
        concerns,
        progressReports,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Provide default stats if API fails
      onStatsUpdate({
        totalStudents: 0,
        totalCourses: 0,
        totalLogs: 0,
        achievements: 0,
        concerns: 0,
        progressReports: 0
      });
    }
  };

  // This component only handles data fetching and doesn't render anything
  return null;
}
