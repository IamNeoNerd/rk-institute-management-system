/**
 * Operations Stats Overview Component
 * 
 * Displays the header section with title, description, tab navigation,
 * and system status overview for the Operations Hub.
 * 
 * Design Features:
 * - Professional gradient text headings
 * - Tab navigation with active state indicators
 * - System status cards with color-coded indicators
 * - Error handling with professional error display
 * - Loading states with skeleton components
 */

'use client';

import { OperationsStatsOverviewProps } from './types';
import { PageHeader, Grid, StatsCard, ErrorState, LoadingState } from '@/components/ui';

export default function OperationsStatsOverview({
  automationStatus,
  loading,
  error,
  activeTab,
  onTabChange
}: OperationsStatsOverviewProps) {
  
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Operations Dashboard"
        subtitle="Automation & Operations Management"
      />

      {/* Error Display */}
      {error && (
        <ErrorState
          message={error}
          retry={{
            label: 'Retry',
            onClick: () => window.location.reload()
          }}
        />
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'reminders', name: 'Fee Reminders', icon: '📧' },
            { id: 'reports', name: 'Reports', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* System Status Overview */}
      {activeTab === 'overview' && (
        <>
          {loading ? (
            <LoadingState message="Loading automation status..." />
          ) : automationStatus ? (
            <>
              {/* System Status Cards */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">System Status</h2>
                <Grid cols={3} responsive={{ sm: 1, md: 3 }}>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Automation Engine</p>
                        <p className="text-xs text-green-600 capitalize">
                          {automationStatus.systemStatus.automationEngine}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Scheduler</p>
                        <p className="text-xs text-blue-600 capitalize">
                          {automationStatus.systemStatus.scheduler}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Last Updated</p>
                      <p className="text-xs text-gray-600">
                        {formatDateTime(automationStatus.systemStatus.timestamp)}
                      </p>
                    </div>
                  </div>
                </Grid>
              </div>

              {/* Summary Statistics */}
              <Grid cols={3} responsive={{ sm: 1, md: 3 }}>
                <StatsCard
                  title="Running Jobs"
                  value={automationStatus.summary.totalRunningJobs}
                  color="blue"
                  icon="⚡"
                />
                <StatsCard
                  title="Scheduled Jobs"
                  value={automationStatus.summary.totalScheduledJobs}
                  color="purple"
                  icon="📅"
                />
                <StatsCard
                  title="Active Schedules"
                  value={automationStatus.summary.activeScheduledJobs}
                  color="green"
                  icon="✅"
                />
              </Grid>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🔧</div>
                <p className="text-gray-500">No automation status available</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
