import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all courses
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        feeStructure: true,
        subscriptions: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                grade: true,
                studentId: true,
                family: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
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
