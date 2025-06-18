'use client';

import { useState, useEffect } from 'react';
import { usePerformanceMonitoring } from '@/hooks/monitoring/usePerformanceMonitoring';
import { Activity, Zap, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | undefined;
  unit: string;
  icon: React.ReactNode;
  threshold?: number;
  isGood?: (value: number) => boolean;
}

function MetricCard({ title, value, unit, icon, threshold, isGood }: MetricCardProps) {
  const getStatusColor = () => {
    if (value === undefined) return 'text-gray-400';
    if (isGood && isGood(value)) return 'text-green-600';
    if (threshold && value > threshold) return 'text-red-600';
    return 'text-blue-600';
  };

  const getStatusIcon = () => {
    if (value === undefined) return <Clock className="w-4 h-4 text-gray-400" />;
    if (isGood && isGood(value)) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (threshold && value > threshold) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    return <TrendingUp className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
        {getStatusIcon()}
      </div>
      <div className="flex items-baseline space-x-1">
        <span className={`text-2xl font-bold ${getStatusColor()}`}>
          {value !== undefined ? value.toFixed(value < 10 ? 2 : 0) : '--'}
        </span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  );
}

interface PerformanceMonitoringDashboardProps {
  className?: string;
}

/**
 * Performance Monitoring Dashboard (Phase 3)
 * Real-time display of Core Web Vitals and custom metrics
 */
export default function PerformanceMonitoringDashboard({ className = '' }: PerformanceMonitoringDashboardProps) {
  const {
    metrics,
    isMonitoring,
    history,
    getPerformanceSummary
  } = usePerformanceMonitoring();

  const [summary, setSummary] = useState<ReturnType<typeof getPerformanceSummary>>(null);

  useEffect(() => {
    const updateSummary = () => {
      setSummary(getPerformanceSummary());
    };

    updateSummary();
    const interval = setInterval(updateSummary, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getPerformanceSummary]);

  if (!isMonitoring) {
    return (
      <div className={`bg-gray-50 rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Performance Monitoring</h3>
          <p className="text-gray-600">Monitoring will start automatically when available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Performance Monitoring</h2>
          <p className="text-gray-600">Real-time Core Web Vitals and custom metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="LCP"
            value={metrics.lcp}
            unit="ms"
            icon={<Zap className="w-4 h-4 text-blue-600" />}
            threshold={2500}
            isGood={(value) => value < 2500}
          />
          <MetricCard
            title="FID"
            value={metrics.fid}
            unit="ms"
            icon={<Activity className="w-4 h-4 text-green-600" />}
            threshold={100}
            isGood={(value) => value < 100}
          />
          <MetricCard
            title="CLS"
            value={metrics.cls}
            unit=""
            icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
            threshold={0.1}
            isGood={(value) => value < 0.1}
          />
          <MetricCard
            title="FCP"
            value={metrics.fcp}
            unit="ms"
            icon={<Clock className="w-4 h-4 text-orange-600" />}
            threshold={1800}
            isGood={(value) => value < 1800}
          />
          <MetricCard
            title="TTFB"
            value={metrics.ttfb}
            unit="ms"
            icon={<Zap className="w-4 h-4 text-red-600" />}
            threshold={600}
            isGood={(value) => value < 600}
          />
        </div>
      </div>

      {/* Custom Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Page Load"
            value={metrics.pageLoadTime}
            unit="ms"
            icon={<Clock className="w-4 h-4 text-blue-600" />}
            threshold={3000}
            isGood={(value) => value < 3000}
          />
          <MetricCard
            title="Memory Usage"
            value={metrics.memoryUsage}
            unit="MB"
            icon={<Activity className="w-4 h-4 text-green-600" />}
            threshold={50}
            isGood={(value) => value < 50}
          />
          <MetricCard
            title="API Response"
            value={metrics.apiResponseTime}
            unit="ms"
            icon={<Zap className="w-4 h-4 text-purple-600" />}
            threshold={1000}
            isGood={(value) => value < 1000}
          />
          <MetricCard
            title="Error Count"
            value={metrics.errorCount}
            unit="errors"
            icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
            threshold={5}
            isGood={(value) => value === 0}
          />
        </div>
      </div>

      {/* Performance Summary */}
      {summary && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {summary.isHealthy ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${summary.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.isHealthy ? 'Healthy' : 'Needs Attention'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Overall system performance status
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{summary.dataPoints}</div>
              <p className="text-sm text-gray-600">Data points collected</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{summary.totalErrors}</div>
              <p className="text-sm text-gray-600">Total errors recorded</p>
            </div>
          </div>
          
          {metrics.lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Last Error:</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{metrics.lastError}</p>
            </div>
          )}
        </div>
      )}

      {/* Data Collection Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Monitoring Active</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Collecting performance metrics in real-time. Data is stored locally and resets on page refresh.
        </p>
      </div>
    </div>
  );
}
