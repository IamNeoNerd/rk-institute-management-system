'use client';

import { FinancialHealthOverviewProps } from './types';

/**
 * Financial Health Overview Component
 * 
 * Displays comprehensive financial health metrics including allocation breakdowns,
 * collection efficiency, and average revenue trends. Provides visual indicators
 * for financial performance monitoring.
 * 
 * Design Features:
 * - Color-coded health indicators (green, yellow, red, blue)
 * - Percentage calculations for allocation distribution
 * - Professional card layout with consistent spacing
 * - Loading states with professional messaging
 * - Financial metrics with proper formatting
 */

export default function FinancialHealthOverview({ stats }: FinancialHealthOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Financial Health Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Health Overview</h2>
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{stats.paidAllocations}</div>
              <div className="text-sm text-green-800">Paid Allocations</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.totalFeeAllocations > 0 
                  ? ((stats.paidAllocations / stats.totalFeeAllocations) * 100).toFixed(1)
                  : '0'
                }% of total
              </div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingAllocations}</div>
              <div className="text-sm text-yellow-800">Pending Allocations</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.totalFeeAllocations > 0 
                  ? ((stats.pendingAllocations / stats.totalFeeAllocations) * 100).toFixed(1)
                  : '0'
                }% of total
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600">{stats.overdueAllocations}</div>
              <div className="text-sm text-red-800">Overdue Allocations</div>
              <div className="text-xs text-gray-500 mt-1">Require immediate attention</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                ₹{stats.averageMonthlyRevenue?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-blue-800">Avg Monthly Revenue</div>
              <div className="text-xs text-gray-500 mt-1">Last 6 months</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">💰</div>
            <p className="text-gray-500 font-medium">Loading financial health data...</p>
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Financial Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Financial Activity</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <p className="text-gray-500 font-medium">Recent activity tracking coming soon</p>
          <p className="text-sm text-gray-400 mt-2">
            This will show recent payments, fee allocations, and financial transactions
          </p>
          
          {/* Preview of Future Features */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-green-500 mr-2">💰</span>
                <span className="text-sm font-medium text-gray-700">Payment Records</span>
              </div>
              <p className="text-xs text-gray-500">Track recent payment transactions and receipts</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-blue-500 mr-2">📄</span>
                <span className="text-sm font-medium text-gray-700">Fee Allocations</span>
              </div>
              <p className="text-xs text-gray-500">Monitor new fee allocations and billing cycles</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-orange-500 mr-2">📧</span>
                <span className="text-sm font-medium text-gray-700">Reminder Activities</span>
              </div>
              <p className="text-xs text-gray-500">View payment reminder history and responses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
