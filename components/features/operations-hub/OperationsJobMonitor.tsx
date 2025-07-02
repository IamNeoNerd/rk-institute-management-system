/**
 * Operations Job Monitor Component
 *
 * Displays real-time monitoring of running and scheduled jobs.
 * Shows job status, execution times, and scheduling information.
 *
 * Design Features:
 * - Real-time job status display
 * - Color-coded status indicators
 * - Professional job cards with detailed information
 * - Empty states for no jobs
 * - Responsive grid layout
 */

'use client';

import { Card, EmptyState, LoadingState } from '@/components/ui';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

import { OperationsJobMonitorProps } from './types';

export default function OperationsJobMonitor({
  automationStatus,
  loading
}: OperationsJobMonitorProps) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return <LoadingState message='Loading job status...' />;
  }

  if (!automationStatus) {
    return (
      <EmptyState
        icon='🔧'
        title='No Automation Status'
        description='Unable to load automation status information'
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Scheduled Jobs */}
      <Card>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>
          Scheduled Jobs
        </h2>
        {automationStatus.scheduledJobs.length === 0 ? (
          <EmptyState
            icon={<ProfessionalIcon name='calendar' size={48} />}
            title='No Scheduled Jobs'
            description='No scheduled jobs configured in the system'
          />
        ) : (
          <div className='space-y-4'>
            {automationStatus.scheduledJobs.map(job => (
              <div
                key={job.id}
                className='border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-900'>{job.name}</h3>
                    <p className='text-sm text-gray-600 mt-1'>
                      {job.description}
                    </p>
                    <p className='text-xs text-gray-500 mt-2'>
                      <span className='font-medium'>Schedule:</span>{' '}
                      {job.schedule}
                    </p>
                  </div>
                  <div className='text-right ml-4'>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        job.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.isActive ? '✅ Active' : '⏸️ Inactive'}
                    </div>
                    {job.lastRun && (
                      <p className='text-xs text-gray-500 mt-2'>
                        <span className='font-medium'>Last run:</span>
                        <br />
                        {formatDateTime(job.lastRun)}
                      </p>
                    )}
                    {job.nextRun && (
                      <p className='text-xs text-gray-500 mt-1'>
                        <span className='font-medium'>Next run:</span>
                        <br />
                        {formatDateTime(job.nextRun)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Running Jobs */}
      <Card>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>Running Jobs</h2>
        {automationStatus.runningJobs.length === 0 ? (
          <EmptyState
            icon={<ProfessionalIcon name='zap' size={48} />}
            title='No Running Jobs'
            description='No jobs are currently running in the system'
          />
        ) : (
          <div className='space-y-4'>
            {automationStatus.runningJobs.map(job => (
              <div
                key={job.id}
                className='border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-900'>{job.type}</h3>
                    <p className='text-sm text-gray-600 mt-1'>
                      <span className='font-medium'>Started:</span>{' '}
                      {formatDateTime(job.startTime)}
                    </p>
                    {job.endTime && (
                      <p className='text-sm text-gray-600 mt-1'>
                        <span className='font-medium'>Completed:</span>{' '}
                        {formatDateTime(job.endTime)}
                      </p>
                    )}
                  </div>
                  <div className='text-right ml-4'>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === 'RUNNING'
                          ? 'bg-blue-100 text-blue-800'
                          : job.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {job.status === 'RUNNING' && '🔄 '}
                      {job.status === 'COMPLETED' && '✅ '}
                      {job.status === 'FAILED' && '❌ '}
                      {job.status}
                    </div>
                    {job.duration && (
                      <p className='text-xs text-gray-500 mt-2'>
                        <span className='font-medium'>Duration:</span>
                        <br />
                        {formatDuration(job.duration)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
