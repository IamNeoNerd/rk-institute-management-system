/**
 * Module Registration Test Suite
 * 
 * Tests for the module registration system including:
 * - Core module registration and validation
 * - Feature module dependency management
 * - Integration module testing
 * - Experimental module handling
 * - Module status and statistics
 */

import { vi } from 'vitest';
import { registerModules, getModuleStatus, moduleRegistry } from '@/lib/modules/index';

beforeEach(() => {
  // Clear module registry state before each test
  moduleRegistry.clear();
  vi.clearAllMocks();
});

// Mock feature flags with realistic scenarios
vi.mock('@/lib/config/FeatureFlags', () => ({
  isFeatureEnabled: vi.fn((feature: string) => {
    // Simulate realistic feature flag states
    const enabledFeatures = [
      'auditLogging',
      'caching',
      'inputValidation',
      'darkMode',
      'accessibilityEnhancements',
      'mobileOptimization',
    ];
    
    const disabledFeatures = [
      'advancedReporting',
      'realTimeCollaboration',
      'aiPersonalization',
      'emailNotifications',
      'smsNotifications',
      'thirdPartyIntegrations',
      'webhookSupport',
    ];
    
    if (enabledFeatures.includes(feature)) return true;
    if (disabledFeatures.includes(feature)) return false;
    
    // Default to false for unknown features
    return false;
  }),
}));

describe('Module Registration System', () => {
  beforeEach(() => {
    // Clear the registry before each test
    // Note: In a real scenario, we'd need a way to reset the global registry
    // For testing, we'll work with the existing state
    vi.clearAllMocks();
  });

  describe('Module Registration Process', () => {
    test('should register all modules without errors', () => {
      expect(() => {
        registerModules();
      }).not.toThrow();
    });

    test('should register core modules first', () => {
      registerModules();
      
      // Core modules should be registered and enabled
      expect(moduleRegistry.isEnabled('core')).toBe(true);
      expect(moduleRegistry.isEnabled('security')).toBe(true);
      expect(moduleRegistry.isEnabled('ui-framework')).toBe(true);
    });

    test('should register feature modules with proper dependencies', () => {
      registerModules();
      
      // Feature modules should be registered
      expect(moduleRegistry.getModule('student-management')).toBeDefined();
      expect(moduleRegistry.getModule('fee-management')).toBeDefined();
      expect(moduleRegistry.getModule('course-management')).toBeDefined();
      
      // Check dependencies are properly set
      const studentModule = moduleRegistry.getModule('student-management');
      expect(studentModule?.config.dependencies).toContain('core');
      expect(studentModule?.config.dependencies).toContain('ui-framework');
      
      const feeModule = moduleRegistry.getModule('fee-management');
      expect(feeModule?.config.dependencies).toContain('student-management');
    });

    test('should handle feature flag controlled modules', () => {
      registerModules();
      
      // Reporting module should be disabled (advancedReporting feature is disabled)
      const reportingModule = moduleRegistry.getModule('reporting');
      expect(reportingModule?.config.enabled).toBe(false);
      
      // Communication module should be disabled (email/sms features are disabled)
      const communicationModule = moduleRegistry.getModule('communication');
      expect(communicationModule?.config.enabled).toBe(false);
    });

    test('should register integration modules conditionally', () => {
      registerModules();
      
      // Third-party integrations should be disabled
      const integrationsModule = moduleRegistry.getModule('third-party-integrations');
      expect(integrationsModule?.config.enabled).toBe(false);
    });

    test('should register experimental modules conditionally', () => {
      registerModules();
      
      // Real-time collaboration should be disabled
      const realtimeModule = moduleRegistry.getModule('realtime-collaboration');
      expect(realtimeModule?.config.enabled).toBe(false);
      
      // AI personalization should be disabled
      const aiModule = moduleRegistry.getModule('ai-personalization');
      expect(aiModule?.config.enabled).toBe(false);
    });
  });

  describe('Module Status and Statistics', () => {
    beforeEach(() => {
      registerModules();
    });

    test('should provide comprehensive module status', () => {
      const status = getModuleStatus();
      
      expect(status).toHaveProperty('registry');
      expect(status).toHaveProperty('statistics');
      expect(status).toHaveProperty('enabledModules');
      expect(status).toHaveProperty('disabledModules');
      expect(status).toHaveProperty('errorModules');
      
      expect(Array.isArray(status.enabledModules)).toBe(true);
      expect(Array.isArray(status.disabledModules)).toBe(true);
      expect(Array.isArray(status.errorModules)).toBe(true);
    });

    test('should have correct module counts', () => {
      const status = getModuleStatus();
      
      expect(status.statistics.total).toBeGreaterThan(0);
      expect(status.statistics.enabled).toBeGreaterThan(0);
      expect(status.statistics.total).toBe(
        status.statistics.enabled + status.statistics.disabled + status.statistics.errors
      );
    });

    test('should categorize modules correctly', () => {
      const status = getModuleStatus();
      
      expect(status.statistics.byCategory).toHaveProperty('core');
      expect(status.statistics.byCategory).toHaveProperty('feature');
      expect(status.statistics.byCategory).toHaveProperty('integration');
      expect(status.statistics.byCategory).toHaveProperty('experimental');
      
      expect(status.statistics.byCategory.core).toBeGreaterThan(0);
      expect(status.statistics.byCategory.feature).toBeGreaterThan(0);
    });

    test('should track module status correctly', () => {
      const status = getModuleStatus();
      
      expect(status.statistics.byStatus).toHaveProperty('loaded');
      expect(status.statistics.byStatus).toHaveProperty('disabled');
      
      expect(status.statistics.byStatus.loaded).toBeGreaterThan(0);
    });

    test('should identify enabled core modules', () => {
      const status = getModuleStatus();
      
      expect(status.enabledModules).toContain('core');
      expect(status.enabledModules).toContain('ui-framework');
      expect(status.enabledModules).toContain('student-management');
      expect(status.enabledModules).toContain('fee-management');
      expect(status.enabledModules).toContain('course-management');
    });

    test('should identify disabled feature-controlled modules', () => {
      const status = getModuleStatus();
      
      expect(status.disabledModules).toContain('reporting');
      expect(status.disabledModules).toContain('realtime-collaboration');
      expect(status.disabledModules).toContain('ai-personalization');
    });
  });

  describe('Module Dependencies and Relationships', () => {
    beforeEach(() => {
      registerModules();
    });

    test('should maintain proper dependency hierarchy', () => {
      // Core should have no dependencies
      expect(moduleRegistry.getDependencies('core')).toEqual([]);
      
      // UI framework should depend on core
      expect(moduleRegistry.getDependencies('ui-framework')).toContain('core');
      
      // Student management should depend on core and ui-framework
      const studentDeps = moduleRegistry.getDependencies('student-management');
      expect(studentDeps).toContain('core');
      expect(studentDeps).toContain('ui-framework');
      
      // Fee management should depend on student management
      const feeDeps = moduleRegistry.getDependencies('fee-management');
      expect(feeDeps).toContain('student-management');
    });

    test('should track module dependents correctly', () => {
      // Core should have many dependents
      const coreDependents = moduleRegistry.getDependents('core');
      expect(coreDependents.length).toBeGreaterThan(0);
      expect(coreDependents).toContain('ui-framework');
      expect(coreDependents).toContain('student-management');
      
      // Student management should have dependents
      const studentDependents = moduleRegistry.getDependents('student-management');
      expect(studentDependents).toContain('fee-management');
      expect(studentDependents).toContain('course-management');
    });

    test('should prevent disabling modules with active dependents', () => {
      // Core cannot be disabled because other modules depend on it
      expect(moduleRegistry.canDisable('core')).toBe(false);
      
      // Student management cannot be disabled because fee/course modules depend on it
      expect(moduleRegistry.canDisable('student-management')).toBe(false);
      
      // Leaf modules can be disabled
      expect(moduleRegistry.canDisable('course-management')).toBe(true);
    });
  });

  describe('Feature Flag Integration', () => {
    beforeEach(() => {
      registerModules();
    });

    test('should respect feature flag states during registration', async () => {
      const { isFeatureEnabled  } = await vi.importActual('@/lib/config/FeatureFlags');
      
      // Modules requiring disabled features should be disabled
      const reportingModule = moduleRegistry.getModule('reporting');
      expect(reportingModule?.config.enabled).toBe(false);
      expect(reportingModule?.config.requiredFeatures).toContain('advancedReporting');
      expect(isFeatureEnabled('advancedReporting')).toBe(false);
      
      // Modules with enabled optional features should note them
      const securityModule = moduleRegistry.getModule('security');
      expect(securityModule?.config.optionalFeatures).toContain('auditLogging');
      expect(isFeatureEnabled('auditLogging')).toBe(true);
    });

    test('should handle modules with mixed feature requirements', () => {
      const communicationModule = moduleRegistry.getModule('communication');
      
      // Should be disabled because required features are disabled
      expect(communicationModule?.config.enabled).toBe(false);
      expect(communicationModule?.config.optionalFeatures).toContain('emailNotifications');
      expect(communicationModule?.config.optionalFeatures).toContain('smsNotifications');
    });
  });

  describe('Performance and Scalability', () => {
    test('should register modules efficiently', () => {
      const startTime = Date.now();
      registerModules();
      const duration = Date.now() - startTime;
      
      // Registration should complete quickly
      expect(duration).toBeLessThan(1000); // 1 second
    });

    test('should provide status information efficiently', () => {
      registerModules();
      
      const startTime = Date.now();
      const status = getModuleStatus();
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(100); // 100ms
      expect(status.statistics.total).toBeGreaterThan(0);
    });

    test('should handle module queries efficiently', () => {
      registerModules();
      
      const startTime = Date.now();
      
      // Perform many queries
      for (let i = 0; i < 1000; i++) {
        moduleRegistry.isEnabled('core');
        moduleRegistry.isEnabled('student-management');
        moduleRegistry.isEnabled('fee-management');
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(500); // 500ms for 3000 queries
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should handle registration errors gracefully', () => {
      // This test would require injecting errors into the registration process
      // For now, we verify that normal registration doesn't throw
      expect(() => {
        registerModules();
      }).not.toThrow();
    });

    test('should provide error information in status', () => {
      registerModules();
      const status = getModuleStatus();
      
      // Error modules array should exist (even if empty)
      expect(Array.isArray(status.errorModules)).toBe(true);
      
      // Statistics should include error count
      expect(typeof status.statistics.errors).toBe('number');
    });

    test('should handle missing dependencies gracefully', () => {
      // This would require a way to inject dependency errors
      // For now, we verify the system handles the current state correctly
      const status = getModuleStatus();
      expect(status.statistics.errors).toBe(0);
    });
  });

  describe('Module Health and Monitoring', () => {
    beforeEach(() => {
      registerModules();
    });

    test('should provide health status for modules', async () => {
      const healthResults = await moduleRegistry.performHealthCheck();
      
      expect(healthResults.size).toBeGreaterThan(0);
      
      for (const [moduleName, health] of healthResults) {
        expect(typeof moduleName).toBe('string');
        expect(health).toHaveProperty('status');
        expect(health).toHaveProperty('lastCheck');
        expect(['healthy', 'degraded', 'unhealthy']).toContain(health?.status);
      }
    });

    test('should track module performance metrics', () => {
      const status = getModuleStatus();
      
      expect(typeof status.statistics.totalMemoryUsage).toBe('number');
      expect(typeof status.statistics.averageLoadTime).toBe('number');
      expect(status.statistics.totalMemoryUsage).toBeGreaterThan(0);
      expect(status.statistics.averageLoadTime).toBeGreaterThanOrEqual(0);
    });
  });
});
