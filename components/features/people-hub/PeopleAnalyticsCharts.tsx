'use client';

import dynamic from 'next/dynamic';
import { PeopleStats } from './types';

// Dynamic imports for heavy chart components (SSR disabled for vendor bundle compatibility)
const ProfessionalPieChart = dynamic(() => import('@/components/charts/ProfessionalPieChart'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>,
  ssr: false
});

const ProfessionalBarChart = dynamic(() => import('@/components/charts/ProfessionalBarChart'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>,
  ssr: false
});

interface PeopleAnalyticsChartsProps {
  stats: PeopleStats | null;
  loading?: boolean;
}

export default function PeopleAnalyticsCharts({ stats, loading }: PeopleAnalyticsChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
        <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ProfessionalPieChart
        data={stats?.gradeDistribution || []}
        title="Student Grade Distribution"
        subtitle="Distribution of students across different grade levels"
        size="lg"
        showLegend={true}
      />

      <ProfessionalBarChart
        data={stats?.enrollmentTrends || []}
        title="Monthly Enrollment Trends"
        subtitle="New student enrollments over the last 6 months"
        height={400}
        color="#3B82F6"
        showGrid={true}
      />
    </div>
  );
}
