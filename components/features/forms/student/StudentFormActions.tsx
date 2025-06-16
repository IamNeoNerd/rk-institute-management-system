'use client';

import LoadingSpinner from '@/components/ui/feedback/LoadingSpinner';

interface StudentFormActionsProps {
  loading: boolean;
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function StudentFormActions({ 
  loading, 
  isEditing, 
  onCancel, 
  onSubmit 
}: StudentFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4 pt-6">
      <button
        type="button"
        onClick={onCancel}
        className="btn-secondary"
        disabled={loading}
        aria-label="Cancel form"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        aria-label={isEditing ? "Update student information" : "Create new student"}
      >
        {loading ? (
          <div className="flex items-center">
            <LoadingSpinner size="sm" />
            <span className="ml-2">Saving...</span>
          </div>
        ) : (
          isEditing ? 'Update Student' : 'Create Student'
        )}
      </button>
    </div>
  );
}
