import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all payments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const familyId = searchParams.get('familyId');
    const status = searchParams.get('status');

    const whereClause: any = {};
    
    if (studentId) {
      whereClause.studentId = studentId;
    }
    
    if (familyId) {
      whereClause.student = {
        familyId: familyId
      };
    }
    
    if (status) {
      whereClause.status = status;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        feeAllocations: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST - Record a new payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      familyId,
      amount,
      paymentMethod,
      reference,
      paymentDate,
      feeAllocationIds
    } = body;

    // Validate required fields
    if (!familyId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Family, amount, and payment method are required' },
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

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        familyId,
        amount: parseFloat(amount),
        paymentMethod,
        reference: reference || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        feeAllocations: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update fee allocations if provided
    if (feeAllocationIds && feeAllocationIds.length > 0) {
      await prisma.studentFeeAllocation.updateMany({
        where: {
          id: { in: feeAllocationIds },
        },
        data: {
          paymentId: payment.id,
          isPaid: true,
          status: 'PAID',
          paidDate: new Date(),
        },
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}
