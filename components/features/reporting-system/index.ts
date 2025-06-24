/**
 * Advanced Reporting System - Component Exports
 * 
 * Centralized exports for the reporting system components.
 * Demonstrates clean module organization and reusable architecture.
 */

// Main Components
export { default as ReportingSystem } from './ReportingSystem';
export { default as ReportTemplateList } from './ReportTemplateList';
export { default as ReportGenerator } from './ReportGenerator';
export { default as ReportHistory } from './ReportHistory';
export { default as ReportStatsOverview } from './ReportStatsOverview';

// Type Definitions
export type {
  ReportTemplate,
  ReportParameter,
  GeneratedReport,
  ReportStats,
  ReportingSystemProps,
  ReportTemplateListProps,
  ReportGeneratorProps,
  ReportHistoryProps,
  ReportStatsOverviewProps,
  ReportDataInsightsProps,
  AcademicReportData,
  FinancialReportData,
  AttendanceReportData,
  PerformanceReportData,
  ReportGenerationRequest,
  ReportFilters
} from './types';

// Hook Export
export { useReportingSystem } from '@/hooks/reporting/useReportingSystem';
export type { UseReportingSystemReturn } from '@/hooks/reporting/useReportingSystem';
