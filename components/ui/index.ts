/**
 * UI Component Library - Export Index
 * 
 * Centralized exports for all UI components following the three-principle
 * methodology for component extraction. Provides consistent design system
 * components across the entire application.
 * 
 * Architecture:
 * - Base components (Card, Button, Input, Layout)
 * - State components (Loading, Empty, Error, Success)
 * - Specialized components for hub patterns
 * - TypeScript interfaces for all components
 */

// Base Components
export { Card, StatsCard, QuickActionCard } from './Card';
export type { CardProps, StatsCardProps, QuickActionCardProps } from './Card';

export { Button, IconButton, ButtonGroup } from './Button';
export type { ButtonProps, IconButtonProps, ButtonGroupProps } from './Button';

export { Input, Textarea, Select } from './Input';
export type { InputProps, TextareaProps, SelectProps } from './Input';

// Layout Components
export { 
  Container, 
  Grid, 
  Stack, 
  Flex, 
  Section, 
  PageHeader 
} from './Layout';
export type { 
  ContainerProps, 
  GridProps, 
  StackProps, 
  FlexProps, 
  SectionProps, 
  PageHeaderProps 
} from './Layout';

// State Components
export { 
  LoadingState, 
  EmptyState, 
  ErrorState, 
  SuccessState,
  Skeleton,
  SkeletonGroup,
  DataListSkeleton,
  StatsCardSkeleton
} from './States';
export type { 
  LoadingStateProps, 
  EmptyStateProps, 
  ErrorStateProps, 
  SuccessStateProps,
  SkeletonProps,
  SkeletonGroupProps
} from './States';

// Performance Optimized Components (Phase F)
export { default as OptimizedStatsCard } from './OptimizedStatsCard';
export { default as OptimizedHeader } from './OptimizedHeader';
export { default as OptimizedNavigation } from './OptimizedNavigation';
export type {
  OptimizedStatsCardProps
} from './OptimizedStatsCard';
export type {
  OptimizedHeaderProps
} from './OptimizedHeader';
export type {
  OptimizedNavigationProps,
  NavigationTab
} from './OptimizedNavigation';
