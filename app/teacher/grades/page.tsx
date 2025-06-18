'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Award, BarChart3, Plus, Edit } from 'lucide-react';

interface StudentGrade {
  id: string;
  studentName: string;
  studentId: string;
  subject: string;
  assessmentType: string;
  assessmentTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  date: string;
  feedback?: string;
  isGraded: boolean;
}

interface GradingSession {
  id: string;
  title: string;
  subject: string;
  assessmentType: string;
  totalStudents: number;
  gradedStudents: number;
  dueDate: string;
  createdDate: string;
}

export default function TeacherGrades() {
  const searchParams = useSearchParams();
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [gradingSessions, setGradingSessions] = useState<GradingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grades');
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<StudentGrade | null>(null);

  useEffect(() => {
    // Handle query parameters
    const subject = searchParams.get('subject');
    const student = searchParams.get('student');
    const view = searchParams.get('view');
    const action = searchParams.get('action');

    if (subject) setFilterSubject(subject);
    if (student) setFilterStudent(student);
    if (view) setViewMode(view);
    if (action === 'grade') setShowGradeForm(true);
  }, [searchParams]);

  useEffect(() => {
    // Mock data for student grades - separate effect to avoid infinite loop
    setGrades([
      {
        id: '1',
        studentName: 'Emma Wilson',
        studentId: '1',
        subject: 'Mathematics',
        assessmentType: 'Test',
        assessmentTitle: 'Calculus Mid-term Examination',
        score: 95,
        maxScore: 100,
        percentage: 95,
        grade: 'A+',
        date: '2024-06-10',
        feedback: 'Excellent understanding of differential calculus concepts. Your problem-solving approach is methodical and accurate.',
        isGraded: true
      },
      {
        id: '2',
        studentName: 'Alex Chen',
        studentId: '2',
        subject: 'Mathematics',
        assessmentType: 'Test',
        assessmentTitle: 'Calculus Mid-term Examination',
        score: 88,
        maxScore: 100,
        percentage: 88,
        grade: 'B+',
        date: '2024-06-10',
        feedback: 'Good understanding of concepts. Work on improving calculation accuracy.',
        isGraded: true
      },
      {
        id: '3',
        studentName: 'Mike Johnson',
        studentId: '4',
        subject: 'Mathematics',
        assessmentType: 'Test',
        assessmentTitle: 'Calculus Mid-term Examination',
        score: 0,
        maxScore: 100,
        percentage: 0,
        grade: '',
        date: '2024-06-10',
        isGraded: false
      },
      {
        id: '4',
        studentName: 'Emma Wilson',
        studentId: '1',
        subject: 'Mathematics',
        assessmentType: 'Assignment',
        assessmentTitle: 'Integration Problems Set 3',
        score: 48,
        maxScore: 50,
        percentage: 96,
        grade: 'A+',
        date: '2024-06-05',
        feedback: 'Outstanding work on complex integration problems.',
        isGraded: true
      },
      {
        id: '5',
        studentName: 'Alex Chen',
        studentId: '2',
        subject: 'Mathematics',
        assessmentType: 'Assignment',
        assessmentTitle: 'Integration Problems Set 3',
        score: 0,
        maxScore: 50,
        percentage: 0,
        grade: '',
        date: '2024-06-05',
        isGraded: false
      },
      {
        id: '6',
        studentName: 'Lisa Wang',
        studentId: '5',
        subject: 'Mathematics',
        assessmentType: 'Quiz',
        assessmentTitle: 'Derivatives Quick Assessment',
        score: 18,
        maxScore: 20,
        percentage: 90,
        grade: 'A',
        date: '2024-05-28',
        feedback: 'Good grasp of derivative rules.',
        isGraded: true
      }
    ]);

    // Mock grading sessions
    setGradingSessions([
      {
        id: '1',
        title: 'Calculus Mid-term Examination',
        subject: 'Mathematics',
        assessmentType: 'Test',
        totalStudents: 8,
        gradedStudents: 6,
        dueDate: '2024-06-15',
        createdDate: '2024-06-10'
      },
      {
        id: '2',
        title: 'Integration Problems Set 3',
        subject: 'Mathematics',
        assessmentType: 'Assignment',
        totalStudents: 8,
        gradedStudents: 5,
        dueDate: '2024-06-12',
        createdDate: '2024-06-05'
      },
      {
        id: '3',
        title: 'Derivatives Quick Assessment',
        subject: 'Mathematics',
        assessmentType: 'Quiz',
        totalStudents: 8,
        gradedStudents: 8,
        dueDate: '2024-06-01',
        createdDate: '2024-05-28'
      }
    ]);

    setLoading(false);
  }, []); // Empty dependency array for initial data load

  const filteredGrades = grades.filter(grade => {
    const matchesSubject = filterSubject === 'all' || grade.subject === filterSubject;
    const matchesStudent = filterStudent === 'all' || grade.studentName === filterStudent;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'graded' && grade.isGraded) ||
      (filterStatus === 'pending' && !grade.isGraded);
    return matchesSubject && matchesStudent && matchesStatus;
  });

  const uniqueSubjects = Array.from(new Set(grades.map(g => g.subject)));
  const uniqueStudents = Array.from(new Set(grades.map(g => g.studentName)));
  
  const totalGrades = grades.length;
  const gradedCount = grades.filter(g => g.isGraded).length;
  const pendingCount = grades.filter(g => !g.isGraded).length;
  const averageScore = grades.filter(g => g.isGraded).length > 0 
    ? Math.round(grades.filter(g => g.isGraded).reduce((sum, g) => sum + g.percentage, 0) / grades.filter(g => g.isGraded).length)
    : 0;

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

  const handleGradeSubmit = (gradeData: any) => {
    if (selectedGrade) {
      // Update existing grade
      setGrades(grades.map(g => 
        g.id === selectedGrade.id 
          ? { ...g, ...gradeData, isGraded: true }
          : g
      ));
    }
    setShowGradeForm(false);
    setSelectedGrade(null);
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading grades...</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <HubHeader
          title="Grade Management System"
          subtitle="Grade student assessments, manage grading sessions, and track academic performance"
          actions={
            <>
              <HubActionButton href="/teacher/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="/teacher/assignments" icon={BarChart3} label="View Assignments" color="blue" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Grades"
            value={totalGrades}
            subtitle="All assessments"
            icon="file-text"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Graded"
            value={gradedCount}
            subtitle="Completed grading"
            icon="check-circle"
            color="green"
          />
          <ProfessionalMetricCard
            title="Pending"
            value={pendingCount}
            subtitle="Need grading"
            icon="clock"
            color="orange"
          />
          <ProfessionalMetricCard
            title="Class Average"
            value={`${averageScore}%`}
            subtitle="Overall performance"
            icon="trending-up"
            color="purple"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Grade Management</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grades')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'grades'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Individual Grades
              </button>
              <button
                onClick={() => setViewMode('sessions')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'sessions'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Grading Sessions
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'analytics'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          {/* Filters */}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="graded">Graded</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Individual Grades View */}
        {viewMode === 'grades' && (
          <div className="space-y-4">
            {filteredGrades.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Grades Found</h3>
                <p className="text-gray-600">Try adjusting your filters.</p>
              </div>
            ) : (
              filteredGrades.map((grade) => (
                <div key={grade.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{grade.assessmentTitle}</h3>
                        {grade.isGraded ? (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span><strong>Student:</strong> {grade.studentName}</span>
                        <span><strong>Subject:</strong> {grade.subject}</span>
                        <span><strong>Type:</strong> {grade.assessmentType}</span>
                        <span><strong>Date:</strong> {new Date(grade.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {grade.isGraded ? (
                        <>
                          <div className={`text-2xl font-bold ${getPercentageColor(grade.percentage)}`}>
                            {grade.percentage}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {grade.score}/{grade.maxScore}
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedGrade(grade);
                            setShowGradeForm(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit className="w-4 h-4 inline mr-2" />
                          Grade Now
                        </button>
                      )}
                    </div>
                  </div>

                  {grade.feedback && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Your Feedback</h4>
                      <p className="text-blue-800 text-sm">{grade.feedback}</p>
                    </div>
                  )}

                  {grade.isGraded && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedGrade(grade);
                          setShowGradeForm(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit Grade
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Grading Sessions View */}
        {viewMode === 'sessions' && (
          <div className="space-y-4">
            {gradingSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span><strong>Subject:</strong> {session.subject}</span>
                      <span><strong>Type:</strong> {session.assessmentType}</span>
                      <span><strong>Due:</strong> {new Date(session.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {session.gradedStudents}/{session.totalStudents}
                    </div>
                    <div className="text-sm text-gray-500">Graded</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(session.gradedStudents / session.totalStudents) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Progress: {Math.round((session.gradedStudents / session.totalStudents) * 100)}% complete
                      </div>
                    </div>
                    <button className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Continue Grading
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Grade Distribution</h4>
                <div className="space-y-2">
                  {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'].map(gradeLevel => {
                    const count = grades.filter(g => g.grade === gradeLevel).length;
                    const percentage = grades.length > 0 ? (count / grades.length) * 100 : 0;
                    return (
                      <div key={gradeLevel} className="flex items-center space-x-3">
                        <span className="w-8 text-sm font-medium">{gradeLevel}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Assessment Performance</h4>
                <div className="space-y-3">
                  {Array.from(new Set(grades.map(g => g.assessmentTitle))).map(title => {
                    const assessmentGrades = grades.filter(g => g.assessmentTitle === title && g.isGraded);
                    const avgScore = assessmentGrades.length > 0
                      ? Math.round(assessmentGrades.reduce((sum, g) => sum + g.percentage, 0) / assessmentGrades.length)
                      : 0;
                    return (
                      <div key={title} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{title}</div>
                        <div className="text-sm text-gray-600">Average: {avgScore}%</div>
                        <div className="text-xs text-gray-500">{assessmentGrades.length} students graded</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grade Form Modal */}
        {showGradeForm && selectedGrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Grade: {selectedGrade.assessmentTitle} - {selectedGrade.studentName}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                    <input
                      type="number"
                      min="0"
                      max={selectedGrade.maxScore}
                      defaultValue={selectedGrade.score}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Score</label>
                    <input
                      type="number"
                      value={selectedGrade.maxScore}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Letter Grade</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                  <textarea
                    rows={3}
                    placeholder="Enter feedback for the student..."
                    defaultValue={selectedGrade.feedback}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowGradeForm(false);
                    setSelectedGrade(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGradeSubmit({})}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Grade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
