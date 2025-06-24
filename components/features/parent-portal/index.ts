/**
 * Parent Portal Feature Components - Export Index
 * 
 * Centralized exports for all Parent Portal feature components following
 * the three-principle methodology for component breakdown.
 * 
 * Components:
 * - ParentHeader: Header with branding, welcome message, and logout
 * - ParentChildSelector: Child selection dropdown for multi-child families
 * - ParentNavigation: Tab-based navigation for portal sections
 * - ParentStatsOverview: Welcome section and comprehensive statistics
 * - ParentQuickActions: Quick navigation cards for common actions
 * - ParentDataInsights: Data fetching and state management logic
 */

export { default as ParentHeader } from './ParentHeader';
export { default as ParentChildSelector } from './ParentChildSelector';
export { default as ParentNavigation } from './ParentNavigation';
export { default as ParentStatsOverview } from './ParentStatsOverview';
export { default as ParentQuickActions } from './ParentQuickActions';
export { default as ParentDataInsights } from './ParentDataInsights';

export type {
  User,
  Child,
  FamilyProfile,
  EmergencyContact,
  DashboardStats,
  ActiveTab,
  ParentPortalProps,
  ParentHeaderProps,
  ParentChildSelectorProps,
  ParentNavigationProps,
  ParentStatsOverviewProps,
  ParentQuickActionsProps,
  ParentDataInsightsProps,
  NavigationTab,
  QuickAction,
  StatCardData,
  FamilyFeeAllocation,
  FamilyPayment,
  ChildAcademicProgress,
  SubjectProgress,
  Achievement,
  Concern,
  AcademicLog,
  ChildAssignment
} from './types';
