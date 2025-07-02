import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

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
            name: true
          }
        },
        feeAllocations: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                family: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.reference,
      paymentDate: payment.paymentDate,
      status: 'COMPLETED', // Default status
      student:
        payment.feeAllocations.length > 0
          ? {
              id: payment.feeAllocations[0].student.id,
              name: payment.feeAllocations[0].student.name,
              family: payment.feeAllocations[0].student.family
            }
          : {
              id: '',
              name: 'Unknown Student',
              family: payment.family
            },
      allocations: payment.feeAllocations.map(fa => ({
        id: fa.id,
        amount: fa.netAmount, // Use the fee allocation amount
        feeAllocation: {
          id: fa.id,
          month: fa.month,
          year: fa.year,
          netAmount: fa.netAmount
        }
      })),
      createdAt: payment.createdAt
    }));

    return NextResponse.json(transformedPayments);
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
      familyId,
      amount,
      paymentMethod,
      referenceNumber,
      paymentDate,
      allocations
    } = body;

    // Validate required fields
    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Amount and payment method are required' },
        { status: 400 }
      );
    }

    // Determine family ID from student if not provided
    let targetFamilyId = familyId;
    if (studentId && !familyId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { familyId: true }
      });
      if (student) {
        targetFamilyId = student.familyId;
      }
    }

    if (!targetFamilyId) {
      return NextResponse.json(
        { error: 'Family ID is required' },
        { status: 400 }
      );
    }

    // Verify family exists
    const family = await prisma.family.findUnique({
      where: { id: targetFamilyId }
    });

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        familyId: targetFamilyId,
        amount: parseFloat(amount),
        paymentMethod,
        reference: referenceNumber || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date()
      },
      include: {
        family: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update fee allocations if provided
    if (allocations && allocations.length > 0) {
      for (const allocation of allocations) {
        // Update fee allocation status and link to payment
        await prisma.studentFeeAllocation.update({
          where: { id: allocation.feeAllocationId },
          data: {
            status: 'PAID',
            paidDate: new Date(),
            paymentId: payment.id // Link to the payment
          }
        });
      }
    }

    // Fetch the complete payment with allocations for response
    const completePayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        family: {
          select: {
            id: true,
            name: true
          }
        },
        feeAllocations: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                family: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Transform response to match frontend expectations
    const transformedPayment = {
      id: completePayment!.id,
      amount: completePayment!.amount,
      paymentMethod: completePayment!.paymentMethod,
      referenceNumber: completePayment!.reference,
      paymentDate: completePayment!.paymentDate,
      status: 'COMPLETED',
      student:
        completePayment!.feeAllocations.length > 0
          ? {
              id: completePayment!.feeAllocations[0].student.id,
              name: completePayment!.feeAllocations[0].student.name,
              family: completePayment!.feeAllocations[0].student.family
            }
          : {
              id: '',
              name: 'Unknown Student',
              family: completePayment!.family
            },
      allocations: completePayment!.feeAllocations.map(fa => ({
        id: fa.id,
        amount: fa.netAmount,
        feeAllocation: {
          id: fa.id,
          month: fa.month,
          year: fa.year,
          netAmount: fa.netAmount
        }
      })),
      createdAt: completePayment!.createdAt
    };

    return NextResponse.json(transformedPayment, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}
