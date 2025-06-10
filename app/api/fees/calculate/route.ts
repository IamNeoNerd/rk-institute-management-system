import { NextResponse } from 'next/server';
import { FeeCalculationService } from '@/lib/feeCalculationService';

interface CalculateFeesBody {
  studentId?: unknown;
  familyId?: unknown;
  type?: unknown;
}

// POST - Calculate fees for student or family
export async function POST(request: Request) {
  try {
    let body: CalculateFeesBody | undefined;
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
        typeof body.type !== 'string' ||
        (body.type !== 'student' && body.type !== 'family') ||
        (body.type === 'student' && typeof body.studentId !== 'string') ||
        (body.type === 'family' && typeof body.familyId !== 'string')) {
      return NextResponse.json(
        { error: 'Invalid request body. Ensure "type" is "student" (with string "studentId") or "family" (with string "familyId").' },
        { status: 400 }
      );
    }

    // Type assertion for type safety in subsequent code
    const { studentId, familyId, type } = body as { studentId?: string; familyId?: string; type: 'student' | 'family' };

    if (type === 'student') { // studentId is guaranteed to be a string here by the check above
      const calculation = await FeeCalculationService.calculateStudentMonthlyFee(studentId!); // Non-null assertion for studentId
      return NextResponse.json(calculation);
    }

    if (type === 'family') { // familyId is guaranteed to be a string here
      const calculations = await FeeCalculationService.calculateFamilyFees(familyId!); // Non-null assertion for familyId
      return NextResponse.json(calculations);
    }

    // This part should ideally be unreachable due to the comprehensive validation above
    return NextResponse.json(
      { error: 'Invalid request type. Should be "student" or "family".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error calculating fees:', error);
    return NextResponse.json(
      { error: 'Failed to calculate fees' },
      { status: 500 }
    );
  }
}

// GET - Generate monthly allocations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '');
    const year = parseInt(searchParams.get('year') || '');

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    const allocations = await FeeCalculationService.generateMonthlyAllocations(month, year);
    return NextResponse.json(allocations);
  } catch (error) {
    console.error('Error generating allocations:', error);
    return NextResponse.json(
      { error: 'Failed to generate allocations' },
      { status: 500 }
    );
  }
}
