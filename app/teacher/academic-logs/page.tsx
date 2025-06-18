'use client';

import { useState, useEffect } from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Plus, Filter, Award } from 'lucide-react';

interface AcademicLog {
  id: string;
  title: string;
  content: string;
  logType: 'ACHIEVEMENT' | 'PROGRESS' | 'CONCERN';
  subject: string;
  studentName: string;
  studentId: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TeacherAcademicLogs() {
  const [academicLogs, setAcademicLogs] = useState<AcademicLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Mock data for teacher's academic logs
    setAcademicLogs([
      {
        id: '1',
        title: 'Outstanding Performance in Advanced Mathematics',
        content: 'Emma has consistently scored above 95% in all calculus assessments and shows exceptional problem-solving skills. Her understanding of complex mathematical concepts is remarkable for her grade level.',
        logType: 'ACHIEVEMENT',
        subject: 'Mathematics',
        studentName: 'Emma Wilson',
        studentId: '1',
        isPrivate: false,
        createdAt: '2024-06-15T10:30:00Z',
        updatedAt: '2024-06-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Excellent Research Project on Renewable Energy',
        content: 'Emma submitted an outstanding research project on solar energy efficiency that exceeded grade-level expectations. The project demonstrated thorough research, critical thinking, and innovative solutions.',
        logType: 'ACHIEVEMENT',
        subject: 'Physics',
        studentName: 'Emma Wilson',
        studentId: '1',
        isPrivate: false,
        createdAt: '2024-06-10T14:20:00Z',
        updatedAt: '2024-06-10T14:20:00Z'
      },
      {
        id: '3',
        title: 'Regular Progress Update - Mathematics',
        content: 'Emma continues to excel in advanced mathematics. She has mastered differential calculus and is ready to move on to integral calculus. Her homework completion rate is 100%.',
        logType: 'PROGRESS',
        subject: 'Mathematics',
        studentName: 'Emma Wilson',
        studentId: '1',
        isPrivate: false,
        createdAt: '2024-06-05T09:15:00Z',
        updatedAt: '2024-06-05T09:15:00Z'
      },
      {
        id: '4',
        title: 'Needs Additional Support in Physics',
        content: 'Alex is struggling with thermodynamics concepts. Recommend additional practice problems and one-on-one tutoring sessions to improve understanding.',
        logType: 'CONCERN',
        subject: 'Physics',
        studentName: 'Alex Chen',
        studentId: '2',
        isPrivate: true,
        createdAt: '2024-06-08T16:45:00Z',
        updatedAt: '2024-06-08T16:45:00Z'
      },
      {
        id: '5',
        title: 'Improvement in Mathematics Performance',
        content: 'Mike has shown significant improvement in his mathematics performance over the past month. His test scores have increased from 70% to 85%.',
        logType: 'PROGRESS',
        subject: 'Mathematics',
        studentName: 'Mike Johnson',
        studentId: '4',
        isPrivate: false,
        createdAt: '2024-06-12T11:30:00Z',
        updatedAt: '2024-06-12T11:30:00Z'
      },
      {
        id: '6',
        title: 'Creative Writing Excellence',
        content: 'Lisa\'s latest essay on contemporary literature shows sophisticated analysis and excellent writing skills. Her ability to connect themes across different works is impressive.',
        logType: 'ACHIEVEMENT',
        subject: 'English Literature',
        studentName: 'Lisa Wang',
        studentId: '5',
        isPrivate: false,
        createdAt: '2024-05-28T11:45:00Z',
        updatedAt: '2024-05-28T11:45:00Z'
      }
    ]);

    setLoading(false);
  }, []);

  const filteredLogs = academicLogs.filter(log => {
    const matchesType = filterType === 'all' || log.logType === filterType;
    const matchesSubject = filterSubject === 'all' || log.subject === filterSubject;
    const matchesStudent = filterStudent === 'all' || log.studentName === filterStudent;
    return matchesType && matchesSubject && matchesStudent;
  });

  const uniqueSubjects = Array.from(new Set(academicLogs.map(log => log.subject)));
  const uniqueStudents = Array.from(new Set(academicLogs.map(log => log.studentName)));

  const achievementCount = academicLogs.filter(log => log.logType === 'ACHIEVEMENT').length;
  const progressCount = academicLogs.filter(log => log.logType === 'PROGRESS').length;
  const concernCount = academicLogs.filter(log => log.logType === 'CONCERN').length;
  const privateCount = academicLogs.filter(log => log.isPrivate).length;

  const getLogTypeIcon = (logType: string) => {
    switch (logType) {
      case 'ACHIEVEMENT':
        return '🏆';
      case 'CONCERN':
        return '⚠️';
      default:
        return '📊';
    }
  };

  const getLogTypeColor = (logType: string) => {
    switch (logType) {
      case 'ACHIEVEMENT':
        return 'bg-green-100 text-green-800';
      case 'CONCERN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading academic logs...</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <HubHeader
          title="Academic Logs"
          subtitle="Create and manage academic progress logs for your students"
          actions={
            <>
              <HubActionButton href="/teacher/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton
                href="#"
                icon={Plus}
                label="Create Log"
                color="blue"
                onClick={() => setShowCreateForm(true)}
              />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Logs"
            value={academicLogs.length}
            subtitle="All academic logs"
            icon="file-text"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Achievements"
            value={achievementCount}
            subtitle="Student achievements"
            icon="award"
            color="green"
          />
          <ProfessionalMetricCard
            title="Progress Reports"
            value={progressCount}
            subtitle="Progress updates"
            icon="trending-up"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Concerns"
            value={concernCount}
            subtitle="Areas needing attention"
            icon="alert-triangle"
            color="red"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="ACHIEVEMENT">Achievements</option>
                <option value="PROGRESS">Progress Reports</option>
                <option value="CONCERN">Concerns</option>
              </select>
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Student</label>
              <select
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Students</option>
                {uniqueStudents.map(student => (
                  <option key={student} value={student}>{student}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Academic Logs List */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Academic Logs Found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new academic log.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getLogTypeIcon(log.logType)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{log.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLogTypeColor(log.logType)}`}>
                        {log.logType}
                      </span>
                      {log.isPrivate && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          🔒 Private
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span><strong>Student:</strong> {log.studentName}</span>
                      <span><strong>Subject:</strong> {log.subject}</span>
                      <span><strong>Created:</strong> {new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{log.content}</p>
                </div>

                <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                  <span>Last updated: {new Date(log.updatedAt).toLocaleDateString()}</span>
                  <span>
                    Visibility: {log.isPrivate ? 'Private (Teachers only)' : 'Public (Students & Parents can view)'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Log Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Academic Log</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select a student...</option>
                    {uniqueStudents.map(student => (
                      <option key={student} value={student}>{student}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select a subject...</option>
                    {uniqueSubjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Log Type</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select log type...</option>
                    <option value="ACHIEVEMENT">Achievement</option>
                    <option value="PROGRESS">Progress Report</option>
                    <option value="CONCERN">Concern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Enter log title..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed log content..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                    Make this log private (only visible to teachers)
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Log
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}