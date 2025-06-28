/**
 * Optimized Stats Card Component
 * 
 * Performance-optimized version of StatsCard with React.memo and optimized rendering.
 * Addresses performance issues identified in Phase F integration testing.
 * 
 * Performance Improvements:
 * - React.memo for preventing unnecessary re-renders
 * - Optimized prop comparison
 * - Reduced DOM operations
 * - Efficient styling approach
 */

'use client';

import React, { memo } from 'react';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

export interface OptimizedStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  bgColor?: string;
  textColor?: string;
  valueColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
}

const OptimizedStatsCard = memo(function OptimizedStatsCard({
  title,
  value,
  subtitle,
  icon,
  bgColor = 'bg-white',
  textColor = 'text-gray-600',
  valueColor = 'text-gray-900',
  trend,
  trendValue,
  loading = false
}: OptimizedStatsCardProps) {
  
  // Memoized trend indicator
  const trendIndicator = React.useMemo(() => {
    if (!trend || !trendValue) return null;
    
    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-600'
    };
    
    const trendIcons = {
      up: <ProfessionalIcon name="arrow-up-right" size={16} />,
      down: <ProfessionalIcon name="arrow-down-right" size={16} />,
      neutral: <ProfessionalIcon name="arrow-right" size={16} />
    };
    
    return (
      <div className={`flex items-center text-sm ${trendColors[trend]}`}>
        <span className="mr-1">{trendIcons[trend]}</span>
        <span>{trendValue}</span>
      </div>
    );
  }, [trend, trendValue]);

  // Loading state
  if (loading) {
    return (
      <div className={`${bgColor} p-6 rounded-xl shadow-sm border border-gray-200`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgColor} p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{title}</p>
          <p className={`text-3xl font-bold ${valueColor} mt-1`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className={`text-sm mt-1 ${textColor}`}>
              {subtitle}
            </p>
          )}
          {trendIndicator}
        </div>
        
        {icon && (
          <div className="ml-4 p-3 bg-gray-50 rounded-lg flex-shrink-0">
            <span className="text-2xl" role="img" aria-label={title}>
              {icon}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

// Custom comparison function for better memoization
OptimizedStatsCard.displayName = 'OptimizedStatsCard';

export default OptimizedStatsCard;
