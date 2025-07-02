/**
 * Student Stats Overview Component
 *
 * Displays the welcome section and comprehensive statistics overview
 * for the Student Portal dashboard.
 *
 * Design Features:
 * - Gradient welcome banner with student information
 * - Comprehensive statistics grid with 6 key metrics
 * - Color-coded stat cards with icons
 * - Conditional styling for outstanding dues
 * - Loading states and responsive design
 * - Professional RK Institute styling
 */

'use client';

import { StatsCard, Grid, LoadingState } from '@/components/ui';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

import { StudentStatsOverviewProps, StatCardData } from './types';

export default function StudentStatsOverview({
  studentProfile,
  stats,
  loading
}: StudentStatsOverviewProps) {
  if (loading) {
    return <LoadingState message='Loading student dashboard...' />;
  }

  const statCards: StatCardData[] = [
    {
      title: 'Enrolled Courses',
      value: stats.totalCourses,
      subtitle: 'Active subjects',
      icon: <ProfessionalIcon name='courses' size={24} />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Services',
      value: stats.totalServices,
      subtitle: 'Active services',
      icon: <ProfessionalIcon name='transport' size={24} />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Monthly Fee',
      value: `₹${stats.currentMonthFee.toLocaleString()}`,
      subtitle: 'Current month',
      icon: <ProfessionalIcon name='fees' size={24} />,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Outstanding Dues',
      value: `₹${stats.outstandingDues.toLocaleString()}`,
      subtitle: stats.outstandingDues > 0 ? 'Payment pending' : 'All clear!',
      icon: stats.outstandingDues > 0 ? '⚠️' : '✅',
      bgColor: stats.outstandingDues > 0 ? 'bg-red-100' : 'bg-green-100',
      textColor: stats.outstandingDues > 0 ? 'text-red-600' : 'text-green-600',
      valueColor: stats.outstandingDues > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'Academic Logs',
      value: stats.academicLogs,
      subtitle: 'Progress records',
      icon: '📝',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Achievements',
      value: stats.achievements,
      subtitle: 'Earned this term',
      icon: '🏆',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      valueColor: 'text-yellow-600'
    }
  ];

  return (
    <div className='space-y-8'>
      {/* Welcome Section */}
      <div className='bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white'>
        <h2 className='text-3xl font-bold mb-4'>
          Welcome Back, {studentProfile?.name}!
        </h2>
        <p className='text-lg opacity-90 mb-6'>
          Track your academic progress, view course materials, and stay updated
          with your learning journey
        </p>

        {/* Student Info Badges */}
        <div className='flex flex-wrap gap-4'>
          <div className='bg-white bg-opacity-20 rounded-lg px-4 py-2'>
            <span className='text-sm font-medium'>{studentProfile?.grade}</span>
          </div>
          <div className='bg-white bg-opacity-20 rounded-lg px-4 py-2'>
            <span className='text-sm font-medium'>
              {studentProfile?.studentId}
            </span>
          </div>
          <div className='bg-white bg-opacity-20 rounded-lg px-4 py-2'>
            <span className='text-sm font-medium'>
              {studentProfile?.family.name}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <Grid cols={3} responsive={{ sm: 1, md: 2, lg: 3 }}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  {stat.title}
                </p>
                <p
                  className={`text-3xl font-bold ${stat.valueColor || 'text-gray-900'}`}
                >
                  {stat.value}
                </p>
                <p className={`text-sm mt-1 ${stat.textColor}`}>
                  {stat.subtitle}
                </p>
              </div>
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <span className='text-3xl'>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </Grid>
    </div>
  );
}
