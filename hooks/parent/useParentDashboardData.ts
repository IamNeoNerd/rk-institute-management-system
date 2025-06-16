'use client';

import { useState, useEffect } from 'react';

export interface Child {
  id: string;
  name: string;
  grade: string;
  studentId: string;
  averageGrade: number;
  attendance: number;
  achievements: number;
  concerns: number;
}

export interface FamilyProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  discountAmount: number;
  children: Child[];
}

export interface ParentStats {
  totalChildren: number;
  totalMonthlyFee: number;
  outstandingDues: number;
  totalAchievements: number;
  totalConcerns: number;
  lastPaymentDate: string;
  familyDiscount: number;
  averageFamilyGrade: number;
  totalAssignments: number;
  pendingAssignments: number;
  upcomingEvents: number;
  teacherMessages: number;
}

export interface ParentDashboardData {
  familyProfile: FamilyProfile | null;
  stats: ParentStats | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useParentDashboardData(): ParentDashboardData {
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null);
  const [stats, setStats] = useState<ParentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // In a real implementation, you would fetch family-specific data
      // For now, we'll use enhanced mock data
      
      // Mock family profile data
      const mockFamilyProfile: FamilyProfile = {
        id: 'family-1',
        name: 'The Johnson Family',
        email: 'johnson.family@email.com',
        phone: '+1-217-555-0101',
        address: '123 Oak Street, Springfield, IL 62701',
        discountAmount: 1000,
        children: [
          {
            id: 'student-1',
            name: 'Emma Johnson',
            grade: 'Grade 11',
            studentId: 'STU001',
            averageGrade: 87.5,
            attendance: 94.2,
            achievements: 5,
            concerns: 0,
          },
          {
            id: 'student-2',
            name: 'Liam Johnson',
            grade: 'Grade 9',
            studentId: 'STU002',
            averageGrade: 82.3,
            attendance: 91.8,
            achievements: 3,
            concerns: 1,
          },
        ],
      };

      // Enhanced mock dashboard stats
      const mockStats: ParentStats = {
        totalChildren: 2,
        totalMonthlyFee: 16000, // After discount
        outstandingDues: 0,
        totalAchievements: 8,
        totalConcerns: 1,
        lastPaymentDate: '2024-06-10',
        familyDiscount: 1000,
        averageFamilyGrade: 84.9,
        totalAssignments: 24,
        pendingAssignments: 6,
        upcomingEvents: 3,
        teacherMessages: 2,
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFamilyProfile(mockFamilyProfile);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching parent data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch family data');
      
      // Set fallback mock data on error
      setFamilyProfile({
        id: 'family-1',
        name: 'Family User',
        email: 'family@email.com',
        phone: '+1-000-000-0000',
        address: '123 Main Street',
        discountAmount: 500,
        children: [
          {
            id: 'student-1',
            name: 'Student One',
            grade: 'Grade 10',
            studentId: 'STU001',
            averageGrade: 85.0,
            attendance: 92.0,
            achievements: 3,
            concerns: 0,
          },
        ],
      });
      
      setStats({
        totalChildren: 1,
        totalMonthlyFee: 7500,
        outstandingDues: 0,
        totalAchievements: 3,
        totalConcerns: 0,
        lastPaymentDate: '2024-06-01',
        familyDiscount: 500,
        averageFamilyGrade: 85.0,
        totalAssignments: 12,
        pendingAssignments: 3,
        upcomingEvents: 2,
        teacherMessages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchParentData();
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  return {
    familyProfile,
    stats,
    loading,
    error,
    refreshData,
  };
}
