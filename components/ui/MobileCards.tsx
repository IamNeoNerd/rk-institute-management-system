/**
 * Mobile-Optimized Card Components
 *
 * Enhanced card variants specifically designed for mobile devices based on research
 * from leading mobile UI libraries (Ant Design Mobile, TDesign Mobile Vue).
 *
 * Key Features:
 * - Ultra-compact padding for maximum content density
 * - Horizontal layouts for better mobile utilization
 * - Progressive disclosure patterns
 * - Touch-friendly 44px minimum targets
 * - Optimized typography scaling
 */

import React from 'react';

import { cn } from '@/lib/utils';

import { Card, CardProps } from './Card';

// Compact Stats Card for Mobile
export interface CompactStatsCardProps {
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
  layout?: 'vertical' | 'horizontal';
}

const compactColorVariants = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  teal: 'text-teal-600',
  red: 'text-red-600'
};

export function CompactStatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  trend,
  className,
  layout = 'vertical'
}: CompactStatsCardProps) {
  if (layout === 'horizontal') {
    return (
      <Card
        variant='mobile-compact'
        padding='sm'
        className={cn('min-h-[60px]', className)}
        mobileOptimized
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2 flex-1 min-w-0'>
            {icon && (
              <div
                className={cn(
                  'text-lg flex-shrink-0',
                  compactColorVariants[color]
                )}
              >
                {icon}
              </div>
            )}
            <div className='min-w-0 flex-1'>
              <div className='flex items-baseline space-x-2'>
                <div
                  className={cn(
                    'text-lg sm:text-xl font-bold',
                    compactColorVariants[color]
                  )}
                >
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {trend && (
                  <div
                    className={cn(
                      'text-xs font-medium',
                      trend.isPositive ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                  </div>
                )}
              </div>
              <div className='text-xs text-gray-600 truncate'>{title}</div>
              {subtitle && (
                <div className='text-xs text-gray-400 truncate'>{subtitle}</div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant='mobile-compact'
      padding='sm'
      className={cn('text-center min-h-[80px]', className)}
      mobileOptimized
    >
      {icon && (
        <div
          className={cn(
            'text-base sm:text-lg mb-1',
            compactColorVariants[color]
          )}
        >
          {icon}
        </div>
      )}
      <div
        className={cn(
          'text-lg sm:text-xl font-bold mb-0.5',
          compactColorVariants[color]
        )}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className='text-xs font-medium text-gray-600'>{title}</div>
      {subtitle && (
        <div className='text-xs text-gray-400 mt-0.5'>{subtitle}</div>
      )}
      {trend && (
        <div
          className={cn(
            'text-xs font-medium mt-1',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}
        >
          {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
        </div>
      )}
    </Card>
  );
}

// Condensed Metric Card for Mobile
export interface CondensedMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color:
    | 'blue'
    | 'green'
    | 'purple'
    | 'red'
    | 'yellow'
    | 'indigo'
    | 'pink'
    | 'gray';
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
  showTrendLabel?: boolean;
}

const condensedColorClasses = {
  blue: {
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  green: {
    text: 'text-green-600',
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  purple: {
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  red: {
    text: 'text-red-600',
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  yellow: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    iconBg: 'bg-yellow-100',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  indigo: {
    text: 'text-indigo-600',
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  pink: {
    text: 'text-pink-600',
    bg: 'bg-pink-50',
    iconBg: 'bg-pink-100',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  gray: {
    text: 'text-gray-600',
    bg: 'bg-gray-50',
    iconBg: 'bg-gray-100',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  }
};

export function CondensedMetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  className = '',
  showTrendLabel = false
}: CondensedMetricCardProps) {
  const colors = condensedColorClasses[color];

  return (
    <Card
      variant='mobile-compact'
      padding='sm'
      className={cn('min-h-[70px]', className)}
      mobileOptimized
    >
      <div className='flex items-center space-x-2'>
        <div
          className={cn('p-1.5 sm:p-2 rounded-lg flex-shrink-0', colors.iconBg)}
        >
          <div className='text-sm sm:text-base'>{icon}</div>
        </div>
        <div className='flex-1 min-w-0'>
          <div className='text-xs text-gray-600 mb-0.5 truncate'>{title}</div>
          <div className='text-base sm:text-lg font-bold text-gray-900 mb-0.5 truncate'>
            {value}
          </div>
          {subtitle && (
            <div className={cn('text-xs font-medium truncate', colors.text)}>
              {subtitle}
            </div>
          )}
          {trend && (
            <div className='flex items-center mt-0.5'>
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? colors.trendPositive : colors.trendNegative
                )}
              >
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              {showTrendLabel && (
                <span className='text-xs text-gray-500 ml-1 truncate'>
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// List-style Card for Mobile
export interface ListCardProps {
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    value?: string | number;
    icon?: React.ReactNode;
    badge?: {
      text: string;
      color: 'red' | 'yellow' | 'green' | 'blue' | 'purple';
    };
    onClick?: () => void;
  }>;
  className?: string;
  maxItems?: number;
  showMore?: () => void;
}

const badgeColors = {
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800'
};

export function ListCard({
  items,
  className,
  maxItems = 3,
  showMore
}: ListCardProps) {
  const displayItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  return (
    <Card
      variant='mobile-compact'
      padding='none'
      className={className}
      mobileOptimized
    >
      <div className='divide-y divide-gray-100'>
        {displayItems.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              'p-2.5 sm:p-3 flex items-center justify-between min-h-[44px]',
              item.onClick &&
                'cursor-pointer hover:bg-gray-50 transition-colors'
            )}
            onClick={item.onClick}
          >
            <div className='flex items-center space-x-2 flex-1 min-w-0'>
              {item.icon && (
                <div className='text-sm flex-shrink-0 text-gray-600'>
                  {item.icon}
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <div className='text-sm font-medium text-gray-900 truncate'>
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className='text-xs text-gray-500 truncate'>
                    {item.subtitle}
                  </div>
                )}
              </div>
            </div>
            <div className='flex items-center space-x-2 flex-shrink-0'>
              {item.badge && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 text-xs font-medium rounded',
                    badgeColors[item.badge.color]
                  )}
                >
                  {item.badge.text}
                </span>
              )}
              {item.value && (
                <div className='text-sm font-semibold text-gray-900'>
                  {item.value}
                </div>
              )}
            </div>
          </div>
        ))}
        {hasMore && showMore && (
          <button
            onClick={showMore}
            className='w-full p-2.5 sm:p-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors text-center'
          >
            View {items.length - maxItems} more
          </button>
        )}
      </div>
    </Card>
  );
}
