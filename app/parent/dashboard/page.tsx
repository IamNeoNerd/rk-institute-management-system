'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ParentLayout from '@/components/layout/ParentLayout';
import { Toaster } from 'react-hot-toast';
import { Users, CreditCard, FileText, Target, BarChart3 } from 'lucide-react';
import { HubHeader, HubActionButton } from '@/components/hub';

// Custom hook for data management
import { useParentDashboardData } from '@/hooks/parent/useParentDashboardData';

// Shared UI components
import ErrorAlert from '@/components/ui/feedback/ErrorAlert';
import LoadingSpinner from '@/components/ui/feedback/LoadingSpinner';

// Feature components (critical above-the-fold)
import ParentStatsOverview from '@/components/features/parent-hub/ParentStatsOverview';
import ParentManagementActions from '@/components/features/parent-hub/ParentManagementActions';

// Dynamic feature components (below-the-fold)
const ParentDataInsights = dynamic(() => import('@/components/features/parent-hub/ParentDataInsights'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
});

const ParentAnalyticsCharts = dynamic(() => import('@/components/features/parent-hub/ParentAnalyticsCharts'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
});

const ParentQuickActions = dynamic(() => import('@/components/features/parent-hub/ParentQuickActions'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>
});

const ParentFamilyOverview = dynamic(() => import('@/components/features/parent-hub/ParentFamilyOverview'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-48"></div>
});

export default function ParentDashboard() {
  // Use custom hook for all data management
  const { familyProfile, stats, loading, error } = useParentDashboardData();

  // Loading state with improved UX
  if (loading) {
    return (
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" message="Loading family dashboard..." />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <Toaster position="top-right" />
      <div className="space-y-8">
        {/* Header - Critical above-the-fold content */}
        <HubHeader
          title="Parent Dashboard"
          subtitle="Manage your family's academic journey and stay connected with your children's progress"
          actions={
            <>
              <HubActionButton href="/parent/analytics" icon={BarChart3} label="Family Analytics" color="gray" />
              <HubActionButton href="/parent/fees?action=pay" icon={CreditCard} label="Pay Fees" color="green" />
              <HubActionButton href="/parent/messages?action=compose" icon={FileText} label="Message Teachers" color="blue" />
            </>
          }
        />

        {/* Error handling with shared component */}
        {error && <ErrorAlert message={error} />}

        {/* Family Overview - Above-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-48"></div>}>
          <ParentFamilyOverview familyProfile={familyProfile} loading={loading} />
        </Suspense>

        {/* Key Metrics - Critical above-the-fold content */}
        <ParentStatsOverview stats={stats} loading={loading} />

        {/* Primary Management Actions - Critical above-the-fold content */}
        <ParentManagementActions />

        {/* Data Insights - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>}>
          <div className="animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Family Insights
            </h3>
            <ParentDataInsights stats={stats} loading={loading} />
          </div>
        </Suspense>

        {/* Data Visualization - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>}>
          <ParentAnalyticsCharts stats={stats} loading={loading} />
        </Suspense>

        {/* Quick Actions - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>}>
          <ParentQuickActions stats={stats} />
        </Suspense>
      </div>
    </ParentLayout>
  );
}




