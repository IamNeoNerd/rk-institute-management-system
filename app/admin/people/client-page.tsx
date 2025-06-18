'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/layout/AdminLayout';
import { Toaster } from 'react-hot-toast';
import { Search, Users, FileText } from 'lucide-react';
import { HubHeader, HubActionButton } from '@/components/hub';

// Custom hook for data management
import { usePeopleHubData } from '@/hooks/people/usePeopleHubData';

// Shared UI components
import ErrorAlert from '@/components/ui/feedback/ErrorAlert';
import LoadingSpinner from '@/components/ui/feedback/LoadingSpinner';

// Feature components (critical above-the-fold)
import PeopleStatsOverview from '@/components/features/people-hub/PeopleStatsOverview';
import PeopleManagementActions from '@/components/features/people-hub/PeopleManagementActions';

// Dynamic feature components with SSR disabled (Phase 2 Critical SSR Fix)
const PeopleDataInsights = dynamic(() => import('@/components/features/people-hub/PeopleDataInsights'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>,
  ssr: false
});

const PeopleAnalyticsCharts = dynamic(() => import('@/components/features/people-hub/PeopleAnalyticsCharts'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>,
  ssr: false
});

const PeopleReportSection = dynamic(() => import('@/components/features/people-hub/PeopleReportSection'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>,
  ssr: false
});

export default function PeopleHubClientPage() {
  // Use custom hook for all data management (SSR-safe)
  const { stats, loading, error } = usePeopleHubData();

  // Loading state with improved UX
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" message="Loading people data..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="space-y-8">
        {/* Header - Critical above-the-fold content */}
        <HubHeader
          title="People Management"
          subtitle="Comprehensive insights and management for students, families, and users"
          actions={
            <>
              <HubActionButton href="/admin/people/search" icon={Search} label="Advanced Search" color="gray" />
              <HubActionButton href="/admin/people/import" icon={Users} label="Bulk Import" color="green" />
              <HubActionButton href="/admin/people/reports" icon={FileText} label="People Reports" color="blue" />
            </>
          }
        />

        {/* Error handling with shared component */}
        {error && <ErrorAlert message={error} />}

        {/* Key Metrics - Critical above-the-fold content */}
        <PeopleStatsOverview stats={stats} loading={loading} />

        {/* Primary Management Actions - Critical above-the-fold content */}
        <PeopleManagementActions />

        {/* Data Insights - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>}>
          <div className="animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              People Insights
            </h3>
            <PeopleDataInsights stats={stats} loading={loading} />
          </div>
        </Suspense>

        {/* Data Visualization - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>}>
          <PeopleAnalyticsCharts stats={stats} loading={loading} />
        </Suspense>

        {/* Report Generation - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>}>
          <PeopleReportSection stats={stats} />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
