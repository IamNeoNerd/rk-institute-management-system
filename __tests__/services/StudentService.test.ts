/**
 * StudentService Test Suite
 * 
 * Comprehensive tests for StudentService including:
 * - CRUD operations with business logic validation
 * - Family relationship management
 * - Search and filtering functionality
 * - Statistics and analytics
 * - Error handling and edge cases
 * - Performance and integration testing
 */

import { vi } from 'vitest';
import { StudentService, CreateStudentData, UpdateStudentData } from '@/lib/services/StudentService';
import { BaseService } from '@/lib/services/BaseService';
import {
  createPrismaMock,
  setupDefaultMockBehaviors,
  setupErrorScenarios,
  mockStudentWithRelations,
  mockFamilyData,
  validationTestUtils,
  performanceTestUtils,
  integrationTestUtils,
} from './mocks/PrismaMock';

// Mock the database module
vi.mock('@/lib/database', () => ({
  getPrismaClient: vi.fn(),
}));

describe('StudentService', () => {
  let studentService: StudentService;
  let prismaMock: any;
  let errorScenarios: any;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create fresh mocks
    prismaMock = createPrismaMock();
    setupDefaultMockBehaviors(prismaMock);
    errorScenarios = setupErrorScenarios(prismaMock);

    // Mock the database module
    const { getPrismaClient } = await import('@/lib/database');
    vi.mocked(getPrismaClient).mockResolvedValue(prismaMock);
    
    // Create fresh service instance
    studentService = new StudentService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Initialization', () => {
    test('should create StudentService instance', () => {
      expect(studentService).toBeInstanceOf(StudentService);
      expect(studentService).toBeInstanceOf(BaseService);
    });

    test('should inherit from BaseService', () => {
      expect(studentService).toBeInstanceOf(BaseService);
      expect(typeof studentService.getHealthStatus).toBe('function');
      expect(typeof studentService.disconnect).toBe('function');
    });
  });

  describe('Create Student Operations', () => {
    const validCreateData: CreateStudentData = {
      name: 'John Doe',
      grade: '10th',
      dateOfBirth: new Date('2008-05-15'),
      familyId: 'family-456',
      studentId: 'STU-2023-001',
    };

    test('should create student successfully with valid data', async () => {
      const result = await studentService.create(validCreateData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStudentWithRelations);
      expect(result.metadata).toHaveProperty('timestamp');
      expect(result.metadata?.context).toHaveProperty('operation', 'create');
      
      expect(prismaMock.family.findUnique).toHaveBeenCalledWith({
        where: { id: validCreateData.familyId },
        select: { id: true, name: true, discountAmount: true },
      });
      
      expect(prismaMock.student.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: validCreateData.name,
          grade: validCreateData.grade,
          familyId: validCreateData.familyId,
          isActive: true,
        }),
        include: expect.any(Object),
      });
    });

    test('should validate required fields', async () => {
      const invalidData = { name: '', familyId: '' } as CreateStudentData;
      
      const result = await studentService.create(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.error).toContain('Missing required fields');
      expect(result.metadata?.missingFields).toContain('name');
      expect(result.metadata?.missingFields).toContain('familyId');
    });

    test('should validate family exists', async () => {
      prismaMock.family.findUnique.mockResolvedValueOnce(null);
      
      const result = await studentService.create(validCreateData);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('FAMILY_NOT_FOUND');
      expect(result.error).toBe('Family not found');
      expect(result.metadata?.familyId).toBe(validCreateData.familyId);
    });

    test('should check for duplicate student ID', async () => {
      prismaMock.student.findFirst.mockResolvedValueOnce({ id: 'existing-student' });
      
      const result = await studentService.create(validCreateData);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('DUPLICATE_STUDENT_ID');
      expect(result.error).toBe('Student ID already exists');
      expect(result.metadata?.studentId).toBe(validCreateData.studentId);
    });

    test('should handle database errors during creation', async () => {
      errorScenarios.simulateUniqueConstraintError();
      
      const result = await studentService.create(validCreateData);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNIQUE_CONSTRAINT_VIOLATION');
      expect(result.metadata?.context).toEqual({ data: validCreateData });
    });

    test('should set default enrollment date if not provided', async () => {
      const dataWithoutDate = { ...validCreateData };
      delete dataWithoutDate.enrollmentDate;
      
      await studentService.create(dataWithoutDate);
      
      expect(prismaMock.student.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          enrollmentDate: expect.any(Date),
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('Find Student Operations', () => {
    test('should find student by ID successfully', async () => {
      const result = await studentService.findById('student-123');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStudentWithRelations);
      expect(result.metadata?.context).toHaveProperty('operation', 'findById');
      
      expect(prismaMock.student.findUnique).toHaveBeenCalledWith({
        where: { id: 'student-123' },
        include: expect.objectContaining({
          family: expect.any(Object),
          subscriptions: expect.any(Object),
          _count: expect.any(Object),
        }),
      });
    });

    test('should handle student not found', async () => {
      prismaMock.student.findUnique.mockResolvedValueOnce(null);
      
      const result = await studentService.findById('non-existent-id');
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('STUDENT_NOT_FOUND');
      expect(result.error).toBe('Student not found');
      expect(result.metadata?.studentId).toBe('non-existent-id');
    });

    test('should validate student ID format', async () => {
      const result = await studentService.findById('');
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_ID');
      expect(result.error).toBe('Invalid student ID provided');
    });

    test('should find students by family ID', async () => {
      const familyStudents = [mockStudentWithRelations];
      prismaMock.student.findMany.mockResolvedValueOnce(familyStudents);
      
      const result = await studentService.findByFamilyId('family-456');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(familyStudents);
      expect(result.metadata?.context).toHaveProperty('familyId', 'family-456');
      
      expect(prismaMock.student.findMany).toHaveBeenCalledWith({
        where: { familyId: 'family-456', isActive: true },
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('Update Student Operations', () => {
    const validUpdateData: UpdateStudentData = {
      name: 'John Updated',
      grade: '11th',
      isActive: true,
    };

    test('should update student successfully', async () => {
      const result = await studentService.update('student-123', validUpdateData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStudentWithRelations);
      expect(result.metadata?.context).toHaveProperty('operation', 'update');
      expect(result.metadata?.context).toHaveProperty('updatedFields');
      
      expect(prismaMock.student.findUnique).toHaveBeenCalledWith({
        where: { id: 'student-123' },
        select: { id: true, studentId: true },
      });
      
      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-123' },
        data: validUpdateData,
        include: expect.any(Object),
      });
    });

    test('should validate student exists before update', async () => {
      prismaMock.student.findUnique.mockResolvedValueOnce(null);
      
      const result = await studentService.update('non-existent-id', validUpdateData);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('STUDENT_NOT_FOUND');
      expect(result.error).toBe('Student not found');
    });

    test('should check for duplicate student ID during update', async () => {
      prismaMock.student.findUnique
        .mockResolvedValueOnce({ id: 'student-123', studentId: 'OLD-ID' }) // Existing student
        .mockResolvedValueOnce({ id: 'other-student', studentId: 'NEW-ID' }); // Duplicate check
      
      const updateWithNewId = { ...validUpdateData, studentId: 'NEW-ID' };
      const result = await studentService.update('student-123', updateWithNewId);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('DUPLICATE_STUDENT_ID');
      expect(result.error).toBe('Student ID already exists');
    });

    test('should allow updating to same student ID', async () => {
      prismaMock.student.findUnique.mockResolvedValueOnce({ 
        id: 'student-123', 
        studentId: 'SAME-ID' 
      });
      
      const updateWithSameId = { ...validUpdateData, studentId: 'SAME-ID' };
      const result = await studentService.update('student-123', updateWithSameId);
      
      expect(result.success).toBe(true);
      expect(prismaMock.student.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('Delete Student Operations', () => {
    test('should soft delete student successfully', async () => {
      prismaMock.student.findUnique.mockResolvedValueOnce({
        id: 'student-123',
        name: 'John Doe',
        isActive: true,
      });
      
      const result = await studentService.delete('student-123');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.metadata?.context).toHaveProperty('operation', 'delete');
      expect(result.metadata?.context).toHaveProperty('deletionType', 'soft');
      
      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-123' },
        data: { isActive: false },
      });
    });

    test('should validate student exists before deletion', async () => {
      prismaMock.student.findUnique.mockResolvedValueOnce(null);
      
      const result = await studentService.delete('non-existent-id');
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('STUDENT_NOT_FOUND');
      expect(result.error).toBe('Student not found');
    });

    test('should prevent deletion of already inactive student', async () => {
      prismaMock.student.findUnique.mockResolvedValueOnce({
        id: 'student-123',
        name: 'John Doe',
        isActive: false,
      });
      
      const result = await studentService.delete('student-123');
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('ALREADY_INACTIVE');
      expect(result.error).toBe('Student is already inactive');
    });
  });

  describe('Search and Pagination', () => {
    test('should find many students with default pagination', async () => {
      const students = [mockStudentWithRelations];
      prismaMock.student.findMany.mockResolvedValueOnce(students);
      prismaMock.student.count.mockResolvedValueOnce(1);
      
      const result = await studentService.findMany();
      
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.data).toEqual(students);
        expect(result.data.total).toBe(1);
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    test('should apply search filters correctly', async () => {
      const searchOptions = {
        page: 1,
        limit: 10,
        nameSearch: 'John',
        grade: '10th',
        familyId: 'family-456',
        isActive: true,
      };
      
      await studentService.findMany(searchOptions);
      
      expect(prismaMock.student.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          isActive: true,
          name: { contains: 'John', mode: 'insensitive' },
          grade: '10th',
          familyId: 'family-456',
        },
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    test('should handle date range filters', async () => {
      const dateFrom = new Date('2023-01-01');
      const dateTo = new Date('2023-12-31');
      
      const searchOptions = {
        page: 1,
        limit: 10,
        enrollmentDateFrom: dateFrom,
        enrollmentDateTo: dateTo,
      };
      
      await studentService.findMany(searchOptions);
      
      expect(prismaMock.student.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          isActive: true,
          enrollmentDate: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    test('should include inactive students when requested', async () => {
      const searchOptions = {
        page: 1,
        limit: 10,
        includeInactive: true,
      };
      
      await studentService.findMany(searchOptions);
      
      expect(prismaMock.student.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('Statistics and Analytics', () => {
    test('should get student statistics', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      prismaMock.student.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(85)  // active
        .mockResolvedValueOnce(15)  // inactive
        .mockResolvedValueOnce(5);  // recent enrollments

      prismaMock.student.groupBy.mockResolvedValueOnce([
        { grade: '9th', _count: { grade: 20 } },
        { grade: '10th', _count: { grade: 30 } },
        { grade: '11th', _count: { grade: 25 } },
        { grade: '12th', _count: { grade: 10 } },
      ]);

      const result = await studentService.getStatistics();

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.total).toBe(100);
        expect(result.data.active).toBe(85);
        expect(result.data.inactive).toBe(15);
        expect(result.data.recentEnrollments).toBe(5);
        expect(result.data.byGrade).toEqual({
          '9th': 20,
          '10th': 30,
          '11th': 25,
          '12th': 10,
        });
      }
    });

    test('should handle empty statistics gracefully', async () => {
      prismaMock.student.count.mockResolvedValue(0);
      prismaMock.student.groupBy.mockResolvedValue([]);

      const result = await studentService.getStatistics();

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.total).toBe(0);
        expect(result.data.byGrade).toEqual({});
      }
    });
  });

  describe('Performance Testing', () => {
    test('should handle large datasets efficiently', async () => {
      performanceTestUtils.simulateLargeDataset(prismaMock, 1000);

      const startTime = Date.now();
      const result = await studentService.findMany({ page: 1, limit: 50 });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      if (result.success && result.data) {
        expect(result.data.total).toBe(1000);
        expect(result.data.data.length).toBeLessThanOrEqual(50);
      }
    });

    test('should track operation performance metrics', async () => {
      const result = await studentService.findById('student-123');

      expect(result.metadata?.duration).toBeDefined();
      expect(typeof result.metadata?.duration).toBe('number');
      expect(result.metadata?.duration).toBeGreaterThanOrEqual(0);
    });

    test('should handle concurrent operations', async () => {
      const operations = [
        () => studentService.findById('student-1'),
        () => studentService.findById('student-2'),
        () => studentService.findById('student-3'),
        () => studentService.getStatistics(),
        () => studentService.findMany({ page: 1, limit: 10 }),
      ];

      const results = await integrationTestUtils.simulateConcurrentOperations(operations);

      expect(results.successful).toBeGreaterThan(0);
      expect(results.failed).toBe(0);
    });
  });

  describe('Input Validation and Edge Cases', () => {
    test('should handle invalid input data gracefully', async () => {
      const invalidData = validationTestUtils.generateInvalidStudentData();

      // Test empty name
      const emptyNameResult = await studentService.create(invalidData.emptyName);
      expect(emptyNameResult.success).toBe(false);
      expect(emptyNameResult.code).toBe('VALIDATION_ERROR');

      // Test invalid family ID
      prismaMock.family.findUnique.mockResolvedValueOnce(null);
      const invalidFamilyResult = await studentService.create(invalidData.invalidFamilyId);
      expect(invalidFamilyResult.success).toBe(false);
      expect(invalidFamilyResult.code).toBe('FAMILY_NOT_FOUND');
    });

    test('should handle edge case data', async () => {
      const edgeCaseData = validationTestUtils.generateEdgeCaseData();

      // Test very long name (should be sanitized)
      const result = await studentService.create(edgeCaseData.veryLongName);
      expect(prismaMock.student.create).toHaveBeenCalled();

      // Test unicode characters
      const unicodeResult = await studentService.create(edgeCaseData.unicodeName);
      expect(prismaMock.student.create).toHaveBeenCalled();
    });

    test('should validate date ranges', async () => {
      const futureDate = new Date('2030-01-01');
      const pastDate = new Date('1900-01-01');

      // These should not cause errors but might be flagged in business logic
      const futureResult = await studentService.create({
        name: 'Future Student',
        familyId: 'family-456',
        dateOfBirth: futureDate,
      });

      const pastResult = await studentService.create({
        name: 'Past Student',
        familyId: 'family-456',
        dateOfBirth: pastDate,
      });

      // Both should succeed at the service level (business validation is separate)
      expect(futureResult.success).toBe(true);
      expect(pastResult.success).toBe(true);
    });
  });

  describe('Integration Testing', () => {
    test('should maintain data consistency across operations', async () => {
      const { families, students } = integrationTestUtils.setupRealisticDatabaseState(prismaMock);

      // Test finding students by family
      const familyStudentsResult = await studentService.findByFamilyId('family-1');
      expect(familyStudentsResult.success).toBe(true);

      // Test statistics with realistic data
      prismaMock.student.count.mockResolvedValue(students.length);
      const statsResult = await studentService.getStatistics();
      expect(statsResult.success).toBe(true);

      if (statsResult.success && statsResult.data) {
        expect(statsResult.data.total).toBe(students.length);
      }
    });

    test('should handle complex search scenarios', async () => {
      const complexSearchOptions = {
        page: 2,
        limit: 5,
        nameSearch: 'Smith',
        grade: '10th',
        enrollmentDateFrom: new Date('2023-01-01'),
        enrollmentDateTo: new Date('2023-12-31'),
        sortBy: 'name',
        sortOrder: 'asc' as const,
      };

      const result = await studentService.findMany(complexSearchOptions);

      expect(result.success).toBe(true);
      expect(prismaMock.student.findMany).toHaveBeenCalledWith({
        skip: 5, // (page 2 - 1) * limit 5
        take: 5,
        where: {
          isActive: true,
          name: { contains: 'Smith', mode: 'insensitive' },
          grade: '10th',
          enrollmentDate: {
            gte: complexSearchOptions.enrollmentDateFrom,
            lte: complexSearchOptions.enrollmentDateTo,
          },
        },
        orderBy: { name: 'asc' },
        include: expect.any(Object),
      });
    });

    test('should maintain referential integrity', async () => {
      // Test that student creation validates family existence
      prismaMock.family.findUnique.mockResolvedValueOnce(null);

      const result = await studentService.create({
        name: 'Orphan Student',
        familyId: 'non-existent-family',
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe('FAMILY_NOT_FOUND');
      expect(prismaMock.student.create).not.toHaveBeenCalled();
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should recover from temporary database failures', async () => {
      // Simulate temporary failure followed by success
      prismaMock.student.findUnique
        .mockRejectedValueOnce(new Error('Temporary connection error'))
        .mockResolvedValueOnce(mockStudentWithRelations);

      // First call should fail
      const firstResult = await studentService.findById('student-123');
      expect(firstResult.success).toBe(false);

      // Second call should succeed (simulating retry logic)
      const secondResult = await studentService.findById('student-123');
      expect(secondResult.success).toBe(true);
    });

    test('should handle partial operation failures gracefully', async () => {
      // Simulate scenario where student exists but related data fails to load
      prismaMock.student.findUnique.mockResolvedValueOnce({
        ...mockStudentWithRelations,
        subscriptions: [], // Empty subscriptions due to failure
      });

      const result = await studentService.findById('student-123');

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.subscriptions).toEqual([]);
      }
    });
  });
});
