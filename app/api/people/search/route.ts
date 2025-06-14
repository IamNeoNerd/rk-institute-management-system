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

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';

    // Calculate date filter
    let dateFilter: any = {};
    if (dateRange !== 'all') {
      const now = new Date();
      let daysBack = 0;

      switch (dateRange) {
        case 'week':
          daysBack = 7;
          break;
        case 'month':
          daysBack = 30;
          break;
        case 'year':
          daysBack = 365;
          break;
      }

      if (daysBack > 0) {
        dateFilter = {
          createdAt: {
            gte: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
          }
        };
      }
    }

    const results: any[] = [];

    // Search Students
    if (type === 'all' || type === 'students') {
      const students = await prisma.student.findMany({
        where: {
          AND: [
            query
              ? {
                  OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { id: { contains: query, mode: 'insensitive' } }
                  ]
                }
              : {},
            dateFilter,
            status !== 'all'
              ? {
                  subscriptions:
                    status === 'active'
                      ? {
                          some: { isActive: true }
                        }
                      : {
                          none: { isActive: true }
                        }
                }
              : {}
          ]
        },
        include: {
          family: {
            select: {
              name: true,
              email: true
            }
          },
          subscriptions: {
            where: {
              AND: [
                { startDate: { lte: new Date() } },
                { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }
              ]
            },
            include: {
              course: { select: { name: true } },
              service: { select: { name: true } }
            }
          }
        },
        take: 50
      });

      students.forEach(student => {
        const activeSubscriptions = student.subscriptions.length;
        const subscriptionDetails = student.subscriptions
          .map(sub => sub.course?.name || sub.service?.name)
          .filter(Boolean)
          .join(', ');

        results.push({
          id: student.id,
          type: 'student',
          name: student.name,
          email: student.family.email,
          status: activeSubscriptions > 0 ? 'active' : 'inactive',
          details: `Family: ${student.family.name} | Enrolled in: ${subscriptionDetails || 'No active enrollments'}`,
          href: `/admin/students/${student.id}`
        });
      });
    }

    // Search Families
    if (type === 'all' || type === 'families') {
      const families = await prisma.family.findMany({
        where: {
          AND: [
            query
              ? {
                  OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } },
                    { id: { contains: query, mode: 'insensitive' } }
                  ]
                }
              : {},
            dateFilter
          ]
        },
        include: {
          students: {
            select: {
              name: true,
              subscriptions: {
                where: {
                  AND: [
                    { startDate: { lte: new Date() } },
                    {
                      OR: [{ endDate: null }, { endDate: { gte: new Date() } }]
                    }
                  ]
                }
              }
            }
          }
        },
        take: 50
      });

      families.forEach(family => {
        const studentCount = family.students.length;
        const activeStudents = family.students.filter(
          student => student.subscriptions.length > 0
        ).length;

        results.push({
          id: family.id,
          type: 'family',
          name: family.name,
          email: family.email,
          status: activeStudents > 0 ? 'active' : 'inactive',
          details: `${studentCount} student${studentCount !== 1 ? 's' : ''} | ${activeStudents} active enrollment${activeStudents !== 1 ? 's' : ''}`,
          href: `/admin/families/${family.id}`
        });
      });
    }

    // Search Users
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          AND: [
            query
              ? {
                  OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { id: { contains: query, mode: 'insensitive' } }
                  ]
                }
              : {},
            dateFilter
          ]
        },
        take: 50
      });

      users.forEach(user => {
        // Determine if user is active (logged in recently or has recent activity)
        const isActive = true; // For now, consider all users as active

        results.push({
          id: user.id,
          type: 'user',
          name: user.name,
          email: user.email,
          status: isActive ? 'active' : 'inactive',
          details: `Role: ${user.role} | Registered: ${user.createdAt.toLocaleDateString()}`,
          href: `/admin/users/${user.id}`
        });
      });
    }

    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExactMatch =
        a.name.toLowerCase() === query.toLowerCase() ||
        a.email?.toLowerCase() === query.toLowerCase();
      const bExactMatch =
        b.name.toLowerCase() === query.toLowerCase() ||
        b.email?.toLowerCase() === query.toLowerCase();

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Then sort by type (students, families, users)
      const typeOrder = { student: 0, family: 1, user: 2 };
      return (
        typeOrder[a.type as keyof typeof typeOrder] -
        typeOrder[b.type as keyof typeof typeOrder]
      );
    });

    return NextResponse.json({
      results: results.slice(0, 100), // Limit to 100 results
      total: results.length,
      query,
      filters: { type, status, dateRange }
    });
  } catch (error) {
    console.error('Error searching people:', error);
    return NextResponse.json(
      { error: 'Failed to search people' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
