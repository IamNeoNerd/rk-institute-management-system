import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rkinstitute.com' },
    update: {},
    create: {
      email: 'admin@rkinstitute.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample family
  const sampleFamily = await prisma.family.upsert({
    where: { id: 'sample-family-id' },
    update: {},
    create: {
      id: 'sample-family-id',
      name: 'Sample Family',
      address: '123 Main Street, City, State 12345',
      phone: '+1-234-567-8900',
      email: 'family@example.com',
      discountAmount: 0,
      isActive: true,
    },
  });

  console.log('✅ Sample family created:', sampleFamily.name);

  // Create sample courses
  const mathCourse = await prisma.course.upsert({
    where: { id: 'math-course-id' },
    update: {},
    create: {
      id: 'math-course-id',
      name: 'Mathematics',
      description: 'Comprehensive mathematics course covering algebra, geometry, and calculus',
      grade: 'Grade 10-12',
      isActive: true,
      capacity: 30,
      teacherId: adminUser.id,
    },
  });

  const scienceCourse = await prisma.course.upsert({
    where: { id: 'science-course-id' },
    update: {},
    create: {
      id: 'science-course-id',
      name: 'Science',
      description: 'Physics, Chemistry, and Biology fundamentals',
      grade: 'Grade 9-12',
      isActive: true,
      capacity: 25,
      teacherId: adminUser.id,
    },
  });

  const englishCourse = await prisma.course.upsert({
    where: { id: 'english-course-id' },
    update: {},
    create: {
      id: 'english-course-id',
      name: 'English',
      description: 'English language arts, literature, and writing',
      grade: 'Grade 8-12',
      isActive: true,
      capacity: 20,
      teacherId: adminUser.id,
    },
  });

  console.log('✅ Sample courses created');

  // Create sample services
  const transportService = await prisma.service.upsert({
    where: { id: 'transport-service-id' },
    update: {},
    create: {
      id: 'transport-service-id',
      name: 'Transport',
      description: 'School bus transportation service',
    },
  });

  const mealsService = await prisma.service.upsert({
    where: { id: 'meals-service-id' },
    update: {},
    create: {
      id: 'meals-service-id',
      name: 'Meals',
      description: 'Daily lunch and snack service',
    },
  });

  console.log('✅ Sample services created');

  // Create fee structures
  await prisma.feeStructure.upsert({
    where: { courseId: mathCourse.id },
    update: {},
    create: {
      amount: 2000,
      billingCycle: 'MONTHLY',
      courseId: mathCourse.id,
    },
  });

  await prisma.feeStructure.upsert({
    where: { courseId: scienceCourse.id },
    update: {},
    create: {
      amount: 2000,
      billingCycle: 'MONTHLY',
      courseId: scienceCourse.id,
    },
  });

  await prisma.feeStructure.upsert({
    where: { courseId: englishCourse.id },
    update: {},
    create: {
      amount: 2000,
      billingCycle: 'MONTHLY',
      courseId: englishCourse.id,
    },
  });

  await prisma.feeStructure.upsert({
    where: { serviceId: transportService.id },
    update: {},
    create: {
      amount: 800,
      billingCycle: 'MONTHLY',
      serviceId: transportService.id,
    },
  });

  await prisma.feeStructure.upsert({
    where: { serviceId: mealsService.id },
    update: {},
    create: {
      amount: 1200,
      billingCycle: 'MONTHLY',
      serviceId: mealsService.id,
    },
  });

  console.log('✅ Fee structures created');

  // Create sample student
  const sampleStudent = await prisma.student.upsert({
    where: { id: 'sample-student-id' },
    update: {},
    create: {
      id: 'sample-student-id',
      name: 'John Doe',
      grade: 'Grade 10',
      dateOfBirth: new Date('2008-05-15'),
      enrollmentDate: new Date(),
      isActive: true,
      studentId: 'STU001',
      familyId: sampleFamily.id,
    },
  });

  console.log('✅ Sample student created:', sampleStudent.name);

  // Create sample subscriptions
  await prisma.studentSubscription.create({
    data: {
      studentId: sampleStudent.id,
      courseId: mathCourse.id,
      discountAmount: 0,
      startDate: new Date(),
    },
  });

  await prisma.studentSubscription.create({
    data: {
      studentId: sampleStudent.id,
      courseId: scienceCourse.id,
      discountAmount: 0,
      startDate: new Date(),
    },
  });

  await prisma.studentSubscription.create({
    data: {
      studentId: sampleStudent.id,
      serviceId: transportService.id,
      discountAmount: 0,
      startDate: new Date(),
    },
  });

  console.log('✅ Sample subscriptions created');

  // Create sample academic log
  await prisma.academicLog.create({
    data: {
      title: 'Excellent Progress in Mathematics',
      content: 'John has shown remarkable improvement in algebra and is ready to advance to more complex topics.',
      logType: 'ACHIEVEMENT',
      subject: 'Mathematics',
      isPrivate: false,
      studentId: sampleStudent.id,
      teacherId: adminUser.id,
    },
  });

  console.log('✅ Sample academic log created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 Login Credentials:');
  console.log('Email: admin@rkinstitute.com');
  console.log('Password: admin123');
  console.log('');
  console.log('🔗 Access the application at: https://rk-institute-management-system.vercel.app');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
