/**
 * Feature Flags System Tests
 * 
 * Comprehensive test suite for the feature flags configuration system.
 * Tests environment variable parsing, validation, analytics, and edge cases.
 */

import { vi } from 'vitest';

import {
  isFeatureEnabled,
  getAllFeatureFlags,
  getEnabledFeatures,
  getFeatureFlagAnalytics,
  validateFeatureFlags,
  FeatureFlags,
} from '@/lib/config/FeatureFlags';

// Type assertions for dynamic imports in tests
const typedIsFeatureEnabled = isFeatureEnabled as any;
const typedGetAllFeatureFlags = getAllFeatureFlags as any;
const typedGetFeatureFlagAnalytics = getFeatureFlagAnalytics as any;

// Mock environment variables for testing
const originalEnv = process.env;

describe('Feature Flags System', () => {
  // Mock console.log to prevent output pollution during tests
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // Mock console.log to suppress FeatureFlags output
    console.log = vi.fn();

    // Reset environment variables before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore console.log after each test
    console.log = originalConsoleLog;
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Environment Variable Parsing', () => {
    test('should parse true values correctly', async () => {
      process.env.FEATURE_REALTIME = 'true';
      process.env.FEATURE_REPORTING = '1';
      process.env.FEATURE_AI = 'yes';
      process.env.FEATURE_MOBILE = 'on';
      process.env.FEATURE_2FA = 'enabled';

      // Re-import to get fresh configuration
      vi.resetModules();
      const { isFeatureEnabled  } = await vi.importActual('@/lib/config/FeatureFlags') as any;

      expect((isFeatureEnabled as any)('realTimeCollaboration')).toBe(true);
      expect((isFeatureEnabled as any)('advancedReporting')).toBe(true);
      expect((isFeatureEnabled as any)('aiPersonalization')).toBe(true);
      expect((isFeatureEnabled as any)('mobileOptimization')).toBe(true);
      expect((isFeatureEnabled as any)('twoFactorAuth')).toBe(true);
    });

    test('should parse false values correctly', async () => {
      process.env.FEATURE_REALTIME = 'false';
      process.env.FEATURE_REPORTING = '0';
      process.env.FEATURE_AI = 'no';
      process.env.FEATURE_MOBILE = 'off';
      process.env.FEATURE_2FA = 'disabled';

      vi.resetModules();
      const { isFeatureEnabled } = await import('@/lib/config/FeatureFlags?t=' + Date.now());

      expect(isFeatureEnabled('realTimeCollaboration')).toBe(false);
      expect(isFeatureEnabled('advancedReporting')).toBe(false);
      expect(isFeatureEnabled('aiPersonalization')).toBe(false);
      expect(isFeatureEnabled('mobileOptimization')).toBe(false);
      expect(isFeatureEnabled('twoFactorAuth')).toBe(false);
    });

    test('should handle case insensitive values', async () => {
      process.env.FEATURE_REALTIME = 'TRUE';
      process.env.FEATURE_REPORTING = 'False';
      process.env.FEATURE_AI = 'YES';
      process.env.FEATURE_MOBILE = 'No';

      vi.resetModules();
      const { isFeatureEnabled } = await import('@/lib/config/FeatureFlags?t=' + Date.now());

      expect(isFeatureEnabled('realTimeCollaboration')).toBe(true);
      expect(isFeatureEnabled('advancedReporting')).toBe(false);
      expect(isFeatureEnabled('aiPersonalization')).toBe(true);
      expect(isFeatureEnabled('mobileOptimization')).toBe(false);
    });

    test('should use default values for undefined environment variables', async () => {
      // Don't set any environment variables
      vi.resetModules();
      const { isFeatureEnabled  } = await vi.importActual('@/lib/config/FeatureFlags');

      // These should use default values
      expect((isFeatureEnabled as any)('realTimeCollaboration')).toBe(false); // default false
      expect((isFeatureEnabled as any)('advancedReporting')).toBe(true); // default true
      expect((isFeatureEnabled as any)('auditLogging')).toBe(true); // default true
      expect((isFeatureEnabled as any)('caching')).toBe(true); // default true
    });

    test('should handle invalid environment variable values', async () => {
      process.env.FEATURE_REALTIME = 'invalid';
      process.env.FEATURE_REPORTING = 'maybe';
      process.env.FEATURE_AI = '2';

      vi.resetModules();
      const { isFeatureEnabled } = await import('@/lib/config/FeatureFlags?t=' + Date.now());

      // Should fall back to default values for invalid inputs
      expect(isFeatureEnabled('realTimeCollaboration')).toBe(false); // default false
      expect(isFeatureEnabled('advancedReporting')).toBe(true); // default true
      expect(isFeatureEnabled('aiPersonalization')).toBe(false); // default false
    });
  });

  describe('Feature Flag Functions', () => {
    test('isFeatureEnabled should return correct boolean values', () => {
      expect(typeof typedIsFeatureEnabled('realTimeCollaboration')).toBe('boolean');
      expect(typeof typedIsFeatureEnabled('advancedReporting')).toBe('boolean');
      expect(typeof typedIsFeatureEnabled('auditLogging')).toBe('boolean');
    });

    test('getAllFeatureFlags should return complete FeatureFlags object', () => {
      const allFlags = getAllFeatureFlags();
      
      expect(allFlags).toHaveProperty('realTimeCollaboration');
      expect(allFlags).toHaveProperty('advancedReporting');
      expect(allFlags).toHaveProperty('aiPersonalization');
      expect(allFlags).toHaveProperty('mobileOptimization');
      expect(allFlags).toHaveProperty('twoFactorAuth');
      expect(allFlags).toHaveProperty('auditLogging');
      expect(allFlags).toHaveProperty('rateLimiting');
      expect(allFlags).toHaveProperty('caching');
      expect(allFlags).toHaveProperty('lazyLoading');
      expect(allFlags).toHaveProperty('darkMode');
      expect(allFlags).toHaveProperty('betaFeatures');
      expect(allFlags).toHaveProperty('debugMode');
      expect(allFlags).toHaveProperty('emailNotifications');
      
      // Check that all values are booleans
      Object.values(allFlags).forEach(value => {
        expect(typeof value).toBe('boolean');
      });
    });

    test('getEnabledFeatures should return only enabled features', async () => {
      process.env.FEATURE_REALTIME = 'true';
      process.env.FEATURE_AI = 'false';
      process.env.FEATURE_CACHE = 'true';

      vi.resetModules();
      const { getEnabledFeatures } = await import('@/lib/config/FeatureFlags?t=' + Date.now());
      
      const enabledFeatures = getEnabledFeatures();
      
      // Should include enabled features
      expect(enabledFeatures).toHaveProperty('realTimeCollaboration', true);
      expect(enabledFeatures).toHaveProperty('caching', true);
      
      // Should not include disabled features
      expect(enabledFeatures).not.toHaveProperty('aiPersonalization');
      
      // All values should be true
      Object.values(enabledFeatures).forEach(value => {
        expect(value).toBe(true);
      });
    });
  });

  describe('Feature Flag Analytics', () => {
    test('getFeatureFlagAnalytics should return correct analytics data', () => {
      const analytics = getFeatureFlagAnalytics();
      
      expect(analytics).toHaveProperty('totalFlags');
      expect(analytics).toHaveProperty('enabledFlags');
      expect(analytics).toHaveProperty('disabledFlags');
      expect(analytics).toHaveProperty('enabledPercentage');
      expect(analytics).toHaveProperty('flagsByCategory');
      
      expect(typeof analytics.totalFlags).toBe('number');
      expect(typeof analytics.enabledFlags).toBe('number');
      expect(typeof analytics.disabledFlags).toBe('number');
      expect(typeof analytics.enabledPercentage).toBe('number');
      
      expect(analytics.totalFlags).toBeGreaterThan(0);
      expect(analytics.enabledFlags + analytics.disabledFlags).toBe(analytics.totalFlags);
      expect(analytics.enabledPercentage).toBeGreaterThanOrEqual(0);
      expect(analytics.enabledPercentage).toBeLessThanOrEqual(100);
      
      // Check category structure
      expect(analytics.flagsByCategory).toHaveProperty('core');
      expect(analytics.flagsByCategory).toHaveProperty('security');
      expect(analytics.flagsByCategory).toHaveProperty('performance');
      expect(analytics.flagsByCategory).toHaveProperty('userExperience');
      expect(analytics.flagsByCategory).toHaveProperty('development');
      expect(analytics.flagsByCategory).toHaveProperty('integration');
    });

    test('analytics should update when flags change', async () => {
      // First measurement with default values
      const analytics1 = getFeatureFlagAnalytics();
      
      // Enable more features
      process.env.FEATURE_REALTIME = 'true';
      process.env.FEATURE_AI = 'true';
      process.env.FEATURE_2FA = 'true';
      
      vi.resetModules();
      const { getFeatureFlagAnalytics: getAnalytics2 } = await import('@/lib/config/FeatureFlags?t=' + Date.now());
      const analytics2 = getAnalytics2();
      
      // Should have more enabled flags
      expect(analytics2.enabledFlags).toBeGreaterThan(analytics1.enabledFlags);
      expect(analytics2.enabledPercentage).toBeGreaterThan(analytics1.enabledPercentage);
    });
  });

  describe('Feature Flag Validation', () => {
    test('should validate production environment constraints', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      process.env.FEATURE_DEBUG = 'true';
      process.env.FEATURE_BETA = 'true';
      
      vi.resetModules();
      const { validateFeatureFlags } = await import('@/lib/config/FeatureFlags?t=' + Date.now());
      
      const validation = validateFeatureFlags();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Debug mode should not be enabled in production');
      expect(validation.errors).toContain('Beta features should not be enabled in production');
    });

    test('should validate feature dependencies', async () => {
      process.env.FEATURE_REALTIME = 'true';
      process.env.FEATURE_CACHE = 'false';
      process.env.FEATURE_PUSH = 'true';
      process.env.FEATURE_EMAIL = 'false';
      
      vi.resetModules();
      const { validateFeatureFlags } = await import('@/lib/config/FeatureFlags?t=' + Date.now());
      
      const validation = validateFeatureFlags();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Real-time collaboration requires caching to be enabled');
      expect(validation.errors).toContain('Push notifications typically require email notifications as fallback');
    });

    test('should pass validation with correct configuration', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      process.env.FEATURE_REALTIME = 'true';
      process.env.FEATURE_CACHE = 'true';
      process.env.FEATURE_PUSH = 'true';
      process.env.FEATURE_EMAIL = 'true';
      
      vi.resetModules();
      const { validateFeatureFlags } = await import('@/lib/config/FeatureFlags?t=' + Date.now());
      
      const validation = validateFeatureFlags();
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Development Mode Features', () => {
    test('should enable debug mode automatically in development', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      // Don't set FEATURE_DEBUG explicitly
      
      vi.resetModules();
      const { isFeatureEnabled  } = await vi.importActual('@/lib/config/FeatureFlags');
      
      expect((isFeatureEnabled as any)('debugMode')).toBe(true);
    });

    test('should respect explicit debug mode setting', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      process.env.FEATURE_DEBUG = 'false';
      
      vi.resetModules();
      const { isFeatureEnabled } = await import('@/lib/config/FeatureFlags?t=' + Date.now());
      
      expect(isFeatureEnabled('debugMode')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string environment variables', async () => {
      process.env.FEATURE_REALTIME = '';
      process.env.FEATURE_REPORTING = '   ';
      
      vi.resetModules();
      const { isFeatureEnabled } = await import('@/lib/config/FeatureFlags?t=' + Date.now());
      
      // Should use default values
      expect(isFeatureEnabled('realTimeCollaboration')).toBe(false); // default
      expect(isFeatureEnabled('advancedReporting')).toBe(true); // default
    });

    test('should handle whitespace in environment variables', async () => {
      process.env.FEATURE_REALTIME = '  true  ';
      process.env.FEATURE_REPORTING = '\tfalse\n';
      
      vi.resetModules();
      const { isFeatureEnabled } = await import('@/lib/config/FeatureFlags?t=' + Date.now());
      
      expect(isFeatureEnabled('realTimeCollaboration')).toBe(true);
      expect(isFeatureEnabled('advancedReporting')).toBe(false);
    });

    test('should handle all feature flag keys', () => {
      const allFlags = getAllFeatureFlags();
      
      // Test that all keys can be checked
      Object.keys(allFlags).forEach(key => {
        expect(() => {
          isFeatureEnabled(key as keyof FeatureFlags);
        }).not.toThrow();
      });
    });
  });
});
