'use client';

import { Student } from './types';

interface StudentsTableProps {
  students: Student[];
  loading?: boolean;
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
}

export default function StudentsTable({ 
  students, 
  loading = false, 
  onEdit, 
  onDelete 
}: StudentsTableProps) {
  const handleDelete = (student: Student) => {
    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
      onDelete(student.id);
    }
  };

  if (loading) {
    return (
      <div className="table-container animate-slide-up">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container animate-slide-up">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header" scope="col">Student Name</th>
            <th className="table-header" scope="col">Family</th>
            <th className="table-header" scope="col">Grade</th>
            <th className="table-header" scope="col">Subscriptions</th>
            <th className="table-header" scope="col">Enrollment Date</th>
            <th className="table-header" scope="col">
              <span className="sr-only">Actions</span>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.length === 0 ? (
            <tr>
              <td colSpan={6} className="table-cell text-center text-gray-500 py-12">
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">No students found</p>
                  <p className="text-gray-500">Create your first student to get started.</p>
                </div>
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="table-cell">
                  <div className="font-medium text-gray-900">{student.name}</div>
                  {student.dateOfBirth && (
                    <div className="text-sm text-gray-500">
                      DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="table-cell">
                  <div>
                    <div className="font-medium text-gray-900">{student.family.name}</div>
                    {student.family.discountAmount > 0 && (
                      <div className="text-sm text-green-600">
                        Family discount: ₹{student.family.discountAmount}
                      </div>
                    )}
                  </div>
                </td>
                <td className="table-cell">
                  {student.grade || '-'}
                </td>
                <td className="table-cell">
                  <div className="space-y-1">
                    <div className="font-medium">{student._count.subscriptions} active</div>
                    {student.subscriptions.slice(0, 2).map((sub) => (
                      <div key={sub.id} className="text-sm text-gray-500">
                        {sub.course?.name || sub.service?.name}
                      </div>
                    ))}
                    {student.subscriptions.length > 2 && (
                      <div className="text-sm text-gray-400">
                        +{student.subscriptions.length - 2} more
                      </div>
                    )}
                  </div>
                </td>
                <td className="table-cell">
                  {new Date(student.enrollmentDate).toLocaleDateString()}
                </td>
                <td className="table-cell">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onEdit(student)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                      aria-label={`Edit ${student.name}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                      aria-label={`Delete ${student.name}`}
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
  );
}
