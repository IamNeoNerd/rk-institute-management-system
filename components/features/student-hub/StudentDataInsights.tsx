'use client';

import DataInsightCard from '@/components/cards/DataInsightCard';
import { StudentStats } from '@/hooks/student/useStudentDashboardData';

interface StudentDataInsightsProps {
  stats: StudentStats | null;
  loading?: boolean;
}

export default function StudentDataInsights({ stats, loading }: StudentDataInsightsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <DataInsightCard
        title="Upcoming Deadlines"
        description="Assignments and exams due in the next 7 days"
        value={stats?.pendingAssignments || 0}
        icon="clock"
        color="red"
        href="/student/assignments?filter=upcoming"
        badge={{
          text: "Urgent",
          color: "red"
        }}
      />

      <DataInsightCard
        title="Recent Achievements"
        description="Awards and recognitions earned this term"
        value={stats?.achievements || 0}
        icon="award"
        color="green"
        href="/student/academic-logs?filter=achievements"
        badge={{
          text: "Celebrate",
          color: "green"
        }}
        trend={{
          value: 33,
          isPositive: true
        }}
      />

      <DataInsightCard
        title="Course Progress"
        description="Overall completion rate across all subjects"
        value={Math.round((stats?.completedAssignments || 0) / ((stats?.completedAssignments || 0) + (stats?.pendingAssignments || 1)) * 100)}
        icon="trending-up"
        color="blue"
        href="/student/courses?view=progress"
        badge={{
          text: "On Track",
          color: "blue"
        }}
        trend={{
          value: 8.5,
          isPositive: true
        }}
      />

      <DataInsightCard
        title="Upcoming Exams"
        description="Scheduled examinations and assessments"
        value={stats?.upcomingExams || 0}
        icon="file-text"
        color="purple"
        href="/student/exams"
        badge={{
          text: "Prepare",
          color: "purple"
        }}
      />

      <DataInsightCard
        title="Study Streak"
        description="Consecutive days of active learning"
        value={Math.floor((stats?.recentActivity || 0) / 2)}
        icon="flame"
        color="orange"
        href="/student/analytics?view=activity"
        badge={{
          text: "Keep Going",
          color: "orange"
        }}
        trend={{
          value: 15,
          isPositive: true
        }}
      />

      <DataInsightCard
        title="Fee Status"
        description="Current month payment status"
        value={stats?.outstandingDues === 0 ? "Paid" : stats?.outstandingDues?.toLocaleString() || "0"}
        icon="credit-card"
        color={stats?.outstandingDues === 0 ? "green" : "red"}
        href="/student/fees"
        badge={{
          text: stats?.outstandingDues === 0 ? "Current" : "Due",
          color: stats?.outstandingDues === 0 ? "green" : "red"
        }}
      />
    </div>
  );
}
