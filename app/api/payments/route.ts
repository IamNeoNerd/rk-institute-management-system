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
        student: {
          include: {
            family: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        allocations: {
          include: {
            feeAllocation: {
              select: {
                id: true,
                month: true,
                year: true,
                netAmount: true,
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
      studentId, 
      amount, 
      paymentMethod, 
      referenceNumber, 
      paymentDate,
      allocations 
    } = body;

    // Validate required fields
    if (!studentId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Student, amount, and payment method are required' },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Create payment with allocations in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the payment
      const payment = await tx.payment.create({
        data: {
          studentId,
          amount: parseFloat(amount),
          paymentMethod,
          referenceNumber: referenceNumber || null,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          status: 'COMPLETED',
        },
      });

      // Create payment allocations if provided
      if (allocations && allocations.length > 0) {
        for (const allocation of allocations) {
          await tx.paymentAllocation.create({
            data: {
              paymentId: payment.id,
              feeAllocationId: allocation.feeAllocationId,
              amount: parseFloat(allocation.amount),
            },
          });

          // Update fee allocation status
          const totalAllocated = await tx.paymentAllocation.aggregate({
            where: { feeAllocationId: allocation.feeAllocationId },
            _sum: { amount: true },
          });

          const feeAllocation = await tx.studentFeeAllocation.findUnique({
            where: { id: allocation.feeAllocationId },
          });

          if (feeAllocation && totalAllocated._sum.amount) {
            const newStatus = totalAllocated._sum.amount >= feeAllocation.netAmount 
              ? 'PAID' 
              : 'PARTIAL';
            
            await tx.studentFeeAllocation.update({
              where: { id: allocation.feeAllocationId },
              data: { status: newStatus },
            });
          }
        }
      }

      return payment;
    });

    // Fetch the complete payment with relations
    const completePayment = await prisma.payment.findUnique({
      where: { id: result.id },
      include: {
        student: {
          include: {
            family: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        allocations: {
          include: {
            feeAllocation: {
              select: {
                id: true,
                month: true,
                year: true,
                netAmount: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(completePayment, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}
