'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

/**
 * SSR-Safe Component Wrapper
 * 
 * This utility provides SSR-safe loading patterns for components that use
 * browser-specific APIs or cause SSR compatibility issues.
 * 
 * Design Consistency: Maintains the RK Institute design system with
 * consistent loading states and error handling.
 */

interface SSRSafeWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

/**
 * Default loading component that matches RK Institute design system
 */
const DefaultLoadingFallback = () => (
  <div className="card animate-fade-in">
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <LoadingSpinner size="lg" color="blue" />
        <p className="mt-4 text-gray-600 font-medium">Loading component...</p>
      </div>
    </div>
  </div>
);

/**
 * Default error component that matches RK Institute design system
 */
const DefaultErrorFallback = () => (
  <div className="card animate-fade-in">
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl text-red-600">⚠️</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Component Error</h3>
      <p className="text-gray-600 mb-4">This component failed to load properly.</p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary"
      >
        Reload Page
      </button>
    </div>
  </div>
);

/**
 * SSR-Safe wrapper component for client-side only components
 */
export function SSRSafeWrapper({ 
  children, 
  fallback = <DefaultLoadingFallback />,
  errorFallback = <DefaultErrorFallback />
}: SSRSafeWrapperProps) {
  // Only render on client-side
  if (typeof window === 'undefined') {
    return <>{fallback}</>;
  }

  try {
    return <>{children}</>;
  } catch (error) {
    console.error('SSR-Safe component error:', error);
    return <>{errorFallback}</>;
  }
}

/**
 * Higher-order component for making any component SSR-safe
 */
export function withSSRSafe<P extends object>(
  Component: ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    errorFallback?: ReactNode;
  }
) {
  const SSRSafeComponent = (props: P) => (
    <SSRSafeWrapper 
      fallback={options?.fallback}
      errorFallback={options?.errorFallback}
    >
      <Component {...props} />
    </SSRSafeWrapper>
  );

  SSRSafeComponent.displayName = `SSRSafe(${Component.displayName || Component.name})`;
  return SSRSafeComponent;
}

/**
 * Dynamic import with SSR-safe loading and consistent design
 */
export function createSSRSafeDynamic<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    fallback?: ReactNode;
    errorFallback?: ReactNode;
  }
) {
  return dynamic(importFn, {
    ssr: false,
    loading: () => <>{options?.fallback || <DefaultLoadingFallback />}</>,
  });
}

/**
 * Hook for safe browser API access
 */
export function useBrowserAPI() {
  const isBrowser = typeof window !== 'undefined';
  
  return {
    isBrowser,
    localStorage: isBrowser ? window.localStorage : null,
    sessionStorage: isBrowser ? window.sessionStorage : null,
    location: isBrowser ? window.location : null,
    navigator: isBrowser ? window.navigator : null,
    document: isBrowser ? window.document : null,
  };
}

/**
 * Safe localStorage access with SSR compatibility
 */
export function safeLocalStorage() {
  const isBrowser = typeof window !== 'undefined';
  const localStorage = isBrowser ? window.localStorage : null;

  return {
    getItem: (key: string): string | null => {
      try {
        return localStorage?.getItem(key) || null;
      } catch (error) {
        console.warn('localStorage.getItem failed:', error);
        return null;
      }
    },

    setItem: (key: string, value: string): boolean => {
      try {
        localStorage?.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('localStorage.setItem failed:', error);
        return false;
      }
    },

    removeItem: (key: string): boolean => {
      try {
        localStorage?.removeItem(key);
        return true;
      } catch (error) {
        console.warn('localStorage.removeItem failed:', error);
        return false;
      }
    },

    clear: (): boolean => {
      try {
        localStorage?.clear();
        return true;
      } catch (error) {
        console.warn('localStorage.clear failed:', error);
        return false;
      }
    },
  };
}

/**
 * Safe sessionStorage access with SSR compatibility
 */
export function safeSessionStorage() {
  const isBrowser = typeof window !== 'undefined';
  const sessionStorage = isBrowser ? window.sessionStorage : null;

  return {
    getItem: (key: string): string | null => {
      try {
        return sessionStorage?.getItem(key) || null;
      } catch (error) {
        console.warn('sessionStorage.getItem failed:', error);
        return null;
      }
    },

    setItem: (key: string, value: string): boolean => {
      try {
        sessionStorage?.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('sessionStorage.setItem failed:', error);
        return false;
      }
    },

    removeItem: (key: string): boolean => {
      try {
        sessionStorage?.removeItem(key);
        return true;
      } catch (error) {
        console.warn('sessionStorage.removeItem failed:', error);
        return false;
      }
    },

    clear: (): boolean => {
      try {
        sessionStorage?.clear();
        return true;
      } catch (error) {
        console.warn('sessionStorage.clear failed:', error);
        return false;
      }
    },
  };
}

/**
 * Example usage patterns for SSR-safe components
 */

// Example 1: Making an existing component SSR-safe
// const SSRSafeChart = withSSRSafe(ChartComponent);

// Example 2: Dynamic import with SSR-safe loading
// const SSRSafeChart = createSSRSafeDynamic(
//   () => import('./ChartComponent'),
//   { fallback: <div>Loading chart...</div> }
// );

// Example 3: Manual SSR-safe wrapper
// <SSRSafeWrapper fallback={<div>Loading...</div>}>
//   <BrowserOnlyComponent />
// </SSRSafeWrapper>

export default SSRSafeWrapper;
