/**
 * Optimized Header Component
 * 
 * Performance-optimized header component with React.memo and callback optimization.
 * Addresses header render performance issues identified in Phase F testing.
 * 
 * Performance Improvements:
 * - React.memo with custom comparison
 * - useCallback for event handlers
 * - Reduced re-render cycles
 * - Optimized DOM structure
 */

'use client';

import React, { memo, useCallback } from 'react';

export interface OptimizedHeaderProps {
  title?: string;
  subtitle?: string;
  userInfo?: {
    name: string;
    role?: string;
    avatar?: string;
  };
  onLogout?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const OptimizedHeader = memo(function OptimizedHeader({
  title = 'RK Institute',
  subtitle,
  userInfo,
  onLogout,
  actions,
  className = ''
}: OptimizedHeaderProps) {
  
  // Memoized logout handler
  const handleLogout = useCallback(() => {
    if (onLogout) {
      onLogout();
    }
  }, [onLogout]);

  // Memoized user section
  const userSection = React.useMemo(() => {
    if (!userInfo) return null;

    return (
      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="text-right">
          <p className="text-sm text-gray-600">
            {userInfo.role ? `Welcome, ${userInfo.role}` : 'Welcome'}
          </p>
          <p className="font-semibold text-gray-900">{userInfo.name}</p>
        </div>

        {/* Avatar */}
        {userInfo.avatar && (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <img 
              src={userInfo.avatar} 
              alt={`${userInfo.name} avatar`}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        )}

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Logout"
          >
            Logout
          </button>
        )}
      </div>
    );
  }, [userInfo, handleLogout, onLogout]);

  // Memoized branding section
  const brandingSection = React.useMemo(() => (
    <div className="flex items-center">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && (
        <span className="ml-4 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium rounded-full">
          {subtitle}
        </span>
      )}
    </div>
  ), [title, subtitle]);

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Branding */}
          {brandingSection}

          {/* Right Side - Actions and User */}
          <div className="flex items-center space-x-4">
            {actions}
            {userSection}
          </div>
        </div>
      </div>
    </header>
  );
});

// Custom comparison function for better memoization
const areEqual = (prevProps: OptimizedHeaderProps, nextProps: OptimizedHeaderProps) => {
  // Compare primitive props
  if (prevProps.title !== nextProps.title || 
      prevProps.subtitle !== nextProps.subtitle ||
      prevProps.className !== nextProps.className) {
    return false;
  }

  // Compare userInfo object
  if (prevProps.userInfo !== nextProps.userInfo) {
    if (!prevProps.userInfo || !nextProps.userInfo) return false;
    if (prevProps.userInfo.name !== nextProps.userInfo.name ||
        prevProps.userInfo.role !== nextProps.userInfo.role ||
        prevProps.userInfo.avatar !== nextProps.userInfo.avatar) {
      return false;
    }
  }

  // Compare function references (they should be memoized by parent)
  if (prevProps.onLogout !== nextProps.onLogout) {
    return false;
  }

  return true;
};

OptimizedHeader.displayName = 'OptimizedHeader';

export default memo(OptimizedHeader, areEqual);
