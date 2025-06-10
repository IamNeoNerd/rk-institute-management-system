import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET /api/assignments/submissions - Fetch submissions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');

    let submissions;

    if (decoded.role === 'STUDENT') {
      // Students see only their own submissions
      const student = await prisma.student.findFirst({
        where: { family: { users: { some: { id: decoded.userId } } } }
      });

      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }

      submissions = await prisma.assignmentSubmission.findMany({
        where: {
          studentId: student.id,
          ...(assignmentId && { assignmentId })
        },
        include: {
          assignment: {
            select: {
              title: true,
              subject: true,
              dueDate: true,
              priority: true
            }
          },
          grader: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (decoded.role === 'PARENT') {
      // Parents see submissions for their children
      const family = await prisma.family.findFirst({
        where: { users: { some: { id: decoded.userId } } },
        include: { students: true }
      });

      if (!family) {
        return NextResponse.json({ error: 'Family not found' }, { status: 404 });
      }

      const studentIds = family.students.map(s => s.id);

      submissions = await prisma.assignmentSubmission.findMany({
        where: {
          studentId: { in: studentIds },
          ...(assignmentId && { assignmentId })
        },
        include: {
          assignment: {
            select: {
              title: true,
              subject: true,
              dueDate: true,
              priority: true
            }
          },
          student: { select: { name: true, grade: true } },
          grader: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (decoded.role === 'TEACHER') {
      // Teachers see submissions for their assignments
      submissions = await prisma.assignmentSubmission.findMany({
        where: {
          assignment: { teacherId: decoded.userId },
          ...(assignmentId && { assignmentId }),
          ...(studentId && { studentId })
        },
        include: {
          assignment: {
            select: {
              title: true,
              subject: true,
              dueDate: true,
              priority: true
            }
          },
          student: { select: { name: true, grade: true } },
          grader: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (decoded.role === 'ADMIN') {
      // Admins see all submissions
      submissions = await prisma.assignmentSubmission.findMany({
        where: {
          ...(assignmentId && { assignmentId }),
          ...(studentId && { studentId })
        },
        include: {
          assignment: {
            select: {
              title: true,
              subject: true,
              dueDate: true,
              priority: true,
              teacher: { select: { name: true } }
            }
          },
          student: { select: { name: true, grade: true } },
          grader: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/assignments/submissions - Submit assignment (Students only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (decoded.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Only students can submit assignments' }, { status: 403 });
    }

    const body = await request.json();
    const { assignmentId, content, attachmentUrl, attachmentName } = body;

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: { family: { users: { some: { id: decoded.userId } } } }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if assignment exists and is active
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment || !assignment.isActive) {
      return NextResponse.json({ error: 'Assignment not found or inactive' }, { status: 404 });
    }

    // Check if student is eligible for this assignment
    const isEligible = assignment.grade === student.grade || assignment.studentId === student.id;
    if (!isEligible) {
      return NextResponse.json({ error: 'Not eligible for this assignment' }, { status: 403 });
    }

    // Check if already submitted
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: student.id
        }
      }
    });

    if (existingSubmission) {
      return NextResponse.json({ error: 'Assignment already submitted' }, { status: 400 });
    }

    // Determine if submission is late
    const isLate = assignment.dueDate && new Date() > assignment.dueDate;
    const status = isLate ? 'LATE' : 'SUBMITTED';

    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: student.id,
        content,
        attachmentUrl,
        attachmentName,
        status,
        submittedAt: new Date()
      },
      include: {
        assignment: {
          select: {
            title: true,
            subject: true,
            dueDate: true
          }
        }
      }
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
