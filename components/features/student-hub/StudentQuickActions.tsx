'use client';

import ActionCard from '@/components/cards/ActionCard';
import { StudentStats } from '@/hooks/student/useStudentDashboardData';

interface StudentQuickActionsProps {
  stats: StudentStats | null;
}

export default function StudentQuickActions({ stats }: StudentQuickActionsProps) {
  return (
    <div className="animate-slide-up">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          title="Submit Assignment"
          description="Upload and submit your completed homework"
          icon="📝"
          color="blue"
          action={{
            type: "link",
            href: "/student/assignments?action=submit",
            label: "Submit Work"
          }}
        />

        <ActionCard
          title="View Grades"
          description="Check your latest test scores and feedback"
          icon="📊"
          color="green"
          action={{
            type: "link",
            href: "/student/grades",
            label: "View Grades"
          }}
        />

        <ActionCard
          title="Study Materials"
          description="Access course materials and study resources"
          icon="📚"
          color="purple"
          action={{
            type: "link",
            href: "/student/courses?view=materials",
            label: "Study Now"
          }}
        />

        <ActionCard
          title="Pay Fees"
          description="Make fee payments and view payment history"
          icon="💳"
          color="orange"
          action={{
            type: "link",
            href: "/student/fees?action=pay",
            label: "Pay Now"
          }}
        />

        <ActionCard
          title="Schedule Study Session"
          description="Book study rooms or schedule tutoring sessions"
          icon="📅"
          color="indigo"
          action={{
            type: "link",
            href: "/student/schedule",
            label: "Book Session"
          }}
        />

        <ActionCard
          title="Contact Teacher"
          description="Send messages to your teachers for help"
          icon="📧"
          color="teal"
          action={{
            type: "link",
            href: "/student/messages?type=teacher",
            label: "Send Message"
          }}
        />

        <ActionCard
          title="Download Reports"
          description="Get your academic progress and performance reports"
          icon="📄"
          color="yellow"
          action={{
            type: "link",
            href: "/student/reports",
            label: "Download"
          }}
        />

        <ActionCard
          title="Join Study Group"
          description="Connect with classmates for group study sessions"
          icon="👥"
          color="red"
          action={{
            type: "link",
            href: "/student/study-groups",
            label: "Join Group"
          }}
        />
      </div>
    </div>
  );
}
