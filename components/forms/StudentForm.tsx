'use client';

import { useState, useEffect } from 'react';

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

interface StudentFormProps {
  student?: Student | null;
  onSuccess: (student: Student) => void;
  onCancel: () => void;
}

export default function StudentForm({
  student,
  onSuccess,
  onCancel
}: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    dateOfBirth: '',
    enrollmentDate: '',
    familyId: ''
  });
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFamilies();

    if (student) {
      setFormData({
        name: student.name,
        grade: student.grade || '',
        dateOfBirth: student.dateOfBirth
          ? student.dateOfBirth.split('T')[0]
          : '',
        enrollmentDate: student.enrollmentDate.split('T')[0],
        familyId: student.family.id
      });
    } else {
      // Set default enrollment date to today
      setFormData(prev => ({
        ...prev,
        enrollmentDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [student]);

  const fetchFamilies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/families', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFamilies(data);
      }
    } catch (error) {
      console.error('Error fetching families:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = student ? `/api/students/${student.id}` : '/api/students';
      const method = student ? 'PUT' : 'POST';

      const payload = {
        name: formData.name,
        grade: formData.grade || null,
        dateOfBirth: formData.dateOfBirth || null,
        enrollmentDate: formData.enrollmentDate,
        familyId: formData.familyId
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(data);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save student');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl'>
          <div className='flex items-center'>
            <svg
              className='w-5 h-5 text-red-500 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Student Name *
          </label>
          <input
            type='text'
            name='name'
            id='name'
            required
            className='input-field'
            value={formData.name}
            onChange={handleChange}
            placeholder='e.g., John Smith'
          />
        </div>

        <div>
          <label
            htmlFor='grade'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Grade/Class
          </label>
          <input
            type='text'
            name='grade'
            id='grade'
            className='input-field'
            value={formData.grade}
            onChange={handleChange}
            placeholder='e.g., Grade 10, Class A'
          />
        </div>

        <div>
          <label
            htmlFor='dateOfBirth'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Date of Birth
          </label>
          <input
            type='date'
            name='dateOfBirth'
            id='dateOfBirth'
            className='input-field'
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor='enrollmentDate'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Enrollment Date *
          </label>
          <input
            type='date'
            name='enrollmentDate'
            id='enrollmentDate'
            required
            className='input-field'
            value={formData.enrollmentDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor='familyId'
          className='block text-sm font-semibold text-gray-700 mb-2'
        >
          Family *
        </label>
        <select
          name='familyId'
          id='familyId'
          required
          className='input-field'
          value={formData.familyId}
          onChange={handleChange}
        >
          <option value=''>Select a family</option>
          {families.map(family => (
            <option key={family.id} value={family.id}>
              {family.name}{' '}
              {family.discountAmount > 0 &&
                `(₹${family.discountAmount} discount)`}
            </option>
          ))}
        </select>
        {families.length === 0 && (
          <p className='mt-2 text-sm text-gray-500'>
            No families found. Please create a family first.
          </p>
        )}
      </div>

      <div className='bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200'>
        <h4 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
          <span className='w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3'>
            <svg
              className='w-4 h-4 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </span>
          Course & Service Enrollment
        </h4>
        <p className='text-gray-600'>
          After creating the student, you can enroll them in courses and
          services from the student management page.
        </p>
      </div>

      <div className='flex justify-end space-x-4 pt-6'>
        <button
          type='button'
          onClick={onCancel}
          className='btn-secondary'
          disabled={loading}
        >
          Cancel
        </button>
        <button type='submit' className='btn-primary' disabled={loading}>
          {loading ? (
            <div className='flex items-center'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              Saving...
            </div>
          ) : student ? (
            'Update Student'
          ) : (
            'Create Student'
          )}
        </button>
      </div>
    </form>
  );
}
