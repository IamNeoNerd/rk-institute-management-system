/**
 * Feature Flag React Hooks Tests
 *
 * Tests for React hooks integration with the feature flag system.
 * Includes SSR safety, component rendering, and performance testing.
 *
 * @vitest-environment jsdom
 */

// Ensure DOM environment is ready before React imports
if (typeof window === 'undefined') {
  throw new Error('DOM environment not ready - window is undefined');
}

import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import '@testing-library/jest-dom';
import {
  useFeatureFlag,
  useFeatureFlags,
  useAllFeatureFlags,
  useEnabledFeatures,
  useFeatureFlagAnalytics,
  useFeatureFlagValidation,
  withFeatureFlag,
  FeatureGate,
  FeatureDisabled,
  useFeatureFlagDebug,
  isValidFeatureFlag,
  createFeatureDependentValue,
} from '@/hooks/shared/useFeatureFlag';
import { FeatureFlags } from '@/lib/config/FeatureFlags';

// Mock the feature flags module
vi.mock('@/lib/config/FeatureFlags', () => ({
  isFeatureEnabled: vi.fn(),
  getAllFeatureFlags: vi.fn(),
  getEnabledFeatures: vi.fn(),
  getFeatureFlagAnalytics: vi.fn(),
  validateFeatureFlags: vi.fn(),
}));

describe('Feature Flag React Hooks', () => {
  // Get the mocked module functions
  let mockFeatureFlags: any;
  // Mock console.log to prevent output pollution during tests
  const originalConsoleLog = console.log;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Mock console.log to suppress FeatureFlags output
    console.log = vi.fn();

    // Get the mocked module functions
    mockFeatureFlags = await import('@/lib/config/FeatureFlags');

    // Setup default mock implementations
    (mockFeatureFlags.isFeatureEnabled as any).mockImplementation((feature: string) => {
      const enabledFeatures = ['advancedReporting', 'caching', 'auditLogging'];
      return enabledFeatures.includes(feature);
    });
    
    (mockFeatureFlags.getAllFeatureFlags as any).mockReturnValue({
      realTimeCollaboration: false,
      advancedReporting: true,
      aiPersonalization: false,
      mobileOptimization: true,
      caching: true,
      auditLogging: true,
    });
    
    (mockFeatureFlags.getEnabledFeatures as any).mockReturnValue({
      advancedReporting: true,
      mobileOptimization: true,
      caching: true,
      auditLogging: true,
    });
    
    (mockFeatureFlags.getFeatureFlagAnalytics as any).mockReturnValue({
      totalFlags: 6,
      enabledFlags: 4,
      disabledFlags: 2,
      enabledPercentage: 67,
      flagsByCategory: {
        core: 2,
        security: 1,
        performance: 1,
        userExperience: 0,
        development: 0,
        integration: 0,
      },
    });
    
    (mockFeatureFlags.validateFeatureFlags as any).mockReturnValue({
      valid: true,
      errors: [],
    });
  });

  afterEach(() => {
    // Restore console.log after each test
    console.log = originalConsoleLog;
  });

  describe('useFeatureFlag Hook', () => {
    test('should return correct feature flag value', async () => {
      const { result } = renderHook(() => useFeatureFlag('advancedReporting'));

      // In Vitest, useEffect runs synchronously, so isClient is true immediately
      expect(result.current).toBe(true);

      expect(mockFeatureFlags.isFeatureEnabled).toHaveBeenCalledWith('advancedReporting');
    });

    test('should return false for disabled features', async () => {
      const { result } = renderHook(() => useFeatureFlag('realTimeCollaboration'));
      
      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    test('should handle SSR safely', () => {
      // Mock SSR environment
      const originalWindow = global.window;
      delete (global as any).window;
      
      const { result } = renderHook(() => useFeatureFlag('advancedReporting'));
      
      // Should return false during SSR
      expect(result.current).toBe(false);
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('useFeatureFlags Hook', () => {
    test('should return multiple feature flags', async () => {
      const features: (keyof FeatureFlags)[] = ['advancedReporting', 'realTimeCollaboration', 'caching'];
      const { result } = renderHook(() => useFeatureFlags(features));
      
      await waitFor(() => {
        expect(result.current).toEqual({
          advancedReporting: true,
          realTimeCollaboration: false,
          caching: true,
        });
      });
    });

    test('should handle empty feature array', async () => {
      const { result } = renderHook(() => useFeatureFlags([]));
      
      await waitFor(() => {
        expect(result.current).toEqual({});
      });
    });
  });

  describe('useAllFeatureFlags Hook', () => {
    test('should return all feature flags', async () => {
      const { result } = renderHook(() => useAllFeatureFlags());
      
      // Initially null during SSR
      expect(result.current).toBe(null);
      
      await waitFor(() => {
        expect(result.current).toEqual({
          realTimeCollaboration: false,
          advancedReporting: true,
          aiPersonalization: false,
          mobileOptimization: true,
          caching: true,
          auditLogging: true,
        });
      });
    });
  });

  describe('useEnabledFeatures Hook', () => {
    test('should return only enabled features', async () => {
      const { result } = renderHook(() => useEnabledFeatures());
      
      await waitFor(() => {
        expect(result.current).toEqual({
          advancedReporting: true,
          mobileOptimization: true,
          caching: true,
          auditLogging: true,
        });
      });
    });
  });

  describe('useFeatureFlagAnalytics Hook', () => {
    test('should return analytics data', async () => {
      const { result } = renderHook(() => useFeatureFlagAnalytics());
      
      await waitFor(() => {
        expect(result.current).toEqual({
          totalFlags: 6,
          enabledFlags: 4,
          disabledFlags: 2,
          enabledPercentage: 67,
          flagsByCategory: {
            core: 2,
            security: 1,
            performance: 1,
            userExperience: 0,
            development: 0,
            integration: 0,
          },
        });
      });
    });
  });

  describe('useFeatureFlagValidation Hook', () => {
    test('should return validation results', async () => {
      const { result } = renderHook(() => useFeatureFlagValidation());
      
      await waitFor(() => {
        expect(result.current).toEqual({
          valid: true,
          errors: [],
        });
      });
    });

    test('should handle validation errors', async () => {
      (mockFeatureFlags.validateFeatureFlags as any).mockReturnValue({
        valid: false,
        errors: ['Debug mode should not be enabled in production'],
      });
      
      const { result } = renderHook(() => useFeatureFlagValidation());
      
      await waitFor(() => {
        expect(result.current).toEqual({
          valid: false,
          errors: ['Debug mode should not be enabled in production'],
        });
      });
    });
  });

  describe('withFeatureFlag HOC', () => {
    const TestComponent = ({ message }: { message: string }) => (
      <div data-testid="test-component">{message}</div>
    );
    
    const FallbackComponent = () => (
      <div data-testid="fallback-component">Feature not available</div>
    );

    test('should render component when feature is enabled', async () => {
      const WrappedComponent = withFeatureFlag('advancedReporting', TestComponent);
      
      render(<WrappedComponent message="Feature enabled" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
        expect(screen.getByText('Feature enabled')).toBeInTheDocument();
      });
    });

    test('should not render component when feature is disabled', async () => {
      const WrappedComponent = withFeatureFlag('realTimeCollaboration', TestComponent);
      
      render(<WrappedComponent message="Feature enabled" />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });
    });

    test('should render fallback component when feature is disabled', async () => {
      const WrappedComponent = withFeatureFlag('realTimeCollaboration', TestComponent, FallbackComponent);
      
      render(<WrappedComponent message="Feature enabled" />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
        expect(screen.getByTestId('fallback-component')).toBeInTheDocument();
      });
    });
  });

  describe('FeatureGate Component', () => {
    test('should render children when feature is enabled', async () => {
      render(
        <FeatureGate feature="advancedReporting">
          <div data-testid="gated-content">Gated content</div>
        </FeatureGate>,
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('gated-content')).toBeInTheDocument();
      });
    });

    test('should not render children when feature is disabled', async () => {
      render(
        <FeatureGate feature="realTimeCollaboration">
          <div data-testid="gated-content">Gated content</div>
        </FeatureGate>,
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('gated-content')).not.toBeInTheDocument();
      });
    });

    test('should render fallback when feature is disabled', async () => {
      render(
        <FeatureGate 
          feature="realTimeCollaboration"
          fallback={<div data-testid="fallback">Feature not available</div>}
        >
          <div data-testid="gated-content">Gated content</div>
        </FeatureGate>,
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('gated-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('fallback')).toBeInTheDocument();
      });
    });
  });

  describe('FeatureDisabled Component', () => {
    test('should render children when feature is disabled', async () => {
      render(
        <FeatureDisabled feature="realTimeCollaboration">
          <div data-testid="disabled-content">Feature coming soon</div>
        </FeatureDisabled>,
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('disabled-content')).toBeInTheDocument();
      });
    });

    test('should not render children when feature is enabled', async () => {
      render(
        <FeatureDisabled feature="advancedReporting">
          <div data-testid="disabled-content">Feature coming soon</div>
        </FeatureDisabled>,
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('disabled-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('useFeatureFlagDebug Hook', () => {
    test('should provide debug functions', () => {
      const { result } = renderHook(() => useFeatureFlagDebug());
      
      expect(result.current).toHaveProperty('logAllFlags');
      expect(result.current).toHaveProperty('logEnabledFlags');
      expect(result.current).toHaveProperty('logAnalytics');
      expect(result.current).toHaveProperty('logValidation');
      
      expect(typeof result.current.logAllFlags).toBe('function');
      expect(typeof result.current.logEnabledFlags).toBe('function');
      expect(typeof result.current.logAnalytics).toBe('function');
      expect(typeof result.current.logValidation).toBe('function');
    });
  });

  describe('Utility Functions', () => {
    test('isValidFeatureFlag should validate feature names', () => {
      (mockFeatureFlags.getAllFeatureFlags as any).mockReturnValue({
        advancedReporting: true,
        realTimeCollaboration: false,
      });
      
      expect(isValidFeatureFlag('advancedReporting')).toBe(true);
      expect(isValidFeatureFlag('realTimeCollaboration')).toBe(true);
      expect(isValidFeatureFlag('invalidFeature')).toBe(false);
    });

    test('createFeatureDependentValue should return correct values', () => {
      const enabledValue = createFeatureDependentValue('advancedReporting', 'enabled', 'disabled');
      const disabledValue = createFeatureDependentValue('realTimeCollaboration', 'enabled', 'disabled');
      
      expect(enabledValue).toBe('enabled');
      expect(disabledValue).toBe('disabled');
    });
  });

  describe('Performance and Memory', () => {
    test('should not cause memory leaks with multiple renders', async () => {
      const { rerender } = renderHook(() => useFeatureFlag('advancedReporting'));
      
      // Rerender multiple times
      for (let i = 0; i < 100; i++) {
        rerender();
      }
      
      // Should not throw or cause issues
      await waitFor(() => {
        expect(mockFeatureFlags.isFeatureEnabled).toHaveBeenCalled();
      });
    });

    test('should memoize results correctly', async () => {
      const { result, rerender } = renderHook(() => useFeatureFlag('advancedReporting'));
      
      await waitFor(() => {
        expect(result.current).toBe(true);
      });
      
      const firstResult = result.current;
      
      // Rerender should return same reference
      rerender();
      
      await waitFor(() => {
        expect(result.current).toBe(firstResult);
      });
    });
  });
});
