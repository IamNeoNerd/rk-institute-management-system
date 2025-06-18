'use client';

import { useState, useEffect } from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Users, Plus, MessageSquare } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  enrolledCourses: string[];
  lastActivity: string;
  performance: {
    averageGrade: number;
    assignmentsCompleted: number;
    totalAssignments: number;
    attendanceRate: number;
  };
  parent: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data for teacher's students
    setStudents([
      {
        id: '1',
        name: 'Emma Wilson',
        email: 'emma.wilson@student.rkinstitute.com',
        grade: 'Grade 11',
        enrolledCourses: ['Advanced Mathematics', 'Physics', 'English Literature'],
        lastActivity: '2024-06-16T10:30:00Z',
        performance: {
          averageGrade: 95,
          assignmentsCompleted: 18,
          totalAssignments: 20,
          attendanceRate: 98
        },
        parent: {
          name: 'Sarah Wilson',
          email: 'sarah.wilson@parent.rkinstitute.com',
          phone: '+1-555-0123'
        }
      },
      {
        id: '2',
        name: 'Alex Chen',
        email: 'alex.chen@student.rkinstitute.com',
        grade: 'Grade 12',
        enrolledCourses: ['Advanced Mathematics', 'Physics'],
        lastActivity: '2024-06-16T09:15:00Z',
        performance: {
          averageGrade: 88,
          assignmentsCompleted: 16,
          totalAssignments: 20,
          attendanceRate: 92
        },
        parent: {
          name: 'David Chen',
          email: 'david.chen@parent.rkinstitute.com',
          phone: '+1-555-0124'
        }
      },
      {
        id: '3',
        name: 'Sarah Kim',
        email: 'sarah.kim@student.rkinstitute.com',
        grade: 'Grade 10',
        enrolledCourses: ['Mathematics', 'English Literature'],
        lastActivity: '2024-06-15T16:45:00Z',
        performance: {
          averageGrade: 91,
          assignmentsCompleted: 15,
          totalAssignments: 18,
          attendanceRate: 95
        },
        parent: {
          name: 'Jennifer Kim',
          email: 'jennifer.kim@parent.rkinstitute.com',
          phone: '+1-555-0125'
        }
      },
      {
        id: '4',
        name: 'Mike Johnson',
        email: 'mike.johnson@student.rkinstitute.com',
        grade: 'Grade 11',
        enrolledCourses: ['Advanced Mathematics', 'Physics'],
        lastActivity: '2024-06-15T14:20:00Z',
        performance: {
          averageGrade: 85,
          assignmentsCompleted: 14,
          totalAssignments: 20,
          attendanceRate: 89
        },
        parent: {
          name: 'Robert Johnson',
          email: 'robert.johnson@parent.rkinstitute.com',
          phone: '+1-555-0126'
        }
      },
      {
        id: '5',
        name: 'Lisa Wang',
        email: 'lisa.wang@student.rkinstitute.com',
        grade: 'Grade 12',
        enrolledCourses: ['Advanced Mathematics', 'English Literature'],
        lastActivity: '2024-06-16T11:00:00Z',
        performance: {
          averageGrade: 93,
          assignmentsCompleted: 19,
          totalAssignments: 20,
          attendanceRate: 97
        },
        parent: {
          name: 'Helen Wang',
          email: 'helen.wang@parent.rkinstitute.com',
          phone: '+1-555-0127'
        }
      }
    ]);

    setLoading(false);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
    const matchesCourse = filterCourse === 'all' || student.enrolledCourses.includes(filterCourse);
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGrade && matchesCourse && matchesSearch;
  });

  const uniqueGrades = Array.from(new Set(students.map(s => s.grade)));
  const uniqueCourses = Array.from(new Set(students.flatMap(s => s.enrolledCourses)));

  const totalStudents = students.length;
  const averagePerformance = students.length > 0
    ? Math.round(students.reduce((sum, student) => sum + student.performance.averageGrade, 0) / students.length)
    : 0;
  const averageAttendance = students.length > 0
    ? Math.round(students.reduce((sum, student) => sum + student.performance.attendanceRate, 0) / students.length)
    : 0;
  const totalAssignments = students.reduce((sum, student) => sum + student.performance.totalAssignments, 0);

  const getPerformanceColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-blue-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading students...</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <HubHeader
          title="My Students"
          subtitle="Manage your students, track their progress, and communicate with parents"
          actions={
            <>
              <HubActionButton href="/teacher/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="/teacher/academic-logs?action=create" icon={Plus} label="Create Academic Log" color="blue" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Students"
            value={totalStudents}
            subtitle="Under your guidance"
            icon="users"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Average Performance"
            value={`${averagePerformance}%`}
            subtitle="Class average grade"
            icon="trending-up"
            color="green"
          />
          <ProfessionalMetricCard
            title="Average Attendance"
            value={`${averageAttendance}%`}
            subtitle="Class attendance rate"
            icon="calendar"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Total Assignments"
            value={totalAssignments}
            subtitle="Across all students"
            icon="file-text"
            color="orange"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Grade</label>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Grades</option>
                {uniqueGrades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Course</label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {student.grade}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{student.email}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {student.enrolledCourses.map((course) => (
                        <span
                          key={course}
                          className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-2">
                      Last active: {new Date(student.lastActivity).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        View Profile
                      </button>
                      <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        Message
                      </button>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getPerformanceColor(student.performance.averageGrade)}`}>
                      {student.performance.averageGrade}%
                    </div>
                    <div className="text-xs text-gray-500">Average Grade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {student.performance.assignmentsCompleted}/{student.performance.totalAssignments}
                    </div>
                    <div className="text-xs text-gray-500">Assignments</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getAttendanceColor(student.performance.attendanceRate)}`}>
                      {student.performance.attendanceRate}%
                    </div>
                    <div className="text-xs text-gray-500">Attendance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{student.parent.name}</div>
                    <div className="text-xs text-gray-500">Parent Contact</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}