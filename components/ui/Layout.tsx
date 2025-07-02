/**
 * Layout Components - UI Library
 *
 * Reusable layout components extracted from common patterns across all hubs.
 * Provides consistent spacing, grids, and container structures.
 *
 * Design Features:
 * - Responsive grid systems
 * - Consistent spacing patterns
 * - Professional container layouts
 * - Header and section components
 * - RK Institute design consistency
 */

import React from 'react';

import { cn } from '@/lib/utils';

// Container Component
export interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full'
};

export function Container({
  children,
  size = 'xl',
  className
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        containerSizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}

// Grid Component
export interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6;
    md?: 1 | 2 | 3 | 4 | 5 | 6;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
    xl?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  className?: string;
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6'
};

const gridGaps = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4',
  lg: 'gap-4 sm:gap-6',
  xl: 'gap-6 sm:gap-8'
};

export function Grid({
  children,
  cols = 1,
  gap = 'lg',
  responsive,
  className
}: GridProps) {
  const baseClasses = 'grid';
  const colClasses = gridCols[cols];
  const gapClasses = gridGaps[gap];

  const responsiveClasses = responsive
    ? [
        responsive.sm && `sm:${gridCols[responsive.sm]}`,
        responsive.md && `md:${gridCols[responsive.md]}`,
        responsive.lg && `lg:${gridCols[responsive.lg]}`,
        responsive.xl && `xl:${gridCols[responsive.xl]}`
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <div
      className={cn(
        baseClasses,
        colClasses,
        gapClasses,
        responsiveClasses,
        className
      )}
    >
      {children}
    </div>
  );
}

// Mobile-Optimized Card Grid Component
export interface CardGridProps {
  children: React.ReactNode;
  className?: string;
  density?: 'comfortable' | 'compact' | 'condensed';
}

export function CardGrid({
  children,
  className,
  density = 'comfortable'
}: CardGridProps) {
  const densityClasses = {
    comfortable:
      'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4',
    compact:
      'grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4',
    condensed:
      'grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2 lg:grid-cols-4 lg:gap-3 xl:grid-cols-5'
  };

  return (
    <div className={cn(densityClasses[density], className)}>{children}</div>
  );
}

// Mobile-Optimized Stats Grid Component
export function StatsGrid({
  children,
  className,
  density = 'compact'
}: CardGridProps) {
  const densityClasses = {
    comfortable:
      'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4',
    compact: 'grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4',
    condensed:
      'grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 lg:grid-cols-4 lg:gap-3 xl:grid-cols-6'
  };

  return (
    <div className={cn(densityClasses[density], className)}>{children}</div>
  );
}

// Ultra-Compact Grid for Maximum Mobile Density
export function CompactGrid({ children, className }: CardGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 md:gap-3 lg:grid-cols-5 lg:gap-4 xl:grid-cols-6',
        className
      )}
    >
      {children}
    </div>
  );
}

// Horizontal List Layout for Mobile
export function HorizontalList({ children, className }: CardGridProps) {
  return (
    <div className={cn('space-y-1.5 sm:space-y-2', className)}>{children}</div>
  );
}

// Stack Component (Vertical Layout)
export interface StackProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

const stackSpacing = {
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8'
};

const stackAlign = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
};

export function Stack({
  children,
  spacing = 'md',
  align = 'stretch',
  className
}: StackProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        stackSpacing[spacing],
        stackAlign[align],
        className
      )}
    >
      {children}
    </div>
  );
}

// Flex Component (Horizontal Layout)
export interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const flexDirection = {
  row: 'flex-row',
  col: 'flex-col'
};

const flexAlign = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
};

const flexJustify = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
};

const flexGaps = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
};

export function Flex({
  children,
  direction = 'row',
  align = 'center',
  justify = 'start',
  wrap = false,
  gap = 'md',
  className
}: FlexProps) {
  return (
    <div
      className={cn(
        'flex',
        flexDirection[direction],
        flexAlign[align],
        flexJustify[justify],
        wrap && 'flex-wrap',
        flexGaps[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// Section Component
export interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Section({
  children,
  title,
  subtitle,
  action,
  spacing = 'lg',
  className
}: SectionProps) {
  return (
    <section className={cn(stackSpacing[spacing], className)}>
      {(title || subtitle || action) && (
        <div className='flex justify-between items-start'>
          <div>
            {title && (
              <h2 className='text-2xl font-bold text-gray-900'>{title}</h2>
            )}
            {subtitle && <p className='mt-1 text-gray-600'>{subtitle}</p>}
          </div>
          {action && <div className='flex-shrink-0 ml-4'>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

// Page Header Component
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {breadcrumbs && (
        <nav className='flex' aria-label='Breadcrumb'>
          <ol className='flex items-center space-x-2 text-sm text-gray-500'>
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className='flex items-center'>
                {index > 0 && <span className='mx-2'>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className='hover:text-gray-700'>
                    {crumb.label}
                  </a>
                ) : (
                  <span className='text-gray-900'>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className='flex justify-between items-center animate-fade-in'>
        <div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
            {title}
          </h1>
          {subtitle && <p className='mt-2 text-lg text-gray-600'>{subtitle}</p>}
        </div>
        {actions && <div className='flex space-x-4'>{actions}</div>}
      </div>
    </div>
  );
}
