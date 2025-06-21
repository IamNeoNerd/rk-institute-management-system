'use client';

import TeacherLayout from '@/components/layout/TeacherLayout';

// Emergency minimal component to resolve webpack runtime error
export default function TeacherGrades() {
  return (
    <TeacherLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Grade Management</h1>
        <div className="bg-white p-6 rounded-lg border">
          <p>Grades feature is temporarily under maintenance.</p>
          <p className="text-sm text-gray-600 mt-2">Please check back later.</p>
        </div>
      </div>
    </TeacherLayout>
  );
}