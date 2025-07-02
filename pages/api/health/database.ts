/**
 * Database Health Check API
 * RK Institute Management System
 *
 * Detailed database connectivity and performance health check
 */

import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface DatabaseHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  connection: {
    status: boolean;
    responseTime: number;
    error?: string;
  };
  queries: {
    simple: {
      status: boolean;
      responseTime: number;
      error?: string;
    };
    complex: {
      status: boolean;
      responseTime: number;
      error?: string;
    };
  };
  metrics: {
    activeConnections: number;
    totalQueries: number;
    averageQueryTime: number;
    slowQueries: number;
  };
  tables: {
    accessible: string[];
    inaccessible: string[];
  };
}

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DatabaseHealthResponse | { error: string }>
) {
  const startTime = Date.now();

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Test basic connection
    const connectionTest = await testConnection();

    // Test simple query
    const simpleQueryTest = await testSimpleQuery();

    // Test complex query
    const complexQueryTest = await testComplexQuery();

    // Get database metrics
    const metrics = await getDatabaseMetrics();

    // Test table accessibility
    const tableTests = await testTableAccessibility();

    // Determine overall status
    const allTestsPassed =
      connectionTest.status &&
      simpleQueryTest.status &&
      complexQueryTest.status;

    const someTestsPassed = connectionTest.status || simpleQueryTest.status;

    const status = allTestsPassed
      ? 'healthy'
      : someTestsPassed
        ? 'degraded'
        : 'unhealthy';

    const response: DatabaseHealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      connection: connectionTest,
      queries: {
        simple: simpleQueryTest,
        complex: complexQueryTest
      },
      metrics,
      tables: tableTests
    };

    // Set appropriate HTTP status
    const httpStatus =
      status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

    // Set cache headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.status(httpStatus).json(response);
  } catch (error) {
    console.error('Database health check failed:', error);

    const errorResponse: DatabaseHealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      connection: {
        status: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      queries: {
        simple: {
          status: false,
          responseTime: 0,
          error: 'Health check system failure'
        },
        complex: {
          status: false,
          responseTime: 0,
          error: 'Health check system failure'
        }
      },
      metrics: {
        activeConnections: 0,
        totalQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0
      },
      tables: {
        accessible: [],
        inaccessible: []
      }
    };

    return res.status(503).json(errorResponse);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Test basic database connection
 */
async function testConnection(): Promise<{
  status: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    await prisma.$connect();
    return {
      status: true,
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

/**
 * Test simple database query
 */
async function testSimpleQuery(): Promise<{
  status: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    return {
      status: true,
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Simple query failed'
    };
  }
}

/**
 * Test complex database query
 */
async function testComplexQuery(): Promise<{
  status: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    // Test a more complex query that exercises the database
    await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_count,
        NOW() as current_time,
        version() as db_version
    `;

    return {
      status: true,
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Complex query failed'
    };
  }
}

/**
 * Get database performance metrics
 */
async function getDatabaseMetrics(): Promise<{
  activeConnections: number;
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: number;
}> {
  try {
    // These would be actual database-specific queries
    // For PostgreSQL, you might query pg_stat_activity, pg_stat_database, etc.

    // Placeholder implementation
    return {
      activeConnections: 0,
      totalQueries: 0,
      averageQueryTime: 0,
      slowQueries: 0
    };
  } catch (error) {
    console.error('Failed to get database metrics:', error);
    return {
      activeConnections: 0,
      totalQueries: 0,
      averageQueryTime: 0,
      slowQueries: 0
    };
  }
}

/**
 * Test accessibility of critical tables
 */
async function testTableAccessibility(): Promise<{
  accessible: string[];
  inaccessible: string[];
}> {
  const criticalTables = [
    'User',
    'Student',
    'Teacher',
    'Course',
    'Fee',
    'Attendance',
    'Grade'
  ];

  const accessible: string[] = [];
  const inaccessible: string[] = [];

  for (const table of criticalTables) {
    try {
      // Test table accessibility with a simple count query
      switch (table) {
        case 'User':
          await prisma.user.count();
          break;
        case 'Student':
          await prisma.student.count();
          break;
        case 'Teacher':
          // Teachers are Users with role TEACHER
          await prisma.user.count({ where: { role: 'TEACHER' } });
          break;
        case 'Course':
          await prisma.course.count();
          break;
        case 'Fee':
          // Fee allocations are handled by StudentFeeAllocation
          await prisma.studentFeeAllocation.count();
          break;
        case 'Attendance':
          // Attendance records
          await prisma.attendanceRecord.count();
          break;
        case 'Grade':
          // Grades are in assignment submissions
          await prisma.assignmentSubmission.count();
          break;
        default:
          // Skip unknown tables
          continue;
      }

      accessible.push(table);
    } catch (error) {
      console.error(`Table ${table} accessibility test failed:`, error);
      inaccessible.push(table);
    }
  }

  return { accessible, inaccessible };
}
