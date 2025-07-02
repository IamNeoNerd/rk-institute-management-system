/**
 * API Performance Interceptor
 *
 * Automatically tracks API performance for all fetch requests and API routes.
 * Provides detailed metrics on response times, error rates, and payload sizes.
 *
 * Features:
 * - Automatic fetch request interception
 * - Response time tracking
 * - Error rate monitoring
 * - Payload size analysis
 * - Retry logic for failed requests
 * - Caching optimization
 * - Request deduplication
 */

import { performanceMonitor } from './PerformanceMonitor';

interface RequestMetadata {
  startTime: number;
  endpoint: string;
  method: string;
  requestId: string;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class APIPerformanceInterceptor {
  private activeRequests = new Map<string, RequestMetadata>();
  private requestCache = new Map<string, CacheEntry>();
  private requestQueue = new Map<string, Promise<any>>();
  private retryAttempts = new Map<string, number>();

  private readonly MAX_RETRIES = 3;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SLOW_REQUEST_THRESHOLD = 2000; // 2 seconds

  constructor() {
    this.interceptFetch();
    this.setupCacheCleanup();
  }

  /**
   * Intercept native fetch function
   */
  private interceptFetch(): void {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;

    window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';
      const requestId = this.generateRequestId(url, method);

      // Check cache for GET requests
      if (method === 'GET') {
        const cached = this.getCachedResponse(url);
        if (cached) {
          return this.createCachedResponse(cached);
        }
      }

      // Check for duplicate requests
      if (this.requestQueue.has(requestId)) {
        return this.requestQueue.get(requestId)!;
      }

      // Start tracking
      const startTime = performance.now();
      this.activeRequests.set(requestId, {
        startTime,
        endpoint: url,
        method,
        requestId
      });

      // Create request promise
      const requestPromise = this.executeRequest(
        originalFetch,
        input,
        init,
        requestId
      );
      this.requestQueue.set(requestId, requestPromise);

      try {
        const response = await requestPromise;
        this.handleSuccessfulRequest(requestId, response);
        return response;
      } catch (error) {
        this.handleFailedRequest(requestId, error);
        throw error;
      } finally {
        this.requestQueue.delete(requestId);
        this.activeRequests.delete(requestId);
      }
    };
  }

  /**
   * Execute the actual request with retry logic
   */
  private async executeRequest(
    originalFetch: typeof fetch,
    input: RequestInfo | URL,
    init?: RequestInit,
    requestId?: string
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    let lastError: Error | null = null;
    const maxRetries = this.shouldRetry(url, method) ? this.MAX_RETRIES : 1;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const requestInit = {
          ...init,
          signal: controller.signal
        };

        const response = await originalFetch(input, requestInit);
        clearTimeout(timeoutId);

        // If response is not ok and we can retry, throw error
        if (
          !response.ok &&
          attempt < maxRetries &&
          this.shouldRetryStatus(response.status)
        ) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Cache successful GET responses
        if (response.ok && method === 'GET') {
          this.cacheResponse(url, response.clone());
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await this.delay(delay);

          console.warn(
            `Request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`,
            url
          );
        }
      }
    }

    throw lastError;
  }

  /**
   * Handle successful request completion
   */
  private handleSuccessfulRequest(requestId: string, response: Response): void {
    const metadata = this.activeRequests.get(requestId);
    if (!metadata) return;

    const endTime = performance.now();
    const responseTime = endTime - metadata.startTime;

    // Track performance
    performanceMonitor.trackAPICall(
      metadata.endpoint,
      metadata.method,
      metadata.startTime,
      endTime,
      response.status,
      this.getResponseSize(response)
    );

    // Log slow requests
    if (responseTime > this.SLOW_REQUEST_THRESHOLD) {
      console.warn(
        `Slow API request detected: ${metadata.endpoint} took ${responseTime.toFixed(2)}ms`
      );
    }

    // Reset retry count on success
    this.retryAttempts.delete(requestId);
  }

  /**
   * Handle failed request
   */
  private handleFailedRequest(requestId: string, error: any): void {
    const metadata = this.activeRequests.get(requestId);
    if (!metadata) return;

    const endTime = performance.now();
    const responseTime = endTime - metadata.startTime;

    // Track failed request
    performanceMonitor.trackAPICall(
      metadata.endpoint,
      metadata.method,
      metadata.startTime,
      endTime,
      0, // Status code 0 for failed requests
      0
    );

    console.error(`API request failed: ${metadata.endpoint}`, error);

    // Track retry attempts
    const attempts = this.retryAttempts.get(requestId) || 0;
    this.retryAttempts.set(requestId, attempts + 1);
  }

  /**
   * Cache management
   */
  private getCachedResponse(url: string): any | null {
    const cached = this.requestCache.get(url);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.requestCache.delete(url);
      return null;
    }

    return cached.data;
  }

  private async cacheResponse(url: string, response: Response): Promise<void> {
    try {
      const data = await response.json();
      this.requestCache.set(url, {
        data,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      });
    } catch (error) {
      // Response is not JSON, skip caching
    }
  }

  private createCachedResponse(data: any): Response {
    return new Response(JSON.stringify(data), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT'
      }
    });
  }

  /**
   * Setup cache cleanup
   */
  private setupCacheCleanup(): void {
    if (typeof window === 'undefined') return;

    // Clean up expired cache entries every 5 minutes
    setInterval(
      () => {
        const now = Date.now();
        for (const [url, entry] of this.requestCache.entries()) {
          if (now - entry.timestamp > entry.ttl) {
            this.requestCache.delete(url);
          }
        }
      },
      5 * 60 * 1000
    );
  }

  /**
   * Utility methods
   */
  private generateRequestId(url: string, method: string): string {
    return `${method}:${url}:${Date.now()}`;
  }

  private shouldRetry(url: string, method: string): boolean {
    // Only retry GET requests and specific endpoints
    if (method !== 'GET') return false;

    // Don't retry authentication endpoints
    if (url.includes('/auth/') || url.includes('/login')) return false;

    return true;
  }

  private shouldRetryStatus(status: number): boolean {
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429;
  }

  private getResponseSize(response: Response): number {
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get performance statistics
   */
  public getStatistics(): any {
    return {
      activeRequests: this.activeRequests.size,
      cachedResponses: this.requestCache.size,
      queuedRequests: this.requestQueue.size,
      retryAttempts: Array.from(this.retryAttempts.values()).reduce(
        (sum, attempts) => sum + attempts,
        0
      )
    };
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Preload critical resources
   */
  public preloadCriticalResources(urls: string[]): void {
    urls.forEach(url => {
      fetch(url, { method: 'GET' })
        .then(response => {
          if (response.ok) {
            this.cacheResponse(url, response.clone());
          }
        })
        .catch(error => {
          console.warn(`Failed to preload resource: ${url}`, error);
        });
    });
  }
}

// Singleton instance
export const apiPerformanceInterceptor = new APIPerformanceInterceptor();

// React Hook for API performance tracking
export function useAPIPerformance() {
  return {
    getStatistics: () => apiPerformanceInterceptor.getStatistics(),
    clearCache: () => apiPerformanceInterceptor.clearCache(),
    preloadResources: (urls: string[]) =>
      apiPerformanceInterceptor.preloadCriticalResources(urls)
  };
}

export default APIPerformanceInterceptor;
