/**
 * Student Portal Feature Components - Export Index
 *
 * Centralized exports for all Student Portal feature components following
 * the three-principle methodology for component breakdown.
 *
 * Components:
 * - StudentHeader: Header with branding, welcome message, and logout
 * - StudentNavigation: Tab-based navigation for portal sections
 * - StudentStatsOverview: Welcome section and comprehensive statistics
 * - StudentQuickActions: Quick navigation cards for common actions
 * - StudentDataInsights: Data fetching and state management logic
 */

export { default as StudentHeader } from './StudentHeader';
export { default as StudentNavigation } from './StudentNavigation';
export { default as StudentStatsOverview } from './StudentStatsOverview';
export { default as StudentQuickActions } from './StudentQuickActions';
export { default as StudentDataInsights } from './StudentDataInsights';

export type {
  User,
  StudentProfile,
  DashboardStats,
  ActiveTab,
  StudentPortalProps,
  StudentHeaderProps,
  StudentNavigationProps,
  StudentStatsOverviewProps,
  StudentQuickActionsProps,
  StudentDataInsightsProps,
  NavigationTab,
  QuickAction,
  StatCardData
} from './types';
