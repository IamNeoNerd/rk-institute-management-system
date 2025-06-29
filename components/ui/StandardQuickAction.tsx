/**
 * StandardQuickAction Component
 * 
 * A unified quick action component that provides consistent styling and behavior
 * across all dashboard portals. Supports multiple variants and maintains
 * professional appearance with proper accessibility.
 * 
 * Features:
 * - Consistent visual design across all portals
 * - Multiple style variants (gradient, card, minimal)
 * - Proper hover effects and transitions
 * - Mobile-optimized touch targets
 * - Accessibility support with keyboard navigation
 * - Professional styling with semantic colors
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface StandardQuickActionProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'gradient' | 'card' | 'minimal';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red';
  priority?: 'high' | 'medium' | 'low';
  disabled?: boolean;
  className?: string;
}

// Standardized color variants for consistent theming
const colorVariants = {
  // Semantic colors (recommended)
  primary: {
    gradient: 'from-blue-500 to-blue-600',
    card: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
    icon: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200',
    text: 'text-blue-600'
  },
  success: {
    gradient: 'from-green-500 to-green-600',
    card: 'border-green-200 bg-green-50 hover:bg-green-100',
    icon: 'bg-green-100 text-green-600 group-hover:bg-green-200',
    text: 'text-green-600'
  },
  warning: {
    gradient: 'from-yellow-500 to-yellow-600',
    card: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
    icon: 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200',
    text: 'text-yellow-600'
  },
  error: {
    gradient: 'from-red-500 to-red-600',
    card: 'border-red-200 bg-red-50 hover:bg-red-100',
    icon: 'bg-red-100 text-red-600 group-hover:bg-red-200',
    text: 'text-red-600'
  },
  info: {
    gradient: 'from-indigo-500 to-indigo-600',
    card: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100',
    icon: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200',
    text: 'text-indigo-600'
  },
  // Legacy colors (backward compatibility)
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    card: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
    icon: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200',
    text: 'text-blue-600'
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    card: 'border-green-200 bg-green-50 hover:bg-green-100',
    icon: 'bg-green-100 text-green-600 group-hover:bg-green-200',
    text: 'text-green-600'
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    card: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
    icon: 'bg-purple-100 text-purple-600 group-hover:bg-purple-200',
    text: 'text-purple-600'
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    card: 'border-orange-200 bg-orange-50 hover:bg-orange-100',
    icon: 'bg-orange-100 text-orange-600 group-hover:bg-orange-200',
    text: 'text-orange-600'
  },
  teal: {
    gradient: 'from-teal-500 to-teal-600',
    card: 'border-teal-200 bg-teal-50 hover:bg-teal-100',
    icon: 'bg-teal-100 text-teal-600 group-hover:bg-teal-200',
    text: 'text-teal-600'
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    card: 'border-red-200 bg-red-50 hover:bg-red-100',
    icon: 'bg-red-100 text-red-600 group-hover:bg-red-200',
    text: 'text-red-600'
  }
};

// Priority styling for visual hierarchy
const priorityStyles = {
  high: 'ring-2 ring-blue-200 ring-opacity-50',
  medium: '',
  low: 'opacity-90'
};

export const StandardQuickAction: React.FC<StandardQuickActionProps> = ({
  id,
  title,
  description,
  icon,
  onClick,
  variant = 'card',
  color = 'primary',
  priority = 'medium',
  disabled = false,
  className
}) => {
  const colorScheme = colorVariants[color];
  const priorityStyle = priorityStyles[priority];

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  // Gradient variant (Student portal style)
  if (variant === 'gradient') {
    return (
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'group relative overflow-hidden',
          'bg-gradient-to-r text-white',
          'p-6 rounded-xl shadow-lg',
          'transition-all duration-200 transform',
          'hover:scale-105 hover:shadow-xl',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'text-left min-h-[120px]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          colorScheme.gradient,
          priorityStyle,
          className
        )}
        aria-label={`${title}: ${description}`}
      >
        <div className="flex items-start justify-between h-full">
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-2">{title}</h4>
            <p className="text-white text-opacity-90 text-sm leading-relaxed">
              {description}
            </p>
          </div>
          <div className="text-4xl ml-4 flex-shrink-0">
            {icon}
          </div>
        </div>
      </button>
    );
  }

  // Card variant (Teacher/Parent portal style)
  if (variant === 'card') {
    return (
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'group relative overflow-hidden',
          'bg-white border rounded-xl shadow-sm',
          'p-6 transition-all duration-200',
          'hover:shadow-md hover:border-gray-300',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'text-left min-h-[120px]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          colorScheme.card,
          priorityStyle,
          className
        )}
        aria-label={`${title}: ${description}`}
      >
        <div className="flex items-center h-full">
          <div className={cn(
            'p-3 rounded-lg transition-colors flex-shrink-0',
            colorScheme.icon
          )}>
            <span className="text-2xl block">
              {icon}
            </span>
          </div>
          <div className="ml-4 flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-1">{title}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </button>
    );
  }

  // Minimal variant (for compact layouts)
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'group relative overflow-hidden',
          'bg-white border border-gray-200 rounded-lg shadow-sm',
          'p-4 transition-all duration-200',
          'hover:shadow-md hover:border-gray-300',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'text-left min-h-[80px]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          priorityStyle,
          className
        )}
        aria-label={`${title}: ${description}`}
      >
        <div className="flex items-center">
          <div className={cn(
            'p-2 rounded-md transition-colors flex-shrink-0',
            colorScheme.icon
          )}>
            <span className="text-lg block">
              {icon}
            </span>
          </div>
          <div className="ml-3 flex-1">
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </button>
    );
  }

  return null;
};

// Grid component for consistent quick action layouts
export interface QuickActionGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  responsive?: {
    sm?: 1 | 2 | 3 | 4;
    md?: 1 | 2 | 3 | 4;
    lg?: 1 | 2 | 3 | 4;
  };
  className?: string;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  children,
  cols = 2,
  responsive,
  className
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  const responsiveClasses = responsive ? [
    responsive.sm && `sm:grid-cols-${responsive.sm}`,
    responsive.md && `md:grid-cols-${responsive.md}`,
    responsive.lg && `lg:grid-cols-${responsive.lg}`
  ].filter(Boolean).join(' ') : '';

  return (
    <div className={cn(
      'grid gap-4',
      gridCols[cols],
      responsiveClasses,
      className
    )}>
      {children}
    </div>
  );
};

export default StandardQuickAction;
