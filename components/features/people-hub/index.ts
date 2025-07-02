/**
 * People Hub Feature Components - Export Index
 *
 * Centralized exports for all People Hub feature components following
 * the three-principle methodology for component breakdown.
 *
 * Components:
 * - PeopleStatsOverview: Header and key metrics display
 * - PeopleQuickActions: Quick action cards for common operations
 * - PeopleModuleCards: Main module management cards with statistics
 * - PeopleRecentActivity: Recent activity tracking (future implementation)
 * - PeopleDataInsights: Data fetching and state management logic
 */

export { default as PeopleStatsOverview } from './PeopleStatsOverview';
export { default as PeopleQuickActions } from './PeopleQuickActions';
export { default as PeopleModuleCards } from './PeopleModuleCards';
export { default as PeopleRecentActivity } from './PeopleRecentActivity';
export { default as PeopleDataInsights } from './PeopleDataInsights';

export type {
  PeopleStats,
  QuickAction,
  ModuleStat,
  ModuleCard,
  PeopleHubProps,
  PeopleStatsOverviewProps,
  PeopleQuickActionsProps,
  PeopleModuleCardsProps,
  PeopleRecentActivityProps,
  PeopleDataInsightsProps
} from './types';
