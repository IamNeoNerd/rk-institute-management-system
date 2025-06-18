'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Award, TrendingUp } from 'lucide-react';

interface AcademicLog {
  id: string;
  title: string;
  content: string;
  logType: 'ACHIEVEMENT' | 'PROGRESS' | 'CONCERN';
  subject: string;
  isPrivate: boolean;
  createdAt: string;
  teacher: {
    name: string;
  };
}

export default function StudentAcademicLogs() {
  const [academicLogs, setAcademicLogs] = useState<AcademicLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    // Mock data for student's academic logs
    setAcademicLogs([
      {
        id: '1',
        title: 'Outstanding Performance in Advanced Mathematics',
        content: 'Emma has consistently scored above 95% in all calculus assessments and shows exceptional problem-solving skills. Her understanding of complex mathematical concepts is remarkable for her grade level.',
        logType: 'ACHIEVEMENT',
        subject: 'Mathematics',
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
        isPrivate: false,
        createdAt: '2024-06-05T09:15:00Z',
        teacher: { name: 'Dr. Sarah Johnson' },
      },
      {
        id: '4',
        title: 'Creative Writing Excellence',
        content: 'Emma\'s latest essay on contemporary literature shows sophisticated analysis and excellent writing skills. Her ability to connect themes across different works is impressive.',
        logType: 'ACHIEVEMENT',
        subject: 'English Literature',
        isPrivate: false,
        createdAt: '2024-05-28T11:45:00Z',
        teacher: { name: 'System Administrator' },
      },
      {
        id: '5',
        title: 'Physics Lab Performance',
        content: 'Emma demonstrates strong practical skills in physics laboratory sessions. Her experimental technique and data analysis are consistently accurate.',
        logType: 'PROGRESS',
        subject: 'Physics',
        isPrivate: false,
        createdAt: '2024-05-20T16:30:00Z',
        teacher: { name: 'Prof. Michael Chen' },
      },
    ]);

    setLoading(false);
  }, []);

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

  const filteredLogs = academicLogs.filter(log => {
    const matchesType = filterType === 'all' || log.logType === filterType;
    const matchesSubject = filterSubject === 'all' || log.subject === filterSubject;
    return matchesType && matchesSubject && !log.isPrivate; // Only show non-private logs to students
  });

  const uniqueSubjects = Array.from(new Set(academicLogs.map(log => log.subject)));
  const achievementCount = academicLogs.filter(log => log.logType === 'ACHIEVEMENT').length;
  const progressCount = academicLogs.filter(log => log.logType === 'PROGRESS').length;

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading academic logs...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Academic Progress"
          subtitle="Track your academic achievements and progress reports"
          actions={
            <>
              <HubActionButton href="/student/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="/student/reports" icon={TrendingUp} label="View Reports" color="blue" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProfessionalMetricCard
            title="Total Achievements"
            value={achievementCount}
            subtitle="This academic year"
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
            title="Subjects Tracked"
            value={uniqueSubjects.length}
            subtitle="Active monitoring"
            icon="file-text"
            color="purple"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Subject
              </label>
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
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}