import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RecordPaymentBody {
  studentId?: unknown;
  familyId?: unknown;
  amount?: unknown;
  paymentMethod?: unknown;
  referenceNumber?: unknown;
  paymentDate?: unknown;
  allocations?: Array<{ feeAllocationId?: unknown; [key: string]: unknown }>;
}

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
                family: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    // Transform the data to match frontend expectations
    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.reference,
      paymentDate: payment.paymentDate,
      // Assuming 'COMPLETED' means the payment record itself has been successfully created,
      // as the Payment model itself does not have a dedicated status field.
      // The status of individual fee allocations linked to this payment can be found
      // in the 'allocations' array, specifically `fa.feeAllocation.status` (if available).
      status: 'COMPLETED',
      student: payment.feeAllocations.length > 0 ? {
        id: payment.feeAllocations[0].student.id,
        name: payment.feeAllocations[0].student.name,
        family: payment.feeAllocations[0].student.family,
      } : {
        id: '',
        name: 'Unknown Student',
        family: payment.family,
      },
      allocations: payment.feeAllocations.map(fa => ({
        id: fa.id,
        amount: fa.netAmount, // Use the fee allocation amount
        feeAllocation: {
          id: fa.id,
          month: fa.month,
          year: fa.year,
          netAmount: fa.netAmount,
        },
      })),
      createdAt: payment.createdAt,
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
    let body: RecordPaymentBody | undefined;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!body ||
        (typeof body.amount !== 'number' && typeof body.amount !== 'string') ||
        typeof body.paymentMethod !== 'string' ||
        (!body.studentId && !body.familyId) || // Must have studentId or familyId
        (body.studentId && typeof body.studentId !== 'string') ||
        (body.familyId && typeof body.familyId !== 'string') ||
        (body.paymentDate && typeof body.paymentDate !== 'string') ||
        (body.referenceNumber && typeof body.referenceNumber !== 'string') ||
        (body.allocations && !Array.isArray(body.allocations))
       ) {
      return NextResponse.json(
        { error: 'Invalid request body. Ensure amount (string/number), paymentMethod (string), and either studentId (string) or familyId (string) are provided. Optional fields: paymentDate (string), referenceNumber (string), allocations (array).' },
        { status: 400 }
      );
    }

    const {
      studentId,
      familyId,
      amount, // Validated as string or number
      paymentMethod, // Validated as string
      referenceNumber, // Validated as string or undefined
      paymentDate, // Validated as string or undefined
      allocations // Validated as array or undefined
    } = body;

    const parsedAmount = parseFloat(String(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount value. Must be a positive number.' },
        { status: 400 }
      );
    }

    let finalPaymentDate: Date;
    if (paymentDate) {
      const parsedDate = new Date(paymentDate as string);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'Invalid payment date format.' }, { status: 400 });
      }
      // Clear time part for comparison to avoid issues with current time being slightly ahead
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkParsedDate = new Date(parsedDate); // Use a copy for date-only comparison
      checkParsedDate.setHours(0,0,0,0);

      if (checkParsedDate > today) {
        return NextResponse.json({ error: 'Payment date cannot be in the future.' }, { status: 400 });
      }
      finalPaymentDate = parsedDate; // Use the original parsedDate with time
    } else {
      finalPaymentDate = new Date();
    }

    // Determine family ID from student if not provided
    let targetFamilyId = familyId as string | undefined;

    if (studentId && !targetFamilyId) { // If studentId is given and familyId is not
      const student = await prisma.student.findUnique({
        where: { id: studentId as string },
        select: { familyId: true },
      });
      if (student && student.familyId) { // Student found and has a familyId
        targetFamilyId = student.familyId;
      } else { // Student not found, or student has no familyId
        return NextResponse.json(
          { error: `Student with ID ${studentId} not found or has no associated family.` },
          { status: 404 }
        );
      }
    }

    if (!targetFamilyId) {
      // This condition is met if:
      // 1. No familyId was provided directly.
      // 2. No studentId was provided (already caught by the initial validation if both are missing).
      // Thus, this mainly catches the case where familyId was expected but not given, and studentId was also not given.
      return NextResponse.json(
        { error: 'Family ID is required for the payment and could not be determined.' },
        { status: 400 }
      );
    }

    // Verify family exists
    const family = await prisma.family.findUnique({
      where: { id: targetFamilyId },
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    // Use Prisma transaction for atomic operations
    const processedPayment = await prisma.$transaction(async (tx) => {
      // 1. Create payment
      const newPayment = await tx.payment.create({
        data: {
          familyId: targetFamilyId!,
          amount: parsedAmount,
          paymentMethod: paymentMethod as string,
          reference: (referenceNumber as string) || null,
          paymentDate: finalPaymentDate,
        },
        // Minimal include here, full include will be in the final fetch
      });

      // 2. Update fee allocations if provided
      if (allocations && Array.isArray(allocations) && allocations.length > 0) {
        for (const alloc of allocations) {
          if (alloc && typeof alloc.feeAllocationId === 'string') {
            await tx.studentFeeAllocation.update({
              where: { id: alloc.feeAllocationId },
              data: {
                status: 'PAID',
                paidDate: finalPaymentDate, // Use the payment's date for paidDate
                paymentId: newPayment.id,
              },
            });
          } else {
            console.warn('Skipping invalid allocation item during transaction:', alloc);
            // Optionally, throw an error here to rollback the transaction if strictness is required
            // throw new Error('Invalid allocation data provided within transaction.');
          }
        }
      }

      // 3. Fetch the complete payment with allocations for response
      const completePayment = await tx.payment.findUnique({
        where: { id: newPayment.id },
        include: {
          family: { select: { id: true, name: true } },
          feeAllocations: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  family: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      });

      if (!completePayment) {
        // This case should ideally not be reached if payment creation was successful
        throw new Error('Failed to fetch payment immediately after creation within transaction.');
      }
      return completePayment;
    });

    // Transform response to match frontend expectations
    // Note: completePayment from the transaction is now 'processedPayment'
    const transformedPayment = {
      id: processedPayment.id,
      amount: processedPayment.amount,
      paymentMethod: processedPayment.paymentMethod,
      referenceNumber: processedPayment.reference,
      paymentDate: processedPayment.paymentDate,
      status: 'COMPLETED',
      student: processedPayment.feeAllocations.length > 0 ? {
        id: processedPayment.feeAllocations[0].student.id,
        name: processedPayment.feeAllocations[0].student.name,
        family: processedPayment.feeAllocations[0].student.family,
      } : {
        id: '',
        name: 'Unknown Student',
        family: processedPayment.family, // family will be on processedPayment due to include
      },
      allocations: processedPayment.feeAllocations.map(fa => ({
        id: fa.id,
        amount: fa.netAmount,
        feeAllocation: { // Assuming structure from existing code
          id: fa.id,
          month: (fa as any).month, // Cast if month/year not directly on StudentFeeAllocation
          year: (fa as any).year,
          netAmount: fa.netAmount,
        },
      })),
      createdAt: processedPayment.createdAt,
    };

    return NextResponse.json(transformedPayment, { status: 201 });
  } catch (error) {
    console.error('Error recording payment (transaction might have rolled back):', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}
