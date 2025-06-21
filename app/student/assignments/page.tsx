'use client';

import StudentLayout from '@/components/layout/StudentLayout';

// Emergency minimal component to resolve webpack runtime error
export default function StudentAssignments() {
  return (
    <StudentLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Assignments</h1>
        <div className="bg-white p-6 rounded-lg border">
          <p>Assignments feature is temporarily under maintenance.</p>
          <p className="text-sm text-gray-600 mt-2">Please check back later.</p>
        </div>
      </div>
    </StudentLayout>
  );
}
