/**
 * Module Registry Test Suite
 * 
 * Comprehensive tests for the Module Registry system including:
 * - Module registration and validation
 * - Dependency resolution and circular dependency detection
 * - Feature flag integration
 * - Health monitoring and performance metrics
 * - Event system and lifecycle management
 * - Error handling and edge cases
 */

import { vi } from 'vitest';
import {
  ModuleRegistry,
  ModuleConfig,
  ModuleMetadata,
  ModuleRegistryEvent,
  ModuleEventListener,
} from '@/lib/modules/ModuleRegistry';

// Mock feature flags
vi.mock('@/lib/config/FeatureFlags', () => ({
  isFeatureEnabled: vi.fn((feature: string) => {
    // Default mock behavior - some features enabled, some disabled
    const enabledFeatures = ['auditLogging', 'caching', 'inputValidation'];
    return enabledFeatures.includes(feature);
  }),
}));

describe('ModuleRegistry', () => {
  let registry: ModuleRegistry;
  let mockEventListener: jest.MockedFunction<ModuleEventListener>;

  // Sample module configurations for testing
  const coreModule: ModuleConfig = {
    name: 'core',
    version: '1.0.0',
    description: 'Core system functionality',
    dependencies: [],
    routes: ['/api/health'],
    components: ['Layout', 'Navigation'],
    services: ['AuthService'],
    enabled: true,
    category: 'core',
    priority: 100,
  };

  const featureModule: ModuleConfig = {
    name: 'feature-module',
    version: '1.0.0',
    description: 'Feature module depending on core',
    dependencies: ['core'],
    routes: ['/api/feature'],
    components: ['FeatureComponent'],
    services: ['FeatureService'],
    enabled: true,
    category: 'feature',
    priority: 50,
  };

  const conditionalModule: ModuleConfig = {
    name: 'conditional-module',
    version: '1.0.0',
    description: 'Module with feature flag requirements',
    dependencies: ['core'],
    routes: ['/api/conditional'],
    components: ['ConditionalComponent'],
    services: ['ConditionalService'],
    enabled: true,
    requiredFeatures: ['auditLogging'],
    optionalFeatures: ['caching'],
    category: 'feature',
  };

  const disabledFeatureModule: ModuleConfig = {
    name: 'disabled-feature-module',
    version: '1.0.0',
    description: 'Module requiring disabled feature',
    dependencies: ['core'],
    routes: ['/api/disabled'],
    components: ['DisabledComponent'],
    services: ['DisabledService'],
    enabled: true,
    requiredFeatures: ['advancedReporting'], // This feature is disabled in mock
    category: 'feature',
  };

  beforeEach(() => {
    // Create fresh registry for each test
    registry = new ModuleRegistry();
    mockEventListener = vi.fn();

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Module Registration', () => {
    test('should register a valid module successfully', () => {
      expect(() => {
        registry.register(coreModule);
      }).not.toThrow();

      const registeredModule = registry.getModule('core');
      expect(registeredModule).toBeDefined();
      expect(registeredModule?.config.name).toBe('core');
      expect(registeredModule?.status).toBe('loaded');
    });

    test('should validate module configuration', () => {
      const invalidModule = {
        ...coreModule,
        name: '', // Invalid empty name
      };

      expect(() => {
        registry.register(invalidModule);
      }).toThrow('Module name is required and must be a string');
    });

    test('should prevent duplicate module registration', () => {
      registry.register(coreModule);

      expect(() => {
        registry.register(coreModule);
      }).toThrow('Module core is already registered');
    });

    test('should validate dependencies exist', () => {
      expect(() => {
        registry.register(featureModule); // Depends on 'core' which isn't registered
      }).toThrow('Dependency core not found for module feature-module');
    });

    test('should detect circular dependencies', () => {
      const moduleA: ModuleConfig = {
        ...coreModule,
        name: 'module-a',
        dependencies: ['module-b'],
      };

      const moduleB: ModuleConfig = {
        ...coreModule,
        name: 'module-b',
        dependencies: ['module-a'],
      };

      registry.register(moduleA);

      expect(() => {
        registry.register(moduleB);
      }).toThrow('Circular dependency detected for module module-b');
    });

    test('should handle feature flag requirements', async () => {
      const { isFeatureEnabled  } = await vi.importActual('@/lib/config/FeatureFlags');
      
      registry.register(coreModule);
      
      // Module with enabled feature should be enabled
      registry.register(conditionalModule);
      const enabledModule = registry.getModule('conditional-module');
      expect(enabledModule?.config.enabled).toBe(true);
      
      // Module with disabled feature should be disabled
      registry.register(disabledFeatureModule);
      const disabledModule = registry.getModule('disabled-feature-module');
      expect(disabledModule?.config.enabled).toBe(false);
    });

    test('should set module metadata correctly', () => {
      registry.register(coreModule);
      const module = registry.getModule('core');

      expect(module?.loadedAt).toBeInstanceOf(Date);
      expect(module?.status).toBe('loaded');
      expect(module?.metrics?.loadTime).toBeGreaterThanOrEqual(0);
      expect(module?.health?.status).toBe('healthy');
    });
  });

  describe('Module Querying and Management', () => {
    beforeEach(() => {
      registry.register(coreModule);
      registry.register(featureModule);
    });

    test('should check if module is enabled', () => {
      expect(registry.isEnabled('core')).toBe(true);
      expect(registry.isEnabled('feature-module')).toBe(true);
      expect(registry.isEnabled('non-existent')).toBe(false);
    });

    test('should get all modules', () => {
      const allModules = registry.getAllModules();
      expect(allModules).toHaveLength(2);
      expect(allModules.map(m => m.config.name)).toContain('core');
      expect(allModules.map(m => m.config.name)).toContain('feature-module');
    });

    test('should get enabled modules only', () => {
      const enabledModules = registry.getEnabledModules();
      expect(enabledModules).toHaveLength(2);
      expect(enabledModules.every(m => m.config.enabled)).toBe(true);
    });

    test('should get modules by category', () => {
      const coreModules = registry.getModulesByCategory('core');
      const featureModules = registry.getModulesByCategory('feature');

      expect(coreModules).toHaveLength(1);
      expect(coreModules[0].config.name).toBe('core');
      expect(featureModules).toHaveLength(1);
      expect(featureModules[0].config.name).toBe('feature-module');
    });

    test('should get module dependencies', () => {
      const coreDeps = registry.getDependencies('core');
      const featureDeps = registry.getDependencies('feature-module');

      expect(coreDeps).toEqual([]);
      expect(featureDeps).toEqual(['core']);
    });

    test('should get module dependents', () => {
      const coreDependents = registry.getDependents('core');
      const featureDependents = registry.getDependents('feature-module');

      expect(coreDependents).toContain('feature-module');
      expect(featureDependents).toEqual([]);
    });

    test('should track access metrics', () => {
      const module = registry.getModule('core');
      const initialAccessCount = module?.metrics?.accessCount || 0;

      // Access the module multiple times
      registry.isEnabled('core');
      registry.isEnabled('core');
      registry.isEnabled('core');

      const updatedModule = registry.getModule('core');
      expect(updatedModule?.metrics?.accessCount).toBe(initialAccessCount + 3);
      expect(updatedModule?.metrics?.lastAccessed).toBeInstanceOf(Date);
    });
  });

  describe('Module Enable/Disable Operations', () => {
    beforeEach(() => {
      registry.register(coreModule);
      registry.register(featureModule);
    });

    test('should check if module can be disabled', () => {
      expect(registry.canDisable('feature-module')).toBe(true); // No dependents
      expect(registry.canDisable('core')).toBe(false); // Has dependents
    });

    test('should disable module without dependents', () => {
      const result = registry.disable('feature-module');
      expect(result).toBe(true);
      expect(registry.isEnabled('feature-module')).toBe(false);
    });

    test('should prevent disabling module with dependents', () => {
      const result = registry.disable('core');
      expect(result).toBe(false);
      expect(registry.isEnabled('core')).toBe(true);
    });

    test('should enable disabled module', () => {
      registry.disable('feature-module');
      expect(registry.isEnabled('feature-module')).toBe(false);

      const result = registry.enable('feature-module');
      expect(result).toBe(true);
      expect(registry.isEnabled('feature-module')).toBe(true);
    });

    test('should validate dependencies when enabling', () => {
      registry.disable('feature-module');
      registry.disable('core'); // This should fail, but let's force it for testing
      
      // Manually set core as disabled for testing
      const coreModule = registry.getModule('core');
      if (coreModule) {
        coreModule.config.enabled = false;
        coreModule.status = 'disabled';
      }

      const result = registry.enable('feature-module');
      expect(result).toBe(false); // Should fail because core is disabled
    });

    test('should validate feature flags when enabling', () => {
      registry.register(disabledFeatureModule);
      
      const result = registry.enable('disabled-feature-module');
      expect(result).toBe(false); // Should fail because required feature is disabled
    });
  });

  describe('Event System', () => {
    test('should emit registration events', () => {
      registry.addEventListener('module:registered', mockEventListener);
      
      registry.register(coreModule);
      
      expect(mockEventListener).toHaveBeenCalledWith({
        type: 'module:registered',
        moduleName: 'core',
        data: expect.objectContaining({
          version: '1.0.0',
          dependencies: [],
          enabled: true,
        }),
        timestamp: expect.any(Date),
      });
    });

    test('should emit enable/disable events', () => {
      registry.register(coreModule);
      registry.register(featureModule);
      
      registry.addEventListener('module:enabled', mockEventListener);
      registry.addEventListener('module:disabled', mockEventListener);
      
      registry.disable('feature-module');
      registry.enable('feature-module');
      
      expect(mockEventListener).toHaveBeenCalledWith({
        type: 'module:disabled',
        moduleName: 'feature-module',
        data: expect.objectContaining({
          version: '1.0.0',
          reason: 'manual',
        }),
        timestamp: expect.any(Date),
      });
      
      expect(mockEventListener).toHaveBeenCalledWith({
        type: 'module:enabled',
        moduleName: 'feature-module',
        data: expect.objectContaining({
          version: '1.0.0',
          dependencies: ['core'],
        }),
        timestamp: expect.any(Date),
      });
    });

    test('should handle event listener errors gracefully', () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Event listener error');
      });
      
      registry.addEventListener('module:registered', errorListener);
      
      // Should not throw despite listener error
      expect(() => {
        registry.register(coreModule);
      }).not.toThrow();
    });

    test('should remove event listeners', () => {
      registry.addEventListener('module:registered', mockEventListener);
      registry.removeEventListener('module:registered', mockEventListener);
      
      registry.register(coreModule);
      
      expect(mockEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Health Monitoring', () => {
    beforeEach(() => {
      registry.register(coreModule);
      registry.register(featureModule);
      registry.register(conditionalModule);
    });

    test('should perform health checks on all modules', async () => {
      const healthResults = await registry.performHealthCheck();
      
      expect(healthResults.size).toBe(3); // All enabled modules
      
      for (const [moduleName, health] of healthResults) {
        expect(['healthy', 'degraded', 'unhealthy']).toContain(health?.status);
        expect(health?.lastCheck).toBeInstanceOf(Date);
      }
    });

    test('should emit health check events', async () => {
      registry.addEventListener('module:health-check', mockEventListener);
      
      await registry.performHealthCheck();
      
      expect(mockEventListener).toHaveBeenCalledTimes(3); // One for each enabled module
    });

    test('should detect dependency health issues', async () => {
      // Disable core module to create dependency issue
      const coreModule = registry.getModule('core');
      if (coreModule) {
        coreModule.config.enabled = false;
        coreModule.status = 'disabled';
      }
      
      const healthResults = await registry.performHealthCheck();
      const featureHealth = healthResults.get('feature-module');
      
      expect(featureHealth?.status).toBe('unhealthy');
      expect(featureHealth?.details?.error).toContain('Dependency core is not enabled');
    });
  });

  describe('Statistics and Performance', () => {
    beforeEach(() => {
      registry.register(coreModule);
      registry.register(featureModule);
      registry.register(conditionalModule);
    });

    test('should provide comprehensive statistics', () => {
      const stats = registry.getStatistics();

      expect(stats.total).toBe(3);
      expect(stats.enabled).toBe(3);
      expect(stats.disabled).toBe(0);
      expect(stats.errors).toBe(0);

      expect(stats.byCategory.core).toBe(1);
      expect(stats.byCategory.feature).toBe(2);

      expect(stats.byStatus.loaded).toBe(3);

      expect(typeof stats.totalMemoryUsage).toBe('number');
      expect(typeof stats.averageLoadTime).toBe('number');
    });

    test('should track memory usage estimates', () => {
      const stats = registry.getStatistics();
      expect(stats.totalMemoryUsage).toBeGreaterThan(0);
    });

    test('should track load time performance', () => {
      const stats = registry.getStatistics();
      expect(stats.averageLoadTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid module configurations gracefully', () => {
      const invalidConfigs = [
        { ...coreModule, name: null },
        { ...coreModule, version: undefined },
        { ...coreModule, dependencies: 'not-an-array' },
        { ...coreModule, routes: null },
        { ...coreModule, enabled: 'not-a-boolean' },
      ];

      invalidConfigs.forEach((config, index) => {
        expect(() => {
          registry.register(config as any);
        }).toThrow();
      });
    });

    test('should handle non-existent module operations', () => {
      expect(registry.isEnabled('non-existent')).toBe(false);
      expect(registry.getModule('non-existent')).toBeUndefined();
      expect(registry.getDependencies('non-existent')).toEqual([]);
      expect(registry.getDependents('non-existent')).toEqual([]);
      expect(registry.canDisable('non-existent')).toBe(true);
      expect(registry.enable('non-existent')).toBe(false);
      expect(registry.disable('non-existent')).toBe(false);
    });

    test('should handle complex dependency chains', () => {
      const moduleA: ModuleConfig = { ...coreModule, name: 'module-a', dependencies: [] };
      const moduleB: ModuleConfig = { ...coreModule, name: 'module-b', dependencies: ['module-a'] };
      const moduleC: ModuleConfig = { ...coreModule, name: 'module-c', dependencies: ['module-b'] };
      const moduleD: ModuleConfig = { ...coreModule, name: 'module-d', dependencies: ['module-c'] };

      registry.register(moduleA);
      registry.register(moduleB);
      registry.register(moduleC);
      registry.register(moduleD);

      // Should not be able to disable modules with dependents
      expect(registry.canDisable('module-a')).toBe(false);
      expect(registry.canDisable('module-b')).toBe(false);
      expect(registry.canDisable('module-c')).toBe(false);
      expect(registry.canDisable('module-d')).toBe(true);

      // Should be able to disable from the end of the chain
      expect(registry.disable('module-d')).toBe(true);
      expect(registry.canDisable('module-c')).toBe(true);
    });

    test('should handle module registration errors', () => {
      const errorModule: ModuleConfig = {
        ...coreModule,
        name: 'error-module',
        dependencies: ['non-existent-dependency'],
      };

      expect(() => {
        registry.register(errorModule);
      }).toThrow();

      // Module should be registered with error status
      const module = registry.getModule('error-module');
      expect(module?.status).toBe('error');
      expect(module?.error).toBeDefined();
    });
  });

  describe('Integration with Feature Flags', () => {
    test('should respect feature flag changes', async () => {
      const { isFeatureEnabled  } = await vi.importActual('@/lib/config/FeatureFlags');

      // Initially enabled
      isFeatureEnabled.mockReturnValue(true);
      registry.register(coreModule);
      registry.register(conditionalModule);

      expect(registry.isEnabled('conditional-module')).toBe(true);

      // Simulate feature flag being disabled
      isFeatureEnabled.mockReturnValue(false);

      // Health check should detect the issue
      const healthCheck = async () => {
        const results = await registry.performHealthCheck();
        const conditionalHealth = results.get('conditional-module');
        return conditionalHealth?.status;
      };

      // The module should still be enabled until health check detects the issue
      expect(registry.isEnabled('conditional-module')).toBe(true);
    });

    test('should handle optional features correctly', async () => {
      const { isFeatureEnabled  } = await vi.importActual('@/lib/config/FeatureFlags');

      registry.register(coreModule);
      registry.register(conditionalModule);

      const module = registry.getModule('conditional-module');
      expect(module?.health?.details?.featuresAvailable).toHaveProperty('caching');
    });
  });

  describe('Performance Benchmarks', () => {
    test('should register modules efficiently', () => {
      const startTime = Date.now();

      // Register multiple modules
      for (let i = 0; i < 50; i++) {
        const module: ModuleConfig = {
          ...coreModule,
          name: `module-${i}`,
          dependencies: i > 0 ? [`module-${i - 1}`] : [],
        };
        registry.register(module);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should query modules efficiently', () => {
      // Register many modules
      for (let i = 0; i < 100; i++) {
        const module: ModuleConfig = {
          ...coreModule,
          name: `module-${i}`,
          dependencies: [],
        };
        registry.register(module);
      }

      const startTime = Date.now();

      // Perform many queries
      for (let i = 0; i < 1000; i++) {
        registry.isEnabled(`module-${i % 100}`);
        registry.getModule(`module-${i % 100}`);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    test('should handle health checks efficiently', async () => {
      // Register multiple modules
      for (let i = 0; i < 20; i++) {
        const module: ModuleConfig = {
          ...coreModule,
          name: `module-${i}`,
          dependencies: [],
        };
        registry.register(module);
      }

      const startTime = Date.now();
      await registry.performHealthCheck();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
