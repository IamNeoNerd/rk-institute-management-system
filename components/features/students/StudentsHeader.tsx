'use client';

import AccessibleHeading from '@/components/ui/typography/AccessibleHeading';

interface StudentsHeaderProps {
  onAddStudent: () => void;
  studentsCount: number;
}

export default function StudentsHeader({ onAddStudent, studentsCount }: StudentsHeaderProps) {
  return (
    <div className="flex justify-between items-center animate-fade-in">
      <div>
        <AccessibleHeading 
          level={1} 
          className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
        >
          Students
        </AccessibleHeading>
        <p className="mt-2 text-lg text-gray-600">
          Manage student records and enrollments
          {studentsCount > 0 && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {studentsCount} students
            </span>
          )}
        </p>
      </div>
      <button
        onClick={onAddStudent}
        className="btn-primary"
        aria-label="Add new student"
      >
        <span className="mr-2" aria-hidden="true">+</span>
        Add New Student
      </button>
    </div>
  );
}
