'use client';

import Link from 'next/link';
import { FinancialStatsOverviewProps } from './types';

/**
 * Financial Stats Overview Component
 * 
 * Displays the header section with title, description, action buttons,
 * and key financial performance indicators (KPIs) for the Financial hub.
 * 
 * Design Features:
 * - Gradient text headings for professional appearance
 * - Financial KPI cards with color-coded metrics
 * - Consistent button styling with hover animations
 * - Responsive layout with proper spacing
 * - Error handling with professional error display
 */

export default function FinancialStatsOverview({ 
  stats, 
  loading, 
  error 
}: FinancialStatsOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Financial Management
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Unified hub for fees, payments and financial operations
          </p>
        </div>
        <div className="flex space-x-4">
          <Link
            href="/admin/financials/analytics"
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            📈 Financial Analytics
          </Link>
          <Link
            href="/admin/reports"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            📊 Reports & Analytics
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
            Loading financial data...
          </div>
        </div>
      )}

      {/* Financial KPIs */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{stats?.totalRevenueThisMonth?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-green-500 text-2xl">💰</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Current month collections</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Dues</p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{stats?.totalOutstandingDues?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-red-500 text-2xl">⚠️</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Pending collections</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.collectionEfficiency || 0}%
                </p>
              </div>
              <div className="text-blue-500 text-2xl">📊</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Payment efficiency</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Payments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.recentPaymentActivity || 0}
                </p>
              </div>
              <div className="text-purple-500 text-2xl">🔄</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
          </div>
        </div>
      )}
    </div>
  );
}
