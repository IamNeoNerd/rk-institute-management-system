'use client';

import { ManagementCard } from '@/components/hub';
import { Users, UserCheck, Shield } from 'lucide-react';

export default function PeopleManagementActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ManagementCard
        href="/admin/students"
        icon={Users}
        title="Manage Students"
        description="View, edit, and manage student records, enrollments, and academic progress"
        color="blue"
        delay={0.1}
      />
      <ManagementCard
        href="/admin/families"
        icon={UserCheck}
        title="Manage Families"
        description="Handle family profiles, relationships, contact information, and billing"
        color="green"
        delay={0.2}
      />
      <ManagementCard
        href="/admin/users"
        icon={Shield}
        title="Manage Users"
        description="Control user accounts, roles, permissions, and access management"
        color="purple"
        delay={0.3}
      />
    </div>
  );
}
