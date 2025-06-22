'use client';

import { ReportsAutomationHubProps } from './types';

/**
 * Reports Automation Hub Component
 * 
 * Displays the automated reports section with report generation controls,
 * automated schedule information, and recent automated reports list.
 * 
 * Design Features:
 * - Report generation buttons with loading states
 * - Automated schedule display with color-coded indicators
 * - Recent reports list with status badges and download links
 * - Professional card layout with consistent spacing
 * - SSR-safe window.open usage for downloads
 * - Empty states with helpful guidance
 */

export default function ReportsAutomationHub({ 
  automationReports,
  generatingReport,
  onGenerateReport
}: ReportsAutomationHubProps) {
  return (
    <div className="space-y-8">
      {/* Report Generation Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate New Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onGenerateReport('weekly')}
            disabled={generatingReport === 'weekly'}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {generatingReport === 'weekly' ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              <>
                <div className="text-lg mb-1">📊</div>
                <div>Weekly Summary</div>
                <div className="text-xs opacity-80">Last 7 days performance</div>
              </>
            )}
          </button>
          <button
            onClick={() => onGenerateReport('monthly')}
            disabled={generatingReport === 'monthly'}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {generatingReport === 'monthly' ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              <>
                <div className="text-lg mb-1">📈</div>
                <div>Monthly Analysis</div>
                <div className="text-xs opacity-80">Comprehensive monthly metrics</div>
              </>
            )}
          </button>
          <button
            onClick={() => onGenerateReport('outstanding')}
            disabled={generatingReport === 'outstanding'}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {generatingReport === 'outstanding' ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              <>
                <div className="text-lg mb-1">💰</div>
                <div>Outstanding Dues</div>
                <div className="text-xs opacity-80">Collection analysis</div>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Automated Report Schedule */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Automated Schedule</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
            <div>
              <h3 className="font-semibold text-green-800">Weekly Performance Reports</h3>
              <p className="text-sm text-green-600">Every Monday at 8:00 AM</p>
            </div>
            <div className="text-green-600">📊</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div>
              <h3 className="font-semibold text-purple-800">Monthly Analysis Reports</h3>
              <p className="text-sm text-purple-600">1st day of every month at 8:00 AM</p>
            </div>
            <div className="text-purple-600">📈</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div>
              <h3 className="font-semibold text-orange-800">Outstanding Dues Reports</h3>
              <p className="text-sm text-orange-600">Every Wednesday at 8:00 AM</p>
            </div>
            <div className="text-orange-600">💰</div>
          </div>
        </div>
      </div>

      {/* Recent Automated Reports */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Reports</h2>
        {automationReports.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <p className="text-gray-500">No automated reports generated yet</p>
            <p className="text-sm text-gray-400 mt-2">Generate your first report using the buttons above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {automationReports.map((report, index) => (
              <div key={report.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                <div>
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600">Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">
                    {report.executionTime && `Execution time: ${report.executionTime}ms`}
                    {report.fileSize && ` • Size: ${(report.fileSize / 1024).toFixed(1)}KB`}
                    {report.downloadCount > 0 && ` • Downloaded ${report.downloadCount} times`}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : report.status === 'GENERATING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {report.status.toLowerCase()}
                  </div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.type === 'WEEKLY'
                      ? 'bg-blue-100 text-blue-800'
                      : report.type === 'MONTHLY'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {report.type.toLowerCase()}
                  </div>
                  <button
                    onClick={() => {
                      // SSR-safe window.open usage
                      if (typeof window !== 'undefined') {
                        window.open(`/api/reports/download/${report.id}`, '_blank');
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                    disabled={report.status !== 'COMPLETED'}
                  >
                    {report.status === 'COMPLETED' ? 'Download' : 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
