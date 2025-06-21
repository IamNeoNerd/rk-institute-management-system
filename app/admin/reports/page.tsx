'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  ReportsStatsOverview,
  ReportsLiveDashboard,
  ReportsAutomationHub,
  ReportsHistoryManager,
  ReportsDataInsights,
  ReportData,
  AutomationReport,
  ActiveTab,
  ReportType
} from '@/components/features/reports-hub';

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(6); // June - where we have test data
  const [selectedYear, setSelectedYear] = useState(2024); // 2024 - where we have test data
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [automationReports, setAutomationReports] = useState<AutomationReport[]>([]);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const generateAutomationReport = async (reportType: ReportType) => {
    setGeneratingReport(reportType);
    try {
      const response = await fetch('/api/automation/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportType }),
      });

      const data = await response.json();

      if (data.success) {
        // Show success toast (user-friendly message)
        alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);
        // Refresh automation reports will be handled by ReportsDataInsights
      } else {
        alert(`Failed to generate ${reportType} report: ${data.error}`);
      }
    } catch (error) {
      alert('Network error while generating report');
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReport(null);
    }
  };

  return (
    <AdminLayout>
      {/* Data Management Component - handles all API calls and state */}
      <ReportsDataInsights
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        activeTab={activeTab}
        onReportDataUpdate={setReportData}
        onLoadingChange={setLoading}
        onErrorChange={setError}
        onAutomationReportsUpdate={setAutomationReports}
      />

      <div className="space-y-8">
        {/* Header, Navigation, and Key Metrics */}
        <ReportsStatsOverview
          reportData={reportData}
          loading={loading}
          error={error}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          activeTab={activeTab}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onTabChange={setActiveTab}
        />

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <ReportsLiveDashboard
            reportData={reportData}
            loading={loading}
          />
        )}

        {/* Automated Reports Tab Content */}
        {activeTab === 'automated' && (
          <ReportsAutomationHub
            automationReports={automationReports}
            generatingReport={generatingReport}
            onGenerateReport={generateAutomationReport}
          />
        )}

        {/* History Tab Content */}
        {activeTab === 'history' && (
          <ReportsHistoryManager />
        )}
      </div>
    </AdminLayout>
  );
}
