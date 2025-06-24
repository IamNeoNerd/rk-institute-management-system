/**
 * Teacher Academics Hook
 * 
 * Specialized hook for managing teacher academic data including courses,
 * students, academic logs, and assignments.
 * 
 * Features:
 * - Course management and student enrollment
 * - Academic log creation and management
 * - Student progress tracking
 * - Assignment creation and grading
 * - Performance analytics
 */

'use client';

import { useState, useCallback } from 'react';
import { Course, Student, AcademicLog, Assignment } from '@/components/features/teacher-portal/types';

export interface UseTeacherAcademicsReturn {
  // Data State
  courses: Course[];
  students: Student[];
  academicLogs: AcademicLog[];
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCourses: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  fetchAcademicLogs: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  createAcademicLog: (log: Partial<AcademicLog>) => Promise<boolean>;
  updateAcademicLog: (id: string, updates: Partial<AcademicLog>) => Promise<boolean>;
  deleteAcademicLog: (id: string) => Promise<boolean>;
  createAssignment: (assignment: Partial<Assignment>) => Promise<boolean>;
  gradeAssignment: (assignmentId: string, studentId: string, grade: number, feedback?: string) => Promise<boolean>;
}

export function useTeacherAcademics(): UseTeacherAcademicsReturn {
  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [academicLogs, setAcademicLogs] = useState<AcademicLog[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      setError('Network error while fetching courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError('Network error while fetching students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch academic logs
  const fetchAcademicLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/academic-logs', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAcademicLogs(data);
      } else {
        setError('Failed to fetch academic logs');
      }
    } catch (err) {
      setError('Network error while fetching academic logs');
      console.error('Error fetching academic logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      } else {
        setError('Failed to fetch assignments');
      }
    } catch (err) {
      setError('Network error while fetching assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create academic log
  const createAcademicLog = useCallback(async (log: Partial<AcademicLog>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/academic-logs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log),
      });

      if (response.ok) {
        const newLog = await response.json();
        setAcademicLogs(prev => [newLog, ...prev]);
        return true;
      } else {
        setError('Failed to create academic log');
        return false;
      }
    } catch (err) {
      setError('Network error while creating academic log');
      console.error('Error creating academic log:', err);
      return false;
    }
  }, []);

  // Update academic log
  const updateAcademicLog = useCallback(async (id: string, updates: Partial<AcademicLog>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/academic-logs/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedLog = await response.json();
        setAcademicLogs(prev => prev.map(log => log.id === id ? updatedLog : log));
        return true;
      } else {
        setError('Failed to update academic log');
        return false;
      }
    } catch (err) {
      setError('Network error while updating academic log');
      console.error('Error updating academic log:', err);
      return false;
    }
  }, []);

  // Delete academic log
  const deleteAcademicLog = useCallback(async (id: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/academic-logs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setAcademicLogs(prev => prev.filter(log => log.id !== id));
        return true;
      } else {
        setError('Failed to delete academic log');
        return false;
      }
    } catch (err) {
      setError('Network error while deleting academic log');
      console.error('Error deleting academic log:', err);
      return false;
    }
  }, []);

  // Create assignment
  const createAssignment = useCallback(async (assignment: Partial<Assignment>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment),
      });

      if (response.ok) {
        const newAssignment = await response.json();
        setAssignments(prev => [newAssignment, ...prev]);
        return true;
      } else {
        setError('Failed to create assignment');
        return false;
      }
    } catch (err) {
      setError('Network error while creating assignment');
      console.error('Error creating assignment:', err);
      return false;
    }
  }, []);

  // Grade assignment
  const gradeAssignment = useCallback(async (assignmentId: string, studentId: string, grade: number, feedback?: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/assignments/${assignmentId}/grade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, grade, feedback }),
      });

      if (response.ok) {
        // Update assignment with new submission data
        await fetchAssignments();
        return true;
      } else {
        setError('Failed to grade assignment');
        return false;
      }
    } catch (err) {
      setError('Network error while grading assignment');
      console.error('Error grading assignment:', err);
      return false;
    }
  }, [fetchAssignments]);

  return {
    // Data State
    courses,
    students,
    academicLogs,
    assignments,
    loading,
    error,
    
    // Actions
    fetchCourses,
    fetchStudents,
    fetchAcademicLogs,
    fetchAssignments,
    createAcademicLog,
    updateAcademicLog,
    deleteAcademicLog,
    createAssignment,
    gradeAssignment,
  };
}
