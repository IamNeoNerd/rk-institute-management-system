/**
 * Operations System Health Component
 * 
 * Displays comprehensive system health metrics and status indicators.
 * Provides real-time monitoring of automation engine and scheduler health.
 * 
 * Design Features:
 * - System health indicators with color coding
 * - Performance metrics display
 * - Real-time status updates
 * - Professional health dashboard layout
 * - Responsive design for all screen sizes
 */

'use client';

import { OperationsSystemHealthProps } from './types';
import { Card, StatsCard, Grid, LoadingState, EmptyState } from '@/components/ui';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

export default function OperationsSystemHealth({
  automationStatus,
  loading
}: OperationsSystemHealthProps) {

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getHealthStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
      case 'active':
      case 'healthy':
        return { color: 'green', icon: <ProfessionalIcon name="success" size={20} />, label: 'Healthy' };
      case 'warning':
      case 'degraded':
        return { color: 'yellow', icon: <ProfessionalIcon name="warning" size={20} />, label: 'Warning' };
      case 'error':
      case 'failed':
      case 'unhealthy':
        return { color: 'red', icon: <ProfessionalIcon name="error" size={20} />, label: 'Error' };
      default:
        return { color: 'gray', icon: <ProfessionalIcon name="info" size={20} />, label: 'Unknown' };
    }
  };

  if (loading) {
    return <LoadingState message="Loading system health..." />;
  }

  if (!automationStatus) {
    return (
      <EmptyState
        icon="🏥"
        title="System Health Unavailable"
        description="Unable to load system health information"
      />
    );
  }

  const engineHealth = getHealthStatus(automationStatus.systemStatus.automationEngine);
  const schedulerHealth = getHealthStatus(automationStatus.systemStatus.scheduler);

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Health Overview</h2>
        
        {/* Health Status Cards */}
        <Grid cols={2} responsive={{ sm: 1, md: 2 }}>
          <div className={`p-6 rounded-xl border-2 ${
            engineHealth.color === 'green' ? 'bg-green-50 border-green-200' :
            engineHealth.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
            engineHealth.color === 'red' ? 'bg-red-50 border-red-200' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${
                  engineHealth.color === 'green' ? 'text-green-800' :
                  engineHealth.color === 'yellow' ? 'text-yellow-800' :
                  engineHealth.color === 'red' ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  Automation Engine
                </h3>
                <p className={`text-sm ${
                  engineHealth.color === 'green' ? 'text-green-600' :
                  engineHealth.color === 'yellow' ? 'text-yellow-600' :
                  engineHealth.color === 'red' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  Status: {automationStatus.systemStatus.automationEngine}
                </p>
              </div>
              <div className="text-3xl">{engineHealth.icon}</div>
            </div>
          </div>

          <div className={`p-6 rounded-xl border-2 ${
            schedulerHealth.color === 'green' ? 'bg-green-50 border-green-200' :
            schedulerHealth.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
            schedulerHealth.color === 'red' ? 'bg-red-50 border-red-200' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${
                  schedulerHealth.color === 'green' ? 'text-green-800' :
                  schedulerHealth.color === 'yellow' ? 'text-yellow-800' :
                  schedulerHealth.color === 'red' ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  Job Scheduler
                </h3>
                <p className={`text-sm ${
                  schedulerHealth.color === 'green' ? 'text-green-600' :
                  schedulerHealth.color === 'yellow' ? 'text-yellow-600' :
                  schedulerHealth.color === 'red' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  Status: {automationStatus.systemStatus.scheduler}
                </p>
              </div>
              <div className="text-3xl">{schedulerHealth.icon}</div>
            </div>
          </div>
        </Grid>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
        <Grid cols={3} responsive={{ sm: 1, md: 3 }}>
          <StatsCard
            title="Total Running Jobs"
            value={automationStatus.summary.totalRunningJobs}
            color="blue"
            icon={<ProfessionalIcon name="zap" size={24} />}
          />
          <StatsCard
            title="Scheduled Jobs"
            value={automationStatus.summary.totalScheduledJobs}
            color="purple"
            icon={<ProfessionalIcon name="calendar" size={24} />}
          />
          <StatsCard
            title="Active Schedules"
            value={automationStatus.summary.activeScheduledJobs}
            color="green"
            icon={<ProfessionalIcon name="check" size={24} />}
          />
        </Grid>
      </Card>

      {/* System Information */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Last Health Check</span>
              <span className="text-gray-900">{formatDateTime(automationStatus.systemStatus.timestamp)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Automation Engine</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                engineHealth.color === 'green' ? 'bg-green-100 text-green-800' :
                engineHealth.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                engineHealth.color === 'red' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {engineHealth.icon} {engineHealth.label}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-medium text-gray-700">Job Scheduler</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                schedulerHealth.color === 'green' ? 'bg-green-100 text-green-800' :
                schedulerHealth.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                schedulerHealth.color === 'red' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {schedulerHealth.icon} {schedulerHealth.label}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">System Uptime</h4>
              <p className="text-sm text-blue-600">
                Automation services are running normally with real-time monitoring active.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Auto-Refresh</h4>
              <p className="text-sm text-green-600">
                Status updates automatically every 30 seconds to ensure real-time accuracy.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
