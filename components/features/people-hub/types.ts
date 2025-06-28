/**
 * People Hub Feature Components - Type Definitions
 *
 * Defines TypeScript interfaces for the People Hub feature components
 * following the three-principle methodology for component breakdown.
 *
 * Design Consistency: Maintains RK Institute professional standards
 */

import React from 'react';

export interface PeopleStats {
  totalStudents: number;
  totalFamilies: number;
  totalUsers: number;
  activeStudents: number;
  recentEnrollments: number;
  pendingUsers: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string | React.ReactNode;
  href: string;
  color: string;
}

export interface ModuleStat {
  label: string;
  value: number | string;
}

export interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: string | React.ReactNode;
  href: string;
  color: string;
  stats: ModuleStat[];
}

export interface PeopleHubProps {
  stats: PeopleStats | null;
  loading: boolean;
  error: string;
  onRefresh?: () => void;
}

export interface PeopleStatsOverviewProps {
  stats: PeopleStats | null;
  loading: boolean;
  error: string;
}

export interface PeopleQuickActionsProps {
  actions: QuickAction[];
}

export interface PeopleModuleCardsProps {
  modules: ModuleCard[];
  stats: PeopleStats | null;
}

export interface PeopleRecentActivityProps {
  // Future implementation for activity tracking
  activities?: any[];
}

export interface PeopleDataInsightsProps {
  onStatsUpdate: (stats: PeopleStats | null) => void;
  onLoadingChange: (loading: boolean) => void;
  onErrorChange: (error: string) => void;
}
