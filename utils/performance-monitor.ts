/**
 * Performance Monitoring Utility
 * 
 * Provides performance tracking and monitoring capabilities for the RK Institute
 * Management System. Tracks component render times, API response times, and
 * user interaction metrics.
 * 
 * Features:
 * - Component render time tracking
 * - API response time monitoring
 * - User interaction metrics
 * - Performance regression detection
 * - Real-time performance alerts
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'render' | 'api' | 'interaction' | 'navigation';
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  componentRender: number; // ms
  apiResponse: number; // ms
  pageLoad: number; // ms
  userInteraction: number; // ms
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThresholds = {
    componentRender: 200,
    apiResponse: 1000,
    pageLoad: 2000,
    userInteraction: 100
  };
  private isEnabled: boolean = true;

  constructor() {
    // Initialize performance observer if available
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializePerformanceObserver();
    }
  }

  /**
   * Initialize Performance Observer for automatic metrics collection
   */
  private initializePerformanceObserver() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordMetric('page-load', entry.duration, 'navigation', {
              url: window.location.href,
              loadEventEnd: (entry as PerformanceNavigationTiming).loadEventEnd
            });
          } else if (entry.entryType === 'measure') {
            this.recordMetric(entry.name, entry.duration, 'render');
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'measure'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string, 
    value: number, 
    type: PerformanceMetric['type'], 
    metadata?: Record<string, any>
  ) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type,
      metadata
    };

    this.metrics.push(metric);
    this.checkThresholds(metric);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Track component render time
   */
  trackComponentRender<T>(componentName: string, renderFn: () => T): T {
    if (!this.isEnabled) return renderFn();

    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    this.recordMetric(
      `component-${componentName}`,
      endTime - startTime,
      'render',
      { componentName }
    );

    return result;
  }

  /**
   * Track API response time
   */
  async trackApiCall<T>(
    apiName: string, 
    apiCall: () => Promise<T>
  ): Promise<T> {
    if (!this.isEnabled) return apiCall();

    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      
      this.recordMetric(
        `api-${apiName}`,
        endTime - startTime,
        'api',
        { apiName, status: 'success' }
      );
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.recordMetric(
        `api-${apiName}`,
        endTime - startTime,
        'api',
        { apiName, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      throw error;
    }
  }

  /**
   * Track user interaction time
   */
  trackInteraction(interactionName: string, duration: number) {
    this.recordMetric(
      `interaction-${interactionName}`,
      duration,
      'interaction',
      { interactionName }
    );
  }

  /**
   * Check if metrics exceed thresholds and log warnings
   */
  private checkThresholds(metric: PerformanceMetric) {
    let threshold: number | undefined;

    if (metric.type === 'render') {
      threshold = this.thresholds.componentRender;
    } else if (metric.type === 'api') {
      threshold = this.thresholds.apiResponse;
    } else if (metric.type === 'navigation') {
      threshold = this.thresholds.pageLoad;
    } else if (metric.type === 'interaction') {
      threshold = this.thresholds.userInteraction;
    }

    if (threshold && metric.value > threshold) {
      console.warn(
        `Performance threshold exceeded: ${metric.name} took ${metric.value.toFixed(2)}ms (threshold: ${threshold}ms)`,
        metric
      );
    }
  }

  /**
   * Get performance summary
   */
  getSummary(timeRange?: number): {
    totalMetrics: number;
    averageRenderTime: number;
    averageApiTime: number;
    slowestComponents: Array<{ name: string; avgTime: number }>;
    slowestApis: Array<{ name: string; avgTime: number }>;
    thresholdViolations: number;
  } {
    const cutoffTime = timeRange ? Date.now() - timeRange : 0;
    const relevantMetrics = this.metrics.filter(m => m.timestamp > cutoffTime);

    const renderMetrics = relevantMetrics.filter(m => m.type === 'render');
    const apiMetrics = relevantMetrics.filter(m => m.type === 'api');

    // Calculate averages
    const averageRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length
      : 0;

    const averageApiTime = apiMetrics.length > 0
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length
      : 0;

    // Find slowest components
    const componentTimes = new Map<string, number[]>();
    renderMetrics.forEach(m => {
      if (!componentTimes.has(m.name)) {
        componentTimes.set(m.name, []);
      }
      componentTimes.get(m.name)!.push(m.value);
    });

    const slowestComponents = Array.from(componentTimes.entries())
      .map(([name, times]) => ({
        name,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    // Find slowest APIs
    const apiTimes = new Map<string, number[]>();
    apiMetrics.forEach(m => {
      if (!apiTimes.has(m.name)) {
        apiTimes.set(m.name, []);
      }
      apiTimes.get(m.name)!.push(m.value);
    });

    const slowestApis = Array.from(apiTimes.entries())
      .map(([name, times]) => ({
        name,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    // Count threshold violations
    const thresholdViolations = relevantMetrics.filter(m => {
      if (m.type === 'render') return m.value > this.thresholds.componentRender;
      if (m.type === 'api') return m.value > this.thresholds.apiResponse;
      if (m.type === 'navigation') return m.value > this.thresholds.pageLoad;
      if (m.type === 'interaction') return m.value > this.thresholds.userInteraction;
      return false;
    }).length;

    return {
      totalMetrics: relevantMetrics.length,
      averageRenderTime,
      averageApiTime,
      slowestComponents,
      slowestApis,
      thresholdViolations
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<PerformanceThresholds>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Get current thresholds
   */
  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// React hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  const trackRender = (renderFn: () => any) => {
    return performanceMonitor.trackComponentRender(componentName, renderFn);
  };

  const trackInteraction = (interactionName: string, duration: number) => {
    performanceMonitor.trackInteraction(`${componentName}-${interactionName}`, duration);
  };

  return { trackRender, trackInteraction };
}

// Higher-order component for automatic performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: any,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    return performanceMonitor.trackComponentRender(componentName, () => {
      // This would need React import in actual implementation
      return null; // Placeholder for React component
    });
  };
}

export default performanceMonitor;
