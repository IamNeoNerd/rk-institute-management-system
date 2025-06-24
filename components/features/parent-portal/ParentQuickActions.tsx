/**
 * Parent Quick Actions Component
 * 
 * Provides quick navigation cards for common parent actions and tasks.
 * Features prominent action cards with clean styling and hover effects.
 * 
 * Design Features:
 * - Large action cards with clean white backgrounds
 * - Hover effects with smooth transitions
 * - Icon-based visual identification
 * - Responsive grid layout
 * - Professional RK Institute styling
 * - Parent-specific action descriptions
 * - Conditional alerts for concerns and outstanding dues
 */

'use client';

import { ParentQuickActionsProps, QuickAction } from './types';
import { Grid } from '@/components/ui';

export default function ParentQuickActions({
  stats,
  onTabChange
}: ParentQuickActionsProps) {

  const quickActions: QuickAction[] = [
    {
      id: 'children',
      title: 'View My Children',
      description: `Check individual progress and details for ${stats.totalChildren} children`,
      icon: '👨‍👩‍👧‍👦',
      bgColor: 'bg-white',
      hoverColor: 'hover:shadow-md'
    },
    {
      id: 'fees',
      title: 'Manage Fees & Payments',
      description: stats.outstandingDues > 0 
        ? `Outstanding: ₹${stats.outstandingDues.toLocaleString()}` 
        : 'View bills and payment history',
      icon: stats.outstandingDues > 0 ? '⚠️' : '💰',
      bgColor: 'bg-white',
      hoverColor: 'hover:shadow-md'
    },
    {
      id: 'academic',
      title: 'Academic Progress',
      description: `Track achievements and progress for all children`,
      icon: '📚',
      bgColor: 'bg-white',
      hoverColor: 'hover:shadow-md'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h3>
        <p className="text-gray-600">Access your most important family management tools</p>
      </div>

      <Grid cols={3} responsive={{ sm: 1, md: 2, lg: 3 }}>
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onTabChange(action.id)}
            className={`${action.bgColor} p-6 rounded-xl shadow-sm ${action.hoverColor} transition-all border border-gray-200 text-left group`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <span className="text-2xl">{action.icon}</span>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">{action.title}</h4>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </Grid>

      {/* Family Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Family Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
            <p className="text-sm font-medium text-blue-800">Children</p>
            <p className="text-xs text-blue-600">{stats.totalChildren} enrolled</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-sm font-medium text-green-800">Monthly Fee</p>
            <p className="text-xs text-green-600">₹{stats.totalMonthlyFee.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-2">🏆</div>
            <p className="text-sm font-medium text-yellow-800">Achievements</p>
            <p className="text-xs text-yellow-600">{stats.totalAchievements} this month</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">💳</div>
            <p className="text-sm font-medium text-purple-800">Last Payment</p>
            <p className="text-xs text-purple-600">{new Date(stats.lastPaymentDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Attention Required Sections */}
      {(stats.outstandingDues > 0 || stats.totalConcerns > 0) && (
        <div className="space-y-4">
          {/* Outstanding Dues Alert */}
          {stats.outstandingDues > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-xl">💰</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-semibold text-red-800">Payment Required</h4>
                  <p className="text-red-600 text-sm">
                    Outstanding dues: ₹{stats.outstandingDues.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onTabChange('fees')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Make Payment
              </button>
            </div>
          )}

          {/* Concerns Alert */}
          {stats.totalConcerns > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-semibold text-orange-800">Areas of Concern</h4>
                  <p className="text-orange-600 text-sm">
                    {stats.totalConcerns} concern{stats.totalConcerns > 1 ? 's' : ''} need{stats.totalConcerns === 1 ? 's' : ''} your attention
                  </p>
                </div>
              </div>
              <button
                onClick={() => onTabChange('academic')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                Review Progress
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
