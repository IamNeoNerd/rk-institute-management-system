/**
 * State Components - UI Library
 * 
 * Reusable state components for loading, empty, and error states
 * extracted from common patterns across all hubs.
 * 
 * Design Features:
 * - Consistent loading animations
 * - Professional empty state messaging
 * - Error state handling with actions
 * - Icon-based visual hierarchy
 * - RK Institute design consistency
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { ProfessionalIcon } from './icons/ProfessionalIconSystem';

// Loading State Component
export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const loadingSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

export function LoadingState({ 
  message = 'Loading...', 
  size = 'md',
  className 
}: LoadingStateProps) {
  return (
    <div className={cn('text-center py-8', className)}>
      <div className="flex justify-center mb-4">
        <div className={cn(
          'animate-spin rounded-full border-b-2 border-blue-600',
          loadingSizes[size]
        )} />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}

// Empty State Component
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      {icon && (
        <div className="text-gray-400 text-4xl mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Error State Component
export interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: {
    label?: string;
    onClick: () => void;
  };
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  retry,
  className
}: ErrorStateProps) {
  return (
    <div className={cn('text-center py-8', className)}>
      <div className="text-red-400 text-4xl mb-4 flex justify-center">
        <ProfessionalIcon name="warning" size={48} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      {retry && (
        <Button onClick={retry.onClick} variant="primary">
          {retry.label || 'Try Again'}
        </Button>
      )}
    </div>
  );
}

// Success State Component
export interface SuccessStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SuccessState({ 
  title, 
  description, 
  action,
  className 
}: SuccessStateProps) {
  return (
    <div className={cn('text-center py-8', className)}>
      <div className="text-green-400 text-4xl mb-4">✅</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="success">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Skeleton Loading Component
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export function Skeleton({ 
  width = '100%', 
  height = '1rem',
  variant = 'rectangular',
  className 
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  );
}

// Skeleton Group for complex layouts
export interface SkeletonGroupProps {
  lines?: number;
  className?: string;
}

export function SkeletonGroup({ lines = 3, className }: SkeletonGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '75%' : '100%'}
          height="1rem"
        />
      ))}
    </div>
  );
}

// Data List Skeleton
export function DataListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height="1rem" />
            <Skeleton width="40%" height="0.75rem" />
          </div>
          <Skeleton width="5rem" height="1rem" />
        </div>
      ))}
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
      <Skeleton variant="circular" width="2rem" height="2rem" className="mx-auto mb-2" />
      <Skeleton width="3rem" height="1.5rem" className="mx-auto mb-1" />
      <Skeleton width="4rem" height="0.875rem" className="mx-auto" />
    </div>
  );
}
