'use client';

import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { TeacherStats } from '@/hooks/teacher/useTeacherDashboardData';

interface TeacherStatsOverviewProps {
  stats: TeacherStats | null;
  loading?: boolean;
}

export default function TeacherStatsOverview({ stats, loading }: TeacherStatsOverviewProps) {
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
        title="My Students"
        value={stats?.totalStudents || 0}
        subtitle="Active learners"
        icon="users"
        color="blue"
        trend={{
          value: 8.2,
          label: "vs last month",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="My Courses"
        value={stats?.totalCourses || 0}
        subtitle="Teaching subjects"
        icon="book-open"
        color="green"
        trend={{
          value: 5.1,
          label: "vs last semester",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="Academic Logs"
        value={stats?.totalLogs || 0}
        subtitle="Progress entries"
        icon="file-text"
        color="purple"
        trend={{
          value: 12.5,
          label: "vs last month",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="Achievements"
        value={stats?.achievements || 0}
        subtitle="Student successes"
        icon="award"
        color="yellow"
        trend={{
          value: 15.3,
          label: "vs last month",
          isPositive: true
        }}
      />
    </div>
  );
}
