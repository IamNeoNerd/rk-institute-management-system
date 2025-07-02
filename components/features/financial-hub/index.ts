/**
 * Financial Hub Feature Components - Export Index
 *
 * Centralized exports for all Financial Hub feature components following
 * the three-principle methodology for component breakdown.
 *
 * Components:
 * - FinancialStatsOverview: Header and KPI metrics display
 * - FinancialQuickActions: Quick action cards for financial operations
 * - FinancialModuleCards: Main module management cards with statistics
 * - FinancialHealthOverview: Financial health metrics and allocation breakdown
 * - FinancialDataInsights: Data fetching and state management logic
 */

export { default as FinancialStatsOverview } from './FinancialStatsOverview';
export { default as FinancialQuickActions } from './FinancialQuickActions';
export { default as FinancialModuleCards } from './FinancialModuleCards';
export { default as FinancialHealthOverview } from './FinancialHealthOverview';
export { default as FinancialDataInsights } from './FinancialDataInsights';

export type {
  FinancialStats,
  FinancialQuickAction,
  FinancialModuleStat,
  FinancialModuleCard,
  FinancialHubProps,
  FinancialStatsOverviewProps,
  FinancialQuickActionsProps,
  FinancialModuleCardsProps,
  FinancialHealthOverviewProps,
  FinancialDataInsightsProps
} from './types';
