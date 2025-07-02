/**
 * 🗄️ Database Connection Management
 *
 * Proper Prisma client initialization with error handling
 * Based on retrospective analysis findings
 */

import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

/**
 * Get Prisma client with proper error handling
 */
export async function getPrismaClient(): Promise<PrismaClient> {
  if (!prisma) {
    try {
      // Validate environment variables first
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
      }

      console.log('🔗 Initializing Prisma client...');
      prisma = new PrismaClient({
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error']
      });

      // Test the connection
      await prisma.$connect();
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      prisma = null;
      throw new Error(
        `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  return prisma;
}

/**
 * Test database connection health
 */
export async function testDatabaseConnection() {
  try {
    const client = await getPrismaClient();
    const startTime = Date.now();

    // Simple query to test connection
    await client.$queryRaw`SELECT 1 as test`;

    const responseTime = Date.now() - startTime;

    return {
      status: 'connected',
      responseTime,
      timestamp: new Date().toISOString(),
      message: 'Database connection healthy'
    };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      message: 'Database connection failed'
    };
  }
}

/**
 * Safely disconnect from database
 */
export async function disconnectDatabase() {
  if (prisma) {
    try {
      await prisma.$disconnect();
      prisma = null;
      console.log('🔌 Database disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
    }
  }
}

/**
 * Get database health status without throwing errors
 */
export async function getDatabaseHealth() {
  try {
    const healthCheck = await testDatabaseConnection();
    return {
      healthy: healthCheck.status === 'connected',
      details: healthCheck
    };
  } catch (error) {
    return {
      healthy: false,
      details: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        message: 'Database health check failed'
      }
    };
  }
}

/**
 * Execute database operation with error handling
 */
export async function executeDatabaseOperation<T>(
  operation: (client: PrismaClient) => Promise<T>,
  fallbackValue?: T
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const client = await getPrismaClient();
    const data = await operation(client);
    return { success: true, data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown database error';
    console.error('Database operation failed:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      data: fallbackValue
    };
  }
}
