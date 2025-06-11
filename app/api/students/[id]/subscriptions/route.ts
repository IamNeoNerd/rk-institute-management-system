import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch student subscriptions
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptions = await prisma.studentSubscription.findMany({
      where: {
        studentId: params.id,
        endDate: null // Active subscriptions only
      },
      include: {
        course: {
          include: { feeStructure: true }
        },
        service: {
          include: { feeStructure: true }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST - Create new subscription
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { courseId, serviceId, discountAmount, startDate } = body;

    // Validate that either courseId or serviceId is provided
    if (!courseId && !serviceId) {
      return NextResponse.json(
        { error: 'Either course or service must be specified' },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: params.id }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.studentSubscription.findFirst({
      where: {
        studentId: params.id,
        courseId: courseId || null,
        serviceId: serviceId || null,
        endDate: null
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Student is already subscribed to this course/service' },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await prisma.studentSubscription.create({
      data: {
        studentId: params.id,
        courseId: courseId || null,
        serviceId: serviceId || null,
        discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
        startDate: startDate ? new Date(startDate) : new Date()
      },
      include: {
        course: {
          include: { feeStructure: true }
        },
        service: {
          include: { feeStructure: true }
        }
      }
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
