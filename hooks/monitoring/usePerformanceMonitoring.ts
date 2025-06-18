'use client';

import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  cls?: number;  // Cumulative Layout Shift
  fid?: number;  // First Input Delay
  fcp?: number;  // First Contentful Paint
  lcp?: number;  // Largest Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom Metrics
  pageLoadTime?: number;
  memoryUsage?: number;
  renderTime?: number;
  apiResponseTime?: number;
  
  // Error Tracking
  errorCount: number;
  lastError?: string;
  
  // Timestamps
  timestamp: number;
}

interface PerformanceMonitoringState {
  metrics: PerformanceMetrics;
  isMonitoring: boolean;
  history: PerformanceMetrics[];
}

/**
 * Real-time Performance Monitoring Hook (Phase 3)
 * Tracks Core Web Vitals and custom performance metrics
 */
export function usePerformanceMonitoring() {
  const [state, setState] = useState<PerformanceMonitoringState>({
    metrics: {
      errorCount: 0,
      timestamp: Date.now()
    },
    isMonitoring: false,
    history: []
  });

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (typeof window === 'undefined') return;

    setState(prev => ({ ...prev, isMonitoring: true }));

    // Monitor Core Web Vitals (SSR-safe with proper import)
    if (typeof window !== 'undefined') {
      // Dynamic import for web-vitals (SSR-safe)
      import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS((metric) => {
          updateMetric('cls', metric.value);
        });

        onINP((metric) => {
          updateMetric('fid', metric.value); // INP replaces FID in web-vitals v5
        });

        onFCP((metric) => {
          updateMetric('fcp', metric.value);
        });

        onLCP((metric) => {
          updateMetric('lcp', metric.value);
        });

        onTTFB((metric) => {
          updateMetric('ttfb', metric.value);
        });
      }).catch(() => {
        // Fallback if web-vitals is not available
        console.warn('Web Vitals library not available');
      });
    }

    // Monitor memory usage
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      updateMetric('memoryUsage', memoryInfo.usedJSHeapSize / 1024 / 1024); // MB
    }

    // Monitor page load time
    if ('navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming && navTiming.loadEventEnd && navTiming.fetchStart) {
        const loadTime = navTiming.loadEventEnd - navTiming.fetchStart;
        updateMetric('pageLoadTime', loadTime);
      }
    }
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setState(prev => ({ ...prev, isMonitoring: false }));
  }, []);

  // Update specific metric
  const updateMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    setState(prev => {
      const newMetrics = {
        ...prev.metrics,
        [key]: value,
        timestamp: Date.now()
      };

      // Add to history (keep last 50 entries)
      const newHistory = [...prev.history, newMetrics].slice(-50);

      return {
        ...prev,
        metrics: newMetrics,
        history: newHistory
      };
    });
  }, []);

  // Track API response time
  const trackApiCall = useCallback(async (apiCall: () => Promise<any>, endpoint: string) => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      updateMetric('apiResponseTime', responseTime);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      updateMetric('apiResponseTime', responseTime);
      recordError(`API Error on ${endpoint}: ${error}`);
      
      throw error;
    }
  }, [updateMetric]);

  // Record error
  const recordError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        errorCount: prev.metrics.errorCount + 1,
        lastError: error,
        timestamp: Date.now()
      }
    }));
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const { metrics, history } = state;
    
    if (history.length === 0) return null;

    // Calculate averages from history
    const avgMetrics = history.reduce((acc, metric) => {
      Object.keys(metric).forEach(key => {
        if (typeof metric[key as keyof PerformanceMetrics] === 'number' && key !== 'timestamp' && key !== 'errorCount') {
          acc[key] = (acc[key] || 0) + (metric[key as keyof PerformanceMetrics] as number);
        }
      });
      return acc;
    }, {} as Record<string, number>);

    Object.keys(avgMetrics).forEach(key => {
      avgMetrics[key] = avgMetrics[key] / history.length;
    });

    return {
      current: metrics,
      averages: avgMetrics,
      totalErrors: metrics.errorCount,
      dataPoints: history.length,
      isHealthy: metrics.errorCount < 5 && (avgMetrics.lcp || 0) < 2500 // LCP should be < 2.5s
    };
  }, [state]);

  // Auto-start monitoring on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  return {
    metrics: state.metrics,
    isMonitoring: state.isMonitoring,
    history: state.history,
    startMonitoring,
    stopMonitoring,
    trackApiCall,
    recordError,
    getPerformanceSummary
  };
}
