'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';

export default function AcademicReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Academic Reports
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Generate comprehensive academic performance and progress reports
            </p>
          </div>
          <Link
            href="/admin/academic"
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ← Back to Academic Hub
          </Link>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-6">📊</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Academic Reports Coming Soon</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We&apos;re developing comprehensive academic reporting features that will provide detailed insights
            into student performance, course effectiveness, and academic progress tracking.
          </p>
          
          {/* Planned Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="text-2xl mb-3">📈</div>
              <h3 className="font-semibold text-gray-900 mb-2">Performance Analytics</h3>
              <p className="text-sm text-gray-600">Student performance trends and grade analysis</p>
            </div>
            
            <div className="p-6 bg-green-50 rounded-xl">
              <div className="text-2xl mb-3">📋</div>
              <h3 className="font-semibold text-gray-900 mb-2">Progress Reports</h3>
              <p className="text-sm text-gray-600">Individual and class progress tracking reports</p>
            </div>
            
            <div className="p-6 bg-purple-50 rounded-xl">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Course Effectiveness</h3>
              <p className="text-sm text-gray-600">Course performance and effectiveness analysis</p>
            </div>
            
            <div className="p-6 bg-orange-50 rounded-xl">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Grade Distribution</h3>
              <p className="text-sm text-gray-600">Grade distribution and statistical analysis</p>
            </div>
            
            <div className="p-6 bg-red-50 rounded-xl">
              <div className="text-2xl mb-3">⚠️</div>
              <h3 className="font-semibold text-gray-900 mb-2">At-Risk Students</h3>
              <p className="text-sm text-gray-600">Early warning system for struggling students</p>
            </div>
            
            <div className="p-6 bg-yellow-50 rounded-xl">
              <div className="text-2xl mb-3">📤</div>
              <h3 className="font-semibold text-gray-900 mb-2">Export Options</h3>
              <p className="text-sm text-gray-600">PDF, Excel, and CSV export formats</p>
            </div>
            
            <div className="p-6 bg-indigo-50 rounded-xl">
              <div className="text-2xl mb-3">📅</div>
              <h3 className="font-semibold text-gray-900 mb-2">Scheduled Reports</h3>
              <p className="text-sm text-gray-600">Automated report generation and distribution</p>
            </div>
            
            <div className="p-6 bg-teal-50 rounded-xl">
              <div className="text-2xl mb-3">👨‍🏫</div>
              <h3 className="font-semibold text-gray-900 mb-2">Teacher Insights</h3>
              <p className="text-sm text-gray-600">Teacher-specific performance and workload reports</p>
            </div>
            
            <div className="p-6 bg-pink-50 rounded-xl">
              <div className="text-2xl mb-3">🏆</div>
              <h3 className="font-semibold text-gray-900 mb-2">Achievement Reports</h3>
              <p className="text-sm text-gray-600">Student achievements and milestone tracking</p>
            </div>
          </div>
          
          {/* Report Types Preview */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned Report Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Student Reports:</h4>
                <ul className="space-y-1">
                  <li>• Individual progress reports</li>
                  <li>• Grade transcripts</li>
                  <li>• Attendance summaries</li>
                  <li>• Assignment completion rates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Class Reports:</h4>
                <ul className="space-y-1">
                  <li>• Class performance overview</li>
                  <li>• Grade distribution analysis</li>
                  <li>• Course completion rates</li>
                  <li>• Comparative analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Administrative Reports:</h4>
                <ul className="space-y-1">
                  <li>• Institute-wide performance</li>
                  <li>• Teacher effectiveness metrics</li>
                  <li>• Resource utilization</li>
                  <li>• Trend analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
