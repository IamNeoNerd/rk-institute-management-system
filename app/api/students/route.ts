import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch students with pagination and optimized queries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25'); // Smaller default limit
    const grade = searchParams.get('grade');
    const search = searchParams.get('search');

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (grade) {
      whereClause.grade = grade;
    }
    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    // Get total count for pagination
    const totalCount = await prisma.student.count({ where: whereClause });

    // Optimized query with pagination and selective includes
    const students = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        grade: true,
        dateOfBirth: true,
        enrollmentDate: true,
        familyId: true,
        createdAt: true,
        family: {
          select: {
            id: true,
            name: true,
            discountAmount: true,
          },
        },
        // Only get active subscriptions count for performance
        _count: {
          select: {
            subscriptions: {
              where: { endDate: null }
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Return paginated response
    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST - Create a new student
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, grade, dateOfBirth, familyId, enrollmentDate } = body;

    // Validate required fields
    if (!name || !familyId) {
      return NextResponse.json(
        { error: 'Student name and family are required' },
        { status: 400 }
      );
    }

    // Verify family exists
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        name,
        grade: grade || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
        familyId,
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            discountAmount: true,
          },
        },
        subscriptions: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                feeStructure: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                feeStructure: true,
              },
            },
          },
          where: {
            endDate: null,
          },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
