/**
 * Teacher Portal Feature Components - Export Index
 * 
 * Centralized exports for all Teacher Portal feature components following
 * the three-principle methodology for component breakdown.
 * 
 * Components:
 * - TeacherHeader: Header with branding, welcome message, and logout
 * - TeacherNavigation: Tab-based navigation for portal sections
 * - TeacherStatsOverview: Welcome section and comprehensive statistics
 * - TeacherQuickActions: Quick navigation cards for common actions
 * - TeacherDataInsights: Data fetching and state management logic
 */

export { default as TeacherHeader } from './TeacherHeader';
export { default as TeacherNavigation } from './TeacherNavigation';
export { default as TeacherStatsOverview } from './TeacherStatsOverview';
export { default as TeacherQuickActions } from './TeacherQuickActions';
export { default as TeacherDataInsights } from './TeacherDataInsights';

export type {
  User,
  TeacherProfile,
  DashboardStats,
  ActiveTab,
  TeacherPortalProps,
  TeacherHeaderProps,
  TeacherNavigationProps,
  TeacherStatsOverviewProps,
  TeacherQuickActionsProps,
  TeacherDataInsightsProps,
  NavigationTab,
  QuickAction,
  StatCardData,
  AcademicLog,
  Course,
  CourseMaterial,
  Assignment,
  AssignmentSubmission,
  Student
} from './types';
