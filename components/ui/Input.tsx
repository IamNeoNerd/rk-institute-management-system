/**
 * Input Component - UI Library
 * 
 * Reusable input component extracted from common patterns across all hubs.
 * Provides consistent styling and behavior for form inputs.
 * 
 * Design Features:
 * - Multiple variants (default, filled, outlined)
 * - Size variants (sm, md, lg)
 * - Icon support (left and right)
 * - Error and success states
 * - Professional RK Institute design consistency
 * - Full accessibility support
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  success?: boolean;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const inputVariants = {
  default: 'border border-gray-200 bg-white/50 backdrop-blur-sm focus:border-blue-500',
  filled: 'border-0 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500',
  outlined: 'border-2 border-gray-300 bg-transparent focus:border-blue-500'
};

const sizeVariants = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-3 text-base rounded-xl',
  lg: 'px-5 py-4 text-lg rounded-xl'
};

export function Input({
  variant = 'default',
  inputSize = 'md',
  leftIcon,
  rightIcon,
  error,
  success,
  label,
  helperText,
  fullWidth = true,
  className,
  ...props
}: InputProps) {
  const baseClasses = 'transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = inputVariants[variant];
  const sizeClasses = sizeVariants[inputSize];
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : '';
  const successClasses = success ? 'border-green-500 focus:border-green-500 focus:ring-green-500/25' : '';

  const inputElement = (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )}
      
      <input
        className={cn(
          baseClasses,
          variantClasses,
          sizeClasses,
          widthClasses,
          leftIcon ? 'pl-10' : '',
          rightIcon ? 'pr-10' : '',
          errorClasses,
          successClasses,
          className
        )}
        {...props}
      />
      
      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  );

  if (label || helperText || error) {
    return (
      <div className={cn('space-y-2', fullWidth ? 'w-full' : '')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        {inputElement}
        
        {(helperText || error) && (
          <p className={cn(
            'text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }

  return inputElement;
}

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  error?: string;
  success?: boolean;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export function Textarea({
  variant = 'default',
  inputSize = 'md',
  error,
  success,
  label,
  helperText,
  fullWidth = true,
  resize = 'vertical',
  className,
  ...props
}: TextareaProps) {
  const baseClasses = 'transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = inputVariants[variant];
  const sizeClasses = sizeVariants[inputSize];
  const widthClasses = fullWidth ? 'w-full' : '';
  const resizeClasses = `resize-${resize}`;
  
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : '';
  const successClasses = success ? 'border-green-500 focus:border-green-500 focus:ring-green-500/25' : '';

  const textareaElement = (
    <textarea
      className={cn(
        baseClasses,
        variantClasses,
        sizeClasses,
        widthClasses,
        resizeClasses,
        errorClasses,
        successClasses,
        'min-h-[100px]',
        className
      )}
      {...props}
    />
  );

  if (label || helperText || error) {
    return (
      <div className={cn('space-y-2', fullWidth ? 'w-full' : '')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        {textareaElement}
        
        {(helperText || error) && (
          <p className={cn(
            'text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }

  return textareaElement;
}

// Select Component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  error?: string;
  success?: boolean;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
}

export function Select({
  variant = 'default',
  inputSize = 'md',
  error,
  success,
  label,
  helperText,
  fullWidth = true,
  options,
  className,
  ...props
}: SelectProps) {
  const baseClasses = 'transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right bg-[length:16px_16px] pr-10';
  const variantClasses = inputVariants[variant];
  const sizeClasses = sizeVariants[inputSize];
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : '';
  const successClasses = success ? 'border-green-500 focus:border-green-500 focus:ring-green-500/25' : '';

  const selectElement = (
    <div className="relative">
      <select
        className={cn(
          baseClasses,
          variantClasses,
          sizeClasses,
          widthClasses,
          errorClasses,
          successClasses,
          className
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (label || helperText || error) {
    return (
      <div className={cn('space-y-2', fullWidth ? 'w-full' : '')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        {selectElement}
        
        {(helperText || error) && (
          <p className={cn(
            'text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }

  return selectElement;
}
