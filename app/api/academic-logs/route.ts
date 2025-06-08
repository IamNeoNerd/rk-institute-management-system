import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET - Fetch all academic logs
export async function GET() {
  try {
    const logs = await prisma.academicLog.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching academic logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic logs' },
      { status: 500 }
    );
  }
}

// POST - Create new academic log
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, logType, subject, isPrivate, studentId, teacherId } = body;

    // Validate required fields
    if (!title || !content || !logType || !studentId || !teacherId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Create academic log
    const academicLog = await prisma.academicLog.create({
      data: {
        title,
        content,
        logType,
        subject: subject || null,
        isPrivate: isPrivate || false,
        studentId,
        teacherId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(academicLog, { status: 201 });
  } catch (error) {
    console.error('Error creating academic log:', error);
    return NextResponse.json(
      { error: 'Failed to create academic log' },
      { status: 500 }
    );
  }
}
