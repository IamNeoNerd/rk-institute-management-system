'use client';

import { ManagementCard } from '@/components/hub';
import { Users, CreditCard, FileText, MessageSquare, BarChart3, Calendar } from 'lucide-react';

export default function ParentManagementActions() {
  return (
    <div className="animate-slide-up">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Family Management
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ManagementCard
          href="/parent/children"
          icon={Users}
          title="My Children"
          description="View individual progress, grades, and academic details for each child"
          color="blue"
          delay={0.1}
        />
        <ManagementCard
          href="/parent/fees"
          icon={CreditCard}
          title="Fees & Payments"
          description="Manage fee payments, view bills, and track payment history"
          color="green"
          delay={0.2}
        />
        <ManagementCard
          href="/parent/academic"
          icon={FileText}
          title="Academic Progress"
          description="Track achievements, progress reports, and academic milestones"
          color="purple"
          delay={0.3}
        />
        <ManagementCard
          href="/parent/messages"
          icon={MessageSquare}
          title="Communication"
          description="Connect with teachers, view updates, and school announcements"
          color="orange"
          delay={0.4}
        />
        <ManagementCard
          href="/parent/analytics"
          icon={BarChart3}
          title="Family Analytics"
          description="View detailed analytics on family academic performance"
          color="indigo"
          delay={0.5}
        />
        <ManagementCard
          href="/parent/events"
          icon={Calendar}
          title="Events & Calendar"
          description="View school events, parent meetings, and important dates"
          color="teal"
          delay={0.6}
        />
      </div>
    </div>
  );
}
