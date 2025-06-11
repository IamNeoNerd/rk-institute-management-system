import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAssignments() {
  try {
    console.log('🌱 Seeding assignments...');

    // Get existing teachers and students
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' }
    });

    const students = await prisma.student.findMany({
      include: { family: true }
    });

    if (teachers.length === 0) {
      console.log('❌ No teachers found. Please seed users first.');
      return;
    }

    if (students.length === 0) {
      console.log('❌ No students found. Please seed students first.');
      return;
    }

    const teacher = teachers[0]; // Use first teacher for demo

    // Sample assignments data
    const assignmentsData = [
      {
        title: 'Mathematics Chapter 5 - Quadratic Equations',
        description:
          'Complete exercises 1-15 from Chapter 5. Show all working steps and verify your answers. Focus on factoring methods and the quadratic formula.',
        subject: 'Mathematics',
        assignmentType: 'HOMEWORK',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        grade: 'Grade 11',
        teacherId: teacher.id
      },
      {
        title: 'Physics Lab Report - Pendulum Experiment',
        description:
          'Write a comprehensive lab report on the simple pendulum experiment conducted in class. Include hypothesis, methodology, observations, calculations, and conclusions.',
        subject: 'Physics',
        assignmentType: 'PROJECT',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        grade: 'Grade 11',
        teacherId: teacher.id
      },
      {
        title: 'English Literature Essay - Character Analysis',
        description:
          'Write a 1000-word essay analyzing the character development of the protagonist in the novel we are currently reading. Use specific examples and quotes to support your arguments.',
        subject: 'English',
        assignmentType: 'PROJECT',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        grade: 'Grade 11',
        teacherId: teacher.id
      },
      {
        title: 'Chemistry Quiz Preparation Notes',
        description:
          "Prepare comprehensive notes on Organic Chemistry basics including nomenclature, functional groups, and basic reactions. This will help you prepare for next week's quiz.",
        subject: 'Chemistry',
        assignmentType: 'NOTE',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        grade: 'Grade 11',
        teacherId: teacher.id
      },
      {
        title: 'History Research Project - World War II',
        description:
          'Research and prepare a presentation on a specific aspect of World War II. Choose from: Pacific Theater, European Theater, Home Front, or Technology & Warfare.',
        subject: 'History',
        assignmentType: 'PROJECT',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        grade: 'Grade 11',
        teacherId: teacher.id
      },
      {
        title: 'Biology Worksheet - Cell Division',
        description:
          'Complete the worksheet on mitosis and meiosis. Draw and label the different phases and explain the significance of each process.',
        subject: 'Biology',
        assignmentType: 'HOMEWORK',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        grade: 'Grade 11',
        teacherId: teacher.id
      },
      // Grade 9 assignments
      {
        title: 'Basic Algebra Practice',
        description:
          'Complete practice problems on solving linear equations and inequalities. Show all steps clearly.',
        subject: 'Mathematics',
        assignmentType: 'HOMEWORK',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        grade: 'Grade 9',
        teacherId: teacher.id
      },
      {
        title: 'Science Fair Project Proposal',
        description:
          'Submit your science fair project proposal including hypothesis, materials needed, and expected outcomes.',
        subject: 'Science',
        assignmentType: 'PROJECT',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        grade: 'Grade 9',
        teacherId: teacher.id
      },
      // Student-specific assignment
      {
        title: 'Extra Credit - Advanced Mathematics Problems',
        description:
          'Additional challenging problems for students who want to explore advanced concepts. This is optional extra credit work.',
        subject: 'Mathematics',
        assignmentType: 'HOMEWORK',
        priority: 'LOW',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        studentId: students[0]?.id, // Assign to first student
        teacherId: teacher.id
      }
    ];

    // Create assignments
    const createdAssignments = [];
    for (const assignmentData of assignmentsData) {
      const assignment = await prisma.assignment.create({
        data: assignmentData,
        include: {
          teacher: { select: { name: true } },
          student: { select: { name: true, grade: true } }
        }
      });
      createdAssignments.push(assignment);
      console.log(`✅ Created assignment: ${assignment.title}`);
    }

    // Create some sample submissions
    const grade11Students = students.filter(s => s.grade === 'Grade 11');
    const grade9Students = students.filter(s => s.grade === 'Grade 9');

    if (grade11Students.length > 0) {
      // Submit some assignments for Grade 11 students
      const mathAssignment = createdAssignments.find(a =>
        a.title.includes('Mathematics Chapter 5')
      );
      const biologyAssignment = createdAssignments.find(a =>
        a.title.includes('Biology Worksheet')
      );

      if (mathAssignment) {
        await prisma.assignmentSubmission.create({
          data: {
            assignmentId: mathAssignment.id,
            studentId: grade11Students[0].id,
            content:
              'I have completed all 15 exercises from Chapter 5. Here are my solutions with detailed working steps for each problem...',
            status: 'SUBMITTED',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          }
        });
        console.log(`✅ Created submission for: ${mathAssignment.title}`);
      }

      if (biologyAssignment && grade11Students.length > 1) {
        await prisma.assignmentSubmission.create({
          data: {
            assignmentId: biologyAssignment.id,
            studentId: grade11Students[1].id,
            content:
              'Completed the cell division worksheet. I have drawn and labeled all phases of mitosis and meiosis with explanations.',
            status: 'SUBMITTED',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            grade: 'A-',
            feedback:
              'Excellent work! Your diagrams are clear and accurate. Good understanding of the processes.',
            gradedAt: new Date(),
            gradedBy: teacher.id
          }
        });
        console.log(
          `✅ Created graded submission for: ${biologyAssignment.title}`
        );
      }
    }

    if (grade9Students.length > 0) {
      // Submit assignment for Grade 9 student
      const algebraAssignment = createdAssignments.find(a =>
        a.title.includes('Basic Algebra')
      );

      if (algebraAssignment) {
        await prisma.assignmentSubmission.create({
          data: {
            assignmentId: algebraAssignment.id,
            studentId: grade9Students[0].id,
            content:
              'I have solved all the linear equations and inequalities. Here are my step-by-step solutions...',
            status: 'LATE',
            submittedAt: new Date() // Just submitted (after due date)
          }
        });
        console.log(
          `✅ Created late submission for: ${algebraAssignment.title}`
        );
      }
    }

    console.log(
      `🎉 Successfully seeded ${createdAssignments.length} assignments with sample submissions!`
    );
  } catch (error) {
    console.error('❌ Error seeding assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAssignments();
