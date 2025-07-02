/**
 * Card Component - UI Library
 *
 * Reusable card component extracted from common patterns across all hubs.
 * Provides consistent styling and behavior for content containers.
 *
 * Design Features:
 * - Multiple size variants (default, compact, large)
 * - Hover effects with shadow transitions
 * - Optional padding and border customization
 * - Professional RK Institute design consistency
 * - TypeScript support with comprehensive props
 */

import React from 'react';

import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'compact'
    | 'large'
    | 'glass'
    | 'mobile-compact'
    | 'horizontal';
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  as?: 'div' | 'section' | 'article';
  mobileOptimized?: boolean;
}

const cardVariants = {
  default: 'bg-white rounded-2xl shadow-lg border border-gray-200',
  compact: 'bg-white rounded-xl shadow-sm border border-gray-200',
  large: 'bg-white rounded-3xl shadow-xl border border-gray-100',
  glass:
    'bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100',
  'mobile-compact': 'bg-white rounded-lg shadow-sm border border-gray-200',
  horizontal: 'bg-white rounded-xl shadow-sm border border-gray-200'
};

const paddingVariants = {
  none: '',
  sm: 'p-2 sm:p-3',
  md: 'p-3 sm:p-4',
  lg: 'p-4 sm:p-6',
  xl: 'p-6 sm:p-8'
};

const mobilePaddingVariants = {
  none: '',
  sm: 'p-1.5 sm:p-3',
  md: 'p-2 sm:p-4',
  lg: 'p-2.5 sm:p-6',
  xl: 'p-3 sm:p-8'
};

export function Card({
  children,
  variant = 'default',
  className,
  hover = true,
  padding = 'lg',
  onClick,
  as: Component = 'div',
  mobileOptimized = false,
  ...props
}: CardProps) {
  const baseClasses = cardVariants[variant];
  const paddingClasses = mobileOptimized
    ? mobilePaddingVariants[padding]
    : paddingVariants[padding];
  const hoverClasses = hover
    ? 'transition-all duration-300 hover:shadow-xl'
    : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <Component
      className={cn(
        baseClasses,
        paddingClasses,
        hoverClasses,
        clickableClasses,
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}

// Additional Card Components for compatibility
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  );
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
    >
      {children}
    </h3>
  );
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>;
}

// Specialized Card Components
export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const colorVariants = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  teal: 'text-teal-600',
  red: 'text-red-600'
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  trend,
  className
}: StatsCardProps) {
  return (
    <Card
      variant='compact'
      padding='sm'
      className={cn('text-center', className)}
    >
      {icon && (
        <div
          className={cn(
            'text-lg sm:text-2xl mb-1 sm:mb-2',
            colorVariants[color]
          )}
        >
          {icon}
        </div>
      )}
      <div
        className={cn(
          'text-xl sm:text-2xl font-bold mb-1',
          colorVariants[color]
        )}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className='text-xs sm:text-sm font-medium text-gray-600'>
        {title}
      </div>
      {subtitle && <div className='text-xs text-gray-400 mt-1'>{subtitle}</div>}
      {trend && (
        <div
          className={cn(
            'text-xs mt-2 flex items-center justify-center',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}
        >
          <span className='mr-1'>{trend.isPositive ? '↗' : '↘'}</span>
          {Math.abs(trend.value)}%
        </div>
      )}
    </Card>
  );
}

// Quick Action Card Component
export interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  color?: string;
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  href,
  onClick,
  color = 'from-blue-500 to-blue-600',
  className
}: QuickActionCardProps) {
  const content = (
    <div className='group p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md cursor-pointer'>
      <div className='flex items-center mb-2 sm:mb-3'>
        <div
          className={cn(
            'w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r rounded-lg flex items-center justify-center text-white text-sm sm:text-lg mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-200',
            color
          )}
        >
          {icon}
        </div>
        <div className='flex-1'>
          <h3 className='text-sm sm:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200'>
            {title}
          </h3>
        </div>
      </div>
      <p className='text-xs sm:text-sm text-gray-600'>{description}</p>
    </div>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <div onClick={onClick} className={className}>
      {content}
    </div>
  );
}
