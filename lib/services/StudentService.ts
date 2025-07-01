/**
 * Student Service Implementation
 * 
 * Provides comprehensive student management operations with proper error handling,
 * validation, and business logic encapsulation.
 * 
 * Features:
 * - Full CRUD operations for students
 * - Family relationship management
 * - Subscription tracking and management
 * - Advanced search and filtering
 * - Bulk operations support
 * - Data validation and sanitization
 * - Performance optimized queries
 * 
 * Business Rules:
 * - Students must belong to a valid family
 * - Student IDs must be unique when provided
 * - Soft delete preserves data integrity
 * - Subscription relationships are maintained
 */

import { Student, Prisma } from '@prisma/client';
import { BaseService, ServiceResult, PaginatedResult, PaginationOptions } from './BaseService';

/**
 * Data structure for creating new students
 */
export interface CreateStudentData {
  /** Student's full name */
  name: string;
  /** Grade/class level (optional) */
  grade?: string;
  /** Date of birth */
  dateOfBirth?: Date;
  /** Enrollment date (defaults to current date) */
  enrollmentDate?: Date;
  /** Family ID (required - student must belong to a family) */
  familyId: string;
  /** Custom student ID (optional - system generates if not provided) */
  studentId?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Data structure for updating existing students
 */
export interface UpdateStudentData {
  /** Updated name */
  name?: string;
  /** Updated grade */
  grade?: string;
  /** Updated date of birth */
  dateOfBirth?: Date;
  /** Active status */
  isActive?: boolean;
  /** Updated student ID */
  studentId?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Extended student data with relationships
 */
export interface StudentWithRelations extends Student {
  /** Family information */
  family: {
    id: string;
    name: string;
    discountAmount: number;
  };
  /** Active subscriptions */
  subscriptions: Array<{
    id: string;
    startDate: Date;
    endDate: Date | null;
    course?: {
      id: string;
      name: string;
      feeStructure: any;
    };
    service?: {
      id: string;
      name: string;
      feeStructure: any;
    };
  }>;
  /** Subscription count */
  _count: {
    subscriptions: number;
  };
}

/**
 * Search and filter options for students
 */
export interface StudentSearchOptions extends PaginationOptions {
  /** Search by name */
  nameSearch?: string;
  /** Filter by grade */
  grade?: string;
  /** Filter by family ID */
  familyId?: string;
  /** Filter by active status */
  isActive?: boolean;
  /** Filter by enrollment date range */
  enrollmentDateFrom?: Date;
  enrollmentDateTo?: Date;
  /** Include inactive students */
  includeInactive?: boolean;
}

/**
 * Student Service Class
 * 
 * Handles all student-related operations with proper business logic,
 * validation, and error handling.
 */
export class StudentService extends BaseService<StudentWithRelations, CreateStudentData, UpdateStudentData> {
  constructor() {
    super('Student');
  }

  /**
   * Create a new student
   * Validates family existence and handles student ID generation
   */
  async create(data: CreateStudentData): Promise<ServiceResult<StudentWithRelations>> {
    try {
      await this.init();

      if (!this.prisma) {
        return this.handleError(new Error('Database connection not available'), 'create');
      }

      // Sanitize input data
      const sanitizedData = this.sanitizeInput(data);

      // Validate required fields
      const missingFields = this.validateRequiredFields(sanitizedData, ['name', 'familyId']);
      if (missingFields.length > 0) {
        return {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          code: 'VALIDATION_ERROR',
          metadata: {
            timestamp: Date.now(),
            missingFields,
          },
        };
      }

      // Validate family exists
      const family = await this.prisma.family.findUnique({
        where: { id: sanitizedData.familyId },
        select: { id: true, name: true, discountAmount: true },
      });

      if (!family) {
        return {
          success: false,
          error: 'Family not found',
          code: 'FAMILY_NOT_FOUND',
          metadata: {
            timestamp: Date.now(),
            familyId: sanitizedData.familyId,
          },
        };
      }

      // Check for duplicate student ID if provided
      if (sanitizedData.studentId) {
        const existingStudent = await this.prisma.student.findFirst({
          where: { studentId: sanitizedData.studentId },
        });

        if (existingStudent) {
          return {
            success: false,
            error: 'Student ID already exists',
            code: 'DUPLICATE_STUDENT_ID',
            metadata: {
              timestamp: Date.now(),
              studentId: sanitizedData.studentId,
            },
          };
        }
      }

      // Create the student
      const student = await this.prisma.student.create({
        data: {
          name: sanitizedData.name,
          grade: sanitizedData.grade,
          dateOfBirth: sanitizedData.dateOfBirth,
          enrollmentDate: sanitizedData.enrollmentDate || new Date(),
          familyId: sanitizedData.familyId,
          studentId: sanitizedData.studentId,
          isActive: true,
        },
        include: {
          family: {
            select: {
              id: true,
              name: true,
              discountAmount: true,
            },
          },
          subscriptions: {
            include: {
              course: {
                select: {
                  id: true,
                  name: true,
                  feeStructure: true,
                },
              },
              service: {
                select: {
                  id: true,
                  name: true,
                  feeStructure: true,
                },
              },
            },
            where: {
              endDate: null, // Only active subscriptions
            },
          },
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });

      return this.success(student as StudentWithRelations, {
        operation: 'create',
        familyName: family.name,
      });
    } catch (error) {
      return this.handleError(error, 'create', { data });
    }
  }

  /**
   * Find student by ID with full relationship data
   */
  async findById(id: string): Promise<ServiceResult<StudentWithRelations>> {
    try {
      await this.init();

      if (!this.prisma) {
        return this.handleError(new Error('Database connection not available'), 'findById');
      }

      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: 'Invalid student ID provided',
          code: 'INVALID_ID',
          metadata: {
            timestamp: Date.now(),
            providedId: id,
          },
        };
      }

      const student = await this.prisma.student.findUnique({
        where: { id },
        include: {
          family: {
            select: {
              id: true,
              name: true,
              discountAmount: true,
            },
          },
          subscriptions: {
            include: {
              course: {
                select: {
                  id: true,
                  name: true,
                  feeStructure: true,
                },
              },
              service: {
                select: {
                  id: true,
                  name: true,
                  feeStructure: true,
                },
              },
            },
            where: {
              endDate: null, // Only active subscriptions
            },
            orderBy: {
              startDate: 'desc',
            },
          },
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });

      if (!student) {
        return {
          success: false,
          error: 'Student not found',
          code: 'STUDENT_NOT_FOUND',
          metadata: {
            timestamp: Date.now(),
            studentId: id,
          },
        };
      }

      return this.success(student as StudentWithRelations, {
        operation: 'findById',
        includeRelations: true,
      });
    } catch (error) {
      return this.handleError(error, 'findById', { id });
    }
  }

  /**
   * Update an existing student
   */
  async update(id: string, data: UpdateStudentData): Promise<ServiceResult<StudentWithRelations>> {
    try {
      await this.init();

      if (!this.prisma) {
        return this.handleError(new Error('Database connection not available'), 'update');
      }

      // Validate ID
      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: 'Invalid student ID provided',
          code: 'INVALID_ID',
          metadata: {
            timestamp: Date.now(),
            providedId: id,
          },
        };
      }

      // Sanitize input data
      const sanitizedData = this.sanitizeInput(data);

      // Check if student exists
      const existingStudent = await this.prisma.student.findUnique({
        where: { id },
        select: { id: true, studentId: true },
      });

      if (!existingStudent) {
        return {
          success: false,
          error: 'Student not found',
          code: 'STUDENT_NOT_FOUND',
          metadata: {
            timestamp: Date.now(),
            studentId: id,
          },
        };
      }

      // Check for duplicate student ID if being updated
      if (sanitizedData.studentId && sanitizedData.studentId !== existingStudent.studentId) {
        const duplicateStudent = await this.prisma.student.findFirst({
          where: {
            studentId: sanitizedData.studentId,
            id: { not: id },
          },
        });

        if (duplicateStudent) {
          return {
            success: false,
            error: 'Student ID already exists',
            code: 'DUPLICATE_STUDENT_ID',
            metadata: {
              timestamp: Date.now(),
              studentId: sanitizedData.studentId,
            },
          };
        }
      }

      // Update the student
      const updatedStudent = await this.prisma.student.update({
        where: { id },
        data: sanitizedData,
        include: {
          family: {
            select: {
              id: true,
              name: true,
              discountAmount: true,
            },
          },
          subscriptions: {
            include: {
              course: {
                select: {
                  id: true,
                  name: true,
                  feeStructure: true,
                },
              },
              service: {
                select: {
                  id: true,
                  name: true,
                  feeStructure: true,
                },
              },
            },
            where: {
              endDate: null,
            },
            orderBy: {
              startDate: 'desc',
            },
          },
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });

      return this.success(updatedStudent as StudentWithRelations, {
        operation: 'update',
        updatedFields: Object.keys(sanitizedData),
      });
    } catch (error) {
      return this.handleError(error, 'update', { id, data });
    }
  }

  /**
   * Soft delete a student (sets isActive to false)
   */
  async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      await this.init();

      if (!this.prisma) {
        return this.handleError(new Error('Database connection not available'), 'delete');
      }

      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: 'Invalid student ID provided',
          code: 'INVALID_ID',
          metadata: {
            timestamp: Date.now(),
            providedId: id,
          },
        };
      }

      // Check if student exists
      const existingStudent = await this.prisma.student.findUnique({
        where: { id },
        select: { id: true, name: true, isActive: true },
      });

      if (!existingStudent) {
        return {
          success: false,
          error: 'Student not found',
          code: 'STUDENT_NOT_FOUND',
          metadata: {
            timestamp: Date.now(),
            studentId: id,
          },
        };
      }

      if (!existingStudent.isActive) {
        return {
          success: false,
          error: 'Student is already inactive',
          code: 'ALREADY_INACTIVE',
          metadata: {
            timestamp: Date.now(),
            studentId: id,
          },
        };
      }

      // Soft delete by setting isActive to false
      await this.prisma.student.update({
        where: { id },
        data: { isActive: false },
      });

      return this.success(true, {
        operation: 'delete',
        studentName: existingStudent.name,
        deletionType: 'soft',
      });
    } catch (error) {
      return this.handleError(error, 'delete', { id });
    }
  }

  /**
   * Find multiple students with advanced search and pagination
   */
  async findMany(options?: StudentSearchOptions): Promise<ServiceResult<PaginatedResult<StudentWithRelations>>> {
    try {
      await this.init();

      if (!this.prisma) {
        return this.handleError(new Error('Database connection not available'), 'findMany');
      }

      const validatedOptions = this.validatePaginationOptions(options);
      const searchOptions = options as StudentSearchOptions;

      // Build where clause
      const where: Prisma.StudentWhereInput = {
        isActive: searchOptions?.includeInactive ? undefined : true,
      };

      // Add search filters
      if (searchOptions?.nameSearch) {
        where.name = {
          contains: searchOptions.nameSearch,
          mode: 'insensitive',
        };
      }

      if (searchOptions?.grade) {
        where.grade = searchOptions.grade;
      }

      if (searchOptions?.familyId) {
        where.familyId = searchOptions.familyId;
      }

      if (searchOptions?.isActive !== undefined) {
        where.isActive = searchOptions.isActive;
      }

      if (searchOptions?.enrollmentDateFrom || searchOptions?.enrollmentDateTo) {
        where.enrollmentDate = {};
        if (searchOptions.enrollmentDateFrom) {
          where.enrollmentDate.gte = searchOptions.enrollmentDateFrom;
        }
        if (searchOptions.enrollmentDateTo) {
          where.enrollmentDate.lte = searchOptions.enrollmentDateTo;
        }
      }

      const queryStartTime = Date.now();

      // Execute queries in parallel
      const [students, total] = await Promise.all([
        this.prisma.student.findMany({
          skip: (validatedOptions.page - 1) * validatedOptions.limit,
          take: validatedOptions.limit,
          where,
          orderBy: {
            [validatedOptions.sortBy || 'createdAt']: validatedOptions.sortOrder || 'desc',
          },
          include: {
            family: {
              select: {
                id: true,
                name: true,
                discountAmount: true,
              },
            },
            subscriptions: {
              include: {
                course: {
                  select: {
                    id: true,
                    name: true,
                    feeStructure: true,
                  },
                },
                service: {
                  select: {
                    id: true,
                    name: true,
                    feeStructure: true,
                  },
                },
              },
              where: {
                endDate: null,
              },
              orderBy: {
                startDate: 'desc',
              },
            },
            _count: {
              select: {
                subscriptions: true,
              },
            },
          },
        }),
        this.prisma.student.count({ where }),
      ]);

      const queryTime = Date.now() - queryStartTime;
      const paginationMetadata = this.buildPaginationMetadata(total, validatedOptions, queryTime);

      const result: PaginatedResult<StudentWithRelations> = {
        data: students as StudentWithRelations[],
        ...paginationMetadata,
      };

      return this.success(result, {
        operation: 'findMany',
        appliedFilters: searchOptions,
        queryTime,
      });
    } catch (error) {
      return this.handleError(error, 'findMany', { options });
    }
  }

  /**
   * Find students by family ID
   */
  async findByFamilyId(familyId: string): Promise<ServiceResult<StudentWithRelations[]>> {
    try {
      await this.init();

      if (!this.prisma) {
        return this.handleError(new Error('Database connection not available'), 'findByFamilyId');
      }

      if (!familyId || typeof familyId !== 'string') {
        return {
          success: false,
          error: 'Invalid family ID provided',
          code: 'INVALID_ID',
          metadata: {
            timestamp: Date.now(),
            providedId: familyId,
          },
        };
      }

      const students = await this.prisma.student.findMany({
        where: { 
          familyId, 
          isActive: true 
        },
        include: {
          family: {
            select: {
              id: true,
              name: true,
              discountAmount: true,
            },
          },
          subscriptions: {
            include: {
              course: {
                select: {
                  id: true,
                  name: true,
                  feeStructure: true,
                },
              },
              service: {
                select: {
                  id: true,
                  name: true,
                  feeStructure: true,
                },
              },
            },
            where: {
              endDate: null,
            },
            orderBy: {
              startDate: 'desc',
            },
          },
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return this.success(students as StudentWithRelations[], {
        operation: 'findByFamilyId',
        familyId,
        count: students.length,
      });
    } catch (error) {
      return this.handleError(error, 'findByFamilyId', { familyId });
    }
  }

  /**
   * Get student statistics
   */
  async getStatistics(): Promise<ServiceResult<{
    total: number;
    active: number;
    inactive: number;
    byGrade: Record<string, number>;
    recentEnrollments: number;
  }>> {
    try {
      await this.init();

      if (!this.prisma) {
        return this.handleError(new Error('Database connection not available'), 'getStatistics');
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [total, active, inactive, gradeStats, recentEnrollments] = await Promise.all([
        this.prisma.student.count(),
        this.prisma.student.count({ where: { isActive: true } }),
        this.prisma.student.count({ where: { isActive: false } }),
        this.prisma.student.groupBy({
          by: ['grade'],
          _count: { grade: true },
          where: { isActive: true },
        }),
        this.prisma.student.count({
          where: {
            enrollmentDate: { gte: thirtyDaysAgo },
            isActive: true,
          },
        }),
      ]);

      const byGrade: Record<string, number> = {};
      gradeStats.forEach(stat => {
        if (stat.grade) {
          byGrade[stat.grade] = stat._count.grade;
        }
      });

      const statistics = {
        total,
        active,
        inactive,
        byGrade,
        recentEnrollments,
      };

      return this.success(statistics, {
        operation: 'getStatistics',
        calculatedAt: new Date().toISOString(),
      });
    } catch (error) {
      return this.handleError(error, 'getStatistics');
    }
  }
}
