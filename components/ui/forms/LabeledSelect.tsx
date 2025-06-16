'use client';

import { forwardRef } from 'react';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface LabeledSelectProps {
  id: string;
  label: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

const LabeledSelect = forwardRef<HTMLSelectElement, LabeledSelectProps>(
  ({
    id,
    label,
    options,
    value,
    onChange,
    placeholder = "Select an option",
    required = false,
    disabled = false,
    error,
    helperText,
    className = '',
    ...props
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className={`space-y-2 ${className}`}>
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        
        <select
          ref={ref}
          id={id}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          aria-invalid={error ? 'true' : 'false'}
          className={`
            w-full px-4 py-3 border rounded-xl transition-all duration-300 
            focus:outline-none focus:ring-4 focus:ring-blue-500/25 
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-300 focus:border-red-500 bg-red-50' 
              : 'border-gray-200 focus:border-blue-500 bg-white'
            }
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p 
            id={`${id}-error`}
            className="text-sm text-red-600 flex items-center"
            role="alert"
            aria-live="polite"
          >
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p 
            id={`${id}-helper`}
            className="text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

LabeledSelect.displayName = 'LabeledSelect';

export default LabeledSelect;
