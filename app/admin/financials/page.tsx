'use client';

import { useState } from 'react';

import {
  FinancialStatsOverview,
  FinancialQuickActions,
  FinancialModuleCards,
  FinancialHealthOverview,
  FinancialDataInsights,
  FinancialStats,
  FinancialQuickAction
} from '@/components/features/financial-hub';
import AdminLayout from '@/components/layout/AdminLayout';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

export default function FinancialsHubPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick actions configuration with professional icons
  const quickActions: FinancialQuickAction[] = [
    {
      id: 'record-payment',
      title: 'Record Payment',
      description: 'Record a new payment from a family',
      icon: <ProfessionalIcon name='money' size={20} />,
      href: '/admin/payments?action=add',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'generate-bills',
      title: 'Generate Bills',
      description: 'Create monthly fee allocations',
      icon: <ProfessionalIcon name='report' size={20} />,
      href: '/admin/fees?action=generate',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'send-reminders',
      title: 'Send Reminders',
      description: 'Send payment reminders to families',
      icon: <ProfessionalIcon name='email' size={20} />,
      href: '/admin/operations?tab=reminders',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'financial-reports',
      title: 'Financial Reports',
      description: 'Generate comprehensive financial reports',
      icon: <ProfessionalIcon name='analytics' size={20} />,
      href: '/admin/reports?tab=automated',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  // Module cards configuration with professional icons
  const moduleCards = [
    {
      id: 'fees',
      title: 'Fee Management',
      description: 'Manage fee structures, allocations, and billing cycles',
      icon: (
        <ProfessionalIcon name='payment' size={32} className='text-white' />
      ),
      href: '/admin/fees',
      color: 'from-blue-500 to-blue-600',
      stats: []
    },
    {
      id: 'payments',
      title: 'Payment Processing',
      description:
        'Record payments, track transactions, and manage payment history',
      icon: <ProfessionalIcon name='money' size={32} className='text-white' />,
      href: '/admin/payments',
      color: 'from-green-500 to-green-600',
      stats: []
    },
    {
      id: 'outstanding',
      title: 'Outstanding Dues',
      description:
        'Track overdue payments, manage collections, and follow up with families',
      icon: (
        <ProfessionalIcon name='warning' size={32} className='text-white' />
      ),
      href: '/admin/fees?filter=overdue',
      color: 'from-red-500 to-red-600',
      stats: []
    }
  ];

  return (
    <AdminLayout>
      {/* Data Management Component - handles all API calls and state */}
      <FinancialDataInsights
        onStatsUpdate={setStats}
        onLoadingChange={setLoading}
        onErrorChange={setError}
      />

      <div className='space-y-8'>
        {/* Header and Financial KPIs */}
        <FinancialStatsOverview stats={stats} loading={loading} error={error} />

        {/* Quick Actions Section */}
        <FinancialQuickActions actions={quickActions} />

        {/* Module Cards Section */}
        <FinancialModuleCards modules={moduleCards} stats={stats} />

        {/* Financial Health and Recent Activity */}
        <FinancialHealthOverview stats={stats} />
      </div>
    </AdminLayout>
  );
}
