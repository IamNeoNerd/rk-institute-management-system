/**
 * Teacher Stats Overview Component
 * 
 * Displays the welcome section and comprehensive statistics overview
 * for the Teacher Portal dashboard.
 * 
 * Design Features:
 * - Gradient welcome banner with teacher information
 * - Comprehensive statistics grid with 6 key metrics
 * - Color-coded stat cards with icons
 * - Conditional styling for concerns and achievements
 * - Loading states and responsive design
 * - Professional RK Institute styling with teal theme
 */

'use client';

import { TeacherStatsOverviewProps, StatCardData } from './types';
import { StatsCard, Grid, LoadingState } from '@/components/ui';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

export default function TeacherStatsOverview({
  user,
  stats,
  loading
}: TeacherStatsOverviewProps) {

  if (loading) {
    return <LoadingState message="Loading teacher dashboard..." />;
  }

  const statCards: StatCardData[] = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      subtitle: 'Active learners',
      icon: <ProfessionalIcon name="students" size={24} />,
      bgColor: 'bg-blue-100',
      textColor: 'text-green-600'
    },
    {
      title: 'My Courses',
      value: stats.totalCourses,
      subtitle: 'Teaching subjects',
      icon: <ProfessionalIcon name="courses" size={24} />,
      bgColor: 'bg-green-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Academic Logs',
      value: stats.totalLogs,
      subtitle: 'Progress records',
      icon: <ProfessionalIcon name="report" size={24} />,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Achievements',
      value: stats.achievements,
      subtitle: 'Student successes',
      icon: <ProfessionalIcon name="achievement" size={24} />,
      bgColor: 'bg-yellow-100',
      textColor: 'text-green-600',
      valueColor: 'text-green-600'
    },
    {
      title: 'Progress Reports',
      value: stats.progressReports,
      subtitle: 'Regular updates',
      icon: '📊',
      bgColor: 'bg-indigo-100',
      textColor: 'text-blue-600',
      valueColor: 'text-blue-600'
    },
    {
      title: 'Concerns',
      value: stats.concerns,
      subtitle: stats.concerns > 0 ? 'Need attention' : 'All good!',
      icon: stats.concerns > 0 ? '⚠️' : '✅',
      bgColor: stats.concerns > 0 ? 'bg-red-100' : 'bg-green-100',
      textColor: stats.concerns > 0 ? 'text-red-600' : 'text-green-600',
      valueColor: stats.concerns > 0 ? 'text-red-600' : 'text-green-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-500 via-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Teacher&apos;s Dashboard
        </h2>
        <p className="text-lg opacity-90 mb-6">
          Empower student success through comprehensive academic tracking and progress management
        </p>
        
        {/* Teacher Info Badges */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <span className="text-sm font-medium">Academic Excellence</span>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <span className="text-sm font-medium">Progress Tracking</span>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <span className="text-sm font-medium">Student Development</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <Grid cols={3} responsive={{ sm: 1, md: 2, lg: 3 }}>
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.valueColor || 'text-gray-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-sm mt-1 ${stat.textColor}`}>
                  {stat.subtitle}
                </p>
              </div>
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </Grid>
    </div>
  );
}
