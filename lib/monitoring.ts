/**
 * Production Monitoring & Error Tracking
 *
 * Comprehensive monitoring solution for RK Institute Management System.
 * Provides error tracking, performance monitoring, and analytics.
 *
 * Features:
 * - Centralized error logging
 * - Performance monitoring
 * - User session tracking
 * - Custom event tracking
 * - Production health checks
 */

import React from 'react';

// =============================================================================
// ERROR TRACKING CONFIGURATION
// =============================================================================

interface ErrorContext {
  userId?: string;
  userRole?: string;
  page?: string;
  action?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  context?: Record<string, any>;
}

class ProductionMonitoring {
  private isProduction: boolean;
  private userId?: string;
  private userRole?: string;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // =============================================================================
  // USER CONTEXT MANAGEMENT
  // =============================================================================

  setUserContext(userId: string, userRole: string) {
    this.userId = userId;
    this.userRole = userRole;
    
    if (this.isProduction && typeof window !== 'undefined') {
      // Set user context for client-side monitoring
      if (window.gtag) {
        window.gtag('config', process.env.GOOGLE_ANALYTICS_ID, {
          user_id: userId,
          custom_map: { dimension1: userRole }
        });
      }
    }
  }

  clearUserContext() {
    this.userId = undefined;
    this.userRole = undefined;
  }

  // =============================================================================
  // ERROR LOGGING
  // =============================================================================

  logError(error: Error, context: ErrorContext = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: this.userId || context.userId,
      userRole: this.userRole || context.userRole,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : context.url,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : context.userAgent,
      ...context
    };

    // Console logging for development
    if (!this.isProduction) {
      console.error('🚨 Error:', errorData);
      return;
    }

    // Production error tracking
    this.sendToErrorTracking(errorData);
    this.sendToAnalytics('error', errorData);
  }

  logWarning(message: string, context: ErrorContext = {}) {
    const warningData = {
      level: 'warning',
      message,
      userId: this.userId || context.userId,
      userRole: this.userRole || context.userRole,
      timestamp: new Date().toISOString(),
      ...context
    };

    if (!this.isProduction) {
      console.warn('⚠️ Warning:', warningData);
      return;
    }

    this.sendToErrorTracking(warningData);
  }

  // =============================================================================
  // PERFORMANCE MONITORING
  // =============================================================================

  trackPerformance(metric: PerformanceMetric) {
    if (!this.isProduction) {
      console.log('📊 Performance:', metric);
      return;
    }

    // Send to analytics
    this.sendToAnalytics('performance', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_unit: metric.unit,
      ...metric.context
    });

    // Send to performance monitoring service
    this.sendToPerformanceMonitoring(metric);
  }

  trackPageLoad(pageName: string, loadTime: number) {
    this.trackPerformance({
      name: 'page_load',
      value: loadTime,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      context: { page: pageName }
    });
  }

  trackApiCall(endpoint: string, duration: number, status: number) {
    this.trackPerformance({
      name: 'api_call',
      value: duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      context: { 
        endpoint, 
        status,
        success: status >= 200 && status < 300
      }
    });
  }

  // =============================================================================
  // USER INTERACTION TRACKING
  // =============================================================================

  trackUserAction(action: string, context: Record<string, any> = {}) {
    const eventData = {
      action,
      userId: this.userId,
      userRole: this.userRole,
      timestamp: new Date().toISOString(),
      ...context
    };

    if (!this.isProduction) {
      console.log('👤 User Action:', eventData);
      return;
    }

    this.sendToAnalytics('user_action', eventData);
  }

  trackFeatureUsage(feature: string, context: Record<string, any> = {}) {
    this.trackUserAction('feature_usage', { feature, ...context });
  }

  trackReportGeneration(templateId: string, format: string, success: boolean) {
    this.trackUserAction('report_generation', {
      template_id: templateId,
      format,
      success
    });
  }

  // =============================================================================
  // BUSINESS METRICS
  // =============================================================================

  trackBusinessMetric(metric: string, value: number, context: Record<string, any> = {}) {
    const metricData = {
      metric,
      value,
      userId: this.userId,
      userRole: this.userRole,
      timestamp: new Date().toISOString(),
      ...context
    };

    if (!this.isProduction) {
      console.log('💼 Business Metric:', metricData);
      return;
    }

    this.sendToAnalytics('business_metric', metricData);
  }

  trackUserRegistration(userRole: string) {
    this.trackBusinessMetric('user_registration', 1, { user_role: userRole });
  }

  trackLogin(userRole: string, method: string = 'email') {
    this.trackBusinessMetric('user_login', 1, { user_role: userRole, method });
  }

  // =============================================================================
  // HEALTH CHECKS
  // =============================================================================

  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: string;
  }> {
    const checks = {
      database: await this.checkDatabase(),
      api: await this.checkApiHealth(),
      external_services: await this.checkExternalServices()
    };

    const allHealthy = Object.values(checks).every(check => check);
    const someHealthy = Object.values(checks).some(check => check);

    const status = allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy';

    const healthData = {
      status,
      checks,
      timestamp: new Date().toISOString()
    };

    if (status !== 'healthy') {
      this.logWarning('Health check failed', { health_status: status, checks });
    }

    return healthData;
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      // Simple database connectivity check
      const response = await fetch('/api/health/database');
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async checkExternalServices(): Promise<boolean> {
    // Check critical external services
    try {
      // Add checks for email service, payment gateway, etc.
      return true;
    } catch (error) {
      return false;
    }
  }

  // =============================================================================
  // PRIVATE METHODS - SERVICE INTEGRATIONS
  // =============================================================================

  private sendToErrorTracking(errorData: any) {
    // Sentry integration
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(new Error(errorData.message), {
        contexts: {
          user: {
            id: errorData.userId,
            role: errorData.userRole
          },
          additional: errorData
        }
      });
    }

    // Custom error tracking endpoint
    this.sendToEndpoint('/api/monitoring/errors', errorData);
  }

  private sendToAnalytics(eventType: string, data: any) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventType, data);
    }

    // Vercel Analytics
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', eventType, data);
    }
  }

  private sendToPerformanceMonitoring(metric: PerformanceMetric) {
    // Web Vitals tracking
    if (typeof window !== 'undefined') {
      // Track Core Web Vitals
      if (metric.name === 'page_load' && window.web_vitals) {
        window.web_vitals.getCLS(console.log);
        window.web_vitals.getFID(console.log);
        window.web_vitals.getLCP(console.log);
      }
    }

    // Custom performance endpoint
    this.sendToEndpoint('/api/monitoring/performance', metric);
  }

  private async sendToEndpoint(endpoint: string, data: any) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Fail silently in production to avoid infinite loops
      if (!this.isProduction) {
        console.error('Failed to send monitoring data:', error);
      }
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

const monitoring = new ProductionMonitoring();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export const logError = (error: Error, context?: ErrorContext) => 
  monitoring.logError(error, context);

export const logWarning = (message: string, context?: ErrorContext) => 
  monitoring.logWarning(message, context);

export const trackPerformance = (metric: PerformanceMetric) => 
  monitoring.trackPerformance(metric);

export const trackUserAction = (action: string, context?: Record<string, any>) => 
  monitoring.trackUserAction(action, context);

export const trackFeatureUsage = (feature: string, context?: Record<string, any>) => 
  monitoring.trackFeatureUsage(feature, context);

export const setUserContext = (userId: string, userRole: string) => 
  monitoring.setUserContext(userId, userRole);

export const clearUserContext = () => 
  monitoring.clearUserContext();

export const performHealthCheck = () => 
  monitoring.performHealthCheck();

// =============================================================================
// REACT HOOKS
// =============================================================================

export function useMonitoring() {
  return {
    logError,
    logWarning,
    trackPerformance,
    trackUserAction,
    trackFeatureUsage,
    setUserContext,
    clearUserContext
  };
}

// =============================================================================
// ERROR BOUNDARY INTEGRATION
// =============================================================================

export function withErrorMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function MonitoredComponent(props: P) {
    React.useEffect(() => {
      if (typeof window === 'undefined') return;

      const handleError = (error: ErrorEvent) => {
        logError(new Error(error.message), {
          page: window.location.pathname,
          action: 'unhandled_error'
        });
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        logError(new Error(event.reason), {
          page: window.location.pathname,
          action: 'unhandled_promise_rejection'
        });
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}

export default monitoring;
