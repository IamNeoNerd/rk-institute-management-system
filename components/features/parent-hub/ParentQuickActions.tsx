'use client';

import ActionCard from '@/components/cards/ActionCard';
import { ParentStats } from '@/hooks/parent/useParentDashboardData';

interface ParentQuickActionsProps {
  stats: ParentStats | null;
}

export default function ParentQuickActions({ stats }: ParentQuickActionsProps) {
  return (
    <div className="animate-slide-up">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          title="Pay Fees"
          description="Make fee payments for all children"
          icon="💳"
          color="green"
          action={{
            type: "link",
            href: "/parent/fees?action=pay",
            label: "Pay Now"
          }}
        />

        <ActionCard
          title="View Report Cards"
          description="Download academic reports for each child"
          icon="📊"
          color="blue"
          action={{
            type: "link",
            href: "/parent/reports",
            label: "View Reports"
          }}
        />

        <ActionCard
          title="Schedule Meeting"
          description="Book parent-teacher conferences"
          icon="📅"
          color="purple"
          action={{
            type: "link",
            href: "/parent/meetings?action=schedule",
            label: "Schedule"
          }}
        />

        <ActionCard
          title="Message Teachers"
          description="Send messages to your children's teachers"
          icon="📧"
          color="orange"
          action={{
            type: "link",
            href: "/parent/messages?action=compose",
            label: "Send Message"
          }}
        />

        <ActionCard
          title="Update Profile"
          description="Manage family contact information"
          icon="👨‍👩‍👧‍👦"
          color="indigo"
          action={{
            type: "link",
            href: "/parent/profile",
            label: "Update Info"
          }}
        />

        <ActionCard
          title="View Calendar"
          description="Check school events and important dates"
          icon="📆"
          color="teal"
          action={{
            type: "link",
            href: "/parent/calendar",
            label: "View Calendar"
          }}
        />

        <ActionCard
          title="Download Receipts"
          description="Get fee payment receipts and invoices"
          icon="📄"
          color="yellow"
          action={{
            type: "link",
            href: "/parent/receipts",
            label: "Download"
          }}
        />

        <ActionCard
          title="Emergency Contacts"
          description="Update emergency contact information"
          icon="🚨"
          color="red"
          action={{
            type: "link",
            href: "/parent/emergency-contacts",
            label: "Update"
          }}
        />
      </div>
    </div>
  );
}
