'use client';

import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

import { ReportsStatsOverviewProps } from './types';

/**
 * Reports Stats Overview Component
 *
 * Displays the header section with title, description, month/year selectors,
 * tab navigation, and key metrics for the Reports hub.
 *
 * Design Features:
 * - Gradient text headings for professional appearance
 * - Tab navigation with active state indicators
 * - Month/year selectors for data filtering
 * - Key metrics cards with color-coded icons
 * - Responsive layout with proper spacing
 * - Error handling with professional error display
 */

export default function ReportsStatsOverview({
  reportData,
  loading,
  error,
  selectedMonth,
  selectedYear,
  activeTab,
  onMonthChange,
  onYearChange,
  onTabChange
}: ReportsStatsOverviewProps) {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center animate-fade-in'>
        <div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
            Reports & Analytics
          </h1>
          <p className='mt-2 text-lg text-gray-600'>
            Comprehensive insights and automated reports
          </p>
        </div>
        {activeTab === 'dashboard' && (
          <div className='flex space-x-4'>
            <select
              value={selectedMonth}
              onChange={e => onMonthChange(parseInt(e.target.value))}
              className='input-field'
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={e => onYearChange(parseInt(e.target.value))}
              className='input-field'
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = 2022 + i; // 2022, 2023, 2024, 2025, 2026
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl animate-fade-in'>
          <div className='flex items-center'>
            <span className='text-red-500 mr-2'>
              <ProfessionalIcon name='warning' size={20} />
            </span>
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className='bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-xl animate-fade-in'>
          <div className='flex items-center'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2'></div>
            Loading reports data...
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
        <div className='flex space-x-1 bg-gray-100 p-1 rounded-xl'>
          {[
            {
              id: 'dashboard',
              name: 'Live Dashboard',
              icon: 'analytics' as const
            },
            {
              id: 'automated',
              name: 'Automated Reports',
              icon: 'settings' as const
            },
            { id: 'history', name: 'Report History', icon: 'list' as const }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className='mr-2'>
                <ProfessionalIcon name={tab.icon} size={16} />
              </span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics - Only show on dashboard tab */}
      {activeTab === 'dashboard' && reportData && !loading && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in'>
          <div className='card-compact'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-blue-100 text-blue-600 mr-4'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                  />
                </svg>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Students
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {reportData.totalStudents}
                </p>
              </div>
            </div>
          </div>

          <div className='card-compact'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-green-100 text-green-600 mr-4'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                  />
                </svg>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Monthly Revenue
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  ₹{reportData.monthlyRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className='card-compact'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-orange-100 text-orange-600 mr-4'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Outstanding Dues
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  ₹{reportData.outstandingDues.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className='card-compact'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-purple-100 text-purple-600 mr-4'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                  />
                </svg>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Discounts
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  ₹{reportData.totalDiscounts.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
