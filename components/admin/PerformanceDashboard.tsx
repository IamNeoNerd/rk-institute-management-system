/**
 * Performance Dashboard Component
 *
 * Real-time performance monitoring dashboard for administrators.
 * Displays Core Web Vitals, API performance, component metrics, and system health.
 *
 * Features:
 * - Real-time Core Web Vitals monitoring
 * - API performance analytics
 * - Component render performance
 * - Memory usage tracking
 * - Performance alerts and recommendations
 * - Historical performance trends
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';
import { apiPerformanceInterceptor } from '@/lib/performance/APIPerformanceInterceptor';
import { lazyLoadingManager } from '@/lib/performance/LazyLoadingManager';
import { performanceMonitor } from '@/lib/performance/PerformanceMonitor';

interface PerformanceMetrics {
  coreWebVitals: {
    LCP?: number;
    FID?: number;
    CLS?: number;
    FCP?: number;
    TTFB?: number;
  };
  apiPerformance: {
    averageResponseTime: number;
    totalCalls: number;
    slowCalls: number;
    slowCallPercentage: number;
  };
  componentPerformance: {
    averageRenderTime: number;
    totalRenders: number;
    slowRenders: number;
    slowRenderPercentage: number;
  };
  systemHealth: {
    memoryUsage?: number;
    activeRequests: number;
    cachedResources: number;
  };
}

interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  /**
   * Fetch performance metrics
   */
  const fetchMetrics = useCallback(async () => {
    try {
      const summary = performanceMonitor.getPerformanceSummary();
      const apiStats = apiPerformanceInterceptor.getStatistics();
      const lazyStats = lazyLoadingManager.getStatistics();

      const newMetrics: PerformanceMetrics = {
        coreWebVitals: summary.coreWebVitals || {},
        apiPerformance: summary.apiPerformance || {
          averageResponseTime: 0,
          totalCalls: 0,
          slowCalls: 0,
          slowCallPercentage: 0
        },
        componentPerformance: summary.componentPerformance || {
          averageRenderTime: 0,
          totalRenders: 0,
          slowRenders: 0,
          slowRenderPercentage: 0
        },
        systemHealth: {
          memoryUsage: (performance as any).memory?.usedJSHeapSize,
          activeRequests: apiStats.activeRequests || 0,
          cachedResources:
            apiStats.cachedResponses + lazyStats.cachedImages || 0
        }
      };

      setMetrics(newMetrics);
      checkForAlerts(newMetrics);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    }
  }, []);

  /**
   * Check for performance alerts
   */
  const checkForAlerts = (metrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];
    const now = Date.now();

    // Core Web Vitals alerts
    if (metrics.coreWebVitals.LCP && metrics.coreWebVitals.LCP > 2500) {
      newAlerts.push({
        type: 'warning',
        metric: 'LCP',
        value: metrics.coreWebVitals.LCP,
        threshold: 2500,
        message: 'Largest Contentful Paint is slower than recommended',
        timestamp: now
      });
    }

    if (metrics.coreWebVitals.FID && metrics.coreWebVitals.FID > 100) {
      newAlerts.push({
        type: 'warning',
        metric: 'FID',
        value: metrics.coreWebVitals.FID,
        threshold: 100,
        message: 'First Input Delay is higher than recommended',
        timestamp: now
      });
    }

    if (metrics.coreWebVitals.CLS && metrics.coreWebVitals.CLS > 0.25) {
      newAlerts.push({
        type: 'error',
        metric: 'CLS',
        value: metrics.coreWebVitals.CLS,
        threshold: 0.25,
        message: 'Cumulative Layout Shift is causing poor user experience',
        timestamp: now
      });
    }

    // API performance alerts
    if (metrics.apiPerformance.slowCallPercentage > 20) {
      newAlerts.push({
        type: 'warning',
        metric: 'API Performance',
        value: metrics.apiPerformance.slowCallPercentage,
        threshold: 20,
        message: 'High percentage of slow API calls detected',
        timestamp: now
      });
    }

    // Component performance alerts
    if (metrics.componentPerformance.slowRenderPercentage > 15) {
      newAlerts.push({
        type: 'warning',
        metric: 'Component Performance',
        value: metrics.componentPerformance.slowRenderPercentage,
        threshold: 15,
        message: 'High percentage of slow component renders detected',
        timestamp: now
      });
    }

    // Memory usage alerts
    if (
      metrics.systemHealth.memoryUsage &&
      metrics.systemHealth.memoryUsage > 50 * 1024 * 1024
    ) {
      newAlerts.push({
        type: 'warning',
        metric: 'Memory Usage',
        value: metrics.systemHealth.memoryUsage,
        threshold: 50 * 1024 * 1024,
        message: 'High memory usage detected',
        timestamp: now
      });
    }

    setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Keep last 10 alerts
  };

  /**
   * Format metric value for display
   */
  const formatMetricValue = (
    value: number | undefined,
    unit: string = 'ms'
  ): string => {
    if (value === undefined) return 'N/A';

    if (unit === 'ms') {
      return `${Math.round(value)}ms`;
    } else if (unit === 'bytes') {
      return `${(value / 1024 / 1024).toFixed(1)}MB`;
    } else if (unit === '%') {
      return `${Math.round(value)}%`;
    }

    return value.toString();
  };

  /**
   * Get metric status color
   */
  const getMetricStatus = (
    value: number | undefined,
    thresholds: { good: number; poor: number }
  ): string => {
    if (value === undefined) return 'text-gray-500';
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Toggle monitoring
   */
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  /**
   * Clear alerts
   */
  const clearAlerts = () => {
    setAlerts([]);
  };

  // Setup monitoring interval
  useEffect(() => {
    if (!isMonitoring) return;

    fetchMetrics(); // Initial fetch
    const interval = setInterval(fetchMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval, fetchMetrics]);

  if (!metrics) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <ProfessionalIcon
            name='analytics'
            size={48}
            className='mx-auto text-gray-400 mb-4'
          />
          <p className='text-gray-600'>Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Performance Dashboard
          </h1>
          <p className='text-gray-600'>
            Real-time system performance monitoring
          </p>
        </div>

        <div className='flex items-center space-x-4'>
          <select
            value={refreshInterval}
            onChange={e => setRefreshInterval(Number(e.target.value))}
            className='px-3 py-2 border border-gray-300 rounded-lg text-sm'
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>

          <button
            onClick={toggleMonitoring}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isMonitoring
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='flex items-center'>
              <ProfessionalIcon
                name='warning'
                size={20}
                className='mr-2 text-yellow-600'
              />
              Performance Alerts
            </CardTitle>
            <button
              onClick={clearAlerts}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              Clear All
            </button>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {alerts.slice(0, 5).map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'error'
                      ? 'bg-red-50 border-red-400'
                      : alert.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium text-gray-900'>
                        {alert.metric}
                      </p>
                      <p className='text-sm text-gray-600'>{alert.message}</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-mono text-sm'>
                        {formatMetricValue(
                          alert.value,
                          alert.metric.includes('Memory') ? 'bytes' : 'ms'
                        )}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Core Web Vitals */}
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              LCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              <span
                className={getMetricStatus(metrics.coreWebVitals.LCP, {
                  good: 2500,
                  poor: 4000
                })}
              >
                {formatMetricValue(metrics.coreWebVitals.LCP)}
              </span>
            </div>
            <p className='text-xs text-gray-500 mt-1'>
              Largest Contentful Paint
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              FID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              <span
                className={getMetricStatus(metrics.coreWebVitals.FID, {
                  good: 100,
                  poor: 300
                })}
              >
                {formatMetricValue(metrics.coreWebVitals.FID)}
              </span>
            </div>
            <p className='text-xs text-gray-500 mt-1'>First Input Delay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              CLS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              <span
                className={getMetricStatus(metrics.coreWebVitals.CLS, {
                  good: 0.1,
                  poor: 0.25
                })}
              >
                {metrics.coreWebVitals.CLS?.toFixed(3) || 'N/A'}
              </span>
            </div>
            <p className='text-xs text-gray-500 mt-1'>
              Cumulative Layout Shift
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              FCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              <span
                className={getMetricStatus(metrics.coreWebVitals.FCP, {
                  good: 1800,
                  poor: 3000
                })}
              >
                {formatMetricValue(metrics.coreWebVitals.FCP)}
              </span>
            </div>
            <p className='text-xs text-gray-500 mt-1'>First Contentful Paint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              TTFB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              <span
                className={getMetricStatus(metrics.coreWebVitals.TTFB, {
                  good: 800,
                  poor: 1800
                })}
              >
                {formatMetricValue(metrics.coreWebVitals.TTFB)}
              </span>
            </div>
            <p className='text-xs text-gray-500 mt-1'>Time to First Byte</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* API Performance */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <ProfessionalIcon name='activity' size={20} className='mr-2' />
              API Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>
                  Average Response Time
                </span>
                <span className='font-mono text-sm'>
                  {formatMetricValue(
                    metrics.apiPerformance.averageResponseTime
                  )}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Total API Calls</span>
                <span className='font-mono text-sm'>
                  {metrics.apiPerformance.totalCalls}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Slow Calls</span>
                <span className='font-mono text-sm'>
                  {metrics.apiPerformance.slowCalls} (
                  {formatMetricValue(
                    metrics.apiPerformance.slowCallPercentage,
                    '%'
                  )}
                  )
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Performance */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <ProfessionalIcon name='layout' size={20} className='mr-2' />
              Component Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>
                  Average Render Time
                </span>
                <span className='font-mono text-sm'>
                  {formatMetricValue(
                    metrics.componentPerformance.averageRenderTime
                  )}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Total Renders</span>
                <span className='font-mono text-sm'>
                  {metrics.componentPerformance.totalRenders}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Slow Renders</span>
                <span className='font-mono text-sm'>
                  {metrics.componentPerformance.slowRenders} (
                  {formatMetricValue(
                    metrics.componentPerformance.slowRenderPercentage,
                    '%'
                  )}
                  )
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <ProfessionalIcon name='monitor' size={20} className='mr-2' />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {formatMetricValue(metrics.systemHealth.memoryUsage, 'bytes')}
              </div>
              <p className='text-sm text-gray-600'>Memory Usage</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {metrics.systemHealth.activeRequests}
              </div>
              <p className='text-sm text-gray-600'>Active Requests</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {metrics.systemHealth.cachedResources}
              </div>
              <p className='text-sm text-gray-600'>Cached Resources</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
