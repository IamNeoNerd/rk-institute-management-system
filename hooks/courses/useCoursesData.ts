'use client';

import { useState, useEffect, useCallback } from 'react';
import { Course } from '@/components/features/courses/types';

interface UseCoursesDataReturn {
  courses: Course[];
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => Promise<boolean>;
}

export function useCoursesData(): UseCoursesDataReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (error) {
      setError('Network error occurred while fetching courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCourse = useCallback(async (courseId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return false;
      }

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCourses(prev => prev.filter(course => course.id !== courseId));
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete course');
        return false;
      }
    } catch (error) {
      setError('Network error occurred while deleting course');
      console.error('Error deleting course:', error);
      return false;
    }
  }, []);

  const addCourse = useCallback((course: Course) => {
    setCourses(prev => [course, ...prev]);
  }, []);

  const updateCourse = useCallback((updatedCourse: Course) => {
    setCourses(prev => 
      prev.map(course => 
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse
  };
}
