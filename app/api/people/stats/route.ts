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

    // Get comprehensive people statistics
    const [
      totalStudents,
      totalFamilies,
      totalUsers,
      activeStudents,
      recentEnrollments,
      pendingUsers
    ] = await Promise.all([
      // Total students count
      prisma.student.count(),
      
      // Total families count
      prisma.family.count(),
      
      // Total users count
      prisma.user.count(),
      
      // Active students (those with recent activity or current enrollments)
      prisma.student.count({
        where: {
          subscriptions: {
            some: {
              isActive: true
            }
          }
        }
      }),
      
      // Recent enrollments (last 30 days)
      prisma.student.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      }),
      
      // Pending users (placeholder - could be users without verified email, etc.)
      prisma.user.count({
        where: {
          // For now, we'll consider users created in last 7 days as "pending"
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          }
        }
      })
    ]);

    // Additional statistics for enhanced insights
    const [
      studentsWithMultipleCourses,
      familiesWithMultipleChildren,
      averageFamilySize
    ] = await Promise.all([
      // Students enrolled in multiple courses
      prisma.student.count({
        where: {
          subscriptions: {
            some: {
              isActive: true,
              course: {
                isNot: null
              }
            }
          }
        }
      }),
      
      // Families with multiple children
      prisma.family.count({
        where: {
          students: {
            some: {
              id: {
                not: undefined
              }
            }
          }
        }
      }),
      
      // Calculate average family size
      prisma.family.findMany({
        include: {
          _count: {
            select: {
              students: true
            }
          }
        }
      })
    ]);

    // Calculate average family size
    const avgFamilySize = averageFamilySize.length > 0 
      ? (averageFamilySize.reduce((sum, family) => sum + family._count.students, 0) / averageFamilySize.length).toFixed(1)
      : '0';

    // Get recent activity data
    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        family: {
          select: {
            name: true
          }
        }
      }
    });

    const recentFamilies = await prisma.family.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            students: true
          }
        }
      }
    });

    // Prepare response data
    const stats = {
      totalStudents,
      totalFamilies,
      totalUsers,
      activeStudents,
      recentEnrollments,
      pendingUsers,
      
      // Additional insights
      studentsWithMultipleCourses,
      familiesWithMultipleChildren,
      averageFamilySize: parseFloat(avgFamilySize),
      
      // Recent activity
      recentActivity: {
        students: recentStudents.map(student => ({
          id: student.id,
          name: student.name,
          familyName: student.family.name,
          enrolledAt: student.createdAt
        })),
        families: recentFamilies.map(family => ({
          id: family.id,
          name: family.name,
          studentCount: family._count.students,
          registeredAt: family.createdAt
        }))
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching people statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch people statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
