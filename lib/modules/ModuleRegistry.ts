/**
 * Module Registry System
 * 
 * Provides centralized module management with dependency resolution,
 * feature flag integration, and runtime module control.
 * 
 * Design Principles:
 * - Dependency-aware module loading
 * - Feature flag integration for conditional modules
 * - Runtime module enable/disable capabilities
 * - Comprehensive module metadata tracking
 * - Circular dependency detection and prevention
 * - Performance monitoring and health checks
 * 
 * Features:
 * - Module registration with dependency validation
 * - Automatic dependency resolution
 * - Feature flag integration
 * - Module health monitoring
 * - Runtime configuration changes
 * - Module lifecycle management
 * - Performance metrics tracking
 * 
 * Usage:
 * ```typescript
 * const registry = new ModuleRegistry();
 * 
 * registry.register({
 *   name: 'student-management',
 *   version: '1.0.0',
 *   dependencies: ['core'],
 *   enabled: true
 * });
 * 
 * const isEnabled = registry.isEnabled('student-management');
 * ```
 */

import { isFeatureEnabled, FeatureFlags } from '@/lib/config/FeatureFlags';

/**
 * Module configuration interface
 */
export interface ModuleConfig {
  /** Unique module identifier */
  name: string;
  /** Semantic version */
  version: string;
  /** Human-readable description */
  description: string;
  /** Array of module names this module depends on */
  dependencies: string[];
  /** API routes provided by this module */
  routes: string[];
  /** React components provided by this module */
  components: string[];
  /** Service classes provided by this module */
  services: string[];
  /** Whether the module is currently enabled */
  enabled: boolean;
  /** Feature flags required for this module to function */
  requiredFeatures?: (keyof FeatureFlags)[];
  /** Optional feature flags that enhance this module */
  optionalFeatures?: (keyof FeatureFlags)[];
  /** Module priority for loading order (higher = loaded first) */
  priority?: number;
  /** Module category for organization */
  category?: 'core' | 'feature' | 'integration' | 'experimental';
  /** Module author/maintainer information */
  author?: string;
  /** Module license */
  license?: string;
  /** Minimum system requirements */
  requirements?: {
    nodeVersion?: string;
    memoryMB?: number;
    features?: string[];
  };
}

/**
 * Module metadata with runtime information
 */
export interface ModuleMetadata {
  /** Module configuration */
  config: ModuleConfig;
  /** When the module was loaded */
  loadedAt: Date;
  /** Current module status */
  status: 'loading' | 'loaded' | 'error' | 'disabled' | 'unloading';
  /** Error message if status is 'error' */
  error?: string;
  /** Performance metrics */
  metrics?: {
    /** Time taken to load the module (ms) */
    loadTime?: number;
    /** Memory usage (bytes) */
    memoryUsage?: number;
    /** Number of times module was accessed */
    accessCount?: number;
    /** Last access timestamp */
    lastAccessed?: Date;
  };
  /** Health check results */
  health?: {
    /** Overall health status */
    status: 'healthy' | 'degraded' | 'unhealthy';
    /** Last health check timestamp */
    lastCheck: Date;
    /** Health check details */
    details?: Record<string, any>;
  };
}

/**
 * Module dependency graph node
 */
interface DependencyNode {
  name: string;
  dependencies: string[];
  dependents: string[];
  level: number;
}

/**
 * Module Registry Events
 */
export type ModuleRegistryEvent = 
  | 'module:registered'
  | 'module:enabled'
  | 'module:disabled'
  | 'module:error'
  | 'module:health-check'
  | 'registry:ready';

/**
 * Event listener function type
 */
export type ModuleEventListener = (event: {
  type: ModuleRegistryEvent;
  moduleName?: string;
  data?: any;
  timestamp: Date;
}) => void;

/**
 * Module Registry Class
 * 
 * Central registry for managing application modules with dependency resolution,
 * feature flag integration, and runtime control capabilities.
 */
export class ModuleRegistry {
  private modules = new Map<string, ModuleMetadata>();
  private dependencies = new Map<string, string[]>();
  private dependents = new Map<string, string[]>();
  private eventListeners = new Map<ModuleRegistryEvent, ModuleEventListener[]>();
  private isReady = false;

  constructor() {
    this.initializeRegistry();
  }

  /**
   * Initialize the registry
   */
  private initializeRegistry(): void {
    // Set up core event listeners
    this.addEventListener('module:error', (event) => {
      console.error(`Module error in ${event.moduleName}:`, event.data);
    });

    this.addEventListener('module:enabled', (event) => {
      console.log(`Module enabled: ${event.moduleName}`);
    });

    this.addEventListener('module:disabled', (event) => {
      console.log(`Module disabled: ${event.moduleName}`);
    });

    this.isReady = true;
    this.emitEvent('registry:ready', undefined, { registryVersion: '1.0.0' });
  }

  /**
   * Register a new module
   */
  register(config: ModuleConfig): void {
    const startTime = Date.now();

    try {
      // Validate module configuration
      this.validateModuleConfig(config);

      // Check for duplicate registration
      if (this.modules.has(config.name)) {
        throw new Error(`Module ${config.name} is already registered`);
      }

      // Validate dependencies exist
      for (const dep of config.dependencies) {
        if (!this.modules.has(dep)) {
          throw new Error(`Dependency ${dep} not found for module ${config.name}`);
        }
      }

      // Check circular dependencies
      this.checkCircularDependencies(config.name, config.dependencies);

      // Check feature requirements
      if (config.requiredFeatures) {
        for (const feature of config.requiredFeatures) {
          if (!isFeatureEnabled(feature)) {
            config.enabled = false;
            console.warn(`Module ${config.name} disabled: required feature ${feature} is not enabled`);
            break;
          }
        }
      }

      // Create module metadata
      const metadata: ModuleMetadata = {
        config: { ...config },
        loadedAt: new Date(),
        status: config.enabled ? 'loaded' : 'disabled',
        metrics: {
          loadTime: Date.now() - startTime,
          memoryUsage: this.estimateMemoryUsage(config),
          accessCount: 0,
          lastAccessed: new Date(),
        },
        health: {
          status: 'healthy',
          lastCheck: new Date(),
          details: {
            dependenciesResolved: true,
            featuresAvailable: this.checkOptionalFeatures(config),
          },
        },
      };

      // Register the module
      this.modules.set(config.name, metadata);
      this.dependencies.set(config.name, config.dependencies);

      // Update dependents mapping
      for (const dep of config.dependencies) {
        if (!this.dependents.has(dep)) {
          this.dependents.set(dep, []);
        }
        this.dependents.get(dep)!.push(config.name);
      }

      // Emit registration event
      this.emitEvent('module:registered', config.name, {
        version: config.version,
        dependencies: config.dependencies,
        enabled: config.enabled,
      });

      console.log(`Module registered: ${config.name} v${config.version} (${metadata.metrics?.loadTime}ms)`);
    } catch (error) {
      console.error(`Failed to register module ${config.name}:`, error);
      
      // Create error metadata
      const errorMetadata: ModuleMetadata = {
        config,
        loadedAt: new Date(),
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        metrics: {
          loadTime: Date.now() - startTime,
        },
      };

      this.modules.set(config.name, errorMetadata);
      this.emitEvent('module:error', config.name, { error: error instanceof Error ? error.message : String(error) });
      
      throw error;
    }
  }

  /**
   * Check if a module is enabled
   */
  isEnabled(moduleName: string): boolean {
    const module = this.modules.get(moduleName);
    if (!module) return false;

    // Update access metrics
    if (module.metrics) {
      module.metrics.accessCount = (module.metrics.accessCount || 0) + 1;
      module.metrics.lastAccessed = new Date();
    }

    return module.config.enabled && module.status === 'loaded';
  }

  /**
   * Get module metadata
   */
  getModule(name: string): ModuleMetadata | undefined {
    return this.modules.get(name);
  }

  /**
   * Get all registered modules
   */
  getAllModules(): ModuleMetadata[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get enabled modules only
   */
  getEnabledModules(): ModuleMetadata[] {
    return this.getAllModules().filter(m => m.config.enabled && m.status === 'loaded');
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: ModuleConfig['category']): ModuleMetadata[] {
    return this.getAllModules().filter(m => m.config.category === category);
  }

  /**
   * Get module dependencies
   */
  getDependencies(moduleName: string): string[] {
    return this.dependencies.get(moduleName) ?? [];
  }

  /**
   * Get modules that depend on the given module
   */
  getDependents(moduleName: string): string[] {
    return this.dependents.get(moduleName) ?? [];
  }

  /**
   * Check if a module can be safely disabled
   */
  canDisable(moduleName: string): boolean {
    const dependents = this.getDependents(moduleName);
    
    // Check if any enabled modules depend on this one
    for (const dependent of dependents) {
      if (this.isEnabled(dependent)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Enable a module
   */
  enable(moduleName: string): boolean {
    const module = this.modules.get(moduleName);
    if (!module) {
      console.error(`Module ${moduleName} not found`);
      return false;
    }

    // Check if already enabled
    if (module.config.enabled && module.status === 'loaded') {
      return true;
    }

    // Check dependencies are enabled
    for (const dep of module.config.dependencies) {
      if (!this.isEnabled(dep)) {
        console.error(`Cannot enable ${moduleName}: dependency ${dep} is not enabled`);
        return false;
      }
    }

    // Check required features
    if (module.config.requiredFeatures) {
      for (const feature of module.config.requiredFeatures) {
        if (!isFeatureEnabled(feature)) {
          console.error(`Cannot enable ${moduleName}: required feature ${feature} is not enabled`);
          return false;
        }
      }
    }

    // Enable the module
    module.config.enabled = true;
    module.status = 'loaded';
    module.health = {
      status: 'healthy',
      lastCheck: new Date(),
      details: {
        dependenciesResolved: true,
        featuresAvailable: this.checkOptionalFeatures(module.config),
      },
    };

    this.emitEvent('module:enabled', moduleName, {
      version: module.config.version,
      dependencies: module.config.dependencies,
    });

    return true;
  }

  /**
   * Disable a module
   */
  disable(moduleName: string): boolean {
    if (!this.canDisable(moduleName)) {
      console.error(`Cannot disable ${moduleName}: other modules depend on it`);
      return false;
    }

    const module = this.modules.get(moduleName);
    if (!module) {
      console.error(`Module ${moduleName} not found`);
      return false;
    }

    module.config.enabled = false;
    module.status = 'disabled';

    this.emitEvent('module:disabled', moduleName, {
      version: module.config.version,
      reason: 'manual',
    });

    return true;
  }

  /**
   * Perform health check on all modules
   */
  async performHealthCheck(): Promise<Map<string, ModuleMetadata['health']>> {
    const results = new Map<string, ModuleMetadata['health']>();

    for (const [name, module] of this.modules.entries()) {
      if (!module.config.enabled) continue;

      try {
        const health = await this.checkModuleHealth(module);
        module.health = health;
        results.set(name, health);

        this.emitEvent('module:health-check', name, health);
      } catch (error) {
        const errorHealth = {
          status: 'unhealthy' as const,
          lastCheck: new Date(),
          details: { error: error instanceof Error ? error.message : String(error) },
        };
        
        module.health = errorHealth;
        results.set(name, errorHealth);
      }
    }

    return results;
  }

  /**
   * Get registry statistics
   */
  getStatistics(): {
    total: number;
    enabled: number;
    disabled: number;
    errors: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    totalMemoryUsage: number;
    averageLoadTime: number;
  } {
    const modules = this.getAllModules();
    const enabled = modules.filter(m => m.config.enabled && m.status === 'loaded').length;
    const disabled = modules.filter(m => !m.config.enabled || m.status === 'disabled').length;
    const errors = modules.filter(m => m.status === 'error').length;

    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalMemoryUsage = 0;
    let totalLoadTime = 0;
    let loadTimeCount = 0;

    modules.forEach(module => {
      // Category stats
      const category = module.config.category || 'unknown';
      byCategory[category] = (byCategory[category] || 0) + 1;

      // Status stats
      byStatus[module.status] = (byStatus[module.status] || 0) + 1;

      // Memory and performance stats
      if (module.metrics?.memoryUsage) {
        totalMemoryUsage += module.metrics.memoryUsage;
      }
      if (module.metrics?.loadTime) {
        totalLoadTime += module.metrics.loadTime;
        loadTimeCount++;
      }
    });

    return {
      total: modules.length,
      enabled,
      disabled,
      errors,
      byCategory,
      byStatus,
      totalMemoryUsage,
      averageLoadTime: loadTimeCount > 0 ? totalLoadTime / loadTimeCount : 0,
    };
  }

  /**
   * Add event listener
   */
  addEventListener(event: ModuleRegistryEvent, listener: ModuleEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: ModuleRegistryEvent, listener: ModuleEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  private emitEvent(type: ModuleRegistryEvent, moduleName?: string, data?: any): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const event = {
        type,
        moduleName,
        data,
        timestamp: new Date(),
      };

      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Validate module configuration
   */
  private validateModuleConfig(config: ModuleConfig): void {
    if (!config.name || typeof config.name !== 'string') {
      throw new Error('Module name is required and must be a string');
    }

    if (!config.version || typeof config.version !== 'string') {
      throw new Error('Module version is required and must be a string');
    }

    if (!Array.isArray(config.dependencies)) {
      throw new Error('Module dependencies must be an array');
    }

    if (!Array.isArray(config.routes)) {
      throw new Error('Module routes must be an array');
    }

    if (!Array.isArray(config.components)) {
      throw new Error('Module components must be an array');
    }

    if (!Array.isArray(config.services)) {
      throw new Error('Module services must be an array');
    }

    if (typeof config.enabled !== 'boolean') {
      throw new Error('Module enabled flag must be a boolean');
    }
  }

  /**
   * Check for circular dependencies
   */
  private checkCircularDependencies(moduleName: string, dependencies: string[]): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (name: string): boolean => {
      if (recursionStack.has(name)) {
        return true;
      }

      if (visited.has(name)) {
        return false;
      }

      visited.add(name);
      recursionStack.add(name);

      const deps = name === moduleName ? dependencies : this.dependencies.get(name) || [];
      for (const dep of deps) {
        if (hasCycle(dep)) {
          return true;
        }
      }

      recursionStack.delete(name);
      return false;
    };

    if (hasCycle(moduleName)) {
      throw new Error(`Circular dependency detected for module ${moduleName}`);
    }
  }

  /**
   * Check optional features availability
   */
  private checkOptionalFeatures(config: ModuleConfig): Record<string, boolean> {
    const features: Record<string, boolean> = {};
    
    if (config.optionalFeatures) {
      for (const feature of config.optionalFeatures) {
        features[feature] = isFeatureEnabled(feature);
      }
    }

    return features;
  }

  /**
   * Estimate memory usage for a module
   */
  private estimateMemoryUsage(config: ModuleConfig): number {
    // Simple estimation based on module complexity
    let estimate = 1024; // Base 1KB

    estimate += config.routes.length * 512; // 512 bytes per route
    estimate += config.components.length * 2048; // 2KB per component
    estimate += config.services.length * 4096; // 4KB per service
    estimate += config.dependencies.length * 256; // 256 bytes per dependency

    return estimate;
  }

  /**
   * Check individual module health
   */
  private async checkModuleHealth(module: ModuleMetadata): Promise<ModuleMetadata['health']> {
    const startTime = Date.now();
    
    try {
      // Check dependencies are still enabled
      for (const dep of module.config.dependencies) {
        if (!this.isEnabled(dep)) {
          return {
            status: 'unhealthy',
            lastCheck: new Date(),
            details: {
              error: `Dependency ${dep} is not enabled`,
              checkDuration: Date.now() - startTime,
            },
          };
        }
      }

      // Check required features are still enabled
      if (module.config.requiredFeatures) {
        for (const feature of module.config.requiredFeatures) {
          if (!isFeatureEnabled(feature)) {
            return {
              status: 'degraded',
              lastCheck: new Date(),
              details: {
                warning: `Required feature ${feature} is not enabled`,
                checkDuration: Date.now() - startTime,
              },
            };
          }
        }
      }

      return {
        status: 'healthy',
        lastCheck: new Date(),
        details: {
          dependenciesResolved: true,
          featuresAvailable: this.checkOptionalFeatures(module.config),
          checkDuration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        details: {
          error: error instanceof Error ? error.message : String(error),
          checkDuration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Clear all registry data (for testing purposes)
   * Resets the registry to its initial state
   */
  clear(): void {
    this.modules.clear();
    this.dependencies.clear();
    this.dependents.clear();
    this.eventListeners.clear();
    this.isReady = false;

    // Re-initialize the registry
    this.initializeRegistry();
  }
}

// Global registry instance
export const moduleRegistry = new ModuleRegistry();
