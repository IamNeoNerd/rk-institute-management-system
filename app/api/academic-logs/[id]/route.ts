import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET - Fetch single academic log
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const log = await prisma.academicLog.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
            family: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!log) {
      return NextResponse.json(
        { error: 'Academic log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error fetching academic log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic log' },
      { status: 500 }
    );
  }
}

// PUT - Update academic log
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, content, logType, subject, isPrivate } = body;

    // Check if log exists
    const existingLog = await prisma.academicLog.findUnique({
      where: { id }
    });

    if (!existingLog) {
      return NextResponse.json(
        { error: 'Academic log not found' },
        { status: 404 }
      );
    }

    // Update academic log
    const updatedLog = await prisma.academicLog.update({
      where: { id },
      data: {
        title: title || existingLog.title,
        content: content || existingLog.content,
        logType: logType || existingLog.logType,
        subject: subject !== undefined ? subject : existingLog.subject,
        isPrivate: isPrivate !== undefined ? isPrivate : existingLog.isPrivate
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error('Error updating academic log:', error);
    return NextResponse.json(
      { error: 'Failed to update academic log' },
      { status: 500 }
    );
  }
}

// DELETE - Delete academic log
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if log exists
    const existingLog = await prisma.academicLog.findUnique({
      where: { id }
    });

    if (!existingLog) {
      return NextResponse.json(
        { error: 'Academic log not found' },
        { status: 404 }
      );
    }

    // Delete academic log
    await prisma.academicLog.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Academic log deleted successfully' });
  } catch (error) {
    console.error('Error deleting academic log:', error);
    return NextResponse.json(
      { error: 'Failed to delete academic log' },
      { status: 500 }
    );
  }
}
