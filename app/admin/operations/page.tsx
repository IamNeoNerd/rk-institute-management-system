'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

interface AutomationStatus {
  systemStatus: {
    automationEngine: string;
    scheduler: string;
    timestamp: string;
  };
  runningJobs: Array<{
    id: string;
    type: string;
    status: string;
    startTime: string;
    endTime?: string;
    duration?: number;
  }>;
  scheduledJobs: Array<{
    id: string;
    name: string;
    schedule: string;
    description: string;
    isActive: boolean;
    lastRun?: string;
    nextRun?: string;
  }>;
  summary: {
    totalRunningJobs: number;
    totalScheduledJobs: number;
    activeScheduledJobs: number;
  };
}

export default function OperationsPage() {
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);

  useEffect(() => {
    fetchAutomationStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchAutomationStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAutomationStatus = async () => {
    try {
      const response = await fetch('/api/automation/status');
      const data = await response.json();
      
      if (data.success) {
        setAutomationStatus(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch automation status');
      }
    } catch (err) {
      setError('Network error while fetching automation status');
      console.error('Error fetching automation status:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerMonthlyBilling = async () => {
    setTriggeringJob('monthly-billing');
    try {
      const response = await fetch('/api/automation/monthly-billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Use current month/year
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Monthly billing completed successfully!\n\nGenerated ${data.data.successfulBills} bills out of ${data.data.totalStudents} students.\nExecution time: ${data.data.executionTime}ms`);
        fetchAutomationStatus(); // Refresh status
      } else {
        alert(`Monthly billing failed: ${data.error}\n\nDetails: ${data.details || 'No additional details'}`);
      }
    } catch (err) {
      alert('Network error while triggering monthly billing');
      console.error('Error triggering monthly billing:', err);
    } finally {
      setTriggeringJob(null);
    }
  };

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
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading automation status...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Operations Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Automation & Operations Management
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {automationStatus && (
          <>
            {/* System Status */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">System Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Automation Engine</p>
                      <p className="text-xs text-green-600 capitalize">{automationStatus.systemStatus.automationEngine}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Scheduler</p>
                      <p className="text-xs text-blue-600 capitalize">{automationStatus.systemStatus.scheduler}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Last Updated</p>
                    <p className="text-xs text-gray-600">{formatDateTime(automationStatus.systemStatus.timestamp)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={triggerMonthlyBilling}
                  disabled={triggeringJob === 'monthly-billing'}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {triggeringJob === 'monthly-billing' ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Bills...
                    </div>
                  ) : (
                    'Trigger Monthly Billing'
                  )}
                </button>
                <button
                  onClick={fetchAutomationStatus}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Refresh Status
                </button>
              </div>
            </div>

            {/* Scheduled Jobs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Scheduled Jobs</h2>
              {automationStatus.scheduledJobs.length === 0 ? (
                <p className="text-gray-500">No scheduled jobs configured.</p>
              ) : (
                <div className="space-y-4">
                  {automationStatus.scheduledJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.name}</h3>
                          <p className="text-sm text-gray-600">{job.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Schedule: {job.schedule}</p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.isActive ? 'Active' : 'Inactive'}
                          </div>
                          {job.lastRun && (
                            <p className="text-xs text-gray-500 mt-1">
                              Last run: {formatDateTime(job.lastRun)}
                            </p>
                          )}
                          {job.nextRun && (
                            <p className="text-xs text-gray-500">
                              Next run: {formatDateTime(job.nextRun)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Running Jobs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Running Jobs</h2>
              {automationStatus.runningJobs.length === 0 ? (
                <p className="text-gray-500">No jobs currently running.</p>
              ) : (
                <div className="space-y-4">
                  {automationStatus.runningJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.type}</h3>
                          <p className="text-sm text-gray-600">Started: {formatDateTime(job.startTime)}</p>
                          {job.endTime && (
                            <p className="text-sm text-gray-600">
                              Completed: {formatDateTime(job.endTime)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.status === 'RUNNING' 
                              ? 'bg-blue-100 text-blue-800' 
                              : job.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {job.status}
                          </div>
                          {job.duration && (
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {formatDuration(job.duration)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
