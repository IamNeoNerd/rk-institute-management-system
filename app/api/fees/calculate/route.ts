import { NextResponse } from 'next/server';

import { FeeCalculationService } from '@/lib/feeCalculationService';

// POST - Calculate fees for student or family
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, familyId, type } = body;

    if (type === 'student' && studentId) {
      const calculation =
        await FeeCalculationService.calculateStudentMonthlyFee(studentId);
      return NextResponse.json(calculation);
    }

    if (type === 'family' && familyId) {
      const calculations =
        await FeeCalculationService.calculateFamilyFees(familyId);
      return NextResponse.json(calculations);
    }

    return NextResponse.json(
      {
        error:
          'Invalid request. Provide studentId or familyId with appropriate type.'
      },
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

    const allocations = await FeeCalculationService.generateMonthlyAllocations(
      month,
      year
    );
    return NextResponse.json(allocations);
  } catch (error) {
    console.error('Error generating allocations:', error);
    return NextResponse.json(
      { error: 'Failed to generate allocations' },
      { status: 500 }
    );
  }
}
