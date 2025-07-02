/**
 * Performance Initialization
 *
 * Centralized initialization for all performance monitoring systems.
 * Sets up monitoring, optimization, and reporting for the entire application.
 *
 * Features:
 * - Automatic performance monitoring setup
 * - Critical resource preloading
 * - Performance optimization configuration
 * - Error tracking integration
 * - Analytics integration
 */

import { apiPerformanceInterceptor } from './APIPerformanceInterceptor';
import { lazyLoadingManager } from './LazyLoadingManager';
import { performanceMonitor } from './PerformanceMonitor';

interface PerformanceConfig {
  enableMonitoring: boolean;
  enableAPIInterception: boolean;
  enableLazyLoading: boolean;
  criticalResources: string[];
  preloadResources: string[];
  analyticsEndpoint?: string;
  errorTrackingEnabled: boolean;
}

class PerformanceInitializer {
  private config: PerformanceConfig;
  private initialized = false;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableMonitoring: true,
      enableAPIInterception: true,
      enableLazyLoading: true,
      criticalResources: [
        '/api/auth/session',
        '/api/dashboard/stats',
        '/_next/static/css/app.css',
        '/_next/static/chunks/main.js'
      ],
      preloadResources: [
        '/api/students',
        '/api/courses',
        '/api/users',
        '/_next/static/chunks/pages.js'
      ],
      errorTrackingEnabled: true,
      ...config
    };
  }

  /**
   * Initialize all performance systems
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('Performance systems already initialized');
      return;
    }

    console.log('🚀 Initializing RK Institute Performance Systems...');

    try {
      // Initialize core monitoring
      if (this.config.enableMonitoring) {
        await this.initializeMonitoring();
      }

      // Initialize API interception
      if (this.config.enableAPIInterception) {
        await this.initializeAPIInterception();
      }

      // Initialize lazy loading
      if (this.config.enableLazyLoading) {
        await this.initializeLazyLoading();
      }

      // Preload critical resources
      await this.preloadCriticalResources();

      // Setup error tracking
      if (this.config.errorTrackingEnabled) {
        await this.initializeErrorTracking();
      }

      // Setup analytics
      if (this.config.analyticsEndpoint) {
        await this.initializeAnalytics();
      }

      // Setup performance optimizations
      await this.setupPerformanceOptimizations();

      this.initialized = true;
      console.log('✅ Performance systems initialized successfully');

      // Report initialization metrics
      this.reportInitializationMetrics();
    } catch (error) {
      console.error('❌ Failed to initialize performance systems:', error);
      throw error;
    }
  }

  /**
   * Initialize performance monitoring
   */
  private async initializeMonitoring(): Promise<void> {
    console.log('📊 Initializing performance monitoring...');

    // Performance monitor is automatically initialized
    // Additional setup can be done here if needed

    // Setup custom performance marks
    this.setupPerformanceMarks();

    console.log('✅ Performance monitoring initialized');
  }

  /**
   * Initialize API performance interception
   */
  private async initializeAPIInterception(): Promise<void> {
    console.log('🔌 Initializing API performance interception...');

    // API interceptor is automatically initialized
    // Additional configuration can be done here

    console.log('✅ API performance interception initialized');
  }

  /**
   * Initialize lazy loading
   */
  private async initializeLazyLoading(): Promise<void> {
    console.log('⚡ Initializing lazy loading systems...');

    // Lazy loading manager is automatically initialized
    // Queue preload resources
    this.config.preloadResources.forEach(resource => {
      lazyLoadingManager.queuePreload(resource, {
        priority: 'low',
        delay: 2000
      });
    });

    console.log('✅ Lazy loading systems initialized');
  }

  /**
   * Preload critical resources
   */
  private async preloadCriticalResources(): Promise<void> {
    console.log('🎯 Preloading critical resources...');

    try {
      // Preload critical resources immediately
      lazyLoadingManager.preloadCritical(this.config.criticalResources);

      // Preload API endpoints
      const criticalAPIs = this.config.criticalResources.filter(url =>
        url.startsWith('/api/')
      );
      await Promise.allSettled(
        criticalAPIs.map(async url => {
          try {
            await fetch(url, { method: 'HEAD' });
          } catch (error) {
            console.warn(`Failed to preload ${url}:`, error);
          }
        })
      );

      console.log('✅ Critical resources preloaded');
    } catch (error) {
      console.warn('⚠️ Some critical resources failed to preload:', error);
    }
  }

  /**
   * Initialize error tracking
   */
  private async initializeErrorTracking(): Promise<void> {
    console.log('🐛 Initializing error tracking...');

    // Global error handler
    window.addEventListener('error', event => {
      this.trackError('JavaScript Error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', event => {
      this.trackError('Unhandled Promise Rejection', event.reason);
    });

    // Performance observer for long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              // Tasks longer than 50ms
              this.trackError(
                'Long Task Detected',
                new Error('Long task blocking main thread'),
                {
                  duration: entry.duration,
                  startTime: entry.startTime
                }
              );
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task monitoring not supported:', error);
      }
    }

    console.log('✅ Error tracking initialized');
  }

  /**
   * Initialize analytics
   */
  private async initializeAnalytics(): Promise<void> {
    console.log('📈 Initializing analytics...');

    // Setup custom analytics tracking
    if (this.config.analyticsEndpoint) {
      // Send initialization event
      await this.sendAnalyticsEvent('performance_init', {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }

    console.log('✅ Analytics initialized');
  }

  /**
   * Setup performance optimizations
   */
  private async setupPerformanceOptimizations(): Promise<void> {
    console.log('⚙️ Setting up performance optimizations...');

    // Optimize images
    this.optimizeImages();

    // Setup service worker for caching
    await this.setupServiceWorker();

    // Optimize fonts
    this.optimizeFonts();

    // Setup resource hints
    this.setupResourceHints();

    console.log('✅ Performance optimizations configured');
  }

  /**
   * Setup performance marks
   */
  private setupPerformanceMarks(): void {
    // Mark application start
    performance.mark('app-start');

    // Mark when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        performance.mark('dom-ready');
      });
    } else {
      performance.mark('dom-ready');
    }

    // Mark when page is fully loaded
    window.addEventListener('load', () => {
      performance.mark('page-loaded');
      performance.measure('app-load-time', 'app-start', 'page-loaded');
    });
  }

  /**
   * Optimize images
   */
  private optimizeImages(): void {
    // Add loading="lazy" to images that don't have it
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      (img as HTMLImageElement).loading = 'lazy';
    });
  }

  /**
   * Setup service worker
   */
  private async setupServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker registered successfully');
      } catch (error) {
        console.warn('Service worker registration failed:', error);
      }
    }
  }

  /**
   * Optimize fonts
   */
  private optimizeFonts(): void {
    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      '/fonts/inter-var-latin.woff2'
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  /**
   * Setup resource hints
   */
  private setupResourceHints(): void {
    // DNS prefetch for external domains
    const externalDomains = ['fonts.googleapis.com', 'fonts.gstatic.com'];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  /**
   * Track error
   */
  private trackError(type: string, error: any, metadata?: any): void {
    const errorData = {
      type,
      message: error?.message || String(error),
      stack: error?.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...metadata
    };

    // Send to analytics
    if (this.config.analyticsEndpoint) {
      this.sendAnalyticsEvent('error', errorData);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${type}]`, error, metadata);
    }
  }

  /**
   * Send analytics event
   */
  private async sendAnalyticsEvent(event: string, data: any): Promise<void> {
    if (!this.config.analyticsEndpoint) return;

    try {
      await fetch(this.config.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data })
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  /**
   * Report initialization metrics
   */
  private reportInitializationMetrics(): void {
    const metrics = {
      monitoring: this.config.enableMonitoring,
      apiInterception: this.config.enableAPIInterception,
      lazyLoading: this.config.enableLazyLoading,
      criticalResourcesCount: this.config.criticalResources.length,
      preloadResourcesCount: this.config.preloadResources.length,
      initializationTime: performance.now()
    };

    console.log('📊 Performance initialization metrics:', metrics);

    // Send to analytics
    if (this.config.analyticsEndpoint) {
      this.sendAnalyticsEvent('performance_init_complete', metrics);
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}

// Create singleton instance
export const performanceInit = new PerformanceInitializer();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceInit.initialize().catch(console.error);
    });
  } else {
    performanceInit.initialize().catch(console.error);
  }
}

export default PerformanceInitializer;
