/**
 * Reports Hub Feature Components - Export Index
 *
 * Centralized exports for all Reports Hub feature components following
 * the three-principle methodology for component breakdown.
 *
 * Components:
 * - ReportsStatsOverview: Header, navigation, and key metrics display
 * - ReportsLiveDashboard: Live dashboard with charts and recent data
 * - ReportsAutomationHub: Automated report generation and scheduling
 * - ReportsHistoryManager: Report history and download management
 * - ReportsDataInsights: Data fetching and state management logic
 */

export { default as ReportsStatsOverview } from './ReportsStatsOverview';
export { default as ReportsLiveDashboard } from './ReportsLiveDashboard';
export { default as ReportsAutomationHub } from './ReportsAutomationHub';
export { default as ReportsHistoryManager } from './ReportsHistoryManager';
export { default as ReportsDataInsights } from './ReportsDataInsights';

export type {
  ReportData,
  AutomationReport,
  ActiveTab,
  ReportType,
  ReportsHubProps,
  ReportsStatsOverviewProps,
  ReportsLiveDashboardProps,
  ReportsAutomationHubProps,
  ReportsHistoryManagerProps,
  ReportsDataInsightsProps
} from './types';
