'use client';

import {
  OperationsStatsOverview,
  OperationsAutomationControl,
  OperationsJobMonitor,
  OperationsSystemHealth,
  OperationsDataInsights,
  AutomationStatus,
  ActiveTab,
  ReminderType,
  ReportType
} from '@/components/features/operations-hub';
import AdminLayout from '@/components/layout/AdminLayout';
import { useOperationsHubData } from '@/hooks';

export default function OperationsPage() {
  const {
    automationStatus,
    loading,
    error,
    activeTab,
    triggeringJob,
    setActiveTab,
    triggerMonthlyBilling,
    triggerFeeReminder,
    triggerReport
  } = useOperationsHubData();

  return (
    <AdminLayout>
      {/* Data Management Component - handles all API calls and state */}
      <OperationsDataInsights
        onAutomationStatusUpdate={status => {}}
        onLoadingChange={() => {}}
        onErrorChange={() => {}}
      />

      <div className='space-y-8'>
        {/* Header, Navigation, and System Status */}
        <OperationsStatsOverview
          automationStatus={automationStatus}
          loading={loading}
          error={error}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Automation Controls */}
        <OperationsAutomationControl
          automationStatus={automationStatus}
          triggeringJob={triggeringJob}
          activeTab={activeTab}
          onTriggerMonthlyBilling={triggerMonthlyBilling}
          onTriggerFeeReminder={triggerFeeReminder}
          onTriggerReport={triggerReport}
        />

        {/* Job Monitoring (Overview Tab Only) */}
        {activeTab === 'overview' && (
          <>
            <OperationsJobMonitor
              automationStatus={automationStatus}
              loading={loading}
            />

            <OperationsSystemHealth
              automationStatus={automationStatus}
              loading={loading}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
