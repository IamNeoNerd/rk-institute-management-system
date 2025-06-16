'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

// Custom hook for data management
import { useStudentsData } from '@/hooks/students/useStudentsData';

// Shared UI components
import ErrorAlert from '@/components/ui/feedback/ErrorAlert';
import LoadingSpinner from '@/components/ui/feedback/LoadingSpinner';

// Feature components
import StudentsHeader from '@/components/features/students/StudentsHeader';
import StudentsTable from '@/components/features/students/StudentsTable';
import StudentFormModal from '@/components/features/students/StudentFormModal';

// Types
import { Student } from '@/components/features/students/types';

export default function StudentsPage() {
  // Use custom hook for all data management
  const {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent
  } = useStudentsData();

  // Local UI state
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleFormSuccess = (student: Student) => {
    if (editingStudent) {
      updateStudent(student);
    } else {
      addStudent(student);
    }
    setShowForm(false);
    setEditingStudent(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const handleDelete = async (studentId: string) => {
    await deleteStudent(studentId);
  };

  // Loading state with improved UX
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" message="Loading students..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with student count */}
        <StudentsHeader
          onAddStudent={handleAddStudent}
          studentsCount={students.length}
        />

        {/* Error handling with shared component */}
        {error && <ErrorAlert message={error} />}

        {/* Student form modal */}
        <StudentFormModal
          isOpen={showForm}
          student={editingStudent}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />

        {/* Students table */}
        <StudentsTable
          students={students}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  );
}
