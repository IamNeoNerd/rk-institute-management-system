'use client';

import dynamic from 'next/dynamic';
import { Student } from './types';
import AccessibleHeading from '@/components/ui/typography/AccessibleHeading';

// Dynamic import for the form to reduce initial bundle size
const StudentForm = dynamic(() => import('@/components/forms/StudentForm'), {
  loading: () => (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading form...</p>
    </div>
  )
});

interface StudentFormModalProps {
  isOpen: boolean;
  student: Student | null;
  onSuccess: (student: Student) => void;
  onCancel: () => void;
}

export default function StudentFormModal({ 
  isOpen, 
  student, 
  onSuccess, 
  onCancel 
}: StudentFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="card animate-slide-up">
      <AccessibleHeading 
        level={2} 
        className="text-gray-900 mb-6"
      >
        {student ? 'Edit Student' : 'Add New Student'}
      </AccessibleHeading>
      
      <StudentForm
        student={student}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </div>
  );
}
