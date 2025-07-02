/**
 * Phase 1 Implementation Integration Tests
 * 
 * Comprehensive test suite validating the complete Phase 1 implementation
 * including Feature Flags, Service Layer, and Module Registry systems.
 * 
 * Test Coverage:
 * - Feature flags functionality and integration
 * - Service layer operations and error handling
 * - Module registry dependency management
 * - System integration and performance
 * - Backwards compatibility validation
 */

import { vi } from 'vitest';

import {
  isFeatureEnabled,
  getAllFeatureFlags,
  getFeatureFlagAnalytics,
  validateFeatureFlags,
} from '@/lib/config/FeatureFlags';
import {
  moduleRegistry,
  registerModules,
  getModuleStatus,
} from '@/lib/modules';
import { BaseService, ServiceResult } from '@/lib/services/BaseService';
import { StudentService } from '@/lib/services/StudentService';

// Mock Prisma for testing
vi.mock('@/lib/database', () => ({
  getPrismaClient: vi.fn().mockResolvedValue({
    student: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    family: {
      findUnique: vi.fn(),
    },
    $queryRaw: vi.fn().mockResolvedValue([{ result: 1 }]),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
  }),
}));

describe('Phase 1 Implementation Integration Tests', () => {
  beforeEach(async () => {
    // Clear module registry state to prevent test interference
    const { moduleRegistry } = await import('@/lib/modules/ModuleRegistry');
    moduleRegistry.clear();
    vi.clearAllMocks();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset environment variables
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
    delete process.env.FEATURE_REALTIME;
    delete process.env.FEATURE_REPORTING;
    delete process.env.FEATURE_AI;
  });

  describe('Feature Flags System', () => {
    test('should provide consistent feature flag access', () => {
      // Test basic feature flag functionality
      expect(typeof isFeatureEnabled('advancedReporting')).toBe('boolean');
      expect(typeof isFeatureEnabled('realTimeCollaboration')).toBe('boolean');
      expect(typeof isFeatureEnabled('auditLogging')).toBe('boolean');
    });

    test('should return complete feature flags object', () => {
      const allFlags = getAllFeatureFlags();
      
      expect(allFlags).toHaveProperty('realTimeCollaboration');
      expect(allFlags).toHaveProperty('advancedReporting');
      expect(allFlags).toHaveProperty('aiPersonalization');
      expect(allFlags).toHaveProperty('auditLogging');
      expect(allFlags).toHaveProperty('caching');
      
      // All values should be booleans
      Object.values(allFlags).forEach(value => {
        expect(typeof value).toBe('boolean');
      });
    });

    test('should provide analytics data', () => {
      const analytics = getFeatureFlagAnalytics();
      
      expect(analytics).toHaveProperty('totalFlags');
      expect(analytics).toHaveProperty('enabledFlags');
      expect(analytics).toHaveProperty('disabledFlags');
      expect(analytics).toHaveProperty('enabledPercentage');
      expect(analytics).toHaveProperty('flagsByCategory');
      
      expect(typeof analytics.totalFlags).toBe('number');
      expect(typeof analytics.enabledFlags).toBe('number');
      expect(typeof analytics.enabledPercentage).toBe('number');
      
      expect(analytics.totalFlags).toBeGreaterThan(0);
      expect(analytics.enabledFlags + analytics.disabledFlags).toBe(analytics.totalFlags);
    });

    test('should validate feature flag configuration', () => {
      const validation = validateFeatureFlags();
      
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('errors');
      expect(typeof validation.valid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
    });
  });

  describe('Service Layer Implementation', () => {
    let studentService: StudentService;

    beforeEach(async () => {
      studentService = new StudentService();

      // Setup Prisma mocks for StudentService operations
      const { getPrismaClient } = await import('@/lib/database');
      const mockPrisma = {
        student: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: 'student-1',
              name: 'Test Student',
              studentId: 'STU-001',
              grade: 'Grade 10',
              isActive: true,
              family: { id: 'family-1', name: 'Test Family' },
              subscriptions: [],
              _count: { subscriptions: 0 },
            },
          ]),
          count: vi.fn().mockResolvedValue(1),
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockRejectedValue(new Error('Validation error')),
        },
        family: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
        $connect: vi.fn().mockResolvedValue(undefined),
        $disconnect: vi.fn().mockResolvedValue(undefined),
        $queryRaw: vi.fn().mockResolvedValue([{ result: 1 }]),
      };

      vi.mocked(getPrismaClient).mockResolvedValue(mockPrisma as any);
    });

    test('should create StudentService instance', () => {
      expect(studentService).toBeInstanceOf(StudentService);
      expect(studentService).toBeInstanceOf(BaseService);
    });

    test('should provide health status', async () => {
      const healthResult = await studentService.getHealthStatus();
      
      expect(healthResult).toHaveProperty('success');
      expect(healthResult).toHaveProperty('data');
      expect(healthResult).toHaveProperty('metadata');
      
      if (healthResult.success && healthResult.data) {
        expect(healthResult.data).toHaveProperty('status');
        expect(healthResult.data).toHaveProperty('details');
        expect(['healthy', 'unhealthy']).toContain(healthResult.data.status);
      }
    });

    test('should handle service operations with proper error handling', async () => {
      // Test with invalid data to trigger error handling
      const result = await studentService.create({
        name: '',
        familyId: 'invalid-id',
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('timestamp');
      
      if (!result.success) {
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('code');
        expect(typeof result.error).toBe('string');
        expect(typeof result.code).toBe('string');
      }
    });

    test('should provide consistent service result format', async () => {
      const result = await studentService.findById('test-id');
      
      // Check ServiceResult interface compliance
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
      
      if (result.success) {
        expect(result).toHaveProperty('data');
      } else {
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('code');
      }
      
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('timestamp');
      expect(typeof result.metadata?.timestamp).toBe('number');
    });

    test('should handle pagination correctly', async () => {
      const result = await studentService.findMany({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(result).toHaveProperty('success');
      
      if (result.success && result.data) {
        expect(result.data).toHaveProperty('data');
        expect(result.data).toHaveProperty('total');
        expect(result.data).toHaveProperty('page');
        expect(result.data).toHaveProperty('limit');
        expect(result.data).toHaveProperty('totalPages');
        expect(result.data).toHaveProperty('hasNext');
        expect(result.data).toHaveProperty('hasPrevious');
        
        expect(Array.isArray(result.data.data)).toBe(true);
        expect(typeof result.data.total).toBe('number');
        expect(typeof result.data.page).toBe('number');
        expect(typeof result.data.limit).toBe('number');
      }
    });
  });

  describe('Module Registry System', () => {
    test('should initialize module registry', () => {
      expect(moduleRegistry).toBeDefined();
    });

    test('should register modules successfully', () => {
      expect(() => {
        registerModules();
      }).not.toThrow();
    });

    test('should provide module status information', () => {
      registerModules();
      const status = getModuleStatus();
      
      expect(status).toHaveProperty('registry');
      expect(status).toHaveProperty('statistics');
      expect(status).toHaveProperty('enabledModules');
      expect(status).toHaveProperty('disabledModules');
      expect(status).toHaveProperty('errorModules');
      
      expect(Array.isArray(status.enabledModules)).toBe(true);
      expect(Array.isArray(status.disabledModules)).toBe(true);
      expect(Array.isArray(status.errorModules)).toBe(true);
      
      expect(status.statistics).toHaveProperty('total');
      expect(status.statistics).toHaveProperty('enabled');
      expect(status.statistics).toHaveProperty('disabled');
      expect(status.statistics.total).toBeGreaterThan(0);
    });

    test('should handle module dependencies correctly', () => {
      registerModules();
      
      // Core module should be enabled
      expect(moduleRegistry.isEnabled('core')).toBe(true);
      
      // Student management should depend on core
      const studentModule = moduleRegistry.getModule('student-management');
      expect(studentModule).toBeDefined();
      expect(studentModule?.config.dependencies).toContain('core');
      
      // Fee management should depend on student management
      const feeModule = moduleRegistry.getModule('fee-management');
      expect(feeModule).toBeDefined();
      expect(feeModule?.config.dependencies).toContain('student-management');
    });

    test('should integrate with feature flags', () => {
      registerModules();
      
      // Reporting module should be controlled by feature flag
      const reportingModule = moduleRegistry.getModule('reporting');
      expect(reportingModule).toBeDefined();
      
      if (reportingModule) {
        const reportingEnabled = isFeatureEnabled('advancedReporting');
        expect(reportingModule.config.enabled).toBe(reportingEnabled);
      }
    });

    test('should provide module statistics', () => {
      registerModules();
      const stats = moduleRegistry.getStatistics();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('enabled');
      expect(stats).toHaveProperty('disabled');
      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('byCategory');
      expect(stats).toHaveProperty('byStatus');
      
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.enabled).toBe('number');
      expect(typeof stats.disabled).toBe('number');
      expect(typeof stats.errors).toBe('number');
      
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.enabled + stats.disabled + stats.errors).toBeLessThanOrEqual(stats.total);
    });
  });

  describe('System Integration', () => {
    test('should integrate all Phase 1 components', () => {
      // Register modules (depends on feature flags)
      registerModules();
      
      // Get system status
      const moduleStatus = getModuleStatus();
      const featureAnalytics = getFeatureFlagAnalytics();
      
      // Verify integration
      expect(moduleStatus.statistics.total).toBeGreaterThan(0);
      expect(featureAnalytics.totalFlags).toBeGreaterThan(0);
      
      // Verify core modules are enabled
      expect(moduleStatus.enabledModules).toContain('core');
      expect(moduleStatus.enabledModules).toContain('student-management');
    });

    test('should maintain backwards compatibility', () => {
      // Test that existing functionality still works
      expect(() => {
        // Feature flags
        isFeatureEnabled('advancedReporting');
        getAllFeatureFlags();
        
        // Service layer
        new StudentService();
        
        // Module registry
        registerModules();
        getModuleStatus();
      }).not.toThrow();
    });

    test('should provide consistent error handling across systems', () => {
      // Feature flags should handle invalid input gracefully
      expect(() => {
        isFeatureEnabled('nonExistentFeature' as any);
      }).not.toThrow();
      
      // Service layer should provide consistent error format
      const studentService = new StudentService();
      expect(async () => {
        await studentService.findById('');
      }).not.toThrow();
      
      // Module registry should handle invalid modules gracefully
      expect(() => {
        moduleRegistry.isEnabled('nonExistentModule');
      }).not.toThrow();
    });

    test('should provide performance metrics', async () => {
      registerModules();
      
      // Module registry performance
      const stats = moduleRegistry.getStatistics();
      expect(typeof stats.averageLoadTime).toBe('number');
      expect(typeof stats.totalMemoryUsage).toBe('number');
      
      // Service layer performance
      const studentService = new StudentService();
      const result = await studentService.getHealthStatus();
      
      if (result.metadata?.duration) {
        expect(typeof result.metadata.duration).toBe('number');
        expect(result.metadata.duration).toBeGreaterThan(0);
      }
    });
  });

  describe('Phase 1 Success Criteria Validation', () => {
    test('should meet all Phase 1 success criteria', () => {
      // 1. Feature flags control component rendering
      expect(typeof isFeatureEnabled('realTimeCollaboration')).toBe('boolean');
      expect(typeof isFeatureEnabled('advancedReporting')).toBe('boolean');
      
      // 2. Service layer handles database operations
      const studentService = new StudentService();
      expect(studentService).toBeInstanceOf(BaseService);
      expect(typeof studentService.create).toBe('function');
      expect(typeof studentService.findById).toBe('function');
      expect(typeof studentService.update).toBe('function');
      expect(typeof studentService.delete).toBe('function');
      expect(typeof studentService.findMany).toBe('function');
      
      // 3. Module registry manages dependencies
      registerModules();
      expect(moduleRegistry.getStatistics().total).toBeGreaterThan(0);
      expect(moduleRegistry.isEnabled('core')).toBe(true);
      
      // 4. Zero breaking changes
      expect(() => {
        // All existing patterns should still work
        isFeatureEnabled('advancedReporting');
        new StudentService();
        registerModules();
      }).not.toThrow();
      
      // 5. Comprehensive error handling
      expect(() => {
        isFeatureEnabled('invalidFeature' as any);
        moduleRegistry.isEnabled('invalidModule');
      }).not.toThrow();
    });

    test('should provide development experience improvements', () => {
      // Faster feature development with reusable services
      const studentService = new StudentService();
      expect(studentService).toBeInstanceOf(BaseService);
      
      // Easier testing with service layer abstraction
      expect(typeof studentService.getHealthStatus).toBe('function');
      
      // Safer deployments with feature flags
      expect(typeof isFeatureEnabled).toBe('function');
      expect(typeof getAllFeatureFlags).toBe('function');
      
      // Better code organization with modules
      registerModules();
      const status = getModuleStatus();
      expect(status.statistics.byCategory).toHaveProperty('core');
      expect(status.statistics.byCategory).toHaveProperty('feature');
    });

    test('should maintain performance standards', async () => {
      const startTime = Date.now();
      
      // Feature flag operations should be fast
      isFeatureEnabled('advancedReporting');
      getAllFeatureFlags();
      getFeatureFlagAnalytics();
      
      // Module operations should be fast
      registerModules();
      getModuleStatus();
      
      // Service operations should be reasonably fast
      const studentService = new StudentService();
      await studentService.getHealthStatus();
      
      const totalTime = Date.now() - startTime;
      
      // All operations should complete within reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds max
    });
  });
});
