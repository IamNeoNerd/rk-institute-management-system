/**
 * Student Academics Hook
 * 
 * Specialized hook for managing student academic data including courses,
 * assignments, academic logs, and progress tracking.
 * 
 * Features:
 * - Course enrollment and materials
 * - Assignment and homework management
 * - Academic progress tracking
 * - Achievement and milestone tracking
 * - Grade and performance analytics
 */

'use client';

import { useState, useCallback } from 'react';

export interface Course {
  id: string;
  name: string;
  code: string;
  teacher: string;
  schedule: string;
  description: string;
  materials: CourseMaterial[];
  progress: number;
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  uploadDate: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  maxGrade: number;
  submissionDate?: string;
}

export interface AcademicLog {
  id: string;
  date: string;
  subject: string;
  topic: string;
  description: string;
  teacher: string;
  type: 'lesson' | 'test' | 'project' | 'activity';
  grade?: number;
  maxGrade?: number;
}

export interface UseStudentAcademicsReturn {
  // Data State
  courses: Course[];
  assignments: Assignment[];
  academicLogs: AcademicLog[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCourses: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchAcademicLogs: () => Promise<void>;
  submitAssignment: (assignmentId: string, submission: FormData) => Promise<boolean>;
  downloadMaterial: (materialId: string) => Promise<void>;
}

export function useStudentAcademics(): UseStudentAcademicsReturn {
  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [academicLogs, setAcademicLogs] = useState<AcademicLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/students/courses');
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
      } else {
        setError(data.error || 'Failed to fetch courses');
      }
    } catch (err) {
      setError('Network error while fetching courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/students/assignments');
      const data = await response.json();
      
      if (data.success) {
        setAssignments(data.assignments);
      } else {
        setError(data.error || 'Failed to fetch assignments');
      }
    } catch (err) {
      setError('Network error while fetching assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch academic logs
  const fetchAcademicLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/students/academic-logs');
      const data = await response.json();
      
      if (data.success) {
        setAcademicLogs(data.logs);
      } else {
        setError(data.error || 'Failed to fetch academic logs');
      }
    } catch (err) {
      setError('Network error while fetching academic logs');
      console.error('Error fetching academic logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit assignment
  const submitAssignment = useCallback(async (assignmentId: string, submission: FormData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/students/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: submission,
      });

      const data = await response.json();
      
      if (data.success) {
        // Update assignment status
        setAssignments(prev => prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status: 'submitted', submissionDate: new Date().toISOString() }
            : assignment
        ));
        return true;
      } else {
        setError(data.error || 'Failed to submit assignment');
        return false;
      }
    } catch (err) {
      setError('Network error while submitting assignment');
      console.error('Error submitting assignment:', err);
      return false;
    }
  }, []);

  // Download material
  const downloadMaterial = useCallback(async (materialId: string) => {
    try {
      const response = await fetch(`/api/students/materials/${materialId}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `material-${materialId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download material');
      }
    } catch (err) {
      setError('Network error while downloading material');
      console.error('Error downloading material:', err);
    }
  }, []);

  return {
    // Data State
    courses,
    assignments,
    academicLogs,
    loading,
    error,
    
    // Actions
    fetchCourses,
    fetchAssignments,
    fetchAcademicLogs,
    submitAssignment,
    downloadMaterial,
  };
}
