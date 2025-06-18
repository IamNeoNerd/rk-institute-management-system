'use client';

import { useState, useEffect, useCallback } from 'react';

interface Family {
  id: string;
  name: string;
  discountAmount: number;
}

interface Student {
  id: string;
  name: string;
  grade?: string;
  dateOfBirth?: string;
  enrollmentDate: string;
  family: Family;
  subscriptions: any[];
  _count: {
    subscriptions: number;
  };
  createdAt: string;
}

interface StudentFormData {
  name: string;
  grade: string;
  dateOfBirth: string;
  enrollmentDate: string;
  familyId: string;
}

interface UseStudentFormReturn {
  formData: StudentFormData;
  families: Family[];
  loading: boolean;
  error: string;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

interface UseStudentFormProps {
  student?: Student | null;
  onSuccess: (student: Student) => void;
}

export function useStudentForm({ student, onSuccess }: UseStudentFormProps): UseStudentFormReturn {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    grade: '',
    dateOfBirth: '',
    enrollmentDate: '',
    familyId: '',
  });
  
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        grade: student.grade || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        enrollmentDate: student.enrollmentDate.split('T')[0],
        familyId: student.family.id,
      });
    } else {
      // Set default enrollment date to today
      setFormData(prev => ({
        ...prev,
        enrollmentDate: new Date().toISOString().split('T')[0],
      }));
    }
  }, [student]);

  // Fetch families
  const fetchFamilies = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/families', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFamilies(data);
      }
    } catch (error) {
      console.error('Error fetching families:', error);
    }
  }, []);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Student name is required';
    }

    if (!formData.enrollmentDate) {
      newErrors.enrollmentDate = 'Enrollment date is required';
    }

    if (!formData.familyId) {
      newErrors.familyId = 'Please select a family';
    }

    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }

    if (new Date(formData.enrollmentDate) > new Date()) {
      newErrors.enrollmentDate = 'Enrollment date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form field changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = student ? `/api/students/${student.id}` : '/api/students';
      const method = student ? 'PUT' : 'POST';

      const payload = {
        name: formData.name.trim(),
        grade: formData.grade.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        enrollmentDate: formData.enrollmentDate,
        familyId: formData.familyId,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(data);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save student');
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, student, onSuccess, validateForm]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      grade: '',
      dateOfBirth: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      familyId: '',
    });
    setErrors({});
    setError('');
  }, []);

  return {
    formData,
    families,
    loading,
    error,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
  };
}
