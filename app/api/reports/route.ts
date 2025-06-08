import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get basic counts
    const [totalStudents, totalFamilies, totalCourses, totalServices] = await Promise.all([
      prisma.student.count(),
      prisma.family.count(),
      prisma.course.count(),
      prisma.service.count(),
    ]);

    // Get monthly revenue (payments made in the selected month)
    const monthlyPayments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
      },
    });

    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get outstanding dues (unpaid allocations)
    const outstandingAllocations = await prisma.studentFeeAllocation.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lte: new Date(),
        },
      },
      select: {
        netAmount: true,
      },
    });

    const outstandingDues = outstandingAllocations.reduce((sum, allocation) => sum + allocation.netAmount, 0);

    // Get total discounts for the month
    const monthlyAllocations = await prisma.studentFeeAllocation.findMany({
      where: {
        month: {
          gte: startDate,
          lte: endDate,
        },
        year: year,
      },
      select: {
        discountAmount: true,
      },
    });

    const totalDiscounts = monthlyAllocations.reduce((sum, allocation) => sum + allocation.discountAmount, 0);

    // Get recent payments (last 10)
    const recentPayments = await prisma.payment.findMany({
      take: 10,
      orderBy: {
        paymentDate: 'desc',
      },
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        family: {
          select: {
            name: true,
            students: {
              take: 1,
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Get top courses by student count and revenue
    const coursesWithStats = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        subscriptions: {
          select: {
            id: true,
            student: {
              select: {
                feeAllocations: {
                  where: {
                    month: {
                      gte: startDate,
                      lte: endDate,
                    },
                    year: year,
                    status: 'PAID',
                  },
                  select: {
                    netAmount: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const topCourses = coursesWithStats
      .map(course => ({
        id: course.id,
        name: course.name,
        studentCount: course.subscriptions.length,
        revenue: course.subscriptions.reduce((sum, sub) =>
          sum + sub.student.feeAllocations.reduce((subSum, allocation) => subSum + allocation.netAmount, 0), 0
        ),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const reportData = {
      totalStudents,
      totalFamilies,
      totalCourses,
      totalServices,
      monthlyRevenue,
      outstandingDues,
      totalDiscounts,
      recentPayments,
      topCourses,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
}
