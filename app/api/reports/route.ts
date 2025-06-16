import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  console.log('📊 Reports API called');
  try {
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('🔑 Token received:', token ? 'Yes' : 'No');

    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    console.log('🔐 Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('✅ Token verified, role:', decoded.role);

    if (decoded.role !== 'ADMIN') {
      console.log('❌ Insufficient permissions');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    console.log('📅 Query params - Month:', month, 'Year:', year);

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    console.log('📅 Date range:', startDate.toISOString(), 'to', endDate.toISOString());

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

    console.log('✅ Report data compiled successfully:', {
      totalStudents,
      totalFamilies,
      monthlyRevenue,
      outstandingDues,
      recentPaymentsCount: recentPayments.length,
      topCoursesCount: topCourses.length
    });

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('❌ Reports API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to fetch report data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create new report and manage FIFO
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, fileName, generatedAt, recordCount } = body;

    // Validate required fields
    if (!title || !type || !fileName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check current report count
    const currentCount = await prisma.storedReport.count();
    const maxReports = 20; // FIFO limit

    // If we're at the limit, delete the oldest report
    if (currentCount >= maxReports) {
      const oldestReport = await prisma.storedReport.findFirst({
        orderBy: {
          generatedAt: 'asc'
        }
      });

      if (oldestReport) {
        await prisma.storedReport.delete({
          where: {
            id: oldestReport.id
          }
        });
      }
    }

    // Create new report
    const newReport = await prisma.storedReport.create({
      data: {
        title,
        type,
        fileName,
        generatedAt: new Date(generatedAt),
        recordCount: recordCount || 0,
        status: 'completed'
      }
    });

    return NextResponse.json({
      success: true,
      data: newReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
