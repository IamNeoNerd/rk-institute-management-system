'use client';

import { useState, useEffect } from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, BookOpen, Users, Calendar } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  grade: string;
  enrolledStudents: number;
  maxStudents: number;
  schedule: {
    days: string[];
    time: string;
    location: string;
  };
  feeStructure: {
    amount: number;
    billingCycle: string;
  };
  nextClass: string;
  totalRevenue: number;
  averagePerformance: number;
  attendanceRate: number;
}

export default function TeacherCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState('all');

  useEffect(() => {
    // Mock data for teacher's courses
    setCourses([
      {
        id: '1',
        name: 'Advanced Mathematics',
        description: 'Calculus, Statistics, and Advanced Algebra for high school students',
        grade: 'Grade 11-12',
        enrolledStudents: 8,
        maxStudents: 12,
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '9:00 AM - 10:30 AM',
          location: 'Room 101'
        },
        feeStructure: {
          amount: 2500,
          billingCycle: 'MONTHLY'
        },
        nextClass: '2024-06-17T09:00:00Z',
        totalRevenue: 20000,
        averagePerformance: 89,
        attendanceRate: 94
      },
      {
        id: '2',
        name: 'Physics',
        description: 'Mechanics, thermodynamics, and modern physics',
        grade: 'Grade 11-12',
        enrolledStudents: 6,
        maxStudents: 10,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: '11:00 AM - 12:30 PM',
          location: 'Physics Lab A'
        },
        feeStructure: {
          amount: 2800,
          billingCycle: 'MONTHLY'
        },
        nextClass: '2024-06-18T11:00:00Z',
        totalRevenue: 16800,
        averagePerformance: 86,
        attendanceRate: 91
      },
      {
        id: '3',
        name: 'English Literature',
        description: 'Classic and modern literature analysis and writing',
        grade: 'Grade 9-12',
        enrolledStudents: 10,
        maxStudents: 15,
        schedule: {
          days: ['Monday', 'Wednesday'],
          time: '2:00 PM - 3:30 PM',
          location: 'English Department'
        },
        feeStructure: {
          amount: 2200,
          billingCycle: 'MONTHLY'
        },
        nextClass: '2024-06-17T14:00:00Z',
        totalRevenue: 22000,
        averagePerformance: 92,
        attendanceRate: 96
      }
    ]);

    setLoading(false);
  }, []);

  const filteredCourses = courses.filter(course => {
    if (filterGrade === 'all') return true;
    return course.grade.includes(filterGrade);
  });

  const totalStudents = courses.reduce((sum, course) => sum + course.enrolledStudents, 0);
  const totalRevenue = courses.reduce((sum, course) => sum + course.totalRevenue, 0);
  const averagePerformance = courses.length > 0
    ? Math.round(courses.reduce((sum, course) => sum + course.averagePerformance, 0) / courses.length)
    : 0;
  const averageAttendance = courses.length > 0
    ? Math.round(courses.reduce((sum, course) => sum + course.attendanceRate, 0) / courses.length)
    : 0;

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 80) return 'text-blue-600';
    if (performance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-blue-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEnrollmentColor = (enrolled: number, max: number) => {
    const percentage = (enrolled / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading courses...</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <HubHeader
          title="My Courses"
          subtitle="Manage your courses, track student enrollment, and monitor performance"
          actions={
            <>
              <HubActionButton href="/teacher/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="/teacher/lessons?action=plan" icon={Calendar} label="Plan Lesson" color="blue" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Courses"
            value={courses.length}
            subtitle="Active courses"
            icon="book-open"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Total Students"
            value={totalStudents}
            subtitle="Across all courses"
            icon="users"
            color="green"
          />
          <ProfessionalMetricCard
            title="Monthly Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            subtitle="From all courses"
            icon="dollar-sign"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Avg Performance"
            value={`${averagePerformance}%`}
            subtitle="Class average"
            icon="trending-up"
            color="orange"
          />
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filter by Grade</h3>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-gray-600">Try adjusting your filters.</p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{course.name}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {course.grade}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{course.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <p><strong>Schedule:</strong> {course.schedule.days.join(', ')}</p>
                        <p><strong>Time:</strong> {course.schedule.time}</p>
                        <p><strong>Location:</strong> {course.schedule.location}</p>
                      </div>
                      <div className="space-y-2">
                        <p><strong>Fee:</strong> ₹{course.feeStructure.amount.toLocaleString()}/{course.feeStructure.billingCycle.toLowerCase()}</p>
                        <p><strong>Next Class:</strong> {new Date(course.nextClass).toLocaleDateString()}</p>
                        <p><strong>Revenue:</strong> ₹{course.totalRevenue.toLocaleString()}/month</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getEnrollmentColor(course.enrolledStudents, course.maxStudents)}`}>
                      {course.enrolledStudents}/{course.maxStudents}
                    </div>
                    <div className="text-xs text-gray-500">Enrollment</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getPerformanceColor(course.averagePerformance)}`}>
                      {course.averagePerformance}%
                    </div>
                    <div className="text-xs text-gray-500">Avg Performance</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getAttendanceColor(course.attendanceRate)}`}>
                      {course.attendanceRate}%
                    </div>
                    <div className="text-xs text-gray-500">Attendance</div>
                  </div>
                  <div className="text-center">
                    <div className="flex space-x-2 justify-center">
                      <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Manage
                      </button>
                      <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Analytics
                      </button>
                    </div>
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