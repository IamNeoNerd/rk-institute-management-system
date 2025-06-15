import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// PATCH /api/assignments/submissions/[id] - Grade submission (Teachers and Admins only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!['TEACHER', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { grade, feedback, status } = body;

    if (!grade || !status) {
      return NextResponse.json({ error: 'Grade and status are required' }, { status: 400 });
    }

    // Check if submission exists
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: params.id },
      include: {
        assignment: {
          select: {
            teacherId: true,
            title: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check if teacher owns this assignment (unless admin)
    if (decoded.role === 'TEACHER' && submission.assignment.teacherId !== decoded.userId) {
      return NextResponse.json({ error: 'You can only grade submissions for your assignments' }, { status: 403 });
    }

    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: params.id },
      data: {
        grade,
        feedback,
        status,
        gradedAt: new Date(),
        gradedBy: decoded.userId
      },
      include: {
        assignment: {
          select: {
            title: true,
            subject: true
          }
        },
        student: {
          select: {
            name: true,
            grade: true
          }
        },
        grader: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({ submission: updatedSubmission });
  } catch (error) {
    console.error('Error grading submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/assignments/submissions/[id] - Get specific submission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: params.id },
      include: {
        assignment: {
          select: {
            title: true,
            subject: true,
            dueDate: true,
            teacherId: true,
            teacher: { select: { name: true } }
          }
        },
        student: {
          select: {
            name: true,
            grade: true,
            family: {
              select: {
                users: {
                  select: { id: true }
                }
              }
            }
          }
        },
        grader: {
          select: {
            name: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check permissions
    const canView = 
      decoded.role === 'ADMIN' ||
      (decoded.role === 'TEACHER' && submission.assignment.teacherId === decoded.userId) ||
      (decoded.role === 'STUDENT' && submission.student.family.users.some(u => u.id === decoded.userId)) ||
      (decoded.role === 'PARENT' && submission.student.family.users.some(u => u.id === decoded.userId));

    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
