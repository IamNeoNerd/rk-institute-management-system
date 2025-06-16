'use client';

// Custom hook for form logic
import { useStudentForm } from '@/hooks/forms/useStudentForm';

// Shared UI components
import ErrorAlert from '@/components/ui/feedback/ErrorAlert';

// Feature components
import StudentFormFields from '@/components/features/forms/student/StudentFormFields';
import StudentFormActions from '@/components/features/forms/student/StudentFormActions';
import StudentFormInfo from '@/components/features/forms/student/StudentFormInfo';

// Types
import { Student } from '@/components/features/students/types';

interface StudentFormProps {
  student?: Student | null;
  onSuccess: (student: Student) => void;
  onCancel: () => void;
}

export default function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  // Use custom hook for all form logic
  const {
    formData,
    families,
    loading,
    error,
    errors,
    handleChange,
    handleSubmit,
  } = useStudentForm({ student, onSuccess });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error handling with shared component */}
      {error && <ErrorAlert message={error} />}

      {/* Form fields */}
      <StudentFormFields
        formData={formData}
        families={families}
        onChange={handleChange}
        errors={errors}
      />

      {/* Information section */}
      <StudentFormInfo />

      {/* Form actions */}
      <StudentFormActions
        loading={loading}
        isEditing={!!student}
        onCancel={onCancel}
        onSubmit={() => {}} // handleSubmit is already bound to form onSubmit
      />
    </form>
  );
}
