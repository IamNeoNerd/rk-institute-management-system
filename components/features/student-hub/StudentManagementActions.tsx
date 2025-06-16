'use client';

import { ManagementCard } from '@/components/hub';
import { BookOpen, PenTool, FileText, CreditCard, BarChart3, Users } from 'lucide-react';

export default function StudentManagementActions() {
  return (
    <div className="animate-slide-up">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Academic Management
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ManagementCard
          href="/student/courses"
          icon={BookOpen}
          title="My Courses"
          description="View enrolled courses, access materials, and track progress"
          color="blue"
          delay={0.1}
        />
        <ManagementCard
          href="/student/assignments"
          icon={PenTool}
          title="Assignments"
          description="View homework, submit assignments, and track deadlines"
          color="green"
          delay={0.2}
        />
        <ManagementCard
          href="/student/academic-logs"
          icon={FileText}
          title="Academic Progress"
          description="View progress reports, achievements, and teacher feedback"
          color="purple"
          delay={0.3}
        />
        <ManagementCard
          href="/student/fees"
          icon={CreditCard}
          title="Fees & Payments"
          description="View fee structure, payment history, and outstanding dues"
          color="orange"
          delay={0.4}
        />
        <ManagementCard
          href="/student/analytics"
          icon={BarChart3}
          title="Performance Analytics"
          description="View detailed analytics on academic performance and progress"
          color="indigo"
          delay={0.5}
        />
        <ManagementCard
          href="/student/profile"
          icon={Users}
          title="My Profile"
          description="Manage personal information and account settings"
          color="teal"
          delay={0.6}
        />
      </div>
    </div>
  );
}
