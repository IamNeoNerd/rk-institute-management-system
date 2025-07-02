/**
 * Production Health Check API
 * RK Institute Management System
 *
 * Comprehensive health check endpoint for production monitoring
 */

import { NextApiRequest, NextApiResponse } from 'next';

import { monitoring } from '../../../lib/monitoring/ProductionMonitoring';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: {
      status: boolean;
      responseTime?: number;
      error?: string;
    };
    redis?: {
      status: boolean;
      responseTime?: number;
      error?: string;
    };
    externalServices: {
      status: boolean;
      services: Record<string, boolean>;
    };
    system: {
      memory: {
        used: number;
        total: number;
        percentage: number;
      };
      cpu: {
        usage: number;
      };
      disk: {
        available: boolean;
      };
    };
  };
  metrics: {
    responseTime: number;
    activeConnections: number;
    requestsPerMinute?: number;
    errorRate?: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse | { error: string }>
) {
  const startTime = Date.now();

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Perform comprehensive health check
    const healthResult = await monitoring.performHealthCheck();

    // Get system metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Build health response
    const healthResponse: HealthResponse = {
      status: healthResult.status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: {
          status: healthResult.checks.database,
          responseTime: healthResult.metrics.responseTime
        },
        redis: healthResult.checks.redis
          ? {
              status: healthResult.checks.redis,
              responseTime: 0 // Would be measured in actual Redis check
            }
          : undefined,
        externalServices: {
          status: healthResult.checks.externalServices,
          services: {
            // Add specific external service checks here
          }
        },
        system: {
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            percentage: Math.round(
              (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
            )
          },
          cpu: {
            usage:
              Math.round(((cpuUsage.user + cpuUsage.system) / 1000000) * 100) /
              100
          },
          disk: {
            available: healthResult.checks.diskSpace
          }
        }
      },
      metrics: {
        responseTime,
        activeConnections: healthResult.metrics.activeConnections,
        requestsPerMinute: await getRequestsPerMinute(),
        errorRate: await getErrorRate()
      }
    };

    // Set appropriate HTTP status based on health
    const httpStatus =
      healthResult.status === 'healthy'
        ? 200
        : healthResult.status === 'degraded'
          ? 200
          : 503;

    // Set cache headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(httpStatus).json(healthResponse);
  } catch (error) {
    console.error('Health check failed:', error);

    // Return unhealthy status with error information
    const errorResponse: HealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: {
          status: false,
          error: 'Health check system failure'
        },
        externalServices: {
          status: false,
          services: {}
        },
        system: {
          memory: {
            used: 0,
            total: 0,
            percentage: 0
          },
          cpu: {
            usage: 0
          },
          disk: {
            available: false
          }
        }
      },
      metrics: {
        responseTime: Date.now() - startTime,
        activeConnections: 0
      }
    };

    return res.status(503).json(errorResponse);
  }
}

/**
 * Get requests per minute metric
 */
async function getRequestsPerMinute(): Promise<number> {
  try {
    // This would integrate with your request tracking system
    // For now, return 0 as placeholder
    return 0;
  } catch (error) {
    console.error('Failed to get requests per minute:', error);
    return 0;
  }
}

/**
 * Get error rate metric
 */
async function getErrorRate(): Promise<number> {
  try {
    // This would calculate error rate from your error tracking system
    // For now, return 0 as placeholder
    return 0;
  } catch (error) {
    console.error('Failed to get error rate:', error);
    return 0;
  }
}
