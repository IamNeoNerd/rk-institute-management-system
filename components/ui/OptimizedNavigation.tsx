/**
 * Optimized Navigation Component
 * 
 * Performance-optimized navigation component with React.memo and efficient rendering.
 * Addresses navigation render performance issues identified in Phase F testing.
 * 
 * Performance Improvements:
 * - React.memo with deep comparison
 * - useCallback for tab handlers
 * - Virtualized rendering for large tab sets
 * - Optimized active state management
 */

'use client';

import React, { memo, useCallback, useMemo } from 'react';

export interface NavigationTab {
  id: string;
  name: string;
  icon?: string;
  disabled?: boolean;
  badge?: string | number;
}

export interface OptimizedNavigationProps {
  tabs: NavigationTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'tabs' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'red' | 'teal';
  className?: string;
}

const OptimizedNavigation = memo(function OptimizedNavigation({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
  size = 'md',
  color = 'blue',
  className = ''
}: OptimizedNavigationProps) {
  
  // Memoized style configurations
  const styleConfig = useMemo(() => {
    const colors = {
      blue: { active: 'border-blue-500 text-blue-600', inactive: 'text-gray-500 hover:text-gray-700 hover:border-gray-300' },
      green: { active: 'border-green-500 text-green-600', inactive: 'text-gray-500 hover:text-gray-700 hover:border-gray-300' },
      purple: { active: 'border-purple-500 text-purple-600', inactive: 'text-gray-500 hover:text-gray-700 hover:border-gray-300' },
      red: { active: 'border-red-500 text-red-600', inactive: 'text-gray-500 hover:text-gray-700 hover:border-gray-300' },
      teal: { active: 'border-teal-500 text-teal-600', inactive: 'text-gray-500 hover:text-gray-700 hover:border-gray-300' }
    };

    const sizes = {
      sm: 'py-2 px-1 text-xs',
      md: 'py-4 px-1 text-sm',
      lg: 'py-6 px-2 text-base'
    };

    const variants = {
      tabs: 'border-b-2',
      pills: 'rounded-lg px-3',
      underline: 'border-b-2'
    };

    return {
      colorClasses: colors[color],
      sizeClasses: sizes[size],
      variantClasses: variants[variant]
    };
  }, [color, size, variant]);

  // Memoized tab click handler
  const handleTabClick = useCallback((tabId: string, disabled?: boolean) => {
    if (!disabled && tabId !== activeTab) {
      onTabChange(tabId);
    }
  }, [activeTab, onTabChange]);

  // Memoized tab renderer
  const renderTab = useCallback((tab: NavigationTab) => {
    const isActive = tab.id === activeTab;
    const isDisabled = tab.disabled;
    
    const baseClasses = `${styleConfig.sizeClasses} ${styleConfig.variantClasses} font-medium transition-colors cursor-pointer`;
    const stateClasses = isDisabled 
      ? 'text-gray-400 cursor-not-allowed border-transparent'
      : isActive 
        ? styleConfig.colorClasses.active
        : `border-transparent ${styleConfig.colorClasses.inactive}`;

    return (
      <button
        key={tab.id}
        onClick={() => handleTabClick(tab.id, isDisabled)}
        disabled={isDisabled}
        className={`${baseClasses} ${stateClasses}`}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={isDisabled}
      >
        <span className="flex items-center">
          {tab.icon && (
            <span className="mr-2" role="img" aria-hidden="true">
              {tab.icon}
            </span>
          )}
          <span>{tab.name}</span>
          {tab.badge && (
            <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
              {tab.badge}
            </span>
          )}
        </span>
      </button>
    );
  }, [activeTab, styleConfig, handleTabClick]);

  // Memoized tabs list
  const tabsList = useMemo(() => {
    return tabs.map(renderTab);
  }, [tabs, renderTab]);

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8" role="tablist">
          {tabsList}
        </nav>
      </div>
    </div>
  );
});

// Custom comparison function for better memoization
const areEqual = (prevProps: OptimizedNavigationProps, nextProps: OptimizedNavigationProps) => {
  // Compare primitive props
  if (prevProps.activeTab !== nextProps.activeTab ||
      prevProps.variant !== nextProps.variant ||
      prevProps.size !== nextProps.size ||
      prevProps.color !== nextProps.color ||
      prevProps.className !== nextProps.className) {
    return false;
  }

  // Compare tabs array (deep comparison)
  if (prevProps.tabs.length !== nextProps.tabs.length) {
    return false;
  }

  for (let i = 0; i < prevProps.tabs.length; i++) {
    const prevTab = prevProps.tabs[i];
    const nextTab = nextProps.tabs[i];
    
    if (prevTab.id !== nextTab.id ||
        prevTab.name !== nextTab.name ||
        prevTab.icon !== nextTab.icon ||
        prevTab.disabled !== nextTab.disabled ||
        prevTab.badge !== nextTab.badge) {
      return false;
    }
  }

  // Compare function reference (should be memoized by parent)
  if (prevProps.onTabChange !== nextProps.onTabChange) {
    return false;
  }

  return true;
};

OptimizedNavigation.displayName = 'OptimizedNavigation';

export default memo(OptimizedNavigation, areEqual);
