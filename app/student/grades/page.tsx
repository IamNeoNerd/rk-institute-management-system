'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StudentLayout from '@/components/layout/StudentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, BarChart3, TrendingUp, Award } from 'lucide-react';

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
  teacher: string;
  feedback?: string;
}

export default function StudentGrades() {
  const searchParams = useSearchParams();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // Handle query parameters
    const subject = searchParams.get('subject');
    const type = searchParams.get('type');

    if (subject) {
      setFilterSubject(subject);
    }
    if (type) {
      setFilterType(type);
    }
  }, [searchParams]);

  useEffect(() => {
    // Mock data for student grades - separate effect to avoid infinite loop
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
        teacher: 'Prof. Michael Chen',
        feedback: 'Outstanding research and presentation skills demonstrated.'
      },
      {
        id: '3',
        subject: 'English Literature',
        assessmentType: 'Essay',
        title: 'Contemporary Literature Analysis',
        score: 42,
        maxScore: 45,
        percentage: 93,
        grade: 'A',
        date: '2024-06-05',
        teacher: 'System Administrator',
        feedback: 'Sophisticated analysis with excellent writing quality.'
      },
      {
        id: '4',
        subject: 'Mathematics',
        assessmentType: 'Quiz',
        title: 'Integration Techniques',
        score: 18,
        maxScore: 20,
        percentage: 90,
        grade: 'A',
        date: '2024-05-28',
        teacher: 'Dr. Sarah Johnson'
      },
      {
        id: '5',
        subject: 'Physics',
        assessmentType: 'Lab Report',
        title: 'Thermodynamics Experiment',
        score: 44,
        maxScore: 50,
        percentage: 88,
        grade: 'B+',
        date: '2024-05-25',
        teacher: 'Prof. Michael Chen',
        feedback: 'Good experimental technique, minor improvements needed in data analysis.'
      }
    ]);

    setLoading(false);
  }, []); // Empty dependency array for initial data load

  const filteredGrades = grades.filter(grade => {
    const matchesSubject = filterSubject === 'all' || grade.subject === filterSubject;
    const matchesType = filterType === 'all' || grade.assessmentType === filterType;
    return matchesSubject && matchesType;
  });

  const uniqueSubjects = Array.from(new Set(grades.map(g => g.subject)));
  const uniqueTypes = Array.from(new Set(grades.map(g => g.assessmentType)));

  const averagePercentage = grades.length > 0
    ? Math.round(grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length)
    : 0;

  const highestGrade = grades.length > 0
    ? Math.max(...grades.map(g => g.percentage))
    : 0;

  const aGradesCount = grades.filter(g => g.grade.startsWith('A')).length;

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
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading grades...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Grades & Performance"
          subtitle="View your academic performance, test scores, and progress tracking"
          actions={
            <>
              <HubActionButton href="/student/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="/student/reports" icon={BarChart3} label="Performance Report" color="blue" />
            </>
          }
        />

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Overall Average"
            value={`${averagePercentage}%`}
            subtitle="Across all subjects"
            icon="trending-up"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Highest Score"
            value={`${highestGrade}%`}
            subtitle="Best performance"
            icon="award"
            color="green"
          />
          <ProfessionalMetricCard
            title="A Grades"
            value={aGradesCount}
            subtitle="Excellent performance"
            icon="check-circle"
            color="green"
          />
          <ProfessionalMetricCard
            title="Total Assessments"
            value={grades.length}
            subtitle="This semester"
            icon="file-text"
            color="purple"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Grades List */}
        <div className="space-y-4">
          {filteredGrades.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Grades Found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for updates.</p>
            </div>
          ) : (
            filteredGrades.map((grade) => (
              <div key={grade.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{grade.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
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
      </div>
    </StudentLayout>
  );
}