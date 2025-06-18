'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import StudentLayout from '@/components/layout/StudentLayout';
import { Toaster } from 'react-hot-toast';
import { BookOpen, CreditCard, FileText, Target, BarChart3 } from 'lucide-react';
import { HubHeader, HubActionButton } from '@/components/hub';

// Custom hook for data management
import { useStudentDashboardData } from '@/hooks/student/useStudentDashboardData';

// Shared UI components
import ErrorAlert from '@/components/ui/feedback/ErrorAlert';
import LoadingSpinner from '@/components/ui/feedback/LoadingSpinner';

// Feature components (critical above-the-fold)
import StudentStatsOverview from '@/components/features/student-hub/StudentStatsOverview';
import StudentManagementActions from '@/components/features/student-hub/StudentManagementActions';

// Dynamic feature components (SSR disabled for vendor bundle compatibility)
const StudentDataInsights = dynamic(() => import('@/components/features/student-hub/StudentDataInsights'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>,
  ssr: false
});

const StudentAnalyticsCharts = dynamic(() => import('@/components/features/student-hub/StudentAnalyticsCharts'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>,
  ssr: false
});

const StudentQuickActions = dynamic(() => import('@/components/features/student-hub/StudentQuickActions'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>
});

const StudentProfileSummary = dynamic(() => import('@/components/features/student-hub/StudentProfileSummary'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-48"></div>
});

export default function StudentDashboard() {
  // Use custom hook for all data management
  const { profile, stats, loading, error } = useStudentDashboardData();

  // Loading state with improved UX
  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" message="Loading student dashboard..." />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <Toaster position="top-right" />
      <div className="space-y-8">
        {/* Header - Critical above-the-fold content */}
        <HubHeader
          title="Student Dashboard"
          subtitle="Track your academic progress, assignments, and learning journey"
          actions={
            <>
              <HubActionButton href="/student/analytics" icon={BarChart3} label="Performance Analytics" color="gray" />
              <HubActionButton href="/student/assignments?action=submit" icon={FileText} label="Submit Assignment" color="green" />
              <HubActionButton href="/student/fees?action=pay" icon={CreditCard} label="Pay Fees" color="blue" />
            </>
          }
        />

        {/* Error handling with shared component */}
        {error && <ErrorAlert message={error} />}

        {/* Student Profile Summary - Above-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-48"></div>}>
          <StudentProfileSummary profile={profile} loading={loading} />
        </Suspense>

        {/* Key Metrics - Critical above-the-fold content */}
        <StudentStatsOverview stats={stats} loading={loading} />

        {/* Primary Management Actions - Critical above-the-fold content */}
        <StudentManagementActions />

        {/* Data Insights - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>}>
          <div className="animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Academic Insights
            </h3>
            <StudentDataInsights stats={stats} loading={loading} />
          </div>
        </Suspense>

        {/* Data Visualization - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>}>
          <StudentAnalyticsCharts stats={stats} loading={loading} />
        </Suspense>

        {/* Quick Actions - Lazy loaded below-the-fold content */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>}>
          <StudentQuickActions stats={stats} />
        </Suspense>
      </div>
    </StudentLayout>
  );
}