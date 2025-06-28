'use client';

import { PeopleRecentActivityProps } from './types';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

/**
 * People Recent Activity Component
 * 
 * Displays recent activity section for the People hub. Currently shows
 * a placeholder for future activity tracking implementation.
 * 
 * Design Features:
 * - Professional placeholder design with clear messaging
 * - Consistent card styling with RK Institute design system
 * - Future-ready structure for activity implementation
 * - Professional icon and typography
 */

export default function PeopleRecentActivity({ activities }: PeopleRecentActivityProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
      
      {/* Future Implementation: Activity List */}
      {activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 text-sm">
                  <ProfessionalIcon name="list" size={16} />
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Placeholder for Future Implementation */
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4 flex justify-center">
            <ProfessionalIcon name="list" size={48} />
          </div>
          <p className="text-gray-500 font-medium">Recent activity tracking coming soon</p>
          <p className="text-sm text-gray-400 mt-2">
            This will show recent enrollments, family registrations, and user activities
          </p>
          
          {/* Preview of Future Features */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-blue-500 mr-2">
                  <ProfessionalIcon name="enrollment" size={20} />
                </span>
                <span className="text-sm font-medium text-gray-700">Student Enrollments</span>
              </div>
              <p className="text-xs text-gray-500">Track new student registrations and enrollment status changes</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-green-500 mr-2">
                  <ProfessionalIcon name="family" size={20} />
                </span>
                <span className="text-sm font-medium text-gray-700">Family Updates</span>
              </div>
              <p className="text-xs text-gray-500">Monitor family profile changes and new family registrations</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-purple-500 mr-2">
                  <ProfessionalIcon name="user" size={20} />
                </span>
                <span className="text-sm font-medium text-gray-700">User Activities</span>
              </div>
              <p className="text-xs text-gray-500">View user account creation, role changes, and access logs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
