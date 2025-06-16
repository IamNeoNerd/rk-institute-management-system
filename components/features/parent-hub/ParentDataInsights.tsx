'use client';

import DataInsightCard from '@/components/cards/DataInsightCard';
import { ParentStats } from '@/hooks/parent/useParentDashboardData';

interface ParentDataInsightsProps {
  stats: ParentStats | null;
  loading?: boolean;
}

export default function ParentDataInsights({ stats, loading }: ParentDataInsightsProps) {
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
        title="Pending Assignments"
        description="Assignments across all children requiring attention"
        value={stats?.pendingAssignments || 0}
        icon="clock"
        color="red"
        href="/parent/assignments?filter=pending"
        badge={{
          text: "Monitor",
          color: "red"
        }}
      />

      <DataInsightCard
        title="Family Achievements"
        description="Recent accomplishments and milestones this month"
        value={stats?.totalAchievements || 0}
        icon="award"
        color="green"
        href="/parent/academic?filter=achievements"
        badge={{
          text: "Celebrate",
          color: "green"
        }}
        trend={{
          value: 25,
          isPositive: true
        }}
      />

      <DataInsightCard
        title="Teacher Messages"
        description="Unread messages and updates from teachers"
        value={stats?.teacherMessages || 0}
        icon="message-square"
        color="blue"
        href="/parent/messages?filter=unread"
        badge={{
          text: "New",
          color: "blue"
        }}
      />

      <DataInsightCard
        title="Upcoming Events"
        description="School events, meetings, and important dates"
        value={stats?.upcomingEvents || 0}
        icon="calendar"
        color="purple"
        href="/parent/events"
        badge={{
          text: "Schedule",
          color: "purple"
        }}
      />

      <DataInsightCard
        title="Payment Status"
        description="Current month fee payment status"
        value={stats?.outstandingDues === 0 ? "Paid" : `₹${stats?.outstandingDues?.toLocaleString()}`}
        icon="credit-card"
        color={stats?.outstandingDues === 0 ? "green" : "red"}
        href="/parent/fees"
        badge={{
          text: stats?.outstandingDues === 0 ? "Current" : "Due",
          color: stats?.outstandingDues === 0 ? "green" : "red"
        }}
      />

      <DataInsightCard
        title="Family Progress"
        description="Overall academic progress across all children"
        value={`${stats?.averageFamilyGrade || 0}%`}
        icon="trending-up"
        color="indigo"
        href="/parent/analytics?view=family"
        badge={{
          text: "Excellent",
          color: "indigo"
        }}
        trend={{
          value: 4.2,
          isPositive: true
        }}
      />
    </div>
  );
}
