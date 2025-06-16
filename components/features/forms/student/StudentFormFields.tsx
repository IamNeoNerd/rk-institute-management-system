'use client';

import LabeledSelect from '@/components/ui/forms/LabeledSelect';

interface Family {
  id: string;
  name: string;
  discountAmount: number;
}

interface StudentFormData {
  name: string;
  grade: string;
  dateOfBirth: string;
  enrollmentDate: string;
  familyId: string;
}

interface StudentFormFieldsProps {
  formData: StudentFormData;
  families: Family[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors?: Record<string, string>;
}

export default function StudentFormFields({ 
  formData, 
  families, 
  onChange, 
  errors = {} 
}: StudentFormFieldsProps) {
  const familyOptions = families.map(family => ({
    value: family.id,
    label: `${family.name}${family.discountAmount > 0 ? ` (₹${family.discountAmount} discount)` : ''}`
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Student Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Student Name *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className={`input-field ${errors.name ? 'border-red-300 focus:border-red-500 bg-red-50' : ''}`}
            value={formData.name}
            onChange={onChange}
            placeholder="e.g., John Smith"
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Grade */}
        <div>
          <label htmlFor="grade" className="block text-sm font-semibold text-gray-700 mb-2">
            Grade/Class
          </label>
          <input
            type="text"
            name="grade"
            id="grade"
            className={`input-field ${errors.grade ? 'border-red-300 focus:border-red-500 bg-red-50' : ''}`}
            value={formData.grade}
            onChange={onChange}
            placeholder="e.g., Grade 10, Class A"
            aria-describedby={errors.grade ? "grade-error" : undefined}
            aria-invalid={errors.grade ? 'true' : 'false'}
          />
          {errors.grade && (
            <p id="grade-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.grade}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            id="dateOfBirth"
            className={`input-field ${errors.dateOfBirth ? 'border-red-300 focus:border-red-500 bg-red-50' : ''}`}
            value={formData.dateOfBirth}
            onChange={onChange}
            aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined}
            aria-invalid={errors.dateOfBirth ? 'true' : 'false'}
          />
          {errors.dateOfBirth && (
            <p id="dateOfBirth-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        {/* Enrollment Date */}
        <div>
          <label htmlFor="enrollmentDate" className="block text-sm font-semibold text-gray-700 mb-2">
            Enrollment Date *
          </label>
          <input
            type="date"
            name="enrollmentDate"
            id="enrollmentDate"
            required
            className={`input-field ${errors.enrollmentDate ? 'border-red-300 focus:border-red-500 bg-red-50' : ''}`}
            value={formData.enrollmentDate}
            onChange={onChange}
            aria-describedby={errors.enrollmentDate ? "enrollmentDate-error" : undefined}
            aria-invalid={errors.enrollmentDate ? 'true' : 'false'}
          />
          {errors.enrollmentDate && (
            <p id="enrollmentDate-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.enrollmentDate}
            </p>
          )}
        </div>
      </div>

      {/* Family Selection */}
      <LabeledSelect
        id="familyId"
        label="Family"
        options={familyOptions}
        value={formData.familyId}
        onChange={(value) => onChange({ target: { name: 'familyId', value } } as any)}
        placeholder="Select a family"
        required
        error={errors.familyId}
        helperText={families.length === 0 ? "No families found. Please create a family first." : undefined}
      />
    </div>
  );
}
