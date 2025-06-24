/**
 * Report Statistics Overview Component
 * 
 * Displays reporting analytics and usage statistics.
 * Leverages existing Chart, Card, and Grid components for consistency.
 * 
 * Features:
 * - Usage statistics and trends
 * - Popular report templates
 * - Performance metrics
 * - Storage utilization
 * - Visual data representation
 */

'use client';

import React from 'react';
import { ReportStatsOverviewProps } from './types';
import {
  Grid,
  Card,
  LoadingState
} from '@/components/ui';

export default function ReportStatsOverview({
  stats,
  userRole,
  loading = false
}: ReportStatsOverviewProps) {

  if (loading) {
    return <LoadingState message="Loading analytics..." />;
  }

  // Prepare chart data for popular templates
  const popularTemplatesData = {
    labels: stats.popularTemplates.map(t => t.templateName),
    datasets: [{
      label: 'Usage Count',
      data: stats.popularTemplates.map(t => t.usageCount),
      backgroundColor: [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#EF4444', // Red
        '#8B5CF6'  // Purple
      ]
    }]
  };

  // Calculate storage percentage (assuming 1GB limit)
  const storageLimit = 1024; // 1GB in MB
  const storagePercentage = (stats.storageUsed / storageLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reporting Analytics</h2>
        <p className="text-gray-600">
          Insights into your reporting usage and system performance
        </p>
      </div>

      {/* Key Metrics */}
      <Grid cols={4} responsive={{ sm: 1, md: 2, lg: 4 }}>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.totalReports}
          </div>
          <div className="text-sm text-gray-600">Total Reports</div>
          <div className="text-xs text-gray-500 mt-1">All time</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.reportsThisMonth}
          </div>
          <div className="text-sm text-gray-600">This Month</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.totalReports > 0 
              ? `${Math.round((stats.reportsThisMonth / stats.totalReports) * 100)}% of total`
              : 'No reports yet'
            }
          </div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.averageGenerationTime}s
          </div>
          <div className="text-sm text-gray-600">Avg Generation</div>
          <div className="text-xs text-gray-500 mt-1">Time per report</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {stats.successRate}%
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-xs text-gray-500 mt-1">Generation success</div>
        </Card>
      </Grid>

      {/* Charts and Detailed Analytics */}
      <Grid cols={2} responsive={{ sm: 1, lg: 2 }}>
        {/* Popular Templates */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Report Templates
            </h3>
            {stats.popularTemplates.length > 0 ? (
              <div className="space-y-4">
                {stats.popularTemplates.map((template, index) => (
                  <div key={template.templateId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3`} 
                           style={{ backgroundColor: popularTemplatesData.datasets[0].backgroundColor[index] }}>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {template.templateName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {template.usageCount} generations
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {stats.totalReports > 0 
                          ? Math.round((template.usageCount / stats.totalReports) * 100)
                          : 0
                        }%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-gray-500">No usage data yet</div>
              </div>
            )}
          </div>
        </Card>

        {/* Storage and Performance */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Storage & Performance
            </h3>
            
            <div className="space-y-6">
              {/* Storage Usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Storage Used</span>
                  <span className="text-sm text-gray-600">
                    {stats.storageUsed.toFixed(1)} MB / {storageLimit} MB
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${
                  storagePercentage > 80 ? 'bg-red-200' :
                  storagePercentage > 60 ? 'bg-yellow-200' : 'bg-green-200'
                }`}>
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      storagePercentage > 80 ? 'bg-red-600' :
                      storagePercentage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {storagePercentage.toFixed(1)}% of available storage
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {stats.averageGenerationTime}s
                  </div>
                  <div className="text-xs text-blue-800">Avg Generation</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {stats.successRate}%
                  </div>
                  <div className="text-xs text-green-800">Success Rate</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {stats.totalReports - stats.reportsThisMonth}
                    </div>
                    <div className="text-xs text-gray-500">Previous Reports</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {Math.round(stats.totalReports * (stats.successRate / 100))}
                    </div>
                    <div className="text-xs text-gray-500">Successful</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Grid>

      {/* Role-specific Insights */}
      {userRole === 'admin' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Insights (Admin)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {stats.popularTemplates.length}
                </div>
                <div className="text-sm text-gray-600">Active Templates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {Math.round(stats.storageUsed / stats.totalReports * 100) / 100 || 0}
                </div>
                <div className="text-sm text-gray-600">MB per Report</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {Math.round((stats.reportsThisMonth / 30) * 10) / 10}
                </div>
                <div className="text-sm text-gray-600">Reports per Day</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tips and Recommendations */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Tips & Recommendations
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            {storagePercentage > 80 && (
              <div>• Consider deleting old reports to free up storage space</div>
            )}
            {stats.successRate < 90 && (
              <div>• Check your internet connection if reports are failing to generate</div>
            )}
            {stats.reportsThisMonth === 0 && (
              <div>• Try generating your first report using the templates above</div>
            )}
            <div>• Reports are automatically deleted after 7 days to save storage</div>
            <div>• PDF format is recommended for sharing and archiving</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
