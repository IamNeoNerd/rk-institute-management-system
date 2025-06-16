'use client';

import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { ParentStats } from '@/hooks/parent/useParentDashboardData';

interface ParentStatsOverviewProps {
  stats: ParentStats | null;
  loading?: boolean;
}

export default function ParentStatsOverview({ stats, loading }: ParentStatsOverviewProps) {
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
        title="My Children"
        value={stats?.totalChildren || 0}
        subtitle="Enrolled students"
        icon="users"
        color="blue"
        trend={{
          value: 0,
          label: "family members",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="Monthly Fee"
        value={`₹${stats?.totalMonthlyFee?.toLocaleString() || '0'}`}
        subtitle="After family discount"
        icon="dollar-sign"
        color="green"
        trend={{
          value: stats?.familyDiscount || 0,
          label: "discount applied",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="Family Average"
        value={`${stats?.averageFamilyGrade || 0}%`}
        subtitle="Academic performance"
        icon="trending-up"
        color="purple"
        trend={{
          value: 3.2,
          label: "vs last month",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="Outstanding Dues"
        value={`₹${stats?.outstandingDues?.toLocaleString() || '0'}`}
        subtitle={stats?.outstandingDues === 0 ? "All clear!" : "Payment due"}
        icon={stats?.outstandingDues === 0 ? "check-circle" : "alert-triangle"}
        color={stats?.outstandingDues === 0 ? "green" : "red"}
      />
      <ProfessionalMetricCard
        title="Achievements"
        value={stats?.totalAchievements || 0}
        subtitle="Family milestones"
        icon="award"
        color="yellow"
        trend={{
          value: 18.5,
          label: "vs last month",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="Areas of Concern"
        value={stats?.totalConcerns || 0}
        subtitle={stats?.totalConcerns === 0 ? "All good!" : "Needs attention"}
        icon={stats?.totalConcerns === 0 ? "smile" : "alert-triangle"}
        color={stats?.totalConcerns === 0 ? "green" : "orange"}
      />
    </div>
  );
}
