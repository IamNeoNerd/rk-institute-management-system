import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch a specific student
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
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

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT - Update a student
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Update student
    const student = await prisma.student.update({
      where: { id: params.id },
      data: {
        name,
        grade: grade || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : undefined,
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

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a student
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if student has active subscriptions
    const subscriptionCount = await prisma.studentSubscription.count({
      where: {
        studentId: params.id,
        endDate: null
      }
    });

    if (subscriptionCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete student with active subscriptions. Please end subscriptions first.'
        },
        { status: 400 }
      );
    }

    // Delete the student
    await prisma.student.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
