'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/layout/AdminLayout';

// Custom hook for data management
import { useCoursesData } from '@/hooks/courses/useCoursesData';

// Shared UI components
import ErrorAlert from '@/components/ui/feedback/ErrorAlert';
import LoadingSpinner from '@/components/ui/feedback/LoadingSpinner';
import AccessibleHeading from '@/components/ui/typography/AccessibleHeading';

// Types
import { Course } from '@/components/features/courses/types';

// Dynamic import for the form to reduce initial bundle size
const CourseForm = dynamic(() => import('@/components/forms/CourseForm'), {
  loading: () => (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading form...</p>
    </div>
  )
});

export default function CoursesPage() {
  // Use custom hook for all data management
  const {
    courses,
    loading,
    error,
    addCourse,
    updateCourse,
    deleteCourse
  } = useCoursesData();

  // Local UI state
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleFormSuccess = (course: Course) => {
    if (editingCourse) {
      updateCourse(course);
    } else {
      addCourse(course);
    }
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleDelete = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await deleteCourse(courseId);
    }
  };

  // Loading state with improved UX
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" message="Loading courses..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <AccessibleHeading
              level={1}
              className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Courses
            </AccessibleHeading>
            <p className="mt-2 text-lg text-gray-600">
              Manage course offerings and fee structures
              {courses.length > 0 && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {courses.length} courses
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleAddCourse}
            className="btn-primary"
            aria-label="Add new course"
          >
            <span className="mr-2" aria-hidden="true">+</span>
            Add New Course
          </button>
        </div>

        {/* Error handling with shared component */}
        {error && <ErrorAlert message={error} />}

        {showForm && (
          <div className="card animate-slide-up">
            <AccessibleHeading
              level={2}
              className="text-gray-900 mb-6"
            >
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </AccessibleHeading>
            <CourseForm
              course={editingCourse}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}

        <div className="table-container">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Course Name</th>
                <th className="table-header">Grade</th>
                <th className="table-header">Teacher</th>
                <th className="table-header">Fee Structure</th>
                <th className="table-header">Students</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-gray-500">
                    No courses found. Create your first course to get started.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id}>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-gray-900">{course.name}</div>
                        {course.description && (
                          <div className="text-sm text-gray-500">{course.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {course.grade || '-'}
                    </td>
                    <td className="table-cell">
                      {course.teacher ? course.teacher.name : 'Not assigned'}
                    </td>
                    <td className="table-cell">
                      {course.feeStructure ? (
                        <div>
                          <div className="font-medium">₹{course.feeStructure.amount}</div>
                          <div className="text-sm text-gray-500">{course.feeStructure.billingCycle}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Not set</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {course._count.subscriptions}
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(course)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={course._count.subscriptions > 0}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
