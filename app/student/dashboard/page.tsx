'use client';

import {
  StudentHeader,
  StudentNavigation,
  StudentStatsOverview,
  StudentQuickActions,
  StudentDataInsights,
  User,
  StudentProfile,
  DashboardStats,
  ActiveTab
} from '@/components/features/student-portal';
import { useStudentPortalData } from '@/hooks';
import MyCoursesView from '../components/MyCoursesView';
import MyFeesView from '../components/MyFeesView';
import MyAcademicLogsView from '../components/MyAcademicLogsView';
import AssignmentsView from '../components/AssignmentsView';

export default function StudentDashboard() {
  const {
    user,
    studentProfile,
    stats,
    loading,
    activeTab,
    setUser,
    setStudentProfile,
    setStats,
    setLoading,
    setActiveTab,
    handleLogout
  } = useStudentPortalData();

  // Mock data for development - in production this would come from the data insights component
  if (loading && !studentProfile) {
    // Set mock data for development
    setStudentProfile({
      id: 'student-1',
      name: 'Emma Johnson',
      grade: 'Grade 11',
      studentId: 'STU001',
      dateOfBirth: '2007-03-12',
      enrollmentDate: '2023-08-15',
      family: {
        name: 'The Johnson Family',
        email: 'johnson.family@email.com',
        phone: '+1-217-555-0101',
      },
    });

    setStats({
      totalCourses: 3,
      totalServices: 2,
      currentMonthFee: 8500,
      outstandingDues: 0,
      academicLogs: 5,
      achievements: 2,
    });

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Data Management Component - handles all API calls and state */}
      <StudentDataInsights
        onUserUpdate={setUser}
        onStudentProfileUpdate={setStudentProfile}
        onStatsUpdate={setStats}
        onLoadingChange={setLoading}
      />

      {/* Header */}
      <StudentHeader
        studentProfile={studentProfile}
        onLogout={handleLogout}
      />

      {/* Navigation */}
      <StudentNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <StudentStatsOverview
              studentProfile={studentProfile}
              stats={stats}
              loading={loading}
            />

            {/* Quick Actions */}
            <StudentQuickActions
              stats={stats}
              onTabChange={setActiveTab}
            />
          </div>
        )}

        {activeTab === 'my-courses' && <MyCoursesView />}
        {activeTab === 'my-fees' && <MyFeesView />}
        {activeTab === 'assignments' && <AssignmentsView />}
        {activeTab === 'academic-logs' && <MyAcademicLogsView />}
      </main>
    </div>
  );
}
