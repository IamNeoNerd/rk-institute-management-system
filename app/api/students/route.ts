import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch all students with optimized query
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeSubscriptions =
      searchParams.get('include') === 'subscriptions';

    // Optimized query with pagination and conditional includes
    const students = await prisma.student.findMany({
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        studentId: true,
        grade: true,
        createdAt: true,
        family: {
          select: {
            id: true,
            name: true,
            discountAmount: true
          }
        },
        ...(includeSubscriptions && {
          subscriptions: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              course: {
                select: {
                  id: true,
                  name: true
                }
              },
              service: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            where: {
              endDate: null // Active subscriptions only
            }
          }
        }),
        _count: {
          select: {
            subscriptions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(students);
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
      where: { id: familyId }
    });

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        name,
        grade: grade || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
        familyId
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            discountAmount: true
          }
        },
        subscriptions: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                feeStructure: true
              }
            },
            service: {
              select: {
                id: true,
                name: true,
                feeStructure: true
              }
            }
          },
          where: {
            endDate: null
          }
        },
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
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
