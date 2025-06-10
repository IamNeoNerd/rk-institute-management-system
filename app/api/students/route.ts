import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateStudentBody {
  name?: unknown;
  grade?: unknown;
  dateOfBirth?: unknown;
  familyId?: unknown;
  enrollmentDate?: unknown;
}

// GET - Fetch all students
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        family: {
          select: {
            id: true,
            name: true,
            discountAmount: true,
          },
        },
        subscriptions: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                feeStructure: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                feeStructure: true,
              },
            },
          },
          where: {
            endDate: null, // Active subscriptions only
          },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST - Create a new student
export async function POST(request: Request) {
  try {
    let body: CreateStudentBody | undefined;
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
        typeof body.name !== 'string' ||
        typeof body.familyId !== 'string' ||
        (body.grade && typeof body.grade !== 'string') ||
        (body.dateOfBirth && typeof body.dateOfBirth !== 'string') ||
        (body.enrollmentDate && typeof body.enrollmentDate !== 'string')
        ) {
      return NextResponse.json(
        { error: 'Invalid request body. Ensure name (string) and familyId (string) are provided. Optional fields (grade, dateOfBirth, enrollmentDate) must also be strings if provided.' },
        { status: 400 }
      );
    }

    const { name, grade, dateOfBirth, familyId, enrollmentDate } = body;

    let finalDateOfBirth: Date | null = null;
    if (dateOfBirth) {
      const parsedDOB = new Date(dateOfBirth as string);
      if (isNaN(parsedDOB.getTime())) {
        return NextResponse.json({ error: 'Invalid date of birth format.' }, { status: 400 });
      }
      if (parsedDOB > new Date()) {
        return NextResponse.json({ error: 'Date of birth cannot be in the future.' }, { status: 400 });
      }
      finalDateOfBirth = parsedDOB;
    }

    let finalEnrollmentDate: Date;
    if (enrollmentDate) {
      const parsedEnrollmentDate = new Date(enrollmentDate as string);
      if (isNaN(parsedEnrollmentDate.getTime())) {
        return NextResponse.json({ error: 'Invalid enrollment date format.' }, { status: 400 });
      }
      finalEnrollmentDate = parsedEnrollmentDate;
    } else {
      finalEnrollmentDate = new Date();
    }

    // Verify family exists
    const family = await prisma.family.findUnique({
      where: { id: familyId as string },
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        name: name as string,
        grade: (grade as string) || null,
        dateOfBirth: finalDateOfBirth,
        enrollmentDate: finalEnrollmentDate,
        familyId: familyId as string,
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            discountAmount: true,
          },
        },
        subscriptions: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                feeStructure: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                feeStructure: true,
              },
            },
          },
          where: {
            endDate: null,
          },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
