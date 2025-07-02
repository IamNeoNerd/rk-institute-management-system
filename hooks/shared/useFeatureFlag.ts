/**
 * Feature Flag React Hooks
 *
 * Provides React integration for the feature flag system with SSR-safe implementation.
 * Enables conditional rendering and feature gating at the component level.
 *
 * Design Features:
 * - SSR-safe implementation with proper hydration
 * - Type-safe feature flag access
 * - Performance optimized with memoization
 * - Development tools integration
 * - Conditional rendering helpers
 * - Feature flag analytics tracking
 *
 * Usage Examples:
 * - Basic: const isEnabled = useFeatureFlag('realTimeCollaboration');
 * - Multiple: const flags = useFeatureFlags(['caching', 'darkMode']);
 * - Component: const Component = withFeatureFlag('mobileOptimization', MyComponent);
 * - Analytics: const analytics = useFeatureFlagAnalytics();
 */

'use client';

import React, { useCallback, useMemo, useEffect, useState } from 'react';

import {
  isFeatureEnabled,
  getAllFeatureFlags,
  getEnabledFeatures,
  getFeatureFlagAnalytics,
  validateFeatureFlags,
  FeatureFlags,
  FeatureFlagAnalytics
} from '@/lib/config/FeatureFlags';

/**
 * Hook to check if a single feature flag is enabled
 * Memoized for performance and SSR-safe
 */
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side for hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isEnabled = useMemo(() => {
    if (!isClient) {
      // Return false during SSR to prevent hydration mismatches
      return false;
    }
    return isFeatureEnabled(feature);
  }, [feature, isClient]);

  // Development mode logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isClient) {
      console.debug(
        `🚩 Feature flag '${feature}': ${isEnabled ? 'enabled' : 'disabled'}`
      );
    }
  }, [feature, isEnabled, isClient]);

  return isEnabled;
}

/**
 * Hook to check multiple feature flags at once
 * Returns an object with feature names as keys and boolean values
 */
export function useFeatureFlags(
  features: (keyof FeatureFlags)[]
): Record<string, boolean> {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const flags = useMemo(() => {
    if (!isClient) {
      // Return all false during SSR
      return features.reduce(
        (acc, feature) => {
          acc[feature] = false;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }

    return features.reduce(
      (acc, feature) => {
        acc[feature] = isFeatureEnabled(feature);
        return acc;
      },
      {} as Record<string, boolean>
    );
  }, [features, isClient]);

  return flags;
}

/**
 * Hook to get all feature flags
 * Useful for admin interfaces and debugging
 */
export function useAllFeatureFlags(): FeatureFlags | null {
  const [isClient, setIsClient] = useState(false);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setFlags(getAllFeatureFlags());
    }
  }, []);

  return isClient ? flags : null;
}

/**
 * Hook to get only enabled feature flags
 * Useful for analytics and feature usage tracking
 */
export function useEnabledFeatures(): Partial<FeatureFlags> {
  const [isClient, setIsClient] = useState(false);
  const [enabledFeatures, setEnabledFeatures] = useState<Partial<FeatureFlags>>(
    {}
  );

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setEnabledFeatures(getEnabledFeatures());
    }
  }, []);

  return isClient ? enabledFeatures : {};
}

/**
 * Hook for feature flag analytics
 * Provides insights into feature flag usage
 */
export function useFeatureFlagAnalytics(): FeatureFlagAnalytics | null {
  const [isClient, setIsClient] = useState(false);
  const [analytics, setAnalytics] = useState<FeatureFlagAnalytics | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setAnalytics(getFeatureFlagAnalytics());
    }
  }, []);

  return isClient ? analytics : null;
}

/**
 * Hook for feature flag validation
 * Checks for configuration errors and warnings
 */
export function useFeatureFlagValidation(): {
  valid: boolean;
  errors: string[];
} | null {
  const [isClient, setIsClient] = useState(false);
  const [validation, setValidation] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setValidation(validateFeatureFlags());
    }
  }, []);

  return isClient ? validation : null;
}

/**
 * Higher-order component for feature flag gating
 * Conditionally renders components based on feature flags
 */
export function withFeatureFlag<T extends object>(
  feature: keyof FeatureFlags,
  WrappedComponent: React.ComponentType<T>,
  FallbackComponent?: React.ComponentType<T> | null
): React.ComponentType<T> {
  const FeatureGatedComponent = (props: T) => {
    const isEnabled = useFeatureFlag(feature);

    if (!isEnabled) {
      if (FallbackComponent) {
        return React.createElement(FallbackComponent, props);
      }
      return null;
    }

    return React.createElement(WrappedComponent, props);
  };

  // Set display name for debugging
  FeatureGatedComponent.displayName = `withFeatureFlag(${feature})(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return FeatureGatedComponent;
}

/**
 * Component for conditional rendering based on feature flags
 * Alternative to withFeatureFlag for inline usage
 */
interface FeatureGateProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({
  feature,
  children,
  fallback = null
}: FeatureGateProps): React.ReactElement | null {
  const isEnabled = useFeatureFlag(feature);

  if (!isEnabled) {
    return fallback as React.ReactElement | null;
  }

  return children as React.ReactElement;
}

/**
 * Component for rendering content when feature is disabled
 * Useful for showing alternative content or migration notices
 */
interface FeatureDisabledProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
}

export function FeatureDisabled({
  feature,
  children
}: FeatureDisabledProps): React.ReactElement | null {
  const isEnabled = useFeatureFlag(feature);

  if (isEnabled) {
    return null;
  }

  return children as React.ReactElement;
}

/**
 * Hook for feature flag debugging
 * Provides development tools for feature flag management
 */
export function useFeatureFlagDebug(): {
  logAllFlags: () => void;
  logEnabledFlags: () => void;
  logAnalytics: () => void;
  logValidation: () => void;
} {
  const allFlags = useAllFeatureFlags();
  const enabledFeatures = useEnabledFeatures();
  const analytics = useFeatureFlagAnalytics();
  const validation = useFeatureFlagValidation();

  const logAllFlags = useCallback(() => {
    if (process.env.NODE_ENV === 'development' && allFlags) {
      console.group('🚩 All Feature Flags');
      Object.entries(allFlags).forEach(([flag, enabled]) => {
        console.log(`${enabled ? '✅' : '❌'} ${flag}: ${enabled}`);
      });
      console.groupEnd();
    }
  }, [allFlags]);

  const logEnabledFlags = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Enabled Features');
      Object.keys(enabledFeatures).forEach(flag => {
        console.log(`✅ ${flag}`);
      });
      console.groupEnd();
    }
  }, [enabledFeatures]);

  const logAnalytics = useCallback(() => {
    if (process.env.NODE_ENV === 'development' && analytics) {
      console.group('📊 Feature Flag Analytics');
      console.log(`Total flags: ${analytics.totalFlags}`);
      console.log(
        `Enabled: ${analytics.enabledFlags} (${analytics.enabledPercentage}%)`
      );
      console.log(`Disabled: ${analytics.disabledFlags}`);
      console.log('By category:', analytics.flagsByCategory);
      console.groupEnd();
    }
  }, [analytics]);

  const logValidation = useCallback(() => {
    if (process.env.NODE_ENV === 'development' && validation) {
      if (validation.valid) {
        console.log('✅ Feature flag configuration is valid');
      } else {
        console.group('⚠️ Feature Flag Validation Errors');
        validation.errors.forEach(error => console.warn(error));
        console.groupEnd();
      }
    }
  }, [validation]);

  return {
    logAllFlags,
    logEnabledFlags,
    logAnalytics,
    logValidation
  };
}

/**
 * Custom hook for feature flag performance monitoring
 * Tracks feature flag usage for optimization
 */
export function useFeatureFlagPerformance(): {
  trackFeatureUsage: (feature: keyof FeatureFlags) => void;
  getUsageStats: () => Record<string, number>;
} {
  const [usageStats, setUsageStats] = useState<Record<string, number>>({});

  const trackFeatureUsage = useCallback((feature: keyof FeatureFlags) => {
    setUsageStats(prev => ({
      ...prev,
      [feature]: (prev[feature] || 0) + 1
    }));
  }, []);

  const getUsageStats = useCallback(() => {
    return { ...usageStats };
  }, [usageStats]);

  // Log usage stats in development
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      Object.keys(usageStats).length > 0
    ) {
      console.debug('📈 Feature flag usage stats:', usageStats);
    }
  }, [usageStats]);

  return {
    trackFeatureUsage,
    getUsageStats
  };
}

/**
 * Type guard for feature flag keys
 * Ensures type safety when working with dynamic feature names
 */
export function isValidFeatureFlag(
  feature: string
): feature is keyof FeatureFlags {
  const allFlags = getAllFeatureFlags();
  return feature in allFlags;
}

/**
 * Utility function to create feature flag dependent values
 * Useful for configuration objects that depend on feature flags
 */
export function createFeatureDependentValue<T>(
  feature: keyof FeatureFlags,
  enabledValue: T,
  disabledValue: T
): T {
  return isFeatureEnabled(feature) ? enabledValue : disabledValue;
}

// Development mode utilities
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Add global debugging functions
  (window as any).__featureFlags = {
    getAll: getAllFeatureFlags,
    getEnabled: getEnabledFeatures,
    getAnalytics: getFeatureFlagAnalytics,
    validate: validateFeatureFlags,
    isEnabled: isFeatureEnabled
  };

  console.log(
    '🚩 Feature flag debugging tools available at window.__featureFlags'
  );
}
