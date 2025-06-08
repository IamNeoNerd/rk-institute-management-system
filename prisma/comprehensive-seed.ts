import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createStudentSubscriptionsAndFees() {
  console.log('📚 Creating realistic student subscriptions and fee allocations...');

  // Define realistic subscription patterns for each student
  const subscriptionPatterns = [
    // Emma Johnson (Grade 11) - High achiever, multiple advanced courses
    {
      studentId: 'student-1',
      subscriptions: [
        { courseId: 'math-advanced', discountAmount: 100 },
        { courseId: 'science-physics', discountAmount: 100 },
        { courseId: 'english-literature', discountAmount: 0 },
        { serviceId: 'transport-bus', discountAmount: 0 },
        { serviceId: 'library-access', discountAmount: 0 },
        { serviceId: 'tutoring', discountAmount: 50 },
      ]
    },
    // Liam Johnson (Grade 9) - Foundation courses
    {
      studentId: 'student-2',
      subscriptions: [
        { courseId: 'math-basic', discountAmount: 100 },
        { courseId: 'english-literature', discountAmount: 0 },
        { courseId: 'art-design', discountAmount: 0 },
        { serviceId: 'transport-bus', discountAmount: 0 },
        { serviceId: 'meals-lunch', discountAmount: 0 },
        { serviceId: 'sports-program', discountAmount: 0 },
      ]
    },
    // Sophie Chen (Grade 12) - STEM focused
    {
      studentId: 'student-3',
      subscriptions: [
        { courseId: 'math-advanced', discountAmount: 0 },
        { courseId: 'science-physics', discountAmount: 0 },
        { courseId: 'science-chemistry', discountAmount: 0 },
        { courseId: 'computer-science', discountAmount: 0 },
        { serviceId: 'transport-van', discountAmount: 0 },
        { serviceId: 'tutoring', discountAmount: 0 },
      ]
    },
    // Carlos Rodriguez (Grade 10) - Balanced curriculum
    {
      studentId: 'student-4',
      subscriptions: [
        { courseId: 'math-basic', discountAmount: 50 },
        { courseId: 'science-chemistry', discountAmount: 50 },
        { courseId: 'english-literature', discountAmount: 0 },
        { serviceId: 'transport-bus', discountAmount: 0 },
        { serviceId: 'meals-lunch', discountAmount: 0 },
      ]
    },
    // Maria Rodriguez (Grade 8) - Foundation level
    {
      studentId: 'student-5',
      subscriptions: [
        { courseId: 'math-basic', discountAmount: 50 },
        { courseId: 'english-literature', discountAmount: 0 },
        { courseId: 'art-design', discountAmount: 0 },
        { serviceId: 'transport-bus', discountAmount: 0 },
        { serviceId: 'meals-lunch', discountAmount: 0 },
        { serviceId: 'meals-snacks', discountAmount: 0 },
      ]
    },
    // Diego Rodriguez (Grade 12) - Advanced STEM
    {
      studentId: 'student-6',
      subscriptions: [
        { courseId: 'math-advanced', discountAmount: 50 },
        { courseId: 'science-physics', discountAmount: 50 },
        { courseId: 'computer-science', discountAmount: 0 },
        { serviceId: 'transport-bus', discountAmount: 0 },
        { serviceId: 'library-access', discountAmount: 0 },
      ]
    },
    // Ava Williams (Grade 10) - Arts focused
    {
      studentId: 'student-7',
      subscriptions: [
        { courseId: 'math-basic', discountAmount: 0 },
        { courseId: 'english-literature', discountAmount: 0 },
        { courseId: 'art-design', discountAmount: 0 },
        { serviceId: 'transport-van', discountAmount: 0 },
        { serviceId: 'meals-lunch', discountAmount: 0 },
        { serviceId: 'sports-program', discountAmount: 0 },
      ]
    },
    // Noah Davis (Grade 11) - Large family discounts
    {
      studentId: 'student-8',
      subscriptions: [
        { courseId: 'math-advanced', discountAmount: 200 },
        { courseId: 'science-chemistry', discountAmount: 200 },
        { courseId: 'english-literature', discountAmount: 100 },
        { serviceId: 'transport-bus', discountAmount: 100 },
        { serviceId: 'meals-lunch', discountAmount: 100 },
      ]
    },
    // Olivia Davis (Grade 9) - Large family discounts
    {
      studentId: 'student-9',
      subscriptions: [
        { courseId: 'math-basic', discountAmount: 200 },
        { courseId: 'english-literature', discountAmount: 100 },
        { courseId: 'art-design', discountAmount: 100 },
        { serviceId: 'transport-bus', discountAmount: 100 },
        { serviceId: 'meals-lunch', discountAmount: 100 },
        { serviceId: 'sports-program', discountAmount: 50 },
      ]
    },
    // Ethan Davis (Grade 8) - Large family discounts
    {
      studentId: 'student-10',
      subscriptions: [
        { courseId: 'math-basic', discountAmount: 200 },
        { courseId: 'art-design', discountAmount: 100 },
        { serviceId: 'transport-bus', discountAmount: 100 },
        { serviceId: 'meals-lunch', discountAmount: 100 },
        { serviceId: 'meals-snacks', discountAmount: 50 },
        { serviceId: 'sports-program', discountAmount: 50 },
      ]
    },
    // Isabella Davis (Grade 12) - Large family discounts
    {
      studentId: 'student-11',
      subscriptions: [
        { courseId: 'math-advanced', discountAmount: 200 },
        { courseId: 'science-physics', discountAmount: 200 },
        { courseId: 'computer-science', discountAmount: 150 },
        { serviceId: 'transport-bus', discountAmount: 100 },
        { serviceId: 'library-access', discountAmount: 50 },
        { serviceId: 'tutoring', discountAmount: 100 },
      ]
    },
  ];

  // Create subscriptions
  for (const pattern of subscriptionPatterns) {
    for (const sub of pattern.subscriptions) {
      await prisma.studentSubscription.create({
        data: {
          studentId: pattern.studentId,
          courseId: sub.courseId || undefined,
          serviceId: sub.serviceId || undefined,
          discountAmount: sub.discountAmount,
          startDate: new Date('2023-09-01'),
        },
      });
    }
  }

  console.log('✅ Created realistic subscriptions for all 11 students');
}

async function createFeeAllocationsAndPayments() {
  console.log('💰 Creating fee allocations and payment history...');

  // Create fee allocations for the last 6 months
  const months = [
    { month: new Date('2024-01-01'), year: 2024 },
    { month: new Date('2024-02-01'), year: 2024 },
    { month: new Date('2024-03-01'), year: 2024 },
    { month: new Date('2024-04-01'), year: 2024 },
    { month: new Date('2024-05-01'), year: 2024 },
    { month: new Date('2024-06-01'), year: 2024 },
  ];

  const studentIds = [
    'student-1', 'student-2', 'student-3', 'student-4', 'student-5', 'student-6',
    'student-7', 'student-8', 'student-9', 'student-10', 'student-11'
  ];

  for (const monthData of months) {
    for (const studentId of studentIds) {
      // Calculate fees for this student for this month
      const subscriptions = await prisma.studentSubscription.findMany({
        where: { studentId },
        include: {
          course: { include: { feeStructure: true } },
          service: { include: { feeStructure: true } },
        },
      });

      let grossAmount = 0;
      let totalDiscounts = 0;

      for (const sub of subscriptions) {
        const feeStructure = sub.course?.feeStructure || sub.service?.feeStructure;
        if (feeStructure) {
          grossAmount += feeStructure.amount;
          totalDiscounts += sub.discountAmount;
        }
      }

      // Add family discount
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { family: true },
      });

      if (student?.family) {
        // Apply proportional family discount
        const familyStudentCount = await prisma.student.count({
          where: { familyId: student.familyId },
        });
        const familyDiscountPerStudent = student.family.discountAmount / familyStudentCount;
        totalDiscounts += familyDiscountPerStudent;
      }

      const netAmount = Math.max(0, grossAmount - totalDiscounts);

      // Determine payment status (90% paid, 10% pending for realism)
      const isPaid = Math.random() > 0.1;
      const status = isPaid ? 'PAID' : 'PENDING';

      await prisma.studentFeeAllocation.upsert({
        where: {
          studentId_month_year: {
            studentId,
            month: monthData.month,
            year: monthData.year,
          },
        },
        update: {},
        create: {
          studentId,
          month: monthData.month,
          year: monthData.year,
          grossAmount,
          discountAmount: totalDiscounts,
          netAmount,
          isPaid,
          status,
          dueDate: new Date(monthData.month.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days after month start
          paidDate: isPaid ? new Date(monthData.month.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000) : null,
        },
      });
    }
  }

  console.log('✅ Created 6 months of fee allocations for all students');
}

async function createPaymentHistory() {
  console.log('💳 Creating realistic payment history...');

  // Get all paid allocations
  const paidAllocations = await prisma.studentFeeAllocation.findMany({
    where: { status: 'PAID' },
    include: { student: { include: { family: true } } },
    orderBy: { paidDate: 'asc' },
  });

  // Group by family and create payments
  const familyPayments: { [key: string]: any[] } = {};
  
  for (const allocation of paidAllocations) {
    const familyId = allocation.student.familyId;
    if (!familyPayments[familyId]) {
      familyPayments[familyId] = [];
    }
    familyPayments[familyId].push(allocation);
  }

  // Create payments for each family
  for (const [familyId, allocations] of Object.entries(familyPayments)) {
    // Group allocations by month to create monthly payments
    const monthlyGroups: { [key: string]: any[] } = {};
    
    for (const allocation of allocations) {
      const monthKey = `${allocation.year}-${allocation.month.getMonth()}`;
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = [];
      }
      monthlyGroups[monthKey].push(allocation);
    }

    // Create payment for each month
    for (const [monthKey, monthAllocations] of Object.entries(monthlyGroups)) {
      const totalAmount = monthAllocations.reduce((sum, alloc) => sum + alloc.netAmount, 0);
      const paymentDate = monthAllocations[0].paidDate;

      const payment = await prisma.payment.create({
        data: {
          familyId,
          amount: totalAmount,
          paymentDate,
          paymentMethod: ['CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE'][Math.floor(Math.random() * 4)],
          reference: `PAY-${familyId.toUpperCase()}-${monthKey.replace('-', '')}`,
        },
      });

      // Link allocations to payment
      for (const allocation of monthAllocations) {
        await prisma.studentFeeAllocation.update({
          where: { id: allocation.id },
          data: { paymentId: payment.id },
        });
      }
    }
  }

  console.log('✅ Created realistic payment history with proper allocation linking');
}

async function createAcademicLogs() {
  console.log('📝 Creating diverse academic logs...');

  // Get the actual teacher IDs from the database
  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    select: { id: true, name: true },
  });

  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  });

  if (teachers.length === 0 || !adminUser) {
    console.log('⚠️ No teachers or admin found, skipping academic logs');
    return;
  }

  const teacher1Id = teachers[0]?.id || adminUser.id;
  const teacher2Id = teachers[1]?.id || adminUser.id;

  const academicLogs = [
    {
      title: 'Outstanding Performance in Advanced Mathematics',
      content: 'Emma has consistently scored above 95% in all calculus assessments and shows exceptional problem-solving skills.',
      logType: 'ACHIEVEMENT',
      subject: 'Mathematics',
      isPrivate: false,
      studentId: 'student-1',
      teacherId: teacher1Id,
    },
    {
      title: 'Improvement Needed in Physics Lab Work',
      content: 'Liam needs to focus more on following safety protocols during laboratory sessions. Additional supervision recommended.',
      logType: 'CONCERN',
      subject: 'Physics',
      isPrivate: true,
      studentId: 'student-2',
      teacherId: teacher2Id,
    },
    {
      title: 'Excellent Research Project on Renewable Energy',
      content: 'Sophie submitted an outstanding research project on solar energy efficiency that exceeded grade-level expectations.',
      logType: 'ACHIEVEMENT',
      subject: 'Science',
      isPrivate: false,
      studentId: 'student-3',
      teacherId: teacher2Id,
    },
    {
      title: 'Regular Progress Update',
      content: 'Carlos is making steady progress in chemistry. Recommend additional practice with molecular structures.',
      logType: 'PROGRESS',
      subject: 'Chemistry',
      isPrivate: false,
      studentId: 'student-4',
      teacherId: teacher2Id,
    },
    {
      title: 'Creative Excellence in Art Class',
      content: 'Maria created a beautiful portfolio showcasing various artistic techniques. Her creativity is remarkable.',
      logType: 'ACHIEVEMENT',
      subject: 'Art',
      isPrivate: false,
      studentId: 'student-5',
      teacherId: teacher1Id,
    },
  ];

  for (const logData of academicLogs) {
    await prisma.academicLog.create({ data: logData });
  }

  console.log('✅ Created diverse academic logs for different students');
}

export { createStudentSubscriptionsAndFees, createFeeAllocationsAndPayments, createPaymentHistory, createAcademicLogs };
