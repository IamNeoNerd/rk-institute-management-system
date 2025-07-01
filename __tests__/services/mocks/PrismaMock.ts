/**
 * Prisma Mock Utilities
 *
 * Comprehensive mocking utilities for Prisma client testing.
 * Provides realistic mock data and behavior for service layer testing.
 */

import { vi } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Create a proper Vitest mock type for PrismaClient
type MockedPrismaClient = {
  [K in keyof PrismaClient]: PrismaClient[K] extends (...args: any[]) => any
    ? ReturnType<typeof vi.fn>
    : PrismaClient[K] extends { [key: string]: (...args: any[]) => any }
    ? { [P in keyof PrismaClient[K]]: ReturnType<typeof vi.fn> }
    : ReturnType<typeof vi.fn>;
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
 * Setup default mock behaviors for common operations
 */
export function setupDefaultMockBehaviors(prismaMock: MockedPrismaClient) {
  // Student operations
  prismaMock.student.create.mockResolvedValue(mockStudentWithRelations as any);
  prismaMock.student.findUnique.mockResolvedValue(mockStudentWithRelations as any);
  prismaMock.student.findMany.mockResolvedValue([mockStudentWithRelations] as any);
  prismaMock.student.update.mockResolvedValue(mockStudentWithRelations as any);
  prismaMock.student.count.mockResolvedValue(1);
  prismaMock.student.groupBy.mockResolvedValue([
    { grade: '10th', _count: { grade: 1 } },
  ] as any);

  // Family operations
  prismaMock.family.findUnique.mockResolvedValue(mockFamilyData as any);
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
      jest.clearAllMocks();
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
        setTimeout(() => resolve([mockStudentWithRelations] as any), delay)
      )
    );
  },

  /**
   * Simulate large dataset operations
   */
  simulateLargeDataset: (prismaMock: MockedPrismaClient, count: number = 1000) => {
    const largeDataset = Array.from({ length: count }, (_, index) => ({
      ...mockStudentWithRelations,
      id: `student-${index}`,
      name: `Student ${index}`,
      studentId: `STU-2023-${String(index).padStart(3, '0')}`,
    }));

    prismaMock.student.findMany.mockResolvedValue(largeDataset as any);
    prismaMock.student.count.mockResolvedValue(count);
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
