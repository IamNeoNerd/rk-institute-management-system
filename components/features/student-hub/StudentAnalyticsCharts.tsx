'use client';

import ProfessionalPieChart from '@/components/charts/ProfessionalPieChart';
import { StudentStats } from '@/hooks/student/useStudentDashboardData';

interface StudentAnalyticsChartsProps {
  stats: StudentStats | null;
  loading?: boolean;
}

export default function StudentAnalyticsCharts({ stats, loading }: StudentAnalyticsChartsProps) {
  if (loading) {
    return (
      <div className="animate-slide-up">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Academic Analytics
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
          <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
        </div>
      </div>
    );
  }

  const assignmentStatusData = stats ? [
    { name: 'Completed', value: stats.completedAssignments, color: '#10b981' },
    { name: 'Pending', value: stats.pendingAssignments, color: '#f59e0b' },
    { name: 'Overdue', value: Math.floor(stats.pendingAssignments * 0.2), color: '#ef4444' },
  ] : [];

  const gradeDistributionData = stats ? [
    { name: 'Excellent (90-100%)', value: Math.floor(stats.totalCourses * 0.4), color: '#10b981' },
    { name: 'Good (80-89%)', value: Math.floor(stats.totalCourses * 0.3), color: '#3b82f6' },
    { name: 'Average (70-79%)', value: Math.floor(stats.totalCourses * 0.2), color: '#f59e0b' },
    { name: 'Needs Improvement (<70%)', value: Math.floor(stats.totalCourses * 0.1), color: '#ef4444' },
  ] : [];

  const attendanceData = stats ? [
    { name: 'Present', value: Math.floor(stats.attendanceRate), color: '#10b981' },
    { name: 'Absent', value: 100 - Math.floor(stats.attendanceRate), color: '#ef4444' },
  ] : [];

  const courseProgressData = stats ? [
    { name: 'Mathematics', value: 92, color: '#3b82f6' },
    { name: 'Science', value: 88, color: '#10b981' },
    { name: 'English', value: 85, color: '#f59e0b' },
    { name: 'History', value: 90, color: '#8b5cf6' },
    { name: 'Geography', value: 87, color: '#06b6d4' },
    { name: 'Computer Science', value: 94, color: '#ef4444' },
  ] : [];

  return (
    <div className="animate-slide-up">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Academic Analytics
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Assignment Status</h3>
          {stats ? (
            <ProfessionalPieChart
              title="Assignment Progress"
              data={assignmentStatusData}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Grade Distribution</h3>
          {stats ? (
            <ProfessionalPieChart
              title="Performance Levels"
              data={gradeDistributionData}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Attendance Overview</h3>
          {stats ? (
            <ProfessionalPieChart
              title="Attendance Rate"
              data={attendanceData}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Course Performance</h3>
          {stats ? (
            <ProfessionalPieChart
              title="Subject Scores"
              data={courseProgressData}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
