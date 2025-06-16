'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Toaster } from 'react-hot-toast';
import { BookOpen, Users, FileText, Target } from 'lucide-react';
import { HubHeader, HubActionButton } from '@/components/hub';

// Custom hook for data management
import { useTeacherDashboardData } from '@/hooks/teacher/useTeacherDashboardData';

// Shared UI components
import ErrorAlert from '@/components/ui/feedback/ErrorAlert';
import LoadingSpinner from '@/components/ui/feedback/LoadingSpinner';

// Feature components (critical above-the-fold)
import TeacherStatsOverview from '@/components/features/teacher-hub/TeacherStatsOverview';
import TeacherManagementActions from '@/components/features/teacher-hub/TeacherManagementActions';

// Dynamic feature components (below-the-fold)
const TeacherDataInsights = dynamic(() => import('@/components/features/teacher-hub/TeacherDataInsights'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
});

const TeacherAnalyticsCharts = dynamic(() => import('@/components/features/teacher-hub/TeacherAnalyticsCharts'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
});

const TeacherQuickActions = dynamic(() => import('@/components/features/teacher-hub/TeacherQuickActions'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>
});

export default function TeacherDashboard() {
  // Use custom hook for all data management
  const { stats, loading, error } = useTeacherDashboardData();

  // Loading state with improved UX
  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" message="Loading teacher dashboard..." />
        </div>
      </TeacherLayout>
    );
  }



  return (
    <TeacherLayout>
      <Toaster position="top-right" />
      <div className="space-y-8">
        {/* Header - Critical above-the-fold content */}
        <HubHeader
          title="Teacher Dashboard"
          subtitle="Comprehensive academic management and student progress tracking"
          actions={
            <>
              <HubActionButton href="/teacher/analytics" icon={BarChart3} label="Teaching Analytics" color="gray" />
              <HubActionButton href="/teacher/academic-logs?action=create" icon={FileText} label="Create Log" color="green" />
              <HubActionButton href="/teacher/assignments?action=create" icon={Target} label="New Assignment" color="blue" />
            </>
          }
        />

        {/* Error handling with shared component */}
        {error && <ErrorAlert message={error} />}

        {/* Key Metrics - Critical above-the-fold content */}
        <TeacherStatsOverview stats={stats} loading={loading} />

        {/* Primary Management Actions - Critical above-the-fold content */}
        <TeacherManagementActions />

        {/* Data Insights - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>}>
          <div className="animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Teaching Insights
            </h3>
            <TeacherDataInsights stats={stats} loading={loading} />
          </div>
        </Suspense>

        {/* Data Visualization - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>}>
          <TeacherAnalyticsCharts stats={stats} loading={loading} />
        </Suspense>

        {/* Quick Actions - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>}>
          <TeacherQuickActions stats={stats} />
        </Suspense>
      </div>
    </TeacherLayout>
  );
}


