'use client';

import Link from 'next/link';
import { PeopleStatsOverviewProps } from './types';
import { PageHeader, Grid, StatsCard, ErrorState, StatsCardSkeleton } from '@/components/ui';

/**
 * People Stats Overview Component
 *
 * Displays the header section with title, description, and action buttons
 * for the People Hub using the UI component library.
 *
 * Design Features:
 * - Uses PageHeader component for consistent styling
 * - StatsCard components for metrics display
 * - Grid layout for responsive design
 * - Error and loading states from UI library
 */

export default function PeopleStatsOverview({
  stats,
  loading,
  error
}: PeopleStatsOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="People Management"
        subtitle="Unified hub for managing students, families, and users"
        actions={
          <>
            <Link
              href="/admin/people/search"
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🔍 Advanced Search
            </Link>
            <Link
              href="/admin/people/reports"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              📊 People Reports
            </Link>
          </>
        }
      />

      {/* Error Display */}
      {error && (
        <ErrorState
          message={error}
          retry={{
            label: 'Retry',
            onClick: () => window.location.reload()
          }}
        />
      )}

      {/* Loading State */}
      {loading && (
        <Grid cols={6} responsive={{ sm: 2, md: 3, lg: 6 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </Grid>
      )}

      {/* Quick Stats Summary */}
      {stats && !loading && (
        <Grid cols={6} responsive={{ sm: 2, md: 3, lg: 6 }} className="animate-fade-in">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            color="blue"
            icon="👥"
          />
          <StatsCard
            title="Total Families"
            value={stats.totalFamilies}
            color="green"
            icon="👨‍👩‍👧‍👦"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            color="purple"
            icon="👤"
          />
          <StatsCard
            title="Active Students"
            value={stats.activeStudents}
            color="orange"
            icon="🎓"
          />
          <StatsCard
            title="Recent Enrollments"
            value={stats.recentEnrollments}
            color="teal"
            icon="📝"
          />
          <StatsCard
            title="Pending Users"
            value={stats.pendingUsers}
            color="red"
            icon="⏳"
          />
        </Grid>
      )}
    </div>
  );
}
