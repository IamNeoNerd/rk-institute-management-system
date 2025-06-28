'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  PeopleStatsOverview,
  PeopleQuickActions,
  PeopleModuleCards,
  PeopleRecentActivity,
  PeopleDataInsights,
  PeopleStats,
  QuickAction
} from '@/components/features/people-hub';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

export default function PeopleHubPage() {
  const [stats, setStats] = useState<PeopleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick actions configuration with professional icons
  const quickActions: QuickAction[] = [
    {
      id: 'add-student',
      title: 'Add New Student',
      description: 'Enroll a new student in the institute',
      icon: <ProfessionalIcon name="enrollment" size={20} />,
      href: '/admin/students?action=add',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'add-family',
      title: 'Add New Family',
      description: 'Register a new family in the system',
      icon: <ProfessionalIcon name="family" size={20} />,
      href: '/admin/families?action=add',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'add-user',
      title: 'Add New User',
      description: 'Create a new system user account',
      icon: <ProfessionalIcon name="user-plus" size={20} />,
      href: '/admin/users?action=add',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'bulk-import',
      title: 'Bulk Import',
      description: 'Import multiple records from spreadsheet',
      icon: <ProfessionalIcon name="upload" size={20} />,
      href: '/admin/people/import',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  // Module cards configuration with professional icons
  const moduleCards = [
    {
      id: 'students',
      title: 'Student Records',
      description: 'Manage student profiles, enrollment, and academic information',
      icon: <ProfessionalIcon name="students" size={32} className="text-white" />,
      href: '/admin/students',
      color: 'from-blue-500 to-blue-600',
      stats: []
    },
    {
      id: 'families',
      title: 'Family Management',
      description: 'Manage family profiles, relationships, and contact information',
      icon: <ProfessionalIcon name="family" size={32} className="text-white" />,
      href: '/admin/families',
      color: 'from-green-500 to-green-600',
      stats: []
    },
    {
      id: 'users',
      title: 'User Accounts',
      description: 'Manage system users, roles, and access permissions',
      icon: <ProfessionalIcon name="user" size={32} className="text-white" />,
      href: '/admin/users',
      color: 'from-purple-500 to-purple-600',
      stats: []
    }
  ];

  return (
    <AdminLayout>
      {/* Data Management Component - handles all API calls and state */}
      <PeopleDataInsights
        onStatsUpdate={setStats}
        onLoadingChange={setLoading}
        onErrorChange={setError}
      />

      <div className="space-y-8">
        {/* Header and Stats Overview */}
        <PeopleStatsOverview
          stats={stats}
          loading={loading}
          error={error}
        />

        {/* Quick Actions Section */}
        <PeopleQuickActions actions={quickActions} />

        {/* Module Cards Section */}
        <PeopleModuleCards
          modules={moduleCards}
          stats={stats}
        />

        {/* Recent Activity Section */}
        <PeopleRecentActivity />
      </div>
    </AdminLayout>
  );
}
