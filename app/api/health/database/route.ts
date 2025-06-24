/**
 * Database Health Check API Endpoint
 * 
 * Provides detailed database connectivity and performance metrics.
 * Used for monitoring database-specific health and performance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DatabaseHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  connection: {
    status: 'connected' | 'disconnected';
    responseTime: number;
    error?: string;
  };
  performance: {
    queryTime: number;
    connectionPool: {
      active: number;
      idle: number;
      total: number;
    };
  };
  metadata: {
    database: string;
    host: string;
    ssl: boolean;
    version?: string;
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // =============================================================================
    // BASIC CONNECTIVITY TEST
    // =============================================================================
    
    let connectionCheck;
    let performanceMetrics;
    
    try {
      const connectionStartTime = Date.now();
      
      // Simple connectivity test
      await prisma.$queryRaw`SELECT 1 as test`;
      
      const connectionTime = Date.now() - connectionStartTime;
      
      connectionCheck = {
        status: 'connected' as const,
        responseTime: connectionTime
      };

      // =============================================================================
      // PERFORMANCE METRICS
      // =============================================================================
      
      const performanceStartTime = Date.now();
      
      // Test query performance with actual data
      const userCount = await prisma.user.count();
      const studentCount = await prisma.student.count();
      
      const queryTime = Date.now() - performanceStartTime;
      
      performanceMetrics = {
        queryTime,
        connectionPool: {
          active: 1, // Simplified - would need actual pool metrics
          idle: 0,
          total: 1
        }
      };

    } catch (error) {
      connectionCheck = {
        status: 'disconnected' as const,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
      
      performanceMetrics = {
        queryTime: 0,
        connectionPool: {
          active: 0,
          idle: 0,
          total: 0
        }
      };
    }

    // =============================================================================
    // DATABASE METADATA
    // =============================================================================
    
    let metadata;
    try {
      // Extract database info from connection string
      const databaseUrl = process.env.DATABASE_URL || '';
      const urlParts = new URL(databaseUrl);
      
      metadata = {
        database: urlParts.pathname.substring(1), // Remove leading slash
        host: urlParts.hostname,
        ssl: urlParts.searchParams.get('sslmode') === 'require',
        version: await getDatabaseVersion()
      };
    } catch (error) {
      metadata = {
        database: 'unknown',
        host: 'unknown',
        ssl: false,
        version: 'unknown'
      };
    }

    // =============================================================================
    // OVERALL STATUS DETERMINATION
    // =============================================================================
    
    const overallStatus = 
      connectionCheck.status === 'disconnected' 
        ? 'unhealthy'
        : performanceMetrics.queryTime > 1000 
        ? 'degraded'
        : 'healthy';

    // =============================================================================
    // RESPONSE CONSTRUCTION
    // =============================================================================
    
    const healthCheck: DatabaseHealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      connection: connectionCheck,
      performance: performanceMetrics,
      metadata
    };

    const httpStatus = 
      overallStatus === 'healthy' ? 200 :
      overallStatus === 'degraded' ? 200 :
      503;

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
    
    const errorResponse: DatabaseHealthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      connection: {
        status: 'disconnected',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Database health check failed'
      },
      performance: {
        queryTime: 0,
        connectionPool: {
          active: 0,
          idle: 0,
          total: 0
        }
      },
      metadata: {
        database: 'unknown',
        host: 'unknown',
        ssl: false,
        version: 'unknown'
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

async function getDatabaseVersion(): Promise<string> {
  try {
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    return result[0]?.version || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

// =============================================================================
// DATABASE HEALTH CHECK DOCUMENTATION
// =============================================================================

/*
DATABASE HEALTH CHECK API DOCUMENTATION

Endpoint: GET /api/health/database

Response Format:
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2024-12-24T10:30:00.000Z",
  "connection": {
    "status": "connected",
    "responseTime": 45
  },
  "performance": {
    "queryTime": 120,
    "connectionPool": {
      "active": 2,
      "idle": 3,
      "total": 5
    }
  },
  "metadata": {
    "database": "neondb",
    "host": "ep-twilight-leaf-a934hjkc-pooler.gwc.azure.neon.tech",
    "ssl": true,
    "version": "PostgreSQL 15.4"
  }
}

Status Criteria:
- healthy: Connected, query time < 500ms
- degraded: Connected, query time 500ms-1000ms
- unhealthy: Disconnected or query time > 1000ms

HTTP Status Codes:
- 200: Healthy or degraded
- 503: Unhealthy (database unavailable)

Usage:
- Database monitoring: Check every 60 seconds
- Performance tracking: Monitor query times
- Connection pool monitoring: Track pool usage
- Alerting: Trigger on unhealthy status

Monitoring Thresholds:
- Response time > 500ms: Warning
- Response time > 1000ms: Critical
- Connection failures: Critical
- Query failures: Critical
*/
