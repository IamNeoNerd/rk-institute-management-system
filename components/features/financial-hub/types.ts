/**
 * Financial Hub Feature Components - Type Definitions
 *
 * Defines TypeScript interfaces for the Financial Hub feature components
 * following the three-principle methodology for component breakdown.
 *
 * Design Consistency: Maintains RK Institute professional standards
 */

import React from 'react';

export interface FinancialStats {
  totalRevenueThisMonth: number;
  totalOutstandingDues: number;
  recentPaymentActivity: number;
  totalStudentsWithDues: number;
  averageMonthlyRevenue: number;
  collectionEfficiency: number;
  totalFeeAllocations: number;
  paidAllocations: number;
  pendingAllocations: number;
  overdueAllocations: number;
  totalFamilies: number;
  familiesWithOutstanding: number;
}

export interface FinancialQuickAction {
  id: string;
  title: string;
  description: string;
  icon: string | React.ReactNode;
  href: string;
  color: string;
}

export interface FinancialModuleStat {
  label: string;
  value: number | string;
}

export interface FinancialModuleCard {
  id: string;
  title: string;
  description: string;
  icon: string | React.ReactNode;
  href: string;
  color: string;
  stats: FinancialModuleStat[];
}

export interface FinancialHubProps {
  stats: FinancialStats | null;
  loading: boolean;
  error: string;
  onRefresh?: () => void;
}

export interface FinancialStatsOverviewProps {
  stats: FinancialStats | null;
  loading: boolean;
  error: string;
}

export interface FinancialQuickActionsProps {
  actions: FinancialQuickAction[];
}

export interface FinancialModuleCardsProps {
  modules: FinancialModuleCard[];
  stats: FinancialStats | null;
}

export interface FinancialHealthOverviewProps {
  stats: FinancialStats | null;
}

export interface FinancialDataInsightsProps {
  onStatsUpdate: (stats: FinancialStats | null) => void;
  onLoadingChange: (loading: boolean) => void;
  onErrorChange: (error: string) => void;
}
