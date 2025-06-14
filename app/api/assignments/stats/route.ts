import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/assignments/stats - Get assignment statistics
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

    let stats;

    if (decoded.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { family: { users: { some: { id: decoded.userId } } } }
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }

      // Get assignments for this student
      const assignments = await prisma.assignment.findMany({
        where: {
          isActive: true,
          OR: [{ grade: student.grade }, { studentId: student.id }]
        },
        include: {
          submissions: {
            where: { studentId: student.id }
          }
        }
      });

      const totalAssignments = assignments.length;
      const submittedCount = assignments.filter(
        a => a.submissions.length > 0
      ).length;
      const pendingCount = totalAssignments - submittedCount;
      const overdueCount = assignments.filter(
        a => a.dueDate && new Date() > a.dueDate && a.submissions.length === 0
      ).length;
      const gradedCount = assignments.filter(
        a => a.submissions.length > 0 && a.submissions[0].status === 'GRADED'
      ).length;

      // Subject breakdown
      const subjectStats = assignments.reduce(
        (acc, assignment) => {
          const subject = assignment.subject;
          if (!acc[subject]) {
            acc[subject] = { total: 0, submitted: 0, pending: 0, overdue: 0 };
          }
          acc[subject].total++;

          const hasSubmission = assignment.submissions.length > 0;
          if (hasSubmission) {
            acc[subject].submitted++;
          } else {
            acc[subject].pending++;
            if (assignment.dueDate && new Date() > assignment.dueDate) {
              acc[subject].overdue++;
            }
          }
          return acc;
        },
        {} as Record<string, any>
      );

      stats = {
        totalAssignments,
        submittedCount,
        pendingCount,
        overdueCount,
        gradedCount,
        completionRate:
          totalAssignments > 0
            ? Math.round((submittedCount / totalAssignments) * 100)
            : 0,
        subjectStats,
        recentActivity: assignments
          .filter(a => a.submissions.length > 0)
          .sort(
            (a, b) =>
              new Date(b.submissions[0].submittedAt || 0).getTime() -
              new Date(a.submissions[0].submittedAt || 0).getTime()
          )
          .slice(0, 5)
          .map(a => ({
            title: a.title,
            subject: a.subject,
            submittedAt: a.submissions[0].submittedAt,
            status: a.submissions[0].status
          }))
      };
    } else if (decoded.role === 'PARENT') {
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

      // Get assignments for family's children
      const assignments = await prisma.assignment.findMany({
        where: {
          isActive: true,
          OR: [{ grade: { in: grades } }, { studentId: { in: studentIds } }]
        },
        include: {
          submissions: {
            where: { studentId: { in: studentIds } },
            include: {
              student: { select: { name: true } }
            }
          }
        }
      });

      const totalAssignments = assignments.length;
      const submittedCount = assignments.filter(
        a => a.submissions.length > 0
      ).length;
      const pendingCount = totalAssignments - submittedCount;
      const overdueCount = assignments.filter(
        a => a.dueDate && new Date() > a.dueDate && a.submissions.length === 0
      ).length;

      // Per-child stats
      const childrenStats = family.students.map(child => {
        const childAssignments = assignments.filter(
          a => a.grade === child.grade || a.studentId === child.id
        );
        const childSubmissions = childAssignments.filter(a =>
          a.submissions.some(s => s.studentId === child.id)
        );

        return {
          childName: child.name,
          grade: child.grade,
          totalAssignments: childAssignments.length,
          submitted: childSubmissions.length,
          pending: childAssignments.length - childSubmissions.length,
          completionRate:
            childAssignments.length > 0
              ? Math.round(
                  (childSubmissions.length / childAssignments.length) * 100
                )
              : 0
        };
      });

      stats = {
        totalAssignments,
        submittedCount,
        pendingCount,
        overdueCount,
        childrenStats,
        familyCompletionRate:
          totalAssignments > 0
            ? Math.round((submittedCount / totalAssignments) * 100)
            : 0
      };
    } else if (decoded.role === 'TEACHER') {
      // Teacher stats for their assignments
      const assignments = await prisma.assignment.findMany({
        where: { teacherId: decoded.userId },
        include: {
          submissions: {
            include: {
              student: { select: { name: true, grade: true } }
            }
          }
        }
      });

      const totalAssignments = assignments.length;
      const totalSubmissions = assignments.reduce(
        (sum, a) => sum + a.submissions.length,
        0
      );
      const gradedSubmissions = assignments.reduce(
        (sum, a) =>
          sum + a.submissions.filter(s => s.status === 'GRADED').length,
        0
      );
      const pendingGrading = totalSubmissions - gradedSubmissions;

      stats = {
        totalAssignments,
        totalSubmissions,
        gradedSubmissions,
        pendingGrading,
        gradingProgress:
          totalSubmissions > 0
            ? Math.round((gradedSubmissions / totalSubmissions) * 100)
            : 0,
        recentSubmissions: assignments
          .flatMap(a =>
            a.submissions.map(s => ({
              ...s,
              assignmentTitle: a.title,
              assignmentSubject: a.subject
            }))
          )
          .sort(
            (a, b) =>
              new Date(b.submittedAt || 0).getTime() -
              new Date(a.submittedAt || 0).getTime()
          )
          .slice(0, 10)
      };
    } else if (decoded.role === 'ADMIN') {
      // Admin gets overall system stats
      const totalAssignments = await prisma.assignment.count({
        where: { isActive: true }
      });
      const totalSubmissions = await prisma.assignmentSubmission.count();
      const gradedSubmissions = await prisma.assignmentSubmission.count({
        where: { status: 'GRADED' }
      });
      const overdueAssignments = await prisma.assignment.count({
        where: {
          isActive: true,
          dueDate: { lt: new Date() },
          submissions: { none: {} }
        }
      });

      stats = {
        totalAssignments,
        totalSubmissions,
        gradedSubmissions,
        overdueAssignments,
        systemCompletionRate:
          totalAssignments > 0
            ? Math.round((totalSubmissions / totalAssignments) * 100)
            : 0,
        gradingProgress:
          totalSubmissions > 0
            ? Math.round((gradedSubmissions / totalSubmissions) * 100)
            : 0
      };
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
