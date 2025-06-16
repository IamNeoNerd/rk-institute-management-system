'use client';

import dynamic from 'next/dynamic';
import { PeopleStats } from './types';

// Dynamic import for DataInsightCard to reduce initial bundle size
const DataInsightCard = dynamic(() => import('@/components/cards/DataInsightCard'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
});

interface PeopleDataInsightsProps {
  stats: PeopleStats | null;
  loading?: boolean;
}

export default function PeopleDataInsights({ stats, loading }: PeopleDataInsightsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <DataInsightCard
        title="Students with Overdue Fees"
        description="Students requiring immediate fee collection attention"
        value={Math.floor((stats?.totalStudents || 0) * 0.08)}
        icon="alert-triangle"
        color="red"
        href="/admin/students?filter=overdue"
        chartType="pie"
        chartData={[
          { name: 'Overdue', value: 12, color: '#EF4444' },
          { name: 'Current', value: 144, color: '#10B981' }
        ]}
        badge={{
          text: "Urgent",
          color: "red"
        }}
        trend={{
          value: 15,
          isPositive: false
        }}
      />

      <DataInsightCard
        title="Multi-Child Families"
        description="Families with multiple enrolled children"
        value={Math.floor((stats?.totalFamilies || 0) * 0.65)}
        icon="users"
        color="green"
        href="/admin/families?filter=multi-child"
        chartType="pie"
        chartData={stats?.familySizeDistribution || []}
        badge={{
          text: "Opportunity",
          color: "green"
        }}
        trend={{
          value: 8,
          isPositive: true
        }}
      />

      <DataInsightCard
        title="New Enrollments"
        description="Students enrolled in the last 30 days"
        value={stats?.recentEnrollments || 0}
        icon="trending-up"
        color="blue"
        href="/admin/students?filter=recent"
        chartType="bar"
        chartData={stats?.enrollmentTrends || []}
        badge={{
          text: "Growth",
          color: "blue"
        }}
        trend={{
          value: 22,
          isPositive: true
        }}
      />
    </div>
  );
}
