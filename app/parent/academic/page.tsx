'use client';

import { useState, useEffect } from 'react';
import ParentLayout from '@/components/layout/ParentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Award, TrendingUp, MessageSquare } from 'lucide-react';

interface AcademicLog {
  id: string;
  title: string;
  content: string;
  logType: 'ACHIEVEMENT' | 'PROGRESS' | 'CONCERN';
  subject: string;
  childName: string;
  childId: string;
  isPrivate: boolean;
  createdAt: string;
  teacher: {
    name: string;
  };
}

interface Grade {
  id: string;
  subject: string;
  assessmentType: string;
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  date: string;
  childName: string;
  childId: string;
  teacher: string;
  feedback?: string;
}

export default function ParentAcademic() {
  const [academicLogs, setAcademicLogs] = useState<AcademicLog[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('logs');

  useEffect(() => {
    // Mock data for academic logs
    setAcademicLogs([
      {
        id: '1',
        title: 'Outstanding Performance in Advanced Mathematics',
        content: 'Emma has consistently scored above 95% in all calculus assessments and shows exceptional problem-solving skills. Her understanding of complex mathematical concepts is remarkable for her grade level.',
        logType: 'ACHIEVEMENT',
        subject: 'Mathematics',
        childName: 'Emma Wilson',
        childId: '1',
        isPrivate: false,
        createdAt: '2024-06-15T10:30:00Z',
        teacher: { name: 'Dr. Sarah Johnson' },
      },
      {
        id: '2',
        title: 'Excellent Research Project on Renewable Energy',
        content: 'Emma submitted an outstanding research project on solar energy efficiency that exceeded grade-level expectations. The project demonstrated thorough research, critical thinking, and innovative solutions.',
        logType: 'ACHIEVEMENT',
        subject: 'Physics',
        childName: 'Emma Wilson',
        childId: '1',
        isPrivate: false,
        createdAt: '2024-06-10T14:20:00Z',
        teacher: { name: 'Prof. Michael Chen' },
      },
      {
        id: '3',
        title: 'Regular Progress Update - Mathematics',
        content: 'Emma continues to excel in advanced mathematics. She has mastered differential calculus and is ready to move on to integral calculus. Her homework completion rate is 100%.',
        logType: 'PROGRESS',
        subject: 'Mathematics',
        childName: 'Emma Wilson',
        childId: '1',
        isPrivate: false,
        createdAt: '2024-06-05T09:15:00Z',
        teacher: { name: 'Dr. Sarah Johnson' },
      },
      {
        id: '4',
        title: 'Improvement in Science Performance',
        content: 'Alex has shown significant improvement in his science performance over the past month. His test scores have increased from 75% to 88%.',
        logType: 'PROGRESS',
        subject: 'Science',
        childName: 'Alex Wilson',
        childId: '2',
        isPrivate: false,
        createdAt: '2024-06-12T11:30:00Z',
        teacher: { name: 'Dr. Robert Brown' },
      },
      {
        id: '5',
        title: 'Creative Writing Excellence',
        content: 'Alex\'s latest essay on environmental conservation shows sophisticated analysis and excellent writing skills. His ability to express complex ideas clearly is impressive.',
        logType: 'ACHIEVEMENT',
        subject: 'English',
        childName: 'Alex Wilson',
        childId: '2',
        isPrivate: false,
        createdAt: '2024-05-28T11:45:00Z',
        teacher: { name: 'Ms. Lisa Davis' },
      }
    ]);

    // Mock data for grades
    setGrades([
      {
        id: '1',
        subject: 'Mathematics',
        assessmentType: 'Test',
        title: 'Calculus Mid-term',
        score: 95,
        maxScore: 100,
        percentage: 95,
        grade: 'A+',
        date: '2024-06-10',
        childName: 'Emma Wilson',
        childId: '1',
        teacher: 'Dr. Sarah Johnson',
        feedback: 'Excellent understanding of differential calculus concepts.'
      },
      {
        id: '2',
        subject: 'Physics',
        assessmentType: 'Assignment',
        title: 'Renewable Energy Research',
        score: 48,
        maxScore: 50,
        percentage: 96,
        grade: 'A+',
        date: '2024-06-08',
        childName: 'Emma Wilson',
        childId: '1',
        teacher: 'Prof. Michael Chen',
        feedback: 'Outstanding research and presentation skills demonstrated.'
      },
      {
        id: '3',
        subject: 'Science',
        assessmentType: 'Test',
        title: 'Environmental Science Quiz',
        score: 44,
        maxScore: 50,
        percentage: 88,
        grade: 'B+',
        date: '2024-06-05',
        childName: 'Alex Wilson',
        childId: '2',
        teacher: 'Dr. Robert Brown',
        feedback: 'Good improvement in understanding scientific concepts.'
      },
      {
        id: '4',
        subject: 'English',
        assessmentType: 'Essay',
        title: 'Environmental Conservation Essay',
        score: 42,
        maxScore: 45,
        percentage: 93,
        grade: 'A',
        date: '2024-05-28',
        childName: 'Alex Wilson',
        childId: '2',
        teacher: 'Ms. Lisa Davis',
        feedback: 'Excellent writing skills and clear expression of ideas.'
      }
    ]);

    setLoading(false);
  }, []);

  const filteredLogs = academicLogs.filter(log => {
    const matchesChild = selectedChild === 'all' || log.childId === selectedChild;
    const matchesType = filterType === 'all' || log.logType === filterType;
    return matchesChild && matchesType && !log.isPrivate; // Only show non-private logs to parents
  });

  const filteredGrades = grades.filter(grade => {
    return selectedChild === 'all' || grade.childId === selectedChild;
  });

  const uniqueChildren = Array.from(new Set(academicLogs.map(log => ({ id: log.childId, name: log.childName }))));
  const achievementCount = academicLogs.filter(log => log.logType === 'ACHIEVEMENT').length;
  const progressCount = academicLogs.filter(log => log.logType === 'PROGRESS').length;
  const concernCount = academicLogs.filter(log => log.logType === 'CONCERN').length;
  const averageGrade = grades.length > 0
    ? Math.round(grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length)
    : 0;

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

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100';
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading academic information...</div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Academic Progress"
          subtitle="Monitor your children's academic achievements, progress reports, and grades"
          actions={
            <>
              <HubActionButton href="/parent/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="/parent/messages?action=compose" icon={MessageSquare} label="Message Teachers" color="blue" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Achievements"
            value={achievementCount}
            subtitle="Across all children"
            icon="award"
            color="green"
          />
          <ProfessionalMetricCard
            title="Progress Reports"
            value={progressCount}
            subtitle="Regular updates"
            icon="trending-up"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Average Grade"
            value={`${averageGrade}%`}
            subtitle="Overall performance"
            icon="check-circle"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Total Assessments"
            value={grades.length}
            subtitle="This semester"
            icon="file-text"
            color="orange"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Academic Logs
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'grades'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Grades & Assessments
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Child</label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Children</option>
                {uniqueChildren.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>
            {activeTab === 'logs' && (
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
                  <option value="CONCERN">Areas of Concern</option>
                </select>
              </div>
            )}
          </div>

          {/* Academic Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Academic Logs Found</h3>
                  <p className="text-gray-600">Try adjusting your filters.</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getLogTypeIcon(log.logType)}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{log.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLogTypeColor(log.logType)}`}>
                            {log.logType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span><strong>Child:</strong> {log.childName}</span>
                          <span><strong>Subject:</strong> {log.subject}</span>
                          <span><strong>Teacher:</strong> {log.teacher.name}</span>
                          <span><strong>Date:</strong> {new Date(log.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{log.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Grades Tab */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              {filteredGrades.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Grades Found</h3>
                  <p className="text-gray-600">Try adjusting your filters.</p>
                </div>
              ) : (
                filteredGrades.map((grade) => (
                  <div key={grade.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{grade.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span><strong>Child:</strong> {grade.childName}</span>
                          <span><strong>Subject:</strong> {grade.subject}</span>
                          <span><strong>Type:</strong> {grade.assessmentType}</span>
                          <span><strong>Teacher:</strong> {grade.teacher}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getPercentageColor(grade.percentage)}`}>
                          {grade.percentage}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {grade.score}/{grade.maxScore}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(grade.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {grade.feedback && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Teacher Feedback</h4>
                        <p className="text-blue-800 text-sm">{grade.feedback}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </ParentLayout>
  );
}