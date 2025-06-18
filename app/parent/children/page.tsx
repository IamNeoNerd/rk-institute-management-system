'use client';

import { useState, useEffect } from 'react';
import ParentLayout from '@/components/layout/ParentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Users, MessageSquare, Calendar } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  grade: string;
  rollNumber: string;
  dateOfBirth: string;
  enrolledCourses: string[];
  currentPerformance: {
    averageGrade: number;
    attendanceRate: number;
    assignmentsCompleted: number;
    totalAssignments: number;
  };
  recentActivity: {
    type: string;
    description: string;
    date: string;
  }[];
  teachers: {
    subject: string;
    teacherName: string;
    email: string;
  }[];
  nextClass: string;
  upcomingEvents: {
    title: string;
    date: string;
    type: string;
  }[];
}

export default function ParentChildren() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for parent's children
    setChildren([
      {
        id: '1',
        name: 'Emma Wilson',
        grade: 'Grade 11',
        rollNumber: 'RK2024001',
        dateOfBirth: '2008-03-15',
        enrolledCourses: ['Advanced Mathematics', 'Physics', 'English Literature'],
        currentPerformance: {
          averageGrade: 95,
          attendanceRate: 98,
          assignmentsCompleted: 18,
          totalAssignments: 20
        },
        recentActivity: [
          {
            type: 'ACHIEVEMENT',
            description: 'Outstanding Performance in Advanced Mathematics',
            date: '2024-06-15'
          },
          {
            type: 'ASSIGNMENT',
            description: 'Submitted Physics Lab Report',
            date: '2024-06-14'
          },
          {
            type: 'ATTENDANCE',
            description: 'Perfect attendance this week',
            date: '2024-06-13'
          }
        ],
        teachers: [
          { subject: 'Mathematics', teacherName: 'Dr. Sarah Johnson', email: 'sarah.johnson@rkinstitute.com' },
          { subject: 'Physics', teacherName: 'Prof. Michael Chen', email: 'michael.chen@rkinstitute.com' },
          { subject: 'English Literature', teacherName: 'System Administrator', email: 'admin@rkinstitute.com' }
        ],
        nextClass: '2024-06-17T09:00:00Z',
        upcomingEvents: [
          { title: 'Mathematics Mid-term Exam', date: '2024-06-20', type: 'EXAM' },
          { title: 'Physics Project Presentation', date: '2024-06-22', type: 'PROJECT' },
          { title: 'Parent-Teacher Meeting', date: '2024-06-25', type: 'MEETING' }
        ]
      },
      {
        id: '2',
        name: 'Alex Wilson',
        grade: 'Grade 9',
        rollNumber: 'RK2024002',
        dateOfBirth: '2010-07-22',
        enrolledCourses: ['Mathematics', 'Science', 'English'],
        currentPerformance: {
          averageGrade: 88,
          attendanceRate: 95,
          assignmentsCompleted: 15,
          totalAssignments: 18
        },
        recentActivity: [
          {
            type: 'PROGRESS',
            description: 'Improvement in Mathematics performance',
            date: '2024-06-12'
          },
          {
            type: 'ASSIGNMENT',
            description: 'Submitted Science project on time',
            date: '2024-06-11'
          }
        ],
        teachers: [
          { subject: 'Mathematics', teacherName: 'Ms. Jennifer Smith', email: 'jennifer.smith@rkinstitute.com' },
          { subject: 'Science', teacherName: 'Dr. Robert Brown', email: 'robert.brown@rkinstitute.com' },
          { subject: 'English', teacherName: 'Ms. Lisa Davis', email: 'lisa.davis@rkinstitute.com' }
        ],
        nextClass: '2024-06-17T10:30:00Z',
        upcomingEvents: [
          { title: 'Science Fair Participation', date: '2024-06-21', type: 'EVENT' },
          { title: 'English Essay Submission', date: '2024-06-23', type: 'ASSIGNMENT' }
        ]
      }
    ]);

    setLoading(false);
  }, []);

  const selectedChildData = selectedChild ? children.find(child => child.id === selectedChild) : children[0];
  const totalChildren = children.length;
  const averagePerformance = children.length > 0
    ? Math.round(children.reduce((sum, child) => sum + child.currentPerformance.averageGrade, 0) / children.length)
    : 0;
  const averageAttendance = children.length > 0
    ? Math.round(children.reduce((sum, child) => sum + child.currentPerformance.attendanceRate, 0) / children.length)
    : 0;
  const totalUpcomingEvents = children.reduce((sum, child) => sum + child.upcomingEvents.length, 0);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ACHIEVEMENT':
        return '🏆';
      case 'ASSIGNMENT':
        return '📝';
      case 'ATTENDANCE':
        return '📅';
      case 'PROGRESS':
        return '📈';
      default:
        return '📋';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'EXAM':
        return '📝';
      case 'PROJECT':
        return '🎯';
      case 'MEETING':
        return '👥';
      case 'EVENT':
        return '🎉';
      case 'ASSIGNMENT':
        return '📋';
      default:
        return '📅';
    }
  };

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
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading children information...</div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-8">
        <HubHeader
          title="My Children"
          subtitle="Monitor your children's academic progress, attendance, and activities"
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
            title="Total Children"
            value={totalChildren}
            subtitle="Under your care"
            icon="users"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Average Performance"
            value={`${averagePerformance}%`}
            subtitle="Overall academic grade"
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
            title="Upcoming Events"
            value={totalUpcomingEvents}
            subtitle="Across all children"
            icon="clock"
            color="orange"
          />
        </div>

        {/* Child Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Child</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedChild === child.id || (!selectedChild && child.id === children[0].id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{child.name}</h4>
                    <p className="text-sm text-gray-600">{child.grade} • Roll: {child.rollNumber}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Child Details */}
        {selectedChildData && (
          <div className="space-y-6">
            {/* Child Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {selectedChildData.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedChildData.name}</h3>
                  <p className="text-gray-600">{selectedChildData.grade} • Roll Number: {selectedChildData.rollNumber}</p>
                  <p className="text-sm text-gray-500">Date of Birth: {new Date(selectedChildData.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getPerformanceColor(selectedChildData.currentPerformance.averageGrade)}`}>
                    {selectedChildData.currentPerformance.averageGrade}%
                  </div>
                  <div className="text-sm text-gray-500">Average Grade</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getAttendanceColor(selectedChildData.currentPerformance.attendanceRate)}`}>
                    {selectedChildData.currentPerformance.attendanceRate}%
                  </div>
                  <div className="text-sm text-gray-500">Attendance</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedChildData.currentPerformance.assignmentsCompleted}/{selectedChildData.currentPerformance.totalAssignments}
                  </div>
                  <div className="text-sm text-gray-500">Assignments</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedChildData.enrolledCourses.length}
                  </div>
                  <div className="text-sm text-gray-500">Courses</div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Enrolled Courses</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedChildData.enrolledCourses.map((course, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              {/* Teachers */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Teachers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedChildData.teachers.map((teacher, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-900">{teacher.teacherName}</div>
                      <div className="text-sm text-gray-600">{teacher.subject}</div>
                      <div className="text-xs text-gray-500">{teacher.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity & Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {selectedChildData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Upcoming Events</h4>
                <div className="space-y-3">
                  {selectedChildData.upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl">{getEventIcon(event.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions for Selected Child */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Actions for {selectedChildData.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium text-gray-900">View Grades</div>
                  <div className="text-sm text-gray-600">Academic performance</div>
                </button>
                <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-medium text-gray-900">Pay Fees</div>
                  <div className="text-sm text-gray-600">Fee payments</div>
                </button>
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                  <div className="text-2xl mb-2">📧</div>
                  <div className="font-medium text-gray-900">Message Teachers</div>
                  <div className="text-sm text-gray-600">Send messages</div>
                </button>
                <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="font-medium text-gray-900">Schedule Meeting</div>
                  <div className="text-sm text-gray-600">Parent-teacher conference</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}