/**
 * Health Check API Endpoint
 * 
 * Provides comprehensive health status for the RK Institute Management System.
 * Used for monitoring, alerting, and deployment validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      error?: string;
    };
    memory: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      usage: number;
      limit: number;
      percentage: number;
    };
    uptime: {
      status: 'healthy';
      seconds: number;
      formatted: string;
    };
  };
  metadata: {
    nodeVersion: string;
    platform: string;
    architecture: string;
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // =============================================================================
    // DATABASE HEALTH CHECK
    // =============================================================================
    
    let databaseCheck;
    try {
      const dbStartTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStartTime;
      
      databaseCheck = {
        status: 'healthy' as const,
        responseTime: dbResponseTime
      };
    } catch (error) {
      databaseCheck = {
        status: 'unhealthy' as const,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }

    // =============================================================================
    // MEMORY HEALTH CHECK
    // =============================================================================
    
    const memoryUsage = process.memoryUsage();
    const memoryLimit = 1024 * 1024 * 1024; // 1GB default limit
    const memoryPercentage = (memoryUsage.heapUsed / memoryLimit) * 100;
    
    const memoryCheck = {
      status: memoryPercentage > 90 ? 'unhealthy' as const : 
              memoryPercentage > 70 ? 'degraded' as const : 'healthy' as const,
      usage: memoryUsage.heapUsed,
      limit: memoryLimit,
      percentage: Math.round(memoryPercentage * 100) / 100
    };

    // =============================================================================
    // UPTIME CHECK
    // =============================================================================
    
    const uptimeSeconds = Math.floor(process.uptime());
    const uptimeFormatted = formatUptime(uptimeSeconds);
    
    const uptimeCheck = {
      status: 'healthy' as const,
      seconds: uptimeSeconds,
      formatted: uptimeFormatted
    };

    // =============================================================================
    // OVERALL HEALTH STATUS
    // =============================================================================
    
    const checks = {
      database: databaseCheck,
      memory: memoryCheck,
      uptime: uptimeCheck
    };

    const overallStatus = 
      databaseCheck.status === 'unhealthy' || memoryCheck.status === 'unhealthy' 
        ? 'unhealthy' 
        : memoryCheck.status === 'degraded' 
        ? 'degraded' 
        : 'healthy';

    // =============================================================================
    // RESPONSE CONSTRUCTION
    // =============================================================================
    
    const healthCheck: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch
      }
    };

    // =============================================================================
    // HTTP STATUS CODE DETERMINATION
    // =============================================================================
    
    const httpStatus = 
      overallStatus === 'healthy' ? 200 :
      overallStatus === 'degraded' ? 200 : // Still operational
      503; // Service unavailable

    return NextResponse.json(healthCheck, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    // =============================================================================
    // ERROR HANDLING
    // =============================================================================
    
    const errorResponse: HealthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: 'Health check failed'
        },
        memory: {
          status: 'unhealthy',
          usage: 0,
          limit: 0,
          percentage: 0
        },
        uptime: {
          status: 'healthy',
          seconds: Math.floor(process.uptime()),
          formatted: formatUptime(Math.floor(process.uptime()))
        }
      },
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch
      }
    };

    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
}

// =============================================================================
// HEALTH CHECK ENDPOINT DOCUMENTATION
// =============================================================================

/*
HEALTH CHECK API DOCUMENTATION

Endpoint: GET /api/health

Response Format:
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2024-12-24T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 45
    },
    "memory": {
      "status": "healthy",
      "usage": 134217728,
      "limit": 1073741824,
      "percentage": 12.5
    },
    "uptime": {
      "status": "healthy",
      "seconds": 86400,
      "formatted": "1d"
    }
  },
  "metadata": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "architecture": "x64"
  }
}

HTTP Status Codes:
- 200: Healthy or degraded (still operational)
- 503: Unhealthy (service unavailable)

Usage:
- Monitoring systems: Check every 30 seconds
- Load balancers: Use for health checks
- Deployment validation: Verify after deployment
- Alerting: Trigger alerts on unhealthy status

Monitoring Integration:
- Uptime Robot: Monitor /api/health endpoint
- Vercel: Built-in health checks
- Custom monitoring: Parse JSON response
*/
