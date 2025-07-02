/**
 * Base Service Class
 *
 * Abstract base class providing standardized CRUD operations, error handling,
 * and validation patterns for all service layer implementations.
 *
 * Design Principles:
 * - Consistent error handling across all services
 * - Type-safe operations with proper TypeScript support
 * - Standardized response format for predictable API behavior
 * - Pagination support for large datasets
 * - Comprehensive logging and monitoring integration
 * - Database connection management and optimization
 *
 * Features:
 * - Generic CRUD operations (Create, Read, Update, Delete)
 * - Pagination with configurable options
 * - Standardized error handling and response format
 * - Database connection pooling and management
 * - Performance monitoring and logging
 * - Input validation and sanitization
 * - Transaction support for complex operations
 *
 * Usage:
 * ```typescript
 * class StudentService extends BaseService<Student, CreateStudentData, UpdateStudentData> {
 *   constructor() {
 *     super('Student');
 *   }
 *
 *   async create(data: CreateStudentData): Promise<ServiceResult<Student>> {
 *     // Implementation
 *   }
 * }
 * ```
 */

import { PrismaClient } from '@prisma/client';

/**
 * Standardized service response format
 * Provides consistent structure for all service operations
 */
export interface ServiceResult<T> {
  /** Whether the operation was successful */
  success: boolean;
  /** The data returned by the operation (if successful) */
  data?: T;
  /** Error message (if operation failed) */
  error?: string;
  /** Error code for programmatic handling */
  code?: string;
  /** Additional metadata about the operation */
  metadata?: {
    /** Timestamp when the operation was performed */
    timestamp: number;
    /** Duration of the operation in milliseconds */
    duration?: number;
    /** Additional context information */
    context?: Record<string, any>;
    /** Service-specific metadata fields */
    [key: string]: any;
  };
}

/**
 * Pagination configuration options
 */
export interface PaginationOptions {
  /** Page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort order (ascending or descending) */
  sortOrder?: 'asc' | 'desc';
  /** Search query for filtering */
  search?: string;
  /** Additional filters */
  filters?: Record<string, any>;
}

/**
 * Paginated result structure
 */
export interface PaginatedResult<T> {
  /** Array of data items for the current page */
  data: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrevious: boolean;
  /** Metadata about the pagination */
  metadata?: {
    /** Time taken to execute the query */
    queryTime?: number;
    /** Applied filters */
    appliedFilters?: Record<string, any>;
    /** Sort configuration */
    sortConfig?: {
      field: string;
      order: 'asc' | 'desc';
    };
  };
}

/**
 * Transaction options for complex operations
 */
export interface TransactionOptions {
  /** Transaction timeout in milliseconds */
  timeout?: number;
  /** Isolation level for the transaction */
  isolationLevel?:
    | 'ReadUncommitted'
    | 'ReadCommitted'
    | 'RepeatableRead'
    | 'Serializable';
}

/**
 * Abstract base service class providing standardized CRUD operations
 *
 * @template T - The entity type (e.g., Student, Course)
 * @template CreateData - The data structure for creating new entities
 * @template UpdateData - The data structure for updating existing entities
 */
export abstract class BaseService<T, CreateData, UpdateData> {
  protected prisma: PrismaClient | null = null;
  protected modelName: string;
  protected startTime: number = 0;

  /**
   * Initialize the service with a model name
   * @param modelName - The name of the Prisma model this service handles
   */
  constructor(modelName: string) {
    this.modelName = modelName;
  }

  /**
   * Initialize the Prisma client connection
   * Implements connection pooling and error handling
   */
  protected async init(): Promise<void> {
    if (!this.prisma) {
      try {
        // Import Prisma client dynamically to avoid circular dependencies
        const { getPrismaClient } = await import('@/lib/database');
        this.prisma = await getPrismaClient();
        this.startTime = Date.now();
      } catch (error) {
        console.error(
          `Failed to initialize Prisma client for ${this.modelName}:`,
          error
        );
        throw new Error(
          `Database connection failed for ${this.modelName} service`
        );
      }
    }
  }

  /**
   * Abstract method: Create a new entity
   * Must be implemented by concrete service classes
   */
  abstract create(data: CreateData): Promise<ServiceResult<T>>;

  /**
   * Abstract method: Find entity by ID
   * Must be implemented by concrete service classes
   */
  abstract findById(id: string): Promise<ServiceResult<T>>;

  /**
   * Abstract method: Update an existing entity
   * Must be implemented by concrete service classes
   */
  abstract update(id: string, data: UpdateData): Promise<ServiceResult<T>>;

  /**
   * Abstract method: Delete an entity (soft delete recommended)
   * Must be implemented by concrete service classes
   */
  abstract delete(id: string): Promise<ServiceResult<boolean>>;

  /**
   * Abstract method: Find multiple entities with pagination
   * Must be implemented by concrete service classes
   */
  abstract findMany(
    options?: PaginationOptions
  ): Promise<ServiceResult<PaginatedResult<T>>>;

  /**
   * Execute a database operation within a transaction
   * Provides automatic rollback on errors
   */
  protected async withTransaction<R>(
    operation: (
      prisma: Omit<
        PrismaClient,
        | '$connect'
        | '$disconnect'
        | '$on'
        | '$transaction'
        | '$use'
        | '$extends'
      >
    ) => Promise<R>,
    options?: TransactionOptions
  ): Promise<R> {
    await this.init();

    if (!this.prisma) {
      throw new Error('Database connection not available');
    }

    try {
      return await this.prisma.$transaction(operation, {
        timeout: options?.timeout || 30000, // 30 seconds default
        isolationLevel: options?.isolationLevel
      });
    } catch (error) {
      console.error(`Transaction failed for ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Standardized error handling for service operations
   * Provides consistent error format and logging
   */
  protected handleError(
    error: any,
    operation: string,
    context?: Record<string, any>
  ): ServiceResult<any> {
    const duration = Date.now() - this.startTime;

    // Log the error with context
    console.error(`${this.modelName} ${operation} error:`, {
      error: error.message || error,
      code: error.code,
      context,
      duration,
      timestamp: new Date().toISOString()
    });

    // Determine error code and message based on error type
    let errorCode = 'UNKNOWN_ERROR';
    let errorMessage = `Failed to ${operation} ${this.modelName.toLowerCase()}`;

    if (error.code === 'P2002') {
      errorCode = 'UNIQUE_CONSTRAINT_VIOLATION';
      errorMessage = 'A record with this information already exists';
    } else if (error.code === 'P2025') {
      errorCode = 'RECORD_NOT_FOUND';
      errorMessage = 'The requested record was not found';
    } else if (error.code === 'P2003') {
      errorCode = 'FOREIGN_KEY_CONSTRAINT_VIOLATION';
      errorMessage = 'This operation would violate data integrity constraints';
    } else if (error.code === 'P2014') {
      errorCode = 'INVALID_ID';
      errorMessage = 'The provided ID is invalid';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      code: errorCode,
      metadata: {
        timestamp: Date.now(),
        duration,
        context
      }
    };
  }

  /**
   * Create a successful service result
   * Provides consistent success format
   */
  protected success<U>(
    data: U,
    metadata?: Record<string, any>
  ): ServiceResult<U> {
    const duration = Date.now() - this.startTime;

    return {
      success: true,
      data,
      metadata: {
        timestamp: Date.now(),
        duration,
        context: metadata
      }
    };
  }

  /**
   * Validate pagination options and apply defaults
   */
  protected validatePaginationOptions(
    options?: PaginationOptions
  ): PaginationOptions {
    const defaults: PaginationOptions = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    if (!options) return defaults;

    return {
      page: Math.max(1, options.page || defaults.page),
      limit: Math.min(100, Math.max(1, options.limit || defaults.limit)), // Max 100 items per page
      sortBy: options.sortBy || defaults.sortBy,
      sortOrder: options.sortOrder || defaults.sortOrder,
      search: options.search,
      filters: options.filters
    };
  }

  /**
   * Build pagination metadata for results
   */
  protected buildPaginationMetadata(
    total: number,
    options: PaginationOptions,
    queryTime?: number
  ): Omit<PaginatedResult<any>, 'data'> {
    const totalPages = Math.ceil(total / options.limit);

    return {
      total,
      page: options.page,
      limit: options.limit,
      totalPages,
      hasNext: options.page < totalPages,
      hasPrevious: options.page > 1,
      metadata: {
        queryTime,
        appliedFilters: options.filters,
        sortConfig: {
          field: options.sortBy || 'createdAt',
          order: options.sortOrder || 'desc'
        }
      }
    };
  }

  /**
   * Sanitize input data to prevent injection attacks
   */
  protected sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.trim().substring(0, 1000); // Limit string length
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (input && typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        // Skip potentially dangerous keys
        if (!key.startsWith('__') && !key.includes('$')) {
          sanitized[key] = this.sanitizeInput(value);
        }
      }
      return sanitized;
    }

    return input;
  }

  /**
   * Validate required fields in input data
   */
  protected validateRequiredFields(
    data: any,
    requiredFields: string[]
  ): string[] {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ''
      ) {
        missingFields.push(field);
      }
    }

    return missingFields;
  }

  /**
   * Get service health status
   */
  public async getHealthStatus(): Promise<
    ServiceResult<{
      status: 'healthy' | 'unhealthy';
      details: Record<string, any>;
    }>
  > {
    try {
      await this.init();

      if (!this.prisma) {
        return this.handleError(
          new Error('Database connection not available'),
          'health check'
        );
      }

      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return this.success({
        status: 'healthy' as const,
        details: {
          modelName: this.modelName,
          connectionStatus: 'connected',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      return this.handleError(error, 'health check');
    }
  }

  /**
   * Close database connection (for cleanup)
   */
  public async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
    }
  }
}
