'use client';

import ActionCard from '@/components/cards/ActionCard';
import { TeacherStats } from '@/hooks/teacher/useTeacherDashboardData';

interface TeacherQuickActionsProps {
  stats: TeacherStats | null;
}

export default function TeacherQuickActions({ stats }: TeacherQuickActionsProps) {
  return (
    <div className="animate-slide-up">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          title="Create Academic Log"
          description="Record student progress, achievements, or concerns"
          icon="📝"
          color="blue"
          action={{
            type: "link",
            href: "/teacher/academic-logs?action=create",
            label: "Create Log"
          }}
        />

        <ActionCard
          title="New Assignment"
          description="Create homework, projects, or study materials"
          icon="📋"
          color="green"
          action={{
            type: "link",
            href: "/teacher/assignments?action=create",
            label: "Create Assignment"
          }}
        />

        <ActionCard
          title="Grade Assignments"
          description="Review and grade pending student submissions"
          icon="✅"
          color="orange"
          action={{
            type: "link",
            href: "/teacher/assignments?filter=pending",
            label: "Grade Now"
          }}
        />

        <ActionCard
          title="Student Progress Report"
          description="Generate comprehensive progress reports"
          icon="📊"
          color="purple"
          action={{
            type: "link",
            href: "/teacher/reports?type=progress",
            label: "Generate Report"
          }}
        />

        <ActionCard
          title="Course Analytics"
          description="View detailed course performance metrics"
          icon="📈"
          color="indigo"
          action={{
            type: "link",
            href: "/teacher/analytics?view=courses",
            label: "View Analytics"
          }}
        />

        <ActionCard
          title="Parent Communication"
          description="Send updates to parents about student progress"
          icon="📧"
          color="teal"
          action={{
            type: "link",
            href: "/teacher/communication?type=parent",
            label: "Send Update"
          }}
        />

        <ActionCard
          title="Lesson Planning"
          description="Plan and organize upcoming lessons and activities"
          icon="📅"
          color="yellow"
          action={{
            type: "link",
            href: "/teacher/lessons?action=plan",
            label: "Plan Lesson"
          }}
        />

        <ActionCard
          title="Resource Library"
          description="Access teaching materials and educational resources"
          icon="📚"
          color="red"
          action={{
            type: "link",
            href: "/teacher/resources",
            label: "Browse Resources"
          }}
        />
      </div>
    </div>
  );
}
