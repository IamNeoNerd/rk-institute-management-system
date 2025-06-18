'use client';

import { useState, useEffect } from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Plus, CheckCircle, Clock } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  assignmentType: string;
  priority: string;
  dueDate: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
  submissions: {
    id: string;
    studentName: string;
    status: string;
    submittedAt: string | null;
    grade: string | null;
    feedback: string | null;
  }[];
  totalStudents: number;
}

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Mock data for teacher's assignments
    setAssignments([
      {
        id: '1',
        title: 'Calculus Integration Problems',
        description: 'Complete the integration problems from Chapter 5. Show all work and include graphs where applicable.',
        subject: 'Mathematics',
        assignmentType: 'HOMEWORK',
        priority: 'MEDIUM',
        dueDate: '2024-06-20T23:59:00Z',
        attachmentUrl: '/assignments/calculus-problems.pdf',
        attachmentName: 'calculus-problems.pdf',
        createdAt: '2024-06-15T10:00:00Z',
        submissions: [
          {
            id: '1',
            studentName: 'Emma Wilson',
            status: 'SUBMITTED',
            submittedAt: '2024-06-18T14:30:00Z',
            grade: 'A',
            feedback: 'Excellent work! All solutions are correct and well-explained.'
          },
          {
            id: '2',
            studentName: 'Alex Chen',
            status: 'SUBMITTED',
            submittedAt: '2024-06-19T09:15:00Z',
            grade: null,
            feedback: null
          },
          {
            id: '3',
            studentName: 'Mike Johnson',
            status: 'PENDING',
            submittedAt: null,
            grade: null,
            feedback: null
          }
        ],
        totalStudents: 8
      },
      {
        id: '2',
        title: 'Thermodynamics Lab Report',
        description: 'Write a comprehensive lab report on the thermodynamics experiment conducted last week. Include data analysis and conclusions.',
        subject: 'Physics',
        assignmentType: 'PROJECT',
        priority: 'HIGH',
        dueDate: '2024-06-22T23:59:00Z',
        attachmentUrl: '/assignments/lab-report-template.docx',
        attachmentName: 'lab-report-template.docx',
        createdAt: '2024-06-12T11:00:00Z',
        submissions: [
          {
            id: '4',
            studentName: 'Emma Wilson',
            status: 'SUBMITTED',
            submittedAt: '2024-06-20T16:45:00Z',
            grade: 'A+',
            feedback: 'Outstanding analysis and presentation of data.'
          },
          {
            id: '5',
            studentName: 'Alex Chen',
            status: 'PENDING',
            submittedAt: null,
            grade: null,
            feedback: null
          }
        ],
        totalStudents: 6
      },
      {
        id: '3',
        title: 'Contemporary Literature Essay',
        description: 'Write a 1500-word essay analyzing the themes in modern literature. Choose from the provided list of books.',
        subject: 'English Literature',
        assignmentType: 'ESSAY',
        priority: 'MEDIUM',
        dueDate: '2024-06-25T23:59:00Z',
        attachmentUrl: null,
        attachmentName: null,
        createdAt: '2024-06-10T09:30:00Z',
        submissions: [
          {
            id: '6',
            studentName: 'Lisa Wang',
            status: 'SUBMITTED',
            submittedAt: '2024-06-23T12:00:00Z',
            grade: 'A',
            feedback: 'Excellent analysis with sophisticated writing.'
          },
          {
            id: '7',
            studentName: 'Sarah Kim',
            status: 'PENDING',
            submittedAt: null,
            grade: null,
            feedback: null
          }
        ],
        totalStudents: 10
      }
    ]);

    setLoading(false);
  }, []);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSubject = filterSubject === 'all' || assignment.subject === filterSubject;
    const matchesType = filterType === 'all' || assignment.assignmentType === filterType;

    let matchesStatus = true;
    if (filterStatus === 'pending-grading') {
      matchesStatus = assignment.submissions.some(sub => sub.status === 'SUBMITTED' && !sub.grade);
    } else if (filterStatus === 'overdue') {
      matchesStatus = Boolean(assignment.dueDate && new Date() > new Date(assignment.dueDate));
    } else if (filterStatus === 'active') {
      matchesStatus = Boolean(!assignment.dueDate || new Date() <= new Date(assignment.dueDate));
    }

    return matchesSubject && matchesType && matchesStatus;
  });

  const totalAssignments = assignments.length;
  const totalSubmissions = assignments.reduce((sum, assignment) =>
    sum + assignment.submissions.filter(sub => sub.status === 'SUBMITTED').length, 0
  );
  const pendingGrading = assignments.reduce((sum, assignment) =>
    sum + assignment.submissions.filter(sub => sub.status === 'SUBMITTED' && !sub.grade).length, 0
  );
  const totalStudents = assignments.reduce((sum, assignment) => sum + assignment.totalStudents, 0);

  const uniqueSubjects = Array.from(new Set(assignments.map(a => a.subject)));
  const uniqueTypes = Array.from(new Set(assignments.map(a => a.assignmentType)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'GRADED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HOMEWORK':
        return '📝';
      case 'PROJECT':
        return '🎯';
      case 'QUIZ':
        return '❓';
      case 'EXAM':
        return '📊';
      case 'ESSAY':
        return '📄';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading assignments...</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <HubHeader
          title="Assignments & Homework"
          subtitle="Create, manage, and grade assignments for your students"
          actions={
            <>
              <HubActionButton href="/teacher/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton
                href="#"
                icon={Plus}
                label="Create Assignment"
                color="blue"
                onClick={() => setShowCreateForm(true)}
              />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Assignments"
            value={totalAssignments}
            subtitle="Created assignments"
            icon="file-text"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Total Submissions"
            value={totalSubmissions}
            subtitle="Student submissions"
            icon="check-circle"
            color="green"
          />
          <ProfessionalMetricCard
            title="Pending Grading"
            value={pendingGrading}
            subtitle="Need your review"
            icon="clock"
            color="orange"
          />
          <ProfessionalMetricCard
            title="Total Students"
            value={totalStudents}
            subtitle="Across all assignments"
            icon="users"
            color="purple"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Subjects</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Assignments</option>
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
                <option value="pending-grading">Pending Grading</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new assignment.</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(assignment.assignmentType)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span><strong>Subject:</strong> {assignment.subject}</span>
                      <span><strong>Type:</strong> {assignment.assignmentType}</span>
                      {assignment.dueDate && (
                        <span><strong>Due:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{assignment.description}</p>
                  </div>
                  <div className="ml-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Grade
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submission Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {assignment.submissions.filter(sub => sub.status === 'SUBMITTED').length}/{assignment.totalStudents}
                    </div>
                    <div className="text-xs text-gray-500">Submissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {assignment.submissions.filter(sub => sub.grade).length}
                    </div>
                    <div className="text-xs text-gray-500">Graded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {assignment.submissions.filter(sub => sub.status === 'SUBMITTED' && !sub.grade).length}
                    </div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {assignment.totalStudents - assignment.submissions.filter(sub => sub.status === 'SUBMITTED').length}
                    </div>
                    <div className="text-xs text-gray-500">Not Submitted</div>
                  </div>
                </div>

                {/* Recent Submissions */}
                {assignment.submissions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Recent Submissions:</h4>
                    <div className="space-y-2">
                      {assignment.submissions.slice(0, 3).map((submission) => (
                        <div key={submission.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{submission.studentName}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                              {submission.status}
                            </span>
                            {submission.grade && (
                              <span className="text-green-600 font-medium">{submission.grade}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}