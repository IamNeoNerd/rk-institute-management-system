'use client';

import { ReportsLiveDashboardProps } from './types';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

/**
 * Reports Live Dashboard Component
 * 
 * Displays the live dashboard with charts, recent payments, top courses,
 * and summary statistics. This component handles the main data visualization
 * for the Reports hub dashboard tab.
 * 
 * Design Features:
 * - Professional card layout with consistent spacing
 * - Recent payments list with family and student information
 * - Top performing courses with ranking and revenue
 * - Summary statistics with color-coded metrics
 * - Loading states with professional messaging
 * - Empty states with helpful guidance
 */

export default function ReportsLiveDashboard({ 
  reportData,
  loading
}: ReportsLiveDashboardProps) {
  if (loading || !reportData) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4 flex justify-center">
          <ProfessionalIcon name="analytics" size={48} />
        </div>
        <p className="text-gray-500 font-medium">Loading dashboard data...</p>
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <div className="card animate-fade-in">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Payments</h3>
          <div className="space-y-4">
            {reportData.recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-3xl mb-2 flex justify-center">
                  <ProfessionalIcon name="money" size={36} />
                </div>
                <p className="text-gray-500 text-center">No recent payments found</p>
                <p className="text-sm text-gray-400 mt-1">Payments will appear here when recorded</p>
              </div>
            ) : (
              reportData.recentPayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div>
                    <p className="font-medium text-gray-900">{payment.family.students[0]?.name || 'Unknown Student'}</p>
                    <p className="text-sm text-gray-500">{payment.family.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Courses */}
        <div className="card animate-fade-in">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Courses</h3>
          <div className="space-y-4">
            {reportData.topCourses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-3xl mb-2">📚</div>
                <p className="text-gray-500 text-center">No course data available</p>
                <p className="text-sm text-gray-400 mt-1">Course performance will appear here</p>
              </div>
            ) : (
              reportData.topCourses.map((course, index) => (
                <div key={course.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-500">{course.studentCount} students enrolled</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{course.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <div className="card-compact text-center hover:shadow-lg transition-shadow duration-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">{reportData.totalFamilies}</div>
          <div className="text-sm font-medium text-gray-600">Total Families</div>
          <div className="text-xs text-gray-400 mt-1">Registered in system</div>
        </div>
        <div className="card-compact text-center hover:shadow-lg transition-shadow duration-200">
          <div className="text-3xl font-bold text-green-600 mb-2">{reportData.totalCourses}</div>
          <div className="text-sm font-medium text-gray-600">Active Courses</div>
          <div className="text-xs text-gray-400 mt-1">Currently offered</div>
        </div>
        <div className="card-compact text-center hover:shadow-lg transition-shadow duration-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">{reportData.totalServices}</div>
          <div className="text-sm font-medium text-gray-600">Available Services</div>
          <div className="text-xs text-gray-400 mt-1">Additional offerings</div>
        </div>
      </div>
    </div>
  );
}
