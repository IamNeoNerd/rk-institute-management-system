import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

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

    // Get comprehensive academic statistics
    const [
      totalCourses,
      totalServices,
      totalAcademicLogs,
      activeCourses,
      activeServices,
      recentLogs,
      totalEnrollments
    ] = await Promise.all([
      // Total courses count
      prisma.course.count(),
      
      // Total services count
      prisma.service.count(),
      
      // Total academic logs count
      prisma.academicLog.count(),
      
      // Active courses (those with current subscriptions)
      prisma.course.count({
        where: {
          subscriptions: {
            some: {
              AND: [
                { startDate: { lte: new Date() } },
                { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }
              ]
            }
          }
        }
      }),

      // Active services (those with current subscriptions)
      prisma.service.count({
        where: {
          subscriptions: {
            some: {
              AND: [
                { startDate: { lte: new Date() } },
                { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }
              ]
            }
          }
        }
      }),
      
      // Recent academic logs (last 7 days)
      prisma.academicLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          }
        }
      }),
      
      // Total enrollments (active subscriptions)
      prisma.studentSubscription.count({
        where: {
          AND: [
            { startDate: { lte: new Date() } },
            { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }
          ]
        }
      })
    ]);

    // Since AcademicLog doesn't have progress field, use a placeholder
    const averageProgress = 75; // Placeholder value

    // Additional statistics for enhanced insights
    const [
      courseEnrollments,
      serviceSubscriptions,
      topCourses,
      topServices,
      recentEnrollments
    ] = await Promise.all([
      // Course enrollments breakdown
      prisma.studentSubscription.count({
        where: {
          AND: [
            { startDate: { lte: new Date() } },
            { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
            { courseId: { not: null } }
          ]
        }
      }),

      // Service subscriptions breakdown
      prisma.studentSubscription.count({
        where: {
          AND: [
            { startDate: { lte: new Date() } },
            { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
            { serviceId: { not: null } }
          ]
        }
      }),
      
      // Top courses by enrollment
      prisma.course.findMany({
        include: {
          subscriptions: {
            where: {
              AND: [
                { startDate: { lte: new Date() } },
                { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }
              ]
            }
          },
          _count: {
            select: {
              subscriptions: true
            }
          }
        },
        orderBy: {
          subscriptions: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      
      // Top services by subscription
      prisma.service.findMany({
        include: {
          subscriptions: {
            where: {
              AND: [
                { startDate: { lte: new Date() } },
                { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }
              ]
            }
          },
          _count: {
            select: {
              subscriptions: true
            }
          }
        },
        orderBy: {
          subscriptions: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      
      // Recent enrollments (last 30 days)
      prisma.studentSubscription.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      })
    ]);

    // Get recent academic activity
    const recentActivity = await prisma.academicLog.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        student: {
          select: {
            name: true,
            family: {
              select: {
                name: true
              }
            }
          }
        },
        teacher: {
          select: {
            name: true
          }
        }
      }
    });

    // Prepare response data
    const stats = {
      totalCourses,
      totalServices,
      totalAcademicLogs,
      activeCourses,
      activeServices,
      recentLogs,
      totalEnrollments,
      averageProgress,
      
      // Additional insights
      courseEnrollments,
      serviceSubscriptions,
      recentEnrollments,
      
      // Top performers
      topCourses: topCourses.map((course: any) => ({
        id: course.id,
        name: course.name,
        enrollments: course._count.subscriptions,
        description: course.description
      })),

      topServices: topServices.map((service: any) => ({
        id: service.id,
        name: service.name,
        subscriptions: service._count.subscriptions,
        description: service.description
      })),
      
      // Recent activity
      recentActivity: recentActivity.map((log: any) => ({
        id: log.id,
        studentName: log.student.name,
        familyName: log.student.family.name,
        teacherName: log.teacher?.name || 'System',
        subject: log.subject,
        logType: log.logType,
        createdAt: log.createdAt
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching academic statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
