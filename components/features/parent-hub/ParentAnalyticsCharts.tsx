'use client';

import ProfessionalPieChart from '@/components/charts/ProfessionalPieChart';
import { ParentStats } from '@/hooks/parent/useParentDashboardData';

interface ParentAnalyticsChartsProps {
  stats: ParentStats | null;
  loading?: boolean;
}

export default function ParentAnalyticsCharts({ stats, loading }: ParentAnalyticsChartsProps) {
  if (loading) {
    return (
      <div className="animate-slide-up">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Family Analytics
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
          <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
        </div>
      </div>
    );
  }

  const assignmentStatusData = stats ? [
    { name: 'Completed', value: stats.totalAssignments - stats.pendingAssignments, color: '#10b981' },
    { name: 'Pending', value: stats.pendingAssignments, color: '#f59e0b' },
    { name: 'Overdue', value: Math.floor(stats.pendingAssignments * 0.3), color: '#ef4444' },
  ] : [];

  const familyPerformanceData = stats ? [
    { name: 'Emma Johnson', value: 87.5, color: '#3b82f6' },
    { name: 'Liam Johnson', value: 82.3, color: '#10b981' },
  ] : [];

  const achievementDistributionData = stats ? [
    { name: 'Academic Excellence', value: Math.floor((stats.totalAchievements || 0) * 0.4), color: '#10b981' },
    { name: 'Sports & Activities', value: Math.floor((stats.totalAchievements || 0) * 0.3), color: '#3b82f6' },
    { name: 'Behavior & Conduct', value: Math.floor((stats.totalAchievements || 0) * 0.2), color: '#f59e0b' },
    { name: 'Leadership', value: Math.floor((stats.totalAchievements || 0) * 0.1), color: '#8b5cf6' },
  ] : [];

  const attendanceOverviewData = stats ? [
    { name: 'Present', value: 94, color: '#10b981' },
    { name: 'Absent', value: 6, color: '#ef4444' },
  ] : [];

  return (
    <div className="animate-slide-up">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Family Analytics
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Assignment Status</h3>
          {stats ? (
            <ProfessionalPieChart
              title="Family Assignment Progress"
              data={assignmentStatusData}
              size="md"
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Children Performance</h3>
          {stats ? (
            <ProfessionalPieChart
              title="Academic Performance"
              data={familyPerformanceData}
              size="md"
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Achievement Categories</h3>
          {stats ? (
            <ProfessionalPieChart
              title="Achievement Types"
              data={achievementDistributionData}
              size="md"
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Family Attendance</h3>
          {stats ? (
            <ProfessionalPieChart
              title="Overall Attendance"
              data={attendanceOverviewData}
              size="md"
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
