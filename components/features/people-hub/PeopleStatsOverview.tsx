'use client';

import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { PeopleStats } from './types';

interface PeopleStatsOverviewProps {
  stats: PeopleStats | null;
  loading?: boolean;
}

export default function PeopleStatsOverview({ stats, loading }: PeopleStatsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-32"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      <ProfessionalMetricCard
        title="Total Students"
        value={stats?.totalStudents || 0}
        subtitle="Enrolled learners"
        icon="users"
        color="blue"
        trend={{
          value: 8.2,
          label: "vs last month",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="Active Families"
        value={stats?.totalFamilies || 0}
        subtitle="Registered families"
        icon="users"
        color="green"
        trend={{
          value: 5.1,
          label: "vs last month",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="System Users"
        value={stats?.totalUsers || 0}
        subtitle="Active accounts"
        icon="users"
        color="purple"
      />
      <ProfessionalMetricCard
        title="Recent Enrollments"
        value={stats?.recentEnrollments || 0}
        subtitle="This month"
        icon="trending-up"
        color="indigo"
        trend={{
          value: 12.5,
          label: "vs last month",
          isPositive: true
        }}
      />
    </div>
  );
}
