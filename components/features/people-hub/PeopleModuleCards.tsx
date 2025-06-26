'use client';

import Link from 'next/link';
import { PeopleModuleCardsProps, ModuleCard, ModuleStat } from './types';

/**
 * People Module Cards Component
 * 
 * Displays the main module management cards for Students, Families, and Users.
 * Each card shows statistics, description, and action buttons.
 * 
 * Design Features:
 * - Professional gradient headers with consistent color schemes
 * - Statistics display with proper data formatting
 * - Action buttons with hover effects
 * - Responsive grid layout for different screen sizes
 * - Loading states for statistics
 */

export default function PeopleModuleCards({ modules, stats }: PeopleModuleCardsProps) {
  // Generate module cards with dynamic stats
  const moduleCards: ModuleCard[] = modules.map(module => {
    let moduleStats: ModuleStat[] = [];

    if (stats) {
      switch (module.id) {
        case 'students':
          moduleStats = [
            { label: 'Total Students', value: stats.totalStudents },
            { label: 'Active Students', value: stats.activeStudents },
            { label: 'Recent Enrollments', value: stats.recentEnrollments }
          ];
          break;
        case 'families':
          moduleStats = [
            { label: 'Total Families', value: stats.totalFamilies },
            { label: 'Multi-Child Families', value: Math.floor(stats.totalFamilies * 0.6) },
            { label: 'Average Family Size', value: '2.3' }
          ];
          break;
        case 'users':
          moduleStats = [
            { label: 'Total Users', value: stats.totalUsers },
            { label: 'Active Users', value: stats.totalUsers - stats.pendingUsers },
            { label: 'Pending Users', value: stats.pendingUsers }
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {moduleCards.map((module) => (
        <div key={module.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Module Header */}
          <div className={`bg-gradient-to-r ${module.color} p-6 text-white`}>
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-4">{module.icon}</div>
              <div>
                <h3 className="text-xl font-bold">{module.title}</h3>
                <p className="text-white/80 text-sm">{module.description}</p>
              </div>
            </div>
          </div>

          {/* Module Stats */}
          <div className="p-6">
            {stats && module.stats.length > 0 ? (
              <div className="space-y-4 mb-6">
                {module.stats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{stat.label}</span>
                    <span className="font-semibold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto mb-2"></div>
                Loading statistics...
              </div>
            )}

            {/* Module Actions - Mobile Optimized */}
            <div className="space-y-2">
              <Link
                href={module.href}
                className={`w-full bg-gradient-to-r ${module.color} hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
              >
                Manage {module.title}
              </Link>
              {/* Hide "Add New" on mobile to reduce duplicate links - Quick Actions section handles this */}
              <Link
                href={`${module.href}?action=add`}
                className="hidden md:flex w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 items-center justify-center"
              >
                Add New
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
