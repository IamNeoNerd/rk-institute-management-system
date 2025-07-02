import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/assignments - Fetch assignments for a user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as any;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const grade = searchParams.get('grade');
    const subject = searchParams.get('subject');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let assignments;

    if (decoded.role === 'STUDENT') {
      // Students see assignments for their grade + student-specific assignments
      const student = await prisma.student.findFirst({
        where: { family: { users: { some: { id: decoded.userId } } } }
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }

      assignments = await prisma.assignment.findMany({
        where: {
          isActive: true,
          OR: [{ grade: student.grade }, { studentId: student.id }],
          ...(subject && { subject }),
          ...(type && { assignmentType: type })
        },
        include: {
          teacher: { select: { name: true } },
          submissions: {
            where: { studentId: student.id },
            select: {
              id: true,
              status: true,
              submittedAt: true,
              grade: true,
              feedback: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      });
    } else if (decoded.role === 'PARENT') {
      // Parents see assignments for their children
      const family = await prisma.family.findFirst({
        where: { users: { some: { id: decoded.userId } } },
        include: { students: true }
      });

      if (!family) {
        return NextResponse.json(
          { error: 'Family not found' },
          { status: 404 }
        );
      }

      const studentIds = family.students.map(s => s.id);
      const grades = Array.from(
        new Set(
          family.students
            .map(s => s.grade)
            .filter((grade): grade is string => Boolean(grade))
        )
      );

      assignments = await prisma.assignment.findMany({
        where: {
          isActive: true,
          OR: [{ grade: { in: grades } }, { studentId: { in: studentIds } }],
          ...(subject && { subject }),
          ...(type && { assignmentType: type })
        },
        include: {
          teacher: { select: { name: true } },
          student: { select: { name: true, grade: true } },
          submissions: {
            where: { studentId: { in: studentIds } },
            include: {
              student: { select: { name: true } }
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      });
    } else if (decoded.role === 'TEACHER') {
      // Teachers see their own assignments
      assignments = await prisma.assignment.findMany({
        where: {
          teacherId: decoded.userId,
          ...(studentId && { studentId }),
          ...(grade && { grade }),
          ...(subject && { subject }),
          ...(type && { assignmentType: type })
        },
        include: {
          teacher: { select: { name: true } },
          student: { select: { name: true, grade: true } },
          submissions: {
            include: {
              student: { select: { name: true, grade: true } }
            }
          }
        },
        orderBy: [{ createdAt: 'desc' }]
      });
    } else if (decoded.role === 'ADMIN') {
      // Admins see all assignments
      assignments = await prisma.assignment.findMany({
        where: {
          ...(studentId && { studentId }),
          ...(grade && { grade }),
          ...(subject && { subject }),
          ...(type && { assignmentType: type })
        },
        include: {
          teacher: { select: { name: true } },
          student: { select: { name: true, grade: true } },
          submissions: {
            include: {
              student: { select: { name: true, grade: true } }
            }
          }
        },
        orderBy: [{ createdAt: 'desc' }]
      });
    }

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/assignments - Create new assignment (Teachers and Admins only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as any;

    if (!['TEACHER', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      subject,
      assignmentType = 'HOMEWORK',
      priority = 'MEDIUM',
      dueDate,
      grade,
      studentId,
      attachmentUrl,
      attachmentName
    } = body;

    if (!title || !description || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        subject,
        assignmentType,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        grade,
        studentId,
        teacherId: decoded.userId,
        attachmentUrl,
        attachmentName
      },
      include: {
        teacher: { select: { name: true } },
        student: { select: { name: true, grade: true } }
      }
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
