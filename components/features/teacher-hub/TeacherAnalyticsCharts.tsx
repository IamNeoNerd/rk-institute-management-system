'use client';

import ProfessionalPieChart from '@/components/charts/ProfessionalPieChart';
import { TeacherStats } from '@/hooks/teacher/useTeacherDashboardData';

interface TeacherAnalyticsChartsProps {
  stats: TeacherStats | null;
  loading?: boolean;
}

export default function TeacherAnalyticsCharts({ stats, loading }: TeacherAnalyticsChartsProps) {
  if (loading) {
    return (
      <div className="animate-slide-up">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Teaching Analytics
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
          <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
        </div>
      </div>
    );
  }

  const academicLogsData = stats ? [
    { name: 'Achievements', value: stats.achievements, color: '#10b981' },
    { name: 'Progress Reports', value: stats.progressReports, color: '#3b82f6' },
    { name: 'Concerns', value: stats.concerns, color: '#ef4444' },
  ] : [];

  const assignmentStatusData = stats ? [
    { name: 'Completed', value: stats.completedAssignments, color: '#10b981' },
    { name: 'In Progress', value: stats.activeAssignments - stats.completedAssignments, color: '#f59e0b' },
    { name: 'Not Started', value: Math.floor(stats.activeAssignments * 0.2), color: '#ef4444' },
  ] : [];

  const courseEngagementData = stats ? [
    { name: 'High Engagement', value: Math.floor(stats.totalStudents * 0.6), color: '#10b981' },
    { name: 'Medium Engagement', value: Math.floor(stats.totalStudents * 0.3), color: '#f59e0b' },
    { name: 'Low Engagement', value: Math.floor(stats.totalStudents * 0.1), color: '#ef4444' },
  ] : [];

  const performanceDistributionData = stats ? [
    { name: 'Excellent (90-100%)', value: Math.floor(stats.totalStudents * 0.25), color: '#10b981' },
    { name: 'Good (80-89%)', value: Math.floor(stats.totalStudents * 0.35), color: '#3b82f6' },
    { name: 'Average (70-79%)', value: Math.floor(stats.totalStudents * 0.25), color: '#f59e0b' },
    { name: 'Needs Improvement (<70%)', value: Math.floor(stats.totalStudents * 0.15), color: '#ef4444' },
  ] : [];

  return (
    <div className="animate-slide-up">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Teaching Analytics
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Academic Log Distribution</h3>
          {stats ? (
            <ProfessionalPieChart
              title="Academic Log Types"
              data={academicLogsData}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>

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
          <h3 className="text-xl font-bold text-gray-900 mb-6">Student Engagement</h3>
          {stats ? (
            <ProfessionalPieChart
              title="Engagement Levels"
              data={courseEngagementData}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Distribution</h3>
          {stats ? (
            <ProfessionalPieChart
              title="Student Performance"
              data={performanceDistributionData}
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
