/**
 * Custom Hooks - Export Index
 * 
 * Centralized exports for all custom hooks following the three-principle
 * methodology for logic extraction. Provides clean separation of business
 * logic from presentation components.
 * 
 * Architecture:
 * - Shared hooks for common functionality (auth, API, forms)
 * - Hub-specific hooks for domain logic (people, financial, reports)
 * - Utility hooks for UI interactions and state management
 */

// Shared Hooks
export { useAuth } from './shared/useAuth';
export { useApiData, useApiMutation } from './shared/useApiData';

// People Hub Hooks
export { 
  usePeopleHubData,
  useStudentData,
  useFamilyData,
  useUserData,
  usePeopleSearch
} from './people/usePeopleHubData';

// Financial Hub Hooks
export {
  useFinancialHubData,
  useFeeAllocations,
  usePayments,
  usePaymentMutation,
  useFeeAllocationMutation,
  useOutstandingDues,
  useFinancialAnalytics
} from './financial/useFinancialHubData';

// Reports Hub Hooks
export {
  useReportsHubData,
  useAutomationReports,
  useReportGeneration,
  useReportHistory,
  useReportDownload,
  useReportAnalytics
} from './reports/useReportsHubData';

// Operations Hub Hooks
export {
  useOperationsHubData,
  type UseOperationsHubDataReturn
} from './operations/useOperationsHubData';
export {
  useAutomationJobs,
  type UseAutomationJobsReturn
} from './operations/useAutomationJobs';
export {
  useSystemHealth,
  type UseSystemHealthReturn,
  type HealthStatus,
  type SystemHealthMetrics
} from './operations/useSystemHealth';
export {
  useJobScheduler,
  type UseJobSchedulerReturn,
  type JobMetrics,
  type JobAnalysis
} from './operations/useJobScheduler';

// Shared Types
export type {
  ApiResponse,
  BaseHookState,
  AuthState,
  User,
  ApiHookConfig,
  HookError,
  LoadingState,
  DataHookReturn,
  FormHookConfig,
  FormHookReturn,
  PaginationConfig,
  PaginationHookReturn,
  SearchConfig,
  SearchHookReturn
} from './shared/types';
