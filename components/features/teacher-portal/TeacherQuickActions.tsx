/**
 * Teacher Quick Actions Component
 * 
 * Provides quick navigation cards for common teacher actions and tasks.
 * Features prominent action cards with professional styling and hover effects.
 * 
 * Design Features:
 * - Large action cards with clean white backgrounds
 * - Hover effects with smooth transitions
 * - Icon-based visual identification
 * - Responsive grid layout
 * - Professional RK Institute styling
 * - Teacher-specific action descriptions
 */

'use client';

import { TeacherQuickActionsProps, QuickAction } from './types';
import { Grid } from '@/components/ui';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

export default function TeacherQuickActions({
  stats,
  onTabChange
}: TeacherQuickActionsProps) {

  const quickActions: QuickAction[] = [
    {
      id: 'assignments',
      title: 'Manage Assignments',
      description: 'Create homework, projects, and study materials',
      icon: '📋',
      bgColor: 'bg-white',
      hoverColor: 'hover:shadow-md'
    },
    {
      id: 'academic-logs',
      title: 'Manage Academic Logs',
      description: 'Create, view, and manage student progress records',
      icon: '📝',
      bgColor: 'bg-white',
      hoverColor: 'hover:shadow-md'
    },
    {
      id: 'my-students',
      title: 'View My Students',
      description: `Access information for ${stats.totalStudents} students and academic history`,
      icon: '👥',
      bgColor: 'bg-white',
      hoverColor: 'hover:shadow-md'
    },
    {
      id: 'my-courses',
      title: 'Manage My Courses',
      description: `View details for ${stats.totalCourses} courses and student enrollments`,
      icon: '📚',
      bgColor: 'bg-white',
      hoverColor: 'hover:shadow-md'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h3>
        <p className="text-gray-600">Access your most important teaching tools and resources</p>
      </div>

      <Grid cols={2} responsive={{ sm: 1, md: 2, lg: 3 }}>
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onTabChange(action.id)}
            className={`${action.bgColor} p-6 rounded-xl shadow-sm ${action.hoverColor} transition-all border border-gray-200 text-left group`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
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

      {/* Teacher Performance Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Teaching Performance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-teal-50 rounded-lg">
            <div className="text-2xl mb-2 flex justify-center">
              <ProfessionalIcon name="students" size={32} className="text-teal-600" />
            </div>
            <p className="text-sm font-medium text-teal-800">Students</p>
            <p className="text-xs text-teal-600">{stats.totalStudents} active</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2 flex justify-center">
              <ProfessionalIcon name="courses" size={32} className="text-blue-600" />
            </div>
            <p className="text-sm font-medium text-blue-800">Courses</p>
            <p className="text-xs text-blue-600">{stats.totalCourses} teaching</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2 flex justify-center">
              <ProfessionalIcon name="achievement" size={32} className="text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-800">Achievements</p>
            <p className="text-xs text-green-600">{stats.achievements} recorded</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2 flex justify-center">
              <ProfessionalIcon name="analytics" size={32} className="text-purple-600" />
            </div>
            <p className="text-sm font-medium text-purple-800">Reports</p>
            <p className="text-xs text-purple-600">{stats.progressReports} created</p>
          </div>
        </div>
      </div>

      {/* Attention Required Section */}
      {stats.concerns > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <ProfessionalIcon name="warning" size={24} className="text-red-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-semibold text-red-800">Attention Required</h4>
              <p className="text-red-600 text-sm">
                {stats.concerns} student concern{stats.concerns > 1 ? 's' : ''} need{stats.concerns === 1 ? 's' : ''} your attention
              </p>
            </div>
          </div>
          <button
            onClick={() => onTabChange('academic-logs')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Review Concerns
          </button>
        </div>
      )}
    </div>
  );
}
