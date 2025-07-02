/**
 * Report Generator Component
 *
 * Dynamic form generator for report parameters with validation and preview.
 * Leverages existing Form, Input, and Button components for consistency.
 *
 * Features:
 * - Dynamic form generation based on template parameters
 * - Real-time validation and error handling
 * - Format selection (PDF, Excel, CSV)
 * - Progress indication during generation
 * - Reuses existing UI components for rapid development
 */

'use client';

import React, { useState, useCallback } from 'react';

import { Card, Button, LoadingState } from '@/components/ui';

import { ReportGeneratorProps, ReportParameter } from './types';

export default function ReportGenerator({
  template,
  onGenerate,
  onCancel,
  generating = false
}: ReportGeneratorProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize parameters with default values
  React.useEffect(() => {
    if (template) {
      const defaultParams: Record<string, any> = {};
      template.parameters.forEach(param => {
        if (param.defaultValue !== undefined) {
          defaultParams[param.id] = param.defaultValue;
        }
      });
      setParameters(defaultParams);
      setSelectedFormat(template.outputFormats[0] || 'pdf');
    }
  }, [template]);

  // Handle parameter value changes
  const handleParameterChange = useCallback(
    (paramId: string, value: any) => {
      setParameters(prev => ({
        ...prev,
        [paramId]: value
      }));

      // Clear error for this parameter
      if (errors[paramId]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[paramId];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Validate parameters
  const validateParameters = useCallback(() => {
    if (!template) return false;

    const newErrors: Record<string, string> = {};

    template.parameters.forEach(param => {
      const value = parameters[param.id];

      // Required field validation
      if (
        param.required &&
        (value === undefined || value === null || value === '')
      ) {
        newErrors[param.id] = `${param.label} is required`;
        return;
      }

      // Type-specific validation
      if (value !== undefined && value !== null && value !== '') {
        if (param.validation) {
          const { min, max, pattern, message } = param.validation;

          if (param.type === 'number') {
            const numValue = Number(value);
            if (min !== undefined && numValue < min) {
              newErrors[param.id] = message || `Minimum value is ${min}`;
            }
            if (max !== undefined && numValue > max) {
              newErrors[param.id] = message || `Maximum value is ${max}`;
            }
          }

          if (param.type === 'text' && pattern) {
            const regex = new RegExp(pattern);
            if (!regex.test(value)) {
              newErrors[param.id] = message || 'Invalid format';
            }
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [template, parameters]);

  // Handle form submission
  const handleGenerate = useCallback(() => {
    if (!template || !validateParameters()) return;

    onGenerate(template.id, parameters, selectedFormat);
  }, [template, parameters, selectedFormat, validateParameters, onGenerate]);

  // Render parameter input based on type
  const renderParameterInput = (param: ReportParameter) => {
    const value = parameters[param.id];
    const error = errors[param.id];

    const inputClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-500' : 'border-gray-300'
    }`;

    switch (param.type) {
      case 'text':
        return (
          <div key={param.id} className='space-y-1'>
            <label className='block text-sm font-medium text-gray-700'>
              {param.label}{' '}
              {param.required && <span className='text-red-500'>*</span>}
            </label>
            <input
              type='text'
              value={value || ''}
              onChange={e => handleParameterChange(param.id, e.target.value)}
              placeholder={`Enter ${param.label.toLowerCase()}`}
              className={inputClassName}
            />
            {error && <p className='text-sm text-red-600'>{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={param.id} className='space-y-1'>
            <label className='block text-sm font-medium text-gray-700'>
              {param.label}{' '}
              {param.required && <span className='text-red-500'>*</span>}
            </label>
            <input
              type='number'
              value={value || ''}
              onChange={e => handleParameterChange(param.id, e.target.value)}
              placeholder={`Enter ${param.label.toLowerCase()}`}
              min={param.validation?.min}
              max={param.validation?.max}
              className={inputClassName}
            />
            {error && <p className='text-sm text-red-600'>{error}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={param.id} className='space-y-1'>
            <label className='block text-sm font-medium text-gray-700'>
              {param.label}{' '}
              {param.required && <span className='text-red-500'>*</span>}
            </label>
            <input
              type='date'
              value={value || ''}
              onChange={e => handleParameterChange(param.id, e.target.value)}
              className={inputClassName}
            />
            {error && <p className='text-sm text-red-600'>{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={param.id} className='space-y-1'>
            <label className='block text-sm font-medium text-gray-700'>
              {param.label}{' '}
              {param.required && <span className='text-red-500'>*</span>}
            </label>
            <select
              value={value || ''}
              onChange={e => handleParameterChange(param.id, e.target.value)}
              className={inputClassName}
            >
              <option value=''>Select {param.label.toLowerCase()}</option>
              {param.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className='text-sm text-red-600'>{error}</p>}
          </div>
        );

      case 'boolean':
        return (
          <div key={param.id} className='flex items-center space-x-2'>
            <input
              type='checkbox'
              checked={value || false}
              onChange={e => handleParameterChange(param.id, e.target.checked)}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <label className='text-sm font-medium text-gray-700'>
              {param.label}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  if (!template) {
    return (
      <div className='text-center py-12'>
        <div className='text-6xl mb-4'>📊</div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          No Template Selected
        </h3>
        <p className='text-gray-600 mb-4'>
          Please select a report template to continue.
        </p>
        <Button onClick={onCancel}>Back to Templates</Button>
      </div>
    );
  }

  if (generating) {
    return <LoadingState message='Generating your report...' />;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>{template.name}</h2>
          <p className='text-gray-600 mt-1'>{template.description}</p>
        </div>
        <Button variant='outline' onClick={onCancel}>
          ← Back to Templates
        </Button>
      </div>

      <Card>
        <div className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Report Parameters
          </h3>

          {/* Parameters Form */}
          <div className='space-y-4'>
            {template.parameters.map(renderParameterInput)}
          </div>

          {/* Format Selection */}
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <h4 className='text-md font-medium text-gray-900 mb-3'>
              Output Format
            </h4>
            <div className='flex gap-3'>
              {template.outputFormats.map(format => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedFormat === format
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Generation Info */}
          <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
            <div className='flex items-center text-sm text-blue-800'>
              <span className='mr-2'>ℹ️</span>
              <span>
                Estimated generation time: ~{template.estimatedTime} seconds
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='mt-6 flex gap-3'>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className='bg-blue-600 text-white hover:bg-blue-700'
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </Button>
            <Button variant='outline' onClick={onCancel} disabled={generating}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
