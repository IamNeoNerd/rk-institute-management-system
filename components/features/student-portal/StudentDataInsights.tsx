/**
 * Student Data Insights Component
 * 
 * Handles all data fetching, state management, and real-time updates
 * for the Student Portal. Provides clean separation of business logic
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
import { StudentDataInsightsProps, User, StudentProfile, DashboardStats } from './types';

export default function StudentDataInsights({
  onUserUpdate,
  onStudentProfileUpdate,
  onStatsUpdate,
  onLoadingChange
}: StudentDataInsightsProps) {

  useEffect(() => {
    // Initial data fetch
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      onLoadingChange(true);

      // Fetch user data
      const userResponse = await fetch('/api/auth/me');
      const userData = await userResponse.json();
      
      if (userData.success) {
        onUserUpdate(userData.user);
        
        // Fetch student profile
        const profileResponse = await fetch('/api/students/profile');
        const profileData = await profileResponse.json();
        
        if (profileData.success) {
          onStudentProfileUpdate(profileData.student);
        }

        // Fetch dashboard stats
        const statsResponse = await fetch('/api/students/dashboard-stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          onStatsUpdate(statsData.stats);
        } else {
          // Provide default stats if API fails
          onStatsUpdate({
            totalCourses: 0,
            totalServices: 0,
            currentMonthFee: 0,
            outstandingDues: 0,
            academicLogs: 0,
            achievements: 0
          });
        }
      } else {
        onUserUpdate(null);
        onStudentProfileUpdate(null);
        onStatsUpdate({
          totalCourses: 0,
          totalServices: 0,
          currentMonthFee: 0,
          outstandingDues: 0,
          academicLogs: 0,
          achievements: 0
        });
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      onUserUpdate(null);
      onStudentProfileUpdate(null);
      onStatsUpdate({
        totalCourses: 0,
        totalServices: 0,
        currentMonthFee: 0,
        outstandingDues: 0,
        academicLogs: 0,
        achievements: 0
      });
    } finally {
      onLoadingChange(false);
    }
  };

  // This component only handles data fetching and doesn't render anything
  return null;
}
