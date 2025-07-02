/**
 * Prisma Mock Utilities
 *
 * Comprehensive mocking utilities for Prisma client testing.
 * Provides realistic mock data and behavior for service layer testing.
 */

import { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';

// Mock the database module to return our enhanced mock
vi.mock('@/lib/database', () => ({
  getPrismaClient: vi.fn(),
  testDatabaseConnection: vi.fn(),
  disconnectDatabase: vi.fn(),
  getDatabaseHealth: vi.fn(),
  executeDatabaseOperation: vi.fn(),
}));

// Create a proper Vitest mock type for PrismaClient
type MockedPrismaClient = {
  student: {
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  family: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  $queryRaw: ReturnType<typeof vi.fn>;
  $connect: ReturnType<typeof vi.fn>;
  $disconnect: ReturnType<typeof vi.fn>;
  $transaction: ReturnType<typeof vi.fn>;
};

/**
 * Mock student data for testing
 */
export const mockStudentData = {
  id: 'student-123',
  name: 'John Doe',
  grade: '10th',
  dateOfBirth: new Date('2008-05-15'),
  enrollmentDate: new Date('2023-09-01'),
  familyId: 'family-456',
  studentId: 'STU-2023-001',
  isActive: true,
  createdAt: new Date('2023-09-01'),
  updatedAt: new Date('2023-09-01'),
};

/**
 * Mock family data for testing
 */
export const mockFamilyData = {
  id: 'family-456',
  name: 'Doe Family',
  discountAmount: 100,
  createdAt: new Date('2023-09-01'),
  updatedAt: new Date('2023-09-01'),
};

/**
 * Mock subscription data for testing
 */
export const mockSubscriptionData = {
  id: 'subscription-789',
  startDate: new Date('2023-09-01'),
  endDate: null,
  studentId: 'student-123',
  courseId: 'course-101',
  serviceId: null,
  createdAt: new Date('2023-09-01'),
  updatedAt: new Date('2023-09-01'),
};

/**
 * Mock course data for testing
 */
export const mockCourseData = {
  id: 'course-101',
  name: 'Mathematics Advanced',
  feeStructure: {
    id: 'fee-structure-1',
    amount: 500,
    billingCycle: 'monthly',
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2023-09-01'),
    courseId: 'course-101',
    serviceId: null,
  },
};

/**
 * Mock student with relations for testing
 */
export const mockStudentWithRelations = {
  ...mockStudentData,
  family: {
    id: mockFamilyData.id,
    name: mockFamilyData.name,
    discountAmount: mockFamilyData.discountAmount,
  },
  subscriptions: [
    {
      ...mockSubscriptionData,
      course: {
        id: mockCourseData.id,
        name: mockCourseData.name,
        feeStructure: mockCourseData.feeStructure,
      },
      service: null,
    },
  ],
  _count: {
    subscriptions: 1,
  },
};

/**
 * Create a comprehensive Prisma mock
 */
export function createPrismaMock(): MockedPrismaClient {
  const prismaMock = {
    student: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    family: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    subscription: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    course: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $queryRaw: vi.fn(),
    $queryRawUnsafe: vi.fn(),
    $executeRaw: vi.fn(),
    $executeRawUnsafe: vi.fn(),
    $transaction: vi.fn(),
    $use: vi.fn(),
    $on: vi.fn(),
    $extends: vi.fn(),
  } as unknown as MockedPrismaClient;

  return prismaMock;
}

/**
 * Enhanced mock state management for realistic business logic simulation
 */
interface MockState {
  students: Map<string, any>;
  families: Map<string, any>;
  studentIdRegistry: Set<string>;
  nextStudentId: number;
}

const mockState: MockState = {
  students: new Map(),
  families: new Map(),
  studentIdRegistry: new Set(),
  nextStudentId: 1,
};

/**
 * Reset mock state between tests
 */
export function resetMockState() {
  mockState.students.clear();
  mockState.families.clear();
  mockState.studentIdRegistry.clear();
  mockState.nextStudentId = 1;

  // Add default family for testing
  mockState.families.set('family-456', mockFamilyData);

  // Add default student for testing (to match existing test expectations)
  const defaultStudent = {
    ...mockStudentWithRelations,
    id: 'student-123',
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2023-09-01'),
  };
  mockState.students.set('student-123', defaultStudent);
  mockState.studentIdRegistry.add(defaultStudent.studentId);
}

/**
 * Setup enhanced mock behaviors that simulate real business logic
 */
export async function setupDefaultMockBehaviors(prismaMock: MockedPrismaClient) {
  // Initialize mock state
  resetMockState();

  // Setup database module mock to return our enhanced Prisma mock
  // Import the mocked module and configure it
  const databaseModule = await import('@/lib/database');
  const mockedGetPrismaClient = vi.mocked(databaseModule.getPrismaClient);

  // Ensure the mock is properly configured
  mockedGetPrismaClient.mockClear();
  mockedGetPrismaClient.mockResolvedValue(prismaMock as any);

  // Also mock other database functions for completeness
  const mockedTestConnection = vi.mocked(databaseModule.testDatabaseConnection);
  const mockedDisconnect = vi.mocked(databaseModule.disconnectDatabase);
  const mockedGetHealth = vi.mocked(databaseModule.getDatabaseHealth);

  mockedTestConnection.mockResolvedValue({
    status: 'healthy',
    responseTime: 50,
    timestamp: new Date().toISOString(),
    message: 'Database connection successful',
  });
  mockedDisconnect.mockResolvedValue(undefined);
  mockedGetHealth.mockResolvedValue({
    healthy: true,
    details: {
      status: 'healthy',
      responseTime: 50,
      timestamp: new Date().toISOString(),
      message: 'Database health check successful',
    },
  });

  // Enhanced Student Create - Simulates real business logic
  prismaMock.student.create.mockImplementation(async (args: any) => {
    const data = args.data;

    // Simulate required field validation (handled by Prisma schema)
    if (!data.name || !data.familyId) {
      throw new Error('Missing required fields');
    }

    // Simulate family existence check
    if (!mockState.families.has(data.familyId)) {
      throw new Error('Family not found');
    }

    // Simulate duplicate student ID check
    if (data.studentId && mockState.studentIdRegistry.has(data.studentId)) {
      throw new Error('Student ID already exists');
    }

    // Generate student ID if not provided
    const studentId = data.studentId || `STU-2023-${String(mockState.nextStudentId++).padStart(3, '0')}`;

    // Create student with relationships (preserve test expectations for specific data)
    const newStudent = {
      ...mockStudentWithRelations,
      id: data.id || `student-${Date.now()}`,
      name: data.name,
      grade: data.grade || mockStudentWithRelations.grade,
      dateOfBirth: data.dateOfBirth || mockStudentWithRelations.dateOfBirth,
      enrollmentDate: data.enrollmentDate || mockStudentWithRelations.enrollmentDate,
      familyId: data.familyId,
      studentId,
      isActive: true,
      createdAt: data.createdAt || mockStudentWithRelations.createdAt,
      updatedAt: data.updatedAt || mockStudentWithRelations.updatedAt,
      family: mockState.families.get(data.familyId),
    };

    // Store in mock state
    mockState.students.set(newStudent.id, newStudent);
    mockState.studentIdRegistry.add(studentId);

    return newStudent;
  });

  // Enhanced Student FindUnique - Simulates database lookup
  prismaMock.student.findUnique.mockImplementation(async (args: any) => {
    const { where } = args;

    if (where.id) {
      return mockState.students.get(where.id) || null;
    }

    if (where.studentId) {
      for (const student of mockState.students.values()) {
        if (student.studentId === where.studentId) {
          return student;
        }
      }
    }

    return null;
  });

  // Enhanced Student FindFirst - Simulates complex queries
  prismaMock.student.findFirst.mockImplementation(async (args: any) => {
    const { where } = args;

    for (const student of mockState.students.values()) {
      // Check studentId match
      if (where.studentId && student.studentId === where.studentId) {
        // Check exclusion criteria (for duplicate checking)
        if (where.id?.not && student.id === where.id.not) {
          continue;
        }
        return student;
      }
    }

    return null;
  });

  // Enhanced Student FindMany - Simulates pagination and filtering
  prismaMock.student.findMany.mockImplementation(async (args: any) => {
    const { skip = 0, take = 50, where = {}, orderBy } = args;

    let students = Array.from(mockState.students.values());

    // Apply filters
    if (where.isActive !== undefined) {
      students = students.filter(s => s.isActive === where.isActive);
    }

    if (where.familyId) {
      students = students.filter(s => s.familyId === where.familyId);
    }

    if (where.name?.contains) {
      const searchTerm = where.name.contains.toLowerCase();
      students = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm),
      );
    }

    if (where.grade) {
      students = students.filter(s => s.grade === where.grade);
    }

    // Apply sorting
    if (orderBy) {
      const sortField = Object.keys(orderBy)[0];
      const sortOrder = orderBy[sortField];
      students.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    // Apply pagination
    return students.slice(skip, skip + take);
  });

  // Enhanced Student Count - Simulates count with filters
  prismaMock.student.count.mockImplementation(async (args: any) => {
    const { where = {} } = args;

    let students = Array.from(mockState.students.values());

    // Apply same filters as findMany
    if (where.isActive !== undefined) {
      students = students.filter(s => s.isActive === where.isActive);
    }

    if (where.familyId) {
      students = students.filter(s => s.familyId === where.familyId);
    }

    if (where.name?.contains) {
      const searchTerm = where.name.contains.toLowerCase();
      students = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm),
      );
    }

    return students.length;
  });

  // Enhanced Student Update - Simulates business logic validation
  prismaMock.student.update.mockImplementation(async (args: any) => {
    const { where, data } = args;
    const studentId = where.id;

    // Check if student exists
    const existingStudent = mockState.students.get(studentId);
    if (!existingStudent) {
      throw new Error('Student not found');
    }

    // Check for duplicate student ID if being updated
    if (data.studentId && data.studentId !== existingStudent.studentId) {
      if (mockState.studentIdRegistry.has(data.studentId)) {
        throw new Error('Student ID already exists');
      }
    }

    // Update student
    const updatedStudent = {
      ...existingStudent,
      ...data,
      updatedAt: new Date(),
    };

    // Update registries
    if (data.studentId && data.studentId !== existingStudent.studentId) {
      mockState.studentIdRegistry.delete(existingStudent.studentId);
      mockState.studentIdRegistry.add(data.studentId);
    }

    mockState.students.set(studentId, updatedStudent);
    return updatedStudent;
  });

  // Enhanced Student Delete - Simulates soft delete
  prismaMock.student.delete.mockImplementation(async (args: any) => {
    const { where } = args;
    const studentId = where.id;

    // Check if student exists
    const existingStudent = mockState.students.get(studentId);
    if (!existingStudent) {
      throw new Error('Student not found');
    }

    // Perform soft delete by updating isActive flag
    const deletedStudent = {
      ...existingStudent,
      isActive: false,
      updatedAt: new Date(),
    };

    mockState.students.set(studentId, deletedStudent);
    return deletedStudent;
  });

  // Enhanced Family operations
  prismaMock.family.findUnique.mockImplementation(async (args: any) => {
    const { where } = args;
    return mockState.families.get(where.id) || null;
  });

  prismaMock.family.findMany.mockResolvedValue([mockFamilyData] as any);

  // Database operations
  prismaMock.$queryRaw.mockResolvedValue([{ result: 1 }]);
  prismaMock.$connect.mockResolvedValue(undefined);
  prismaMock.$disconnect.mockResolvedValue(undefined);
  prismaMock.$transaction.mockImplementation(async (fn: any) => {
    if (typeof fn === 'function') {
      return fn(prismaMock);
    }
    return fn;
  });

  return prismaMock;
}

/**
 * Mock error scenarios for testing error handling
 */
export const mockErrors = {
  uniqueConstraintViolation: {
    code: 'P2002',
    message: 'Unique constraint failed',
    meta: { target: ['studentId'] },
  },
  recordNotFound: {
    code: 'P2025',
    message: 'Record not found',
  },
  foreignKeyConstraintViolation: {
    code: 'P2003',
    message: 'Foreign key constraint failed',
  },
  invalidId: {
    code: 'P2014',
    message: 'Invalid ID provided',
  },
  connectionError: {
    code: 'P1001',
    message: 'Database connection failed',
  },
  timeoutError: {
    code: 'P2024',
    message: 'Query timeout',
  },
};

/**
 * Setup error scenarios for testing
 */
export function setupErrorScenarios(prismaMock: MockedPrismaClient) {
  return {
    simulateUniqueConstraintError: () => {
      prismaMock.student.create.mockRejectedValueOnce(mockErrors.uniqueConstraintViolation);
    },
    simulateRecordNotFoundError: () => {
      prismaMock.student.findUnique.mockResolvedValueOnce(null);
    },
    simulateForeignKeyError: () => {
      prismaMock.student.create.mockRejectedValueOnce(mockErrors.foreignKeyConstraintViolation);
    },
    simulateConnectionError: () => {
      prismaMock.$connect.mockRejectedValueOnce(mockErrors.connectionError);
    },
    simulateTimeoutError: () => {
      prismaMock.student.findMany.mockRejectedValueOnce(mockErrors.timeoutError);
    },
    resetMocks: () => {
      vi.clearAllMocks();
      resetMockState();
      setupDefaultMockBehaviors(prismaMock);
    },
  };
}

/**
 * Performance testing utilities
 */
export const performanceTestUtils = {
  /**
   * Simulate slow database operations
   */
  simulateSlowOperation: (prismaMock: MockedPrismaClient, delay: number = 1000) => {
    prismaMock.student.findMany.mockImplementation(
      () => new Promise(resolve => 
        setTimeout(() => resolve([mockStudentWithRelations] as any), delay),
      ),
    );
  },

  /**
   * Simulate large dataset operations with enhanced mock state
   */
  simulateLargeDataset: (prismaMock: MockedPrismaClient, count: number = 1000) => {
    // Clear existing mock state and populate with large dataset
    resetMockState();

    // Generate large dataset and store in mock state
    for (let i = 0; i < count; i++) {
      const studentId = `student-${i}`;
      const student = {
        ...mockStudentWithRelations,
        id: studentId,
        name: `Student ${i}`,
        studentId: `STU-2023-${String(i).padStart(3, '0')}`,
      };

      mockState.students.set(studentId, student);
      mockState.studentIdRegistry.add(student.studentId);
    }

    // The enhanced findMany and count implementations will automatically
    // handle pagination and filtering using the populated mock state
  },

  /**
   * Measure operation performance
   */
  measurePerformance: async (operation: () => Promise<any>) => {
    const startTime = Date.now();
    const result = await operation();
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      result,
      duration,
      startTime,
      endTime,
    };
  },
};

/**
 * Validation test utilities
 */
export const validationTestUtils = {
  /**
   * Generate invalid data for testing validation
   */
  generateInvalidStudentData: () => ({
    emptyName: { ...mockStudentData, name: '' },
    nullName: { ...mockStudentData, name: null },
    invalidFamilyId: { ...mockStudentData, familyId: 'invalid-id' },
    duplicateStudentId: { ...mockStudentData, studentId: 'DUPLICATE-ID' },
    futureEnrollmentDate: { ...mockStudentData, enrollmentDate: new Date('2030-01-01') },
    invalidGrade: { ...mockStudentData, grade: 'InvalidGrade' },
  }),

  /**
   * Generate edge case data for testing
   */
  generateEdgeCaseData: () => ({
    veryLongName: { ...mockStudentData, name: 'A'.repeat(1000) },
    specialCharactersName: { ...mockStudentData, name: '!@#$%^&*()_+{}|:"<>?[]\\;\',./' },
    unicodeName: { ...mockStudentData, name: '测试学生 José María' },
    emptyGrade: { ...mockStudentData, grade: '' },
    nullGrade: { ...mockStudentData, grade: null },
    pastDateOfBirth: { ...mockStudentData, dateOfBirth: new Date('1900-01-01') },
    futureDateOfBirth: { ...mockStudentData, dateOfBirth: new Date('2030-01-01') },
  }),
};

/**
 * Integration test utilities
 */
export const integrationTestUtils = {
  /**
   * Setup realistic database state for integration tests
   */
  setupRealisticDatabaseState: (prismaMock: MockedPrismaClient) => {
    // Multiple families
    const families = [
      { ...mockFamilyData, id: 'family-1', name: 'Smith Family' },
      { ...mockFamilyData, id: 'family-2', name: 'Johnson Family' },
      { ...mockFamilyData, id: 'family-3', name: 'Williams Family' },
    ];

    // Multiple students across families
    const students = [
      { ...mockStudentData, id: 'student-1', name: 'Alice Smith', familyId: 'family-1' },
      { ...mockStudentData, id: 'student-2', name: 'Bob Smith', familyId: 'family-1' },
      { ...mockStudentData, id: 'student-3', name: 'Charlie Johnson', familyId: 'family-2' },
      { ...mockStudentData, id: 'student-4', name: 'Diana Williams', familyId: 'family-3' },
    ];

    prismaMock.family.findMany.mockResolvedValue(families as any);
    prismaMock.student.findMany.mockResolvedValue(students as any);
    prismaMock.student.count.mockResolvedValue(students.length);

    return { families, students };
  },

  /**
   * Simulate concurrent operations for testing race conditions
   */
  simulateConcurrentOperations: async (operations: (() => Promise<any>)[]) => {
    const results = await Promise.allSettled(operations.map(op => op()));
    
    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results,
    };
  },
};

/**
 * Contract testing utilities to validate mock authenticity
 */
export const contractTestUtils = {
  /**
   * Validate that mock behavior matches expected business logic
   */
  validateStudentCreation: async (prismaMock: MockedPrismaClient) => {
    const validData = {
      name: 'Test Student',
      familyId: 'family-456',
      studentId: 'TEST-001',
    };

    // Test successful creation
    const result = await prismaMock.student.create({ data: validData });
    if (!result || result.name !== validData.name) {
      throw new Error('Mock creation behavior does not match expected logic');
    }

    // Test duplicate student ID prevention
    try {
      await prismaMock.student.create({ data: validData });
      throw new Error('Mock should prevent duplicate student IDs');
    } catch (error) {
      if (!(error as Error).message.includes('already exists')) {
        throw new Error('Mock error handling does not match expected behavior');
      }
    }

    return true;
  },

  /**
   * Validate pagination behavior
   */
  validatePagination: async (prismaMock: MockedPrismaClient) => {
    // Setup large dataset
    performanceTestUtils.simulateLargeDataset(prismaMock, 100);

    // Test pagination
    const page1 = await prismaMock.student.findMany({ skip: 0, take: 10 });
    const page2 = await prismaMock.student.findMany({ skip: 10, take: 10 });

    if (page1.length !== 10 || page2.length !== 10) {
      throw new Error('Mock pagination behavior is incorrect');
    }

    if (page1[0].id === page2[0].id) {
      throw new Error('Mock pagination is not returning different records');
    }

    return true;
  },

  /**
   * Validate business rule enforcement
   */
  validateBusinessRules: async (prismaMock: MockedPrismaClient) => {
    // Test family validation
    try {
      await prismaMock.student.create({
        data: {
          name: 'Test Student',
          familyId: 'non-existent-family',
        },
      });
      throw new Error('Mock should enforce family existence validation');
    } catch (error) {
      if (!(error as Error).message.includes('Family not found')) {
        throw new Error('Mock family validation error message is incorrect');
      }
    }

    return true;
  },
};
