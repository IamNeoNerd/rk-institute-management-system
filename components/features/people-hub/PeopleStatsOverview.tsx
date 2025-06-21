'use client';

import Link from 'next/link';
import { PeopleStatsOverviewProps } from './types';

/**
 * People Stats Overview Component
 * 
 * Displays the header section with title, description, and action buttons
 * for the People Hub. Maintains professional RK Institute design consistency.
 * 
 * Design Features:
 * - Gradient text headings for professional appearance
 * - Consistent button styling with hover animations
 * - Responsive layout with proper spacing
 * - Error handling with professional error display
 */

export default function PeopleStatsOverview({ 
  stats, 
  loading, 
  error 
}: PeopleStatsOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            People Management
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Unified hub for managing students, families, and users
          </p>
        </div>
        <div className="flex space-x-4">
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
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl animate-fade-in">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-xl animate-fade-in">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading people statistics...
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      {stats && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalFamilies}</div>
            <div className="text-sm text-gray-600">Total Families</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.activeStudents}</div>
            <div className="text-sm text-gray-600">Active Students</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-teal-600">{stats.recentEnrollments}</div>
            <div className="text-sm text-gray-600">Recent Enrollments</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.pendingUsers}</div>
            <div className="text-sm text-gray-600">Pending Users</div>
          </div>
        </div>
      )}
    </div>
  );
}
