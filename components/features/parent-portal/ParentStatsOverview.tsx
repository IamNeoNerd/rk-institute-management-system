/**
 * Parent Stats Overview Component
 * 
 * Displays the welcome section and comprehensive statistics overview
 * for the Parent Portal dashboard.
 * 
 * Design Features:
 * - Gradient welcome banner with family information
 * - Comprehensive statistics grid with 6 key metrics
 * - Color-coded stat cards with icons
 * - Conditional styling for outstanding dues and concerns
 * - Loading states and responsive design
 * - Professional RK Institute styling with green theme
 */

'use client';

import { ParentStatsOverviewProps, StatCardData } from './types';
import { StatsCard, Grid, LoadingState } from '@/components/ui';

export default function ParentStatsOverview({
  familyProfile,
  stats,
  loading
}: ParentStatsOverviewProps) {

  if (loading) {
    return <LoadingState message="Loading family dashboard..." />;
  }

  const statCards: StatCardData[] = [
    {
      title: 'Total Children',
      value: stats.totalChildren,
      subtitle: 'Enrolled students',
      icon: '👨‍👩‍👧‍👦',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Monthly Fee',
      value: `₹${stats.totalMonthlyFee.toLocaleString()}`,
      subtitle: 'After family discount',
      icon: '💰',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Outstanding Dues',
      value: `₹${stats.outstandingDues.toLocaleString()}`,
      subtitle: stats.outstandingDues > 0 ? 'Payment required' : 'All clear!',
      icon: stats.outstandingDues > 0 ? '⚠️' : '✅',
      bgColor: stats.outstandingDues > 0 ? 'bg-red-100' : 'bg-green-100',
      textColor: stats.outstandingDues > 0 ? 'text-red-600' : 'text-green-600',
      valueColor: stats.outstandingDues > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'Achievements',
      value: stats.totalAchievements,
      subtitle: 'This month',
      icon: '🏆',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      valueColor: 'text-yellow-600'
    },
    {
      title: 'Areas of Concern',
      value: stats.totalConcerns,
      subtitle: stats.totalConcerns > 0 ? 'Needs attention' : 'All good!',
      icon: stats.totalConcerns > 0 ? '⚠️' : '😊',
      bgColor: stats.totalConcerns > 0 ? 'bg-red-100' : 'bg-green-100',
      textColor: stats.totalConcerns > 0 ? 'text-red-600' : 'text-green-600',
      valueColor: stats.totalConcerns > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'Last Payment',
      value: new Date(stats.lastPaymentDate).toLocaleDateString(),
      subtitle: 'Payment received',
      icon: '💳',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Welcome, {familyProfile?.name}!
        </h2>
        <p className="text-lg opacity-90 mb-6">
          Stay connected with your children&apos;s academic journey and manage family account information
        </p>
        
        {/* Family Info Badges */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <span className="text-sm font-medium">{stats.totalChildren} Children</span>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <span className="text-sm font-medium">Family Discount: ₹{familyProfile?.discountAmount}</span>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <span className="text-sm font-medium">
              {stats.outstandingDues === 0 ? 'All Payments Current' : 'Payment Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Family Stats Grid */}
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
