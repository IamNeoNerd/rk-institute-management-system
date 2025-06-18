'use client';

import { useState, useEffect, useCallback } from 'react';
import { Student } from '@/components/features/students/types';

interface UseStudentsDataReturn {
  students: Student[];
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => Promise<boolean>;
}

export function useStudentsData(): UseStudentsDataReturn {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // SSR-safe localStorage access (Phase 2 Critical Fix)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        // During SSR, skip API call
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle paginated response structure
        if (data.students && Array.isArray(data.students)) {
          setStudents(data.students);
        } else if (Array.isArray(data)) {
          // Fallback for direct array response
          setStudents(data);
        } else {
          console.error('Unexpected response structure:', data);
          setStudents([]);
        }
      } else {
        setError('Failed to fetch students');
      }
    } catch (error) {
      setError('Network error occurred while fetching students');
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStudent = useCallback(async (studentId: string): Promise<boolean> => {
    try {
      // SSR-safe localStorage access (Phase 2 Critical Fix)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        setError('Authentication required. Please log in again.');
        return false;
      }

      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setStudents(prev => prev.filter(student => student.id !== studentId));
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete student');
        return false;
      }
    } catch (error) {
      setError('Network error occurred while deleting student');
      console.error('Error deleting student:', error);
      return false;
    }
  }, []);

  const addStudent = useCallback((student: Student) => {
    setStudents(prev => [student, ...prev]);
  }, []);

  const updateStudent = useCallback((updatedStudent: Student) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent
  };
}
