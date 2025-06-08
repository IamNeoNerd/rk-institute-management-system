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

    // Get basic counts with error handling
    let totalStudents = 0;
    let totalFamilies = 0;
    let totalCourses = 0;
    let totalServices = 0;

    try {
      [totalStudents, totalFamilies, totalCourses, totalServices] = await Promise.all([
        prisma.student.count().catch(() => 0),
        prisma.family.count().catch(() => 0),
        prisma.course.count().catch(() => 0),
        prisma.service.count().catch(() => 0),
      ]);
    } catch (error) {
      console.error('Error fetching basic counts:', error);
    }

    // Get monthly revenue with error handling
    let monthlyRevenue = 0;
    try {
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
      monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
    }

    // Get outstanding dues with error handling
    let outstandingDues = 0;
    try {
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
      outstandingDues = outstandingAllocations.reduce((sum, allocation) => sum + allocation.netAmount, 0);
    } catch (error) {
      console.error('Error fetching outstanding dues:', error);
    }

    // Get total discounts with error handling
    let totalDiscounts = 0;
    try {
      const monthlyAllocations = await prisma.studentFeeAllocation.findMany({
        where: {
          year: year,
        },
        select: {
          discountAmount: true,
        },
      });
      totalDiscounts = monthlyAllocations.reduce((sum, allocation) => sum + allocation.discountAmount, 0);
    } catch (error) {
      console.error('Error fetching total discounts:', error);
    }

    // Get recent payments with error handling
    let recentPayments: any[] = [];
    try {
      recentPayments = await prisma.payment.findMany({
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
    } catch (error) {
      console.error('Error fetching recent payments:', error);
    }

    // Get top courses with simplified logic
    let topCourses: any[] = [];
    try {
      const coursesWithStats = await prisma.course.findMany({
        select: {
          id: true,
          name: true,
          subscriptions: {
            select: {
              id: true,
            },
          },
        },
      });

      topCourses = coursesWithStats
        .map(course => ({
          id: course.id,
          name: course.name,
          studentCount: course.subscriptions.length,
          revenue: 0, // Simplified for now to avoid complex queries
        }))
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching top courses:', error);
    }

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
      { error: 'Failed to fetch report data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
