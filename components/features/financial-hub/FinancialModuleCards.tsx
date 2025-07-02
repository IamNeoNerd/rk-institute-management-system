'use client';

import Link from 'next/link';

import {
  FinancialModuleCardsProps,
  FinancialModuleCard,
  FinancialModuleStat
} from './types';

/**
 * Financial Module Cards Component
 *
 * Displays the main module management cards for Fee Management, Payment Processing,
 * and Outstanding Dues. Each card shows statistics, description, and action buttons.
 *
 * Design Features:
 * - Professional gradient headers with consistent color schemes
 * - Financial statistics display with proper data formatting
 * - Action buttons with hover effects
 * - Responsive grid layout for different screen sizes
 * - Loading states for statistics
 */

export default function FinancialModuleCards({
  modules,
  stats
}: FinancialModuleCardsProps) {
  // Generate module cards with dynamic stats
  const moduleCards: FinancialModuleCard[] = modules.map(module => {
    let moduleStats: FinancialModuleStat[] = [];

    if (stats) {
      switch (module.id) {
        case 'fees':
          moduleStats = [
            { label: 'Total Allocations', value: stats.totalFeeAllocations },
            { label: 'Paid Allocations', value: stats.paidAllocations },
            { label: 'Pending Allocations', value: stats.pendingAllocations }
          ];
          break;
        case 'payments':
          moduleStats = [
            {
              label: 'Monthly Revenue',
              value: `₹${stats.totalRevenueThisMonth?.toLocaleString()}`
            },
            { label: 'Recent Payments', value: stats.recentPaymentActivity },
            {
              label: 'Collection Rate',
              value: `${stats.collectionEfficiency}%`
            }
          ];
          break;
        case 'outstanding':
          moduleStats = [
            {
              label: 'Total Outstanding',
              value: `₹${stats.totalOutstandingDues?.toLocaleString()}`
            },
            {
              label: 'Families Affected',
              value: stats.familiesWithOutstanding
            },
            { label: 'Overdue Allocations', value: stats.overdueAllocations }
          ];
          break;
        default:
          moduleStats = [];
      }
    }

    return {
      ...module,
      stats: moduleStats
    };
  });

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
      {moduleCards.map(module => (
        <div
          key={module.id}
          className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'
        >
          {/* Module Header */}
          <div className={`bg-gradient-to-r ${module.color} p-6 text-white`}>
            <div className='flex items-center mb-4'>
              <div className='text-3xl mr-4'>{module.icon}</div>
              <div>
                <h3 className='text-xl font-bold'>{module.title}</h3>
                <p className='text-white/80 text-sm'>{module.description}</p>
              </div>
            </div>
          </div>

          {/* Module Stats */}
          <div className='p-6'>
            {stats && module.stats.length > 0 ? (
              <div className='space-y-4 mb-6'>
                {module.stats.map((stat, index) => (
                  <div
                    key={index}
                    className='flex justify-between items-center'
                  >
                    <span className='text-gray-600 text-sm'>{stat.label}</span>
                    <span className='font-semibold text-gray-900'>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-4 text-gray-500'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto mb-2'></div>
                Loading statistics...
              </div>
            )}

            {/* Module Actions - Streamlined for Mobile-First */}
            <div className='space-y-2'>
              <Link
                href={module.href}
                className={`w-full bg-gradient-to-r ${module.color} hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
              >
                Manage {module.title.split(' ')[0]}
              </Link>
              {/* Removed redundant "Quick Action" link - Quick Actions section provides this functionality */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
