/**
 * StandardDashboardLayout Component
 * 
 * A unified dashboard layout system that provides consistent spacing, typography,
 * and layout patterns across all dashboard interfaces. Ensures professional
 * appearance and optimal user experience.
 * 
 * Features:
 * - Consistent spacing and typography across all dashboards
 * - Responsive layout patterns optimized for all screen sizes
 * - Professional header and section styling
 * - Standardized grid systems for content organization
 * - Mobile-first responsive design approach
 * - Accessibility support with semantic HTML structure
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Standard dashboard section interface
export interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'compact' | 'spacious';
}

// Standard dashboard header interface
export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  action?: React.ReactNode;
  className?: string;
}

// Standard content grid interface
export interface ContentGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 6 | 12;
  };
  className?: string;
}

// Standardized spacing system
const spacingVariants = {
  default: {
    section: 'mb-8',
    header: 'mb-6',
    content: 'space-y-6'
  },
  compact: {
    section: 'mb-6',
    header: 'mb-4',
    content: 'space-y-4'
  },
  spacious: {
    section: 'mb-12',
    header: 'mb-8',
    content: 'space-y-8'
  }
};

// Standardized grid columns
const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12'
};

// Standardized gap sizes
const gapSizes = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
};

/**
 * Standard Dashboard Header Component
 * Provides consistent header styling across all dashboards
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  action,
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center sm:justify-between',
      'mb-8 pb-6 border-b border-gray-200',
      className
    )}>
      <div className="flex-1 min-w-0">
        {breadcrumb && (
          <nav className="mb-2">
            <p className="text-sm text-gray-500 font-medium">
              {breadcrumb}
            </p>
          </nav>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-base text-gray-600 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

/**
 * Standard Dashboard Section Component
 * Provides consistent section styling and spacing
 */
export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  children,
  className,
  headerAction,
  variant = 'default'
}) => {
  const spacing = spacingVariants[variant];

  return (
    <section className={cn(spacing.section, className)}>
      <div className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between',
        spacing.header
      )}>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        {headerAction && (
          <div className="mt-3 sm:mt-0 sm:ml-6 flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>
      <div className={spacing.content}>
        {children}
      </div>
    </section>
  );
};

/**
 * Standard Content Grid Component
 * Provides consistent grid layouts with responsive behavior
 */
export const ContentGrid: React.FC<ContentGridProps> = ({
  children,
  cols = 1,
  gap = 'md',
  responsive,
  className
}) => {
  const responsiveClasses = responsive ? [
    responsive.sm && `sm:${gridCols[responsive.sm]}`,
    responsive.md && `md:${gridCols[responsive.md]}`,
    responsive.lg && `lg:${gridCols[responsive.lg]}`,
    responsive.xl && `xl:${gridCols[responsive.xl]}`
  ].filter(Boolean).join(' ') : '';

  return (
    <div className={cn(
      'grid',
      gridCols[cols],
      gapSizes[gap],
      responsiveClasses,
      className
    )}>
      {children}
    </div>
  );
};

/**
 * Standard Dashboard Container Component
 * Main container with consistent padding and max-width
 */
export interface DashboardContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
};

const paddingClasses = {
  sm: 'px-4 py-4',
  md: 'px-4 sm:px-6 lg:px-8 py-6',
  lg: 'px-4 sm:px-6 lg:px-8 py-8'
};

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
  children,
  maxWidth = '7xl',
  padding = 'md',
  className
}) => {
  return (
    <div className={cn(
      'mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

/**
 * Standard Stats Grid Component
 * Optimized grid for displaying statistics and metrics
 */
export interface StatsGridProps {
  children: React.ReactNode;
  variant?: 'compact' | 'default' | 'spacious';
  className?: string;
}

const statsGridVariants = {
  compact: {
    grid: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    gap: 'gap-3'
  },
  default: {
    grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    gap: 'gap-4'
  },
  spacious: {
    grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    gap: 'gap-6'
  }
};

export const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  variant = 'default',
  className
}) => {
  const gridVariant = statsGridVariants[variant];

  return (
    <div className={cn(
      'grid',
      gridVariant.grid,
      gridVariant.gap,
      className
    )}>
      {children}
    </div>
  );
};

/**
 * Standard Quick Actions Grid Component
 * Optimized grid specifically for quick action buttons
 */
export interface QuickActionsGridProps {
  children: React.ReactNode;
  maxActions?: 3 | 4 | 6;
  className?: string;
}

const quickActionGrids = {
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
};

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  children,
  maxActions = 4,
  className
}) => {
  return (
    <div className={cn(
      'grid gap-4',
      quickActionGrids[maxActions],
      className
    )}>
      {children}
    </div>
  );
};

/**
 * Standard Typography Components
 * Consistent text styling across all dashboards
 */
export const DashboardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <h1 className={cn('text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight', className)}>
    {children}
  </h1>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <h2 className={cn('text-xl font-semibold text-gray-900 tracking-tight', className)}>
    {children}
  </h2>
);

export const SubsectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <h3 className={cn('text-lg font-medium text-gray-900', className)}>
    {children}
  </h3>
);

export const BodyText: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <p className={cn('text-base text-gray-600', className)}>
    {children}
  </p>
);

export const SmallText: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <p className={cn('text-sm text-gray-500', className)}>
    {children}
  </p>
);

// Export all components as default for easy importing
export default {
  DashboardContainer,
  DashboardHeader,
  DashboardSection,
  ContentGrid,
  StatsGrid,
  QuickActionsGrid,
  DashboardTitle,
  SectionTitle,
  SubsectionTitle,
  BodyText,
  SmallText
};
