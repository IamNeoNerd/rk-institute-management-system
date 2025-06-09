import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get last 6 months for average calculation
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Get comprehensive financial statistics
    const [
      totalRevenueThisMonth,
      totalOutstandingDues,
      recentPaymentActivity,
      totalFeeAllocations,
      paidAllocations,
      pendingAllocations,
      overdueAllocations,
      totalFamilies,
      familiesWithOutstanding,
      averageMonthlyRevenue,
      totalStudentsWithDues
    ] = await Promise.all([
      // Total revenue this month
      prisma.payment.aggregate({
        where: {
          paymentDate: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: {
          amount: true
        }
      }),

      // Total outstanding dues (pending allocations)
      prisma.studentFeeAllocation.aggregate({
        where: {
          status: 'PENDING'
        },
        _sum: {
          netAmount: true
        }
      }),

      // Recent payment activity (last 7 days)
      prisma.payment.count({
        where: {
          paymentDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Total fee allocations
      prisma.studentFeeAllocation.count(),

      // Paid allocations
      prisma.studentFeeAllocation.count({
        where: {
          status: 'PAID'
        }
      }),

      // Pending allocations
      prisma.studentFeeAllocation.count({
        where: {
          status: 'PENDING'
        }
      }),

      // Overdue allocations
      prisma.studentFeeAllocation.count({
        where: {
          status: 'PENDING',
          dueDate: {
            lt: now
          }
        }
      }),

      // Total families
      prisma.family.count(),

      // Families with outstanding dues
      prisma.family.count({
        where: {
          students: {
            some: {
              feeAllocations: {
                some: {
                  status: 'PENDING'
                }
              }
            }
          }
        }
      }),

      // Average monthly revenue (last 6 months)
      prisma.payment.aggregate({
        where: {
          paymentDate: {
            gte: sixMonthsAgo
          }
        },
        _sum: {
          amount: true
        }
      }),

      // Students with outstanding dues
      prisma.student.count({
        where: {
          feeAllocations: {
            some: {
              status: 'PENDING'
            }
          }
        }
      })
    ]);

    // Calculate collection efficiency
    const collectionEfficiency = totalFeeAllocations > 0 
      ? Math.round((paidAllocations / totalFeeAllocations) * 100)
      : 0;

    // Calculate average monthly revenue
    const avgMonthlyRevenue = averageMonthlyRevenue._sum.amount 
      ? Math.round(averageMonthlyRevenue._sum.amount / 6)
      : 0;

    // Get additional financial insights
    const [
      monthlyRevenueBreakdown,
      topPayingFamilies,
      recentPayments,
      overdueBreakdown
    ] = await Promise.all([
      // Monthly revenue breakdown for the last 6 months
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "paymentDate") as month,
          SUM(amount) as revenue,
          COUNT(*) as payment_count
        FROM "Payment"
        WHERE "paymentDate" >= ${sixMonthsAgo}
        GROUP BY DATE_TRUNC('month', "paymentDate")
        ORDER BY month DESC
        LIMIT 6
      `,

      // Top paying families this month
      prisma.payment.groupBy({
        by: ['familyId'],
        where: {
          paymentDate: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _sum: {
            amount: 'desc'
          }
        },
        take: 5
      }),

      // Recent payments
      prisma.payment.findMany({
        take: 10,
        orderBy: {
          paymentDate: 'desc'
        },
        include: {
          family: {
            select: {
              name: true
            }
          }
        }
      }),

      // Overdue breakdown by family
      prisma.studentFeeAllocation.groupBy({
        by: ['studentId'],
        where: {
          status: 'PENDING',
          dueDate: {
            lt: now
          }
        },
        _sum: {
          netAmount: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _sum: {
            netAmount: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Prepare response data
    const stats = {
      // Core KPIs
      totalRevenueThisMonth: totalRevenueThisMonth._sum.amount || 0,
      totalOutstandingDues: totalOutstandingDues._sum.netAmount || 0,
      recentPaymentActivity,
      totalStudentsWithDues,
      averageMonthlyRevenue: avgMonthlyRevenue,
      collectionEfficiency,

      // Allocation statistics
      totalFeeAllocations,
      paidAllocations,
      pendingAllocations,
      overdueAllocations,

      // Family statistics
      totalFamilies,
      familiesWithOutstanding,

      // Additional insights
      monthlyRevenueBreakdown: monthlyRevenueBreakdown || [],
      topPayingFamilies: topPayingFamilies.map(family => ({
        familyId: family.familyId,
        totalAmount: family._sum.amount,
        paymentCount: family._count.id
      })),
      recentPayments: recentPayments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        familyName: payment.family.name,
        method: payment.paymentMethod
      })),
      overdueBreakdown: overdueBreakdown.map(item => ({
        studentId: item.studentId,
        overdueAmount: item._sum.netAmount,
        overdueCount: item._count.id
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching financial statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
