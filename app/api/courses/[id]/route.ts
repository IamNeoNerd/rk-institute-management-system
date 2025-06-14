import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch a specific course
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
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

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT - Update a course
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Update course
    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        grade: grade || null,
        teacherId: teacherId || null
      }
    });

    // Handle fee structure update
    if (feeStructure) {
      const existingFeeStructure = await prisma.feeStructure.findUnique({
        where: { courseId: params.id }
      });

      if (existingFeeStructure) {
        // Update existing fee structure
        await prisma.feeStructure.update({
          where: { courseId: params.id },
          data: {
            amount: parseFloat(feeStructure.amount),
            billingCycle: feeStructure.billingCycle || 'MONTHLY'
          }
        });
      } else if (feeStructure.amount) {
        // Create new fee structure
        await prisma.feeStructure.create({
          data: {
            amount: parseFloat(feeStructure.amount),
            billingCycle: feeStructure.billingCycle || 'MONTHLY',
            courseId: params.id
          }
        });
      }
    }

    // Fetch updated course with all relations
    const updatedCourse = await prisma.course.findUnique({
      where: { id: params.id },
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

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a course
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if course has active subscriptions
    const subscriptionCount = await prisma.studentSubscription.count({
      where: {
        courseId: params.id,
        endDate: null // Active subscriptions
      }
    });

    if (subscriptionCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active student subscriptions' },
        { status: 400 }
      );
    }

    // Delete fee structure first (if exists)
    await prisma.feeStructure.deleteMany({
      where: { courseId: params.id }
    });

    // Delete the course
    await prisma.course.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
