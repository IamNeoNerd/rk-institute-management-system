/**
 * Performance Monitor - Advanced Performance Tracking System
 *
 * Comprehensive performance monitoring solution for RK Institute Management System.
 * Tracks Core Web Vitals, API performance, component render times, and user interactions.
 *
 * Features:
 * - Real-time Core Web Vitals monitoring (LCP, FID, CLS)
 * - API response time tracking
 * - Component render performance analysis
 * - Memory usage monitoring
 * - User interaction tracking
 * - Performance alerts and reporting
 * - Integration with analytics platforms
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
  sessionId: string;
}

interface CoreWebVitals {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
}

interface APIPerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
  size?: number;
}

interface ComponentPerformanceMetric {
  componentName: string;
  renderTime: number;
  propsCount: number;
  reRenderCount: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private apiMetrics: APIPerformanceMetric[] = [];
  private componentMetrics: ComponentPerformanceMetric[] = [];
  private sessionId: string;
  private isEnabled: boolean;
  private observer?: PerformanceObserver;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled =
      typeof window !== 'undefined' && process.env.NODE_ENV === 'production';

    if (this.isEnabled) {
      this.initializeMonitoring();
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    // Monitor Core Web Vitals
    this.initializeCoreWebVitals();

    // Monitor navigation timing
    this.initializeNavigationTiming();

    // Monitor resource loading
    this.initializeResourceTiming();

    // Monitor long tasks
    this.initializeLongTaskMonitoring();

    // Monitor memory usage
    this.initializeMemoryMonitoring();
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private initializeCoreWebVitals(): void {
    if ('web-vitals' in window) {
      // Use web-vitals library if available
      import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS(this.onCLS.bind(this));
        onINP(this.onFID.bind(this)); // INP replaced FID in web-vitals v3
        onFCP(this.onFCP.bind(this));
        onLCP(this.onLCP.bind(this));
        onTTFB(this.onTTFB.bind(this));
      });
    } else {
      // Fallback to Performance Observer
      this.initializePerformanceObserver();
    }
  }

  /**
   * Initialize Performance Observer for manual tracking
   */
  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      try {
        this.observer.observe({
          entryTypes: [
            'navigation',
            'resource',
            'paint',
            'largest-contentful-paint'
          ]
        });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  /**
   * Process performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        this.handleNavigationEntry(entry as PerformanceNavigationTiming);
        break;
      case 'resource':
        this.handleResourceEntry(entry as PerformanceResourceTiming);
        break;
      case 'paint':
        this.handlePaintEntry(entry);
        break;
      case 'largest-contentful-paint':
        this.handleLCPEntry(entry);
        break;
    }
  }

  /**
   * Handle navigation timing
   */
  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    const metrics = {
      domContentLoaded:
        entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domInteractive:
        entry.domInteractive - (entry.activationStart || entry.fetchStart),
      ttfb: entry.responseStart - entry.requestStart
    };

    Object.entries(metrics).forEach(([name, value]) => {
      this.recordMetric(name, value);
    });
  }

  /**
   * Handle resource timing
   */
  private handleResourceEntry(entry: PerformanceResourceTiming): void {
    // Track slow resources (> 1 second)
    if (entry.duration > 1000) {
      this.recordMetric('slow-resource', entry.duration, {
        resourceName: entry.name,
        resourceType: this.getResourceType(entry.name)
      });
    }
  }

  /**
   * Core Web Vitals handlers
   */
  private onCLS(metric: any): void {
    this.recordMetric('CLS', metric.value);
  }

  private onFID(metric: any): void {
    this.recordMetric('FID', metric.value);
  }

  private onFCP(metric: any): void {
    this.recordMetric('FCP', metric.value);
  }

  private onLCP(metric: any): void {
    this.recordMetric('LCP', metric.value);
  }

  private onTTFB(metric: any): void {
    this.recordMetric('TTFB', metric.value);
  }

  private handlePaintEntry(entry: PerformanceEntry): void {
    this.recordMetric(entry.name, entry.startTime);
  }

  private handleLCPEntry(entry: PerformanceEntry): void {
    this.recordMetric('LCP', entry.startTime);
  }

  /**
   * Initialize navigation timing monitoring
   */
  private initializeNavigationTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.handleNavigationEntry(navigation);
        }
      }, 0);
    });
  }

  /**
   * Initialize resource timing monitoring
   */
  private initializeResourceTiming(): void {
    // Monitor resource loading performance
    setInterval(() => {
      const resources = performance.getEntriesByType('resource');
      resources.forEach(resource => {
        this.handleResourceEntry(resource as PerformanceResourceTiming);
      });
      performance.clearResourceTimings();
    }, 30000); // Clear every 30 seconds to prevent memory leaks
  }

  /**
   * Initialize long task monitoring
   */
  private initializeLongTaskMonitoring(): void {
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            this.recordMetric('long-task', entry.duration, {
              startTime: entry.startTime
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task monitoring not supported:', error);
      }
    }
  }

  /**
   * Initialize memory monitoring
   */
  private initializeMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('memory-used', memory.usedJSHeapSize);
        this.recordMetric('memory-total', memory.totalJSHeapSize);
        this.recordMetric('memory-limit', memory.jsHeapSizeLimit);
      }, 60000); // Check every minute
    }
  }

  /**
   * Track API performance
   */
  public trackAPICall(
    endpoint: string,
    method: string,
    startTime: number,
    endTime: number,
    statusCode: number,
    responseSize?: number
  ): void {
    const responseTime = endTime - startTime;

    this.apiMetrics.push({
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: Date.now(),
      size: responseSize
    });

    // Alert on slow API calls (> 2 seconds)
    if (responseTime > 2000) {
      this.recordMetric('slow-api-call', responseTime, {
        endpoint,
        method,
        statusCode
      });
    }
  }

  /**
   * Track component performance
   */
  public trackComponentRender(
    componentName: string,
    renderTime: number,
    propsCount: number,
    reRenderCount: number = 1
  ): void {
    this.componentMetrics.push({
      componentName,
      renderTime,
      propsCount,
      reRenderCount,
      timestamp: Date.now()
    });

    // Alert on slow component renders (> 16ms for 60fps)
    if (renderTime > 16) {
      this.recordMetric('slow-component-render', renderTime, {
        componentName,
        propsCount,
        reRenderCount
      });
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, value: number, metadata?: any): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId
    };

    this.metrics.push(metric);

    // Send to analytics if configured
    this.sendToAnalytics(metric, metadata);

    // Check for performance alerts
    this.checkPerformanceAlerts(metric);
  }

  /**
   * Send metrics to analytics platform
   */
  private sendToAnalytics(metric: PerformanceMetric, metadata?: any): void {
    // Integration with Google Analytics 4
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        session_id: metric.sessionId,
        ...metadata
      });
    }

    // Integration with custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric, metadata })
      }).catch(console.error);
    }
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metric: PerformanceMetric): void {
    const alerts: Record<string, number> = {
      LCP: 2500, // > 2.5s is poor
      FID: 100, // > 100ms is poor
      CLS: 0.25, // > 0.25 is poor
      TTFB: 800, // > 800ms is slow
      'slow-api-call': 2000,
      'slow-component-render': 16
    };

    const threshold = alerts[metric.name];
    if (threshold && metric.value > threshold) {
      console.warn(
        `Performance Alert: ${metric.name} = ${metric.value}ms (threshold: ${threshold}ms)`
      );

      // Send alert to monitoring service
      this.sendPerformanceAlert(metric);
    }
  }

  /**
   * Send performance alert
   */
  private sendPerformanceAlert(metric: PerformanceMetric): void {
    // Integration with monitoring services (Sentry, LogRocket, etc.)
    if (typeof (window as any).Sentry !== 'undefined') {
      (window as any).Sentry.addBreadcrumb({
        message: `Performance Alert: ${metric.name}`,
        level: 'warning',
        data: metric
      });
    }
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): any {
    const now = Date.now();
    const last5Minutes = now - 5 * 60 * 1000;

    const recentMetrics = this.metrics.filter(m => m.timestamp > last5Minutes);
    const recentAPIMetrics = this.apiMetrics.filter(
      m => m.timestamp > last5Minutes
    );
    const recentComponentMetrics = this.componentMetrics.filter(
      m => m.timestamp > last5Minutes
    );

    return {
      coreWebVitals: this.getCoreWebVitalsSummary(recentMetrics),
      apiPerformance: this.getAPIPerformanceSummary(recentAPIMetrics),
      componentPerformance: this.getComponentPerformanceSummary(
        recentComponentMetrics
      ),
      totalMetrics: recentMetrics.length,
      sessionId: this.sessionId
    };
  }

  /**
   * Helper methods
   */
  private getCoreWebVitalsSummary(metrics: PerformanceMetric[]): CoreWebVitals {
    const vitals: CoreWebVitals = {};

    ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].forEach(vital => {
      const metric = metrics.find(m => m.name === vital);
      if (metric) vitals[vital as keyof CoreWebVitals] = metric.value;
    });

    return vitals;
  }

  private getAPIPerformanceSummary(metrics: APIPerformanceMetric[]): any {
    if (metrics.length === 0) return {};

    const avgResponseTime =
      metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    const slowCalls = metrics.filter(m => m.responseTime > 2000).length;

    return {
      averageResponseTime: avgResponseTime,
      totalCalls: metrics.length,
      slowCalls,
      slowCallPercentage: (slowCalls / metrics.length) * 100
    };
  }

  private getComponentPerformanceSummary(
    metrics: ComponentPerformanceMetric[]
  ): any {
    if (metrics.length === 0) return {};

    const avgRenderTime =
      metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length;
    const slowRenders = metrics.filter(m => m.renderTime > 16).length;

    return {
      averageRenderTime: avgRenderTime,
      totalRenders: metrics.length,
      slowRenders,
      slowRenderPercentage: (slowRenders / metrics.length) * 100
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * Cleanup method
   */
  public cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now();

  return {
    trackRender: (propsCount: number, reRenderCount?: number) => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      performanceMonitor.trackComponentRender(
        componentName,
        renderTime,
        propsCount,
        reRenderCount
      );
    }
  };
}

export default PerformanceMonitor;
