'use client';

import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { StudentStats } from '@/hooks/student/useStudentDashboardData';

interface StudentStatsOverviewProps {
  stats: StudentStats | null;
  loading?: boolean;
}

export default function StudentStatsOverview({ stats, loading }: StudentStatsOverviewProps) {
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
        title="My Courses"
        value={stats?.totalCourses || 0}
        subtitle="Active subjects"
        icon="book-open"
        color="blue"
        trend={{
          value: 12.5,
          label: "vs last semester",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="Average Grade"
        value={`${stats?.averageGrade || 0}%`}
        subtitle="Overall performance"
        icon="trending-up"
        color="green"
        trend={{
          value: 5.2,
          label: "vs last month",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="Achievements"
        value={stats?.achievements || 0}
        subtitle="Earned this term"
        icon="award"
        color="yellow"
        trend={{
          value: 25.0,
          label: "vs last term",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="Attendance"
        value={`${stats?.attendanceRate || 0}%`}
        subtitle="This month"
        icon="check-circle"
        color="purple"
        trend={{
          value: 2.1,
          label: "vs last month",
          isPositive: true
        }}
      />
      <ProfessionalMetricCard
        title="Pending Assignments"
        value={stats?.pendingAssignments || 0}
        subtitle="Due soon"
        icon="clock"
        color="red"
      />
      <ProfessionalMetricCard
        title="Monthly Fee"
        value={`₹${stats?.currentMonthFee?.toLocaleString() || '0'}`}
        subtitle="Current month"
        icon="dollar-sign"
        color="indigo"
      />
    </div>
  );
}
