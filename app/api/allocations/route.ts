import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch fee allocations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const familyId = searchParams.get('familyId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const status = searchParams.get('status');

    const whereClause: any = {};
    
    if (studentId) {
      whereClause.studentId = studentId;
    }
    
    if (familyId) {
      whereClause.student = {
        familyId: familyId
      };
    }
    
    if (month) {
      const yearValue = year ? parseInt(year) : new Date().getFullYear();
      const monthDate = new Date(yearValue, parseInt(month) - 1, 1);
      whereClause.month = monthDate;
    }
    
    if (year) {
      whereClause.year = parseInt(year);
    }
    
    if (status) {
      whereClause.status = status;
    }

    const allocations = await prisma.studentFeeAllocation.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            family: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            paymentDate: true,
            paymentMethod: true,
            reference: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    return NextResponse.json(allocations);
  } catch (error) {
    console.error('Error fetching allocations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch allocations' },
      { status: 500 }
    );
  }
}

// POST - Create fee allocations for a specific month/year
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { month, year, studentIds } = body;

    // Validate required fields
    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    const whereClause: any = {};
    if (studentIds && studentIds.length > 0) {
      whereClause.id = { in: studentIds };
    }

    // Get all students with active subscriptions
    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        subscriptions: {
          where: { endDate: null },
          include: {
            course: { include: { feeStructure: true } },
            service: { include: { feeStructure: true } }
          }
        },
        family: true,
      },
    });

    const allocations = [];

    for (const student of students) {
      if (student.subscriptions.length > 0) {
        // Calculate fees for this student
        const { FeeCalculationService } = await import('@/lib/feeCalculationService');
        const calculation = await FeeCalculationService.calculateStudentMonthlyFee(student.id);
        
        // Create or update fee allocation
        const allocation = await prisma.studentFeeAllocation.upsert({
          where: {
            studentId_month_year: {
              studentId: student.id,
              month: new Date(parseInt(year), parseInt(month) - 1, 1),
              year: parseInt(year),
            },
          },
          update: {
            grossAmount: calculation.grossMonthlyFee,
            discountAmount: calculation.totalDiscount,
            netAmount: calculation.netMonthlyFee,
            dueDate: new Date(parseInt(year), parseInt(month) - 1, 15), // 15th of the month
          },
          create: {
            studentId: student.id,
            month: new Date(parseInt(year), parseInt(month) - 1, 1),
            year: parseInt(year),
            grossAmount: calculation.grossMonthlyFee,
            discountAmount: calculation.totalDiscount,
            netAmount: calculation.netMonthlyFee,
            dueDate: new Date(parseInt(year), parseInt(month) - 1, 15),
            status: 'PENDING',
          },
          include: {
            student: {
              include: {
                family: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        allocations.push(allocation);
      }
    }

    return NextResponse.json(allocations, { status: 201 });
  } catch (error) {
    console.error('Error creating allocations:', error);
    return NextResponse.json(
      { error: 'Failed to create allocations' },
      { status: 500 }
    );
  }
}
