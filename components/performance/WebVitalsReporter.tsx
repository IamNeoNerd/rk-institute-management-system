'use client';

import { useEffect } from 'react';

interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const WebVitalsReporter = () => {
  useEffect(() => {
    // Only run when Web Vitals API is available
    if (typeof window !== 'undefined') {
      import('web-vitals').then((webVitals) => {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = webVitals;
        const reportMetric = (metric: WebVitalsMetric) => {
          // Log to console in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Web Vitals] ${metric.name}:`, {
              value: metric.value,
              rating: metric.rating,
              id: metric.id
            });
          }

          // Send to analytics service (replace with your analytics provider)
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', metric.name, {
              event_category: 'Web Vitals',
              event_label: metric.id,
              value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
              non_interaction: true,
            });
          }

          // Send to custom analytics endpoint
          fetch('/api/analytics/web-vitals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              metric: metric.name,
              value: metric.value,
              rating: metric.rating,
              id: metric.id,
              url: window.location.href,
              timestamp: Date.now(),
            }),
          }).catch((error) => {
            // Silently fail - don't impact user experience
            console.warn('Failed to send web vitals:', error);
          });
        };

        // Measure all Core Web Vitals
        onCLS(reportMetric);
        onINP(reportMetric);
        onFCP(reportMetric);
        onLCP(reportMetric);
        onTTFB(reportMetric);
      });
    }
  }, []);

  return null; // This component doesn't render anything
};

export default WebVitalsReporter;
