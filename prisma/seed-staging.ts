/**
 * =============================================================================
 * RK Institute Management System - Staging Database Seeding
 * =============================================================================
 *
 * Comprehensive staging database seeding with:
 * - Test users with various roles
 * - Sample student data for testing
 * - Fee records with different statuses
 * - Synthetic data for comprehensive testing
 * - Performance testing data sets
 *
 * Usage: NODE_ENV=staging tsx prisma/seed-staging.ts
 *
 * Version: 2.0
 * Last Updated: 2025-07-02
 * =============================================================================
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Main seeding function for staging environment
 */
async function seedStagingDatabase() {
  console.log('🌱 Starting staging database seeding...');
  console.log('🧪 Environment: STAGING');
  console.log('='.repeat(60));

  try {
    // Clear existing data (staging only)
    await clearStagingData();

    // Seed test users
    await seedTestUsers();

    // Seed sample students
    await seedSampleStudents();

    // Seed fee records
    await seedFeeRecords();

    // Seed synthetic test data
    await seedSyntheticData();

    // Seed performance test data
    await seedPerformanceTestData();

    console.log('✅ Staging database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Staging database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clear existing staging data
 */
async function clearStagingData() {
  console.log('🧹 Clearing existing staging data...');

  // Clear in reverse dependency order
  await prisma.studentFeeAllocation.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('  ✅ Staging data cleared');
}

/**
 * Seed test users with various roles
 */
async function seedTestUsers() {
  console.log('👥 Seeding test users...');

  const testUsers = [
    {
      name: 'Staging Admin',
      email: 'admin@staging.test',
      password: 'StagingAdmin123!',
      role: 'ADMIN'
    },
    {
      name: 'Staging Teacher',
      email: 'teacher@staging.test',
      password: 'StagingTeacher123!',
      role: 'TEACHER'
    },
    {
      name: 'Staging Student',
      email: 'student@staging.test',
      password: 'StagingStudent123!',
      role: 'STUDENT'
    },
    {
      name: 'Test Manager',
      email: 'manager@staging.test',
      password: 'StagingManager123!',
      role: 'ADMIN'
    },
    {
      name: 'Test Accountant',
      email: 'accountant@staging.test',
      password: 'StagingAccountant123!',
      role: 'TEACHER'
    }
  ];

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role as any,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`  ✅ Created user: ${user.name} (${user.email})`);
  }
}

/**
 * Seed sample students for testing
 */
async function seedSampleStudents() {
  console.log('🎓 Seeding sample students...');

  const sampleStudents = [
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@staging.test',
      phone: '+1-555-0101',
      address: '123 Main St, Staging City, SC 12345',
      dateOfBirth: new Date('2000-05-15'),
      enrollmentDate: new Date('2024-01-15'),
      course: 'Computer Science',
      batch: '2024-CS-A',
      status: 'ACTIVE'
    },
    {
      name: 'Bob Smith',
      email: 'bob.smith@staging.test',
      phone: '+1-555-0102',
      address: '456 Oak Ave, Staging City, SC 12345',
      dateOfBirth: new Date('1999-08-22'),
      enrollmentDate: new Date('2024-01-15'),
      course: 'Information Technology',
      batch: '2024-IT-A',
      status: 'ACTIVE'
    },
    {
      name: 'Carol Davis',
      email: 'carol.davis@staging.test',
      phone: '+1-555-0103',
      address: '789 Pine Rd, Staging City, SC 12345',
      dateOfBirth: new Date('2001-03-10'),
      enrollmentDate: new Date('2024-02-01'),
      course: 'Data Science',
      batch: '2024-DS-A',
      status: 'ACTIVE'
    },
    {
      name: 'David Wilson',
      email: 'david.wilson@staging.test',
      phone: '+1-555-0104',
      address: '321 Elm St, Staging City, SC 12345',
      dateOfBirth: new Date('2000-11-28'),
      enrollmentDate: new Date('2024-01-15'),
      course: 'Computer Science',
      batch: '2024-CS-B',
      status: 'INACTIVE'
    },
    {
      name: 'Eva Brown',
      email: 'eva.brown@staging.test',
      phone: '+1-555-0105',
      address: '654 Maple Dr, Staging City, SC 12345',
      dateOfBirth: new Date('1998-12-05'),
      enrollmentDate: new Date('2023-09-01'),
      course: 'Information Technology',
      batch: '2023-IT-A',
      status: 'GRADUATED'
    }
  ];

  for (const studentData of sampleStudents) {
    const student = await prisma.student.create({
      data: {
        name: studentData.name,
        dateOfBirth: studentData.dateOfBirth,
        enrollmentDate: studentData.enrollmentDate,
        grade: studentData.course, // Map course to grade field
        familyId: 'default-family-id', // You'll need to create a family first
        isActive: studentData.status === 'ACTIVE'
      }
    });

    console.log(
      `  ✅ Created student: ${student.name} (${studentData.course})`
    );
  }
}

/**
 * Seed fee records with various statuses
 */
async function seedFeeRecords() {
  console.log('💰 Seeding fee records...');

  // Get all students
  const students = await prisma.student.findMany();

  const feeTypes = ['TUITION', 'LIBRARY', 'LAB', 'EXAM', 'MISCELLANEOUS'];
  const feeStatuses = ['PENDING', 'PAID', 'OVERDUE', 'PARTIAL'];

  for (const student of students) {
    // Create 2-4 fee records per student
    const numFees = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < numFees; i++) {
      const feeType = feeTypes[Math.floor(Math.random() * feeTypes.length)];
      const status =
        feeStatuses[Math.floor(Math.random() * feeStatuses.length)];
      const amount = Math.floor(Math.random() * 5000) + 1000; // $1000-$6000

      // Generate due date (some past, some future)
      const dueDate = new Date();
      dueDate.setDate(
        dueDate.getDate() + (Math.floor(Math.random() * 180) - 90)
      );

      const fee = await prisma.studentFeeAllocation.create({
        data: {
          studentId: student.id,
          month: new Date(),
          year: new Date().getFullYear(),
          grossAmount: amount,
          discountAmount: 0,
          netAmount: amount,
          status: status as any,
          dueDate: dueDate,
          isPaid: status === 'PAID',
          paidDate: status === 'PAID' ? new Date() : null
        }
      });

      console.log(
        `  ✅ Created fee allocation: $${fee.netAmount} (${fee.status}) for ${student.name}`
      );
    }
  }
}

/**
 * Seed synthetic data for comprehensive testing
 */
async function seedSyntheticData() {
  console.log('🤖 Seeding synthetic test data...');

  // Create synthetic users for load testing
  const syntheticUsers = [];
  for (let i = 1; i <= 10; i++) {
    const hashedPassword = await bcrypt.hash('SyntheticUser123!', 12);

    const user = await prisma.user.create({
      data: {
        name: `Synthetic User ${i}`,
        email: `synthetic${i}@staging.test`,
        password: hashedPassword,
        role: i % 3 === 0 ? 'ADMIN' : i % 2 === 0 ? 'TEACHER' : 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    syntheticUsers.push(user);
  }

  console.log(`  ✅ Created ${syntheticUsers.length} synthetic users`);

  // Create synthetic students for performance testing
  const syntheticStudents = [];
  for (let i = 1; i <= 20; i++) {
    const student = await prisma.student.create({
      data: {
        name: `Synthetic Student ${i}`,
        dateOfBirth: new Date(2000 + (i % 5), i % 12, (i % 28) + 1),
        enrollmentDate: new Date(2024, i % 12, 1),
        grade: `Grade ${(i % 12) + 1}`,
        familyId: 'default-family-id', // You'll need to create a family first
        isActive: i % 3 !== 1 // Most students active, some inactive
      }
    });

    syntheticStudents.push(student);
  }

  console.log(`  ✅ Created ${syntheticStudents.length} synthetic students`);
}

/**
 * Seed performance test data
 */
async function seedPerformanceTestData() {
  console.log('⚡ Seeding performance test data...');

  // Get all students for performance testing
  const students = await prisma.student.findMany();

  // Create bulk fee records for performance testing
  const bulkFees = [];
  for (const student of students) {
    // Create 10 fee records per student for performance testing
    for (let i = 0; i < 10; i++) {
      const amount = Math.floor(Math.random() * 2000) + 500;
      bulkFees.push({
        studentId: student.id,
        month: new Date(),
        year: new Date().getFullYear(),
        grossAmount: amount,
        discountAmount: 0,
        netAmount: amount,
        status: 'PENDING' as any,
        dueDate: new Date(
          Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000
        ),
        isPaid: false
      });
    }
  }

  // Create fees in batches for better performance
  const batchSize = 50;
  for (let i = 0; i < bulkFees.length; i += batchSize) {
    const batch = bulkFees.slice(i, i + batchSize);
    await prisma.studentFeeAllocation.createMany({
      data: batch
    });
  }

  console.log(`  ✅ Created ${bulkFees.length} performance test fee records`);
}

/**
 * Display seeding summary
 */
async function displaySeedingSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 STAGING DATABASE SEEDING SUMMARY');
  console.log('='.repeat(60));

  const userCount = await prisma.user.count();
  const studentCount = await prisma.student.count();
  const feeCount = await prisma.studentFeeAllocation.count();

  console.log(`👥 Users: ${userCount}`);
  console.log(`🎓 Students: ${studentCount}`);
  console.log(`💰 Fee Records: ${feeCount}`);
  console.log(`📅 Seeded on: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  console.log('\n🔑 Test Credentials:');
  console.log('  Admin: admin@staging.test / StagingAdmin123!');
  console.log('  Teacher: teacher@staging.test / StagingTeacher123!');
  console.log('  Student: student@staging.test / StagingStudent123!');
  console.log('  Manager: manager@staging.test / StagingManager123!');
  console.log('  Accountant: accountant@staging.test / StagingAccountant123!');
}

// Main execution
if (require.main === module) {
  seedStagingDatabase()
    .then(async () => {
      await displaySeedingSummary();
      console.log('✅ Staging database seeding completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Staging database seeding failed:', error);
      process.exit(1);
    });
}

export default seedStagingDatabase;
