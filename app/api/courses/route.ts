import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch all courses with optimized query
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeStudents = searchParams.get('include') === 'students';

    // Optimized query with pagination and conditional includes
    const courses = await prisma.course.findMany({
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        feeStructure: {
          select: {
            id: true,
            amount: true,
            billingCycle: true
          }
        },
        ...(includeStudents && {
          subscriptions: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              student: {
                select: {
                  id: true,
                  name: true,
                  grade: true,
                  studentId: true
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

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST - Create a new course
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, grade, teacherId, feeStructure } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Course name is required' },
        { status: 400 }
      );
    }

    // Create course with optional fee structure
    const courseData: any = {
      name,
      description: description || null,
      grade: grade || null,
      teacherId: teacherId || null
    };

    const course = await prisma.course.create({
      data: courseData,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create fee structure if provided
    if (feeStructure && feeStructure.amount) {
      await prisma.feeStructure.create({
        data: {
          amount: parseFloat(feeStructure.amount),
          billingCycle: feeStructure.billingCycle || 'MONTHLY',
          courseId: course.id
        }
      });
    }

    // Fetch the complete course with fee structure
    const completeCourse = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        feeStructure: true,
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    return NextResponse.json(completeCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
