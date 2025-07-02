/**
 * Student Quick Actions Component
 *
 * Provides quick navigation cards for common student actions and tasks.
 * Features prominent action cards with gradient backgrounds and hover effects.
 *
 * Design Features:
 * - Large action cards with gradient backgrounds
 * - Hover effects with smooth transitions
 * - Icon-based visual identification
 * - Responsive grid layout
 * - Professional RK Institute styling
 * - Conditional highlighting for urgent actions
 */

'use client';

import { Grid } from '@/components/ui';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

import { StudentQuickActionsProps, QuickAction } from './types';

export default function StudentQuickActions({
  stats,
  onTabChange
}: StudentQuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      id: 'my-courses',
      title: 'My Courses',
      description: `View ${stats.totalCourses} enrolled courses and materials`,
      icon: (
        <ProfessionalIcon name='courses' size={24} className='text-white' />
      ),
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'assignments',
      title: 'Assignments & Notes',
      description: 'Access homework, assignments, and study materials',
      icon: <ProfessionalIcon name='list' size={24} className='text-white' />,
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'my-fees',
      title: 'Fees & Payments',
      description:
        stats.outstandingDues > 0
          ? `Outstanding: ₹${stats.outstandingDues.toLocaleString()}`
          : 'View payment history and receipts',
      icon:
        stats.outstandingDues > 0 ? (
          <ProfessionalIcon name='warning' size={24} className='text-white' />
        ) : (
          <ProfessionalIcon name='fees' size={24} className='text-white' />
        ),
      bgColor:
        stats.outstandingDues > 0
          ? 'bg-gradient-to-r from-red-500 to-red-600'
          : 'bg-gradient-to-r from-purple-500 to-purple-600',
      hoverColor:
        stats.outstandingDues > 0
          ? 'hover:from-red-600 hover:to-red-700'
          : 'hover:from-purple-600 hover:to-purple-700'
    },
    {
      id: 'academic-logs',
      title: 'Academic Progress',
      description: `View ${stats.academicLogs} progress records and achievements`,
      icon: (
        <ProfessionalIcon name='academic' size={24} className='text-white' />
      ),
      bgColor: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700'
    }
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-2xl font-bold text-gray-900 mb-2'>Quick Actions</h3>
        <p className='text-gray-600'>
          Access your most important student resources
        </p>
      </div>

      <Grid cols={2} responsive={{ sm: 1, md: 2 }}>
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => onTabChange(action.id)}
            className={`${action.bgColor} ${action.hoverColor} text-white p-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl text-left`}
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h4 className='text-xl font-bold mb-2'>{action.title}</h4>
                <p className='text-white text-opacity-90 text-sm'>
                  {action.description}
                </p>
              </div>
              <div className='text-4xl ml-4'>{action.icon}</div>
            </div>
          </button>
        ))}
      </Grid>

      {/* Additional Info Cards */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <h4 className='text-lg font-semibold text-gray-900 mb-4'>
          Student Information
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='text-center p-4 bg-blue-50 rounded-lg'>
            <div className='text-2xl mb-2'>🎓</div>
            <p className='text-sm font-medium text-blue-800'>Academic Year</p>
            <p className='text-xs text-blue-600'>2024-25</p>
          </div>
          <div className='text-center p-4 bg-green-50 rounded-lg'>
            <div className='text-2xl mb-2'>📅</div>
            <p className='text-sm font-medium text-green-800'>Current Term</p>
            <p className='text-xs text-green-600'>Term 2</p>
          </div>
          <div className='text-center p-4 bg-purple-50 rounded-lg'>
            <div className='text-2xl mb-2'>🏆</div>
            <p className='text-sm font-medium text-purple-800'>Achievements</p>
            <p className='text-xs text-purple-600'>
              {stats.achievements} earned
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
