/**
 * Button Component - UI Library
 * 
 * Reusable button component extracted from common patterns across all hubs.
 * Provides consistent styling and behavior for interactive elements.
 * 
 * Design Features:
 * - Multiple variants (primary, secondary, danger, success, ghost)
 * - Size variants (sm, md, lg, xl)
 * - Loading states with spinners
 * - Icon support (left and right)
 * - Professional RK Institute design consistency
 * - Full accessibility support
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-500/25',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm hover:shadow-md focus:ring-gray-500/25',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500/25',
  success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500/25',
  ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500/25',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500/25'
};

const sizeVariants = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-xl'
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  const variantClasses = buttonVariants[variant];
  const sizeClasses = sizeVariants[size];
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses,
        sizeClasses,
        widthClasses,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        
        <span>{children}</span>
        
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </div>
    </button>
  );
}

// Icon Button Component
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      variant={variant}
      className={cn('!p-0', sizeClasses[size], className)}
      {...props}
    >
      {icon}
    </Button>
  );
}

// Button Group Component
export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  className
}: ButtonGroupProps) {
  const orientationClasses = orientation === 'horizontal' 
    ? 'flex flex-row' 
    : 'flex flex-col';

  return (
    <div className={cn(orientationClasses, 'space-x-2', className)}>
      {children}
    </div>
  );
}
