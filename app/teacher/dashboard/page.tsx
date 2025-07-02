'use client';

import {
  TeacherHeader,
  TeacherNavigation,
  TeacherStatsOverview,
  TeacherQuickActions,
  TeacherDataInsights,
  User,
  TeacherProfile,
  DashboardStats,
  ActiveTab
} from '@/components/features/teacher-portal';
import { useTeacherPortalData } from '@/hooks';

import AcademicLogsManager from '../components/AcademicLogsManager';
import AssignmentsManager from '../components/AssignmentsManager';
import CoursesView from '../components/CoursesView';
import StudentsView from '../components/StudentsView';

export default function TeacherDashboard() {
  const {
    user,
    teacherProfile,
    stats,
    loading,
    activeTab,
    setUser,
    setTeacherProfile,
    setStats,
    setLoading,
    setActiveTab,
    handleLogout
  } = useTeacherPortalData();

  // Mock data for development - in production this would come from the data insights component
  if (loading && !user) {
    // Set mock data for development
    setUser({
      id: 'teacher-1',
      name: 'Dr. Sarah Wilson',
      email: 'teacher1@rkinstitute.com',
      role: 'TEACHER'
    });

    setStats({
      totalStudents: 45,
      totalCourses: 3,
      totalLogs: 28,
      achievements: 12,
      concerns: 2,
      progressReports: 14
    });

    setLoading(false);
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Data Management Component - handles all API calls and state */}
      <TeacherDataInsights
        onUserUpdate={setUser}
        onTeacherProfileUpdate={setTeacherProfile}
        onStatsUpdate={setStats}
        onLoadingChange={setLoading}
      />

      {/* Header */}
      <TeacherHeader user={user} onLogout={handleLogout} />

      {/* Navigation */}
      <TeacherNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {activeTab === 'overview' && (
          <div className='space-y-8'>
            {/* Stats Overview */}
            <TeacherStatsOverview user={user} stats={stats} loading={loading} />

            {/* Quick Actions */}
            <TeacherQuickActions stats={stats} onTabChange={setActiveTab} />
          </div>
        )}

        {activeTab === 'assignments' && <AssignmentsManager />}
        {activeTab === 'academic-logs' && <AcademicLogsManager />}
        {activeTab === 'my-students' && <StudentsView />}
        {activeTab === 'my-courses' && <CoursesView />}
      </main>
    </div>
  );
}
