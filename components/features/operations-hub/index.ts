/**
 * Operations Hub Feature Components - Export Index
 * 
 * Centralized exports for all Operations Hub feature components following
 * the three-principle methodology for component breakdown.
 * 
 * Components:
 * - OperationsStatsOverview: Header, navigation, and system status display
 * - OperationsAutomationControl: Job triggering and automation controls
 * - OperationsJobMonitor: Real-time job monitoring and status display
 * - OperationsSystemHealth: System health metrics and performance monitoring
 * - OperationsDataInsights: Data fetching and state management logic
 */

export { default as OperationsStatsOverview } from './OperationsStatsOverview';
export { default as OperationsAutomationControl } from './OperationsAutomationControl';
export { default as OperationsJobMonitor } from './OperationsJobMonitor';
export { default as OperationsSystemHealth } from './OperationsSystemHealth';
export { default as OperationsDataInsights } from './OperationsDataInsights';

export type {
  AutomationStatus,
  RunningJob,
  ScheduledJob,
  ActiveTab,
  ReminderType,
  ReportType,
  JobType,
  OperationsHubProps,
  OperationsStatsOverviewProps,
  OperationsAutomationControlProps,
  OperationsJobMonitorProps,
  OperationsSystemHealthProps,
  OperationsDataInsightsProps,
  JobTriggerResult
} from './types';
