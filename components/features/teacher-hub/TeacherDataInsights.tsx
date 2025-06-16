'use client';

import DataInsightCard from '@/components/cards/DataInsightCard';
import { TeacherStats } from '@/hooks/teacher/useTeacherDashboardData';

interface TeacherDataInsightsProps {
  stats: TeacherStats | null;
  loading?: boolean;
}

export default function TeacherDataInsights({ stats, loading }: TeacherDataInsightsProps) {
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
        title="Students Needing Attention"
        description="Students with recent concerns or declining performance"
        value={stats?.concerns || 0}
        icon="alert-triangle"
        color="red"
        href="/teacher/students?filter=concerns"
        badge={{
          text: "Priority",
          color: "red"
        }}
        trend={{
          value: 8,
          isPositive: false
        }}
      />

      <DataInsightCard
        title="Recent Achievements"
        description="Student accomplishments and milestones this month"
        value={stats?.achievements || 0}
        icon="award"
        color="green"
        href="/teacher/academic-logs?filter=achievements"
        badge={{
          text: "Celebrate",
          color: "green"
        }}
        trend={{
          value: 22,
          isPositive: true
        }}
      />

      <DataInsightCard
        title="Pending Assignments"
        description="Assignments awaiting review and grading"
        value={stats ? (stats.activeAssignments - stats.completedAssignments) : 0}
        icon="clock"
        color="yellow"
        href="/teacher/assignments?filter=pending"
        badge={{
          text: "Review",
          color: "yellow"
        }}
      />

      <DataInsightCard
        title="Course Performance"
        description="Average student performance across all courses"
        value={stats?.averageGrade || 0}
        icon="trending-up"
        color="blue"
        href="/teacher/analytics?view=performance"
        badge={{
          text: "Excellent",
          color: "blue"
        }}
        trend={{
          value: 5.2,
          isPositive: true
        }}
      />

      <DataInsightCard
        title="Progress Reports Due"
        description="Upcoming progress reports and evaluations"
        value={Math.floor((stats?.totalStudents || 0) * 0.3)}
        icon="file-text"
        color="purple"
        href="/teacher/academic-logs?action=create&type=progress"
        badge={{
          text: "Due Soon",
          color: "purple"
        }}
      />

      <DataInsightCard
        title="Active Discussions"
        description="Recent student interactions and engagement"
        value={stats?.recentActivity || 0}
        icon="users"
        color="indigo"
        href="/teacher/students?view=activity"
        badge={{
          text: "Engaged",
          color: "purple"
        }}
        trend={{
          value: 12.8,
          isPositive: true
        }}
      />
    </div>
  );
}
