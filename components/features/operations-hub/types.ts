/**
 * Operations Hub Feature Components - Type Definitions
 * 
 * Defines TypeScript interfaces for the Operations Hub feature components
 * following the three-principle methodology for component breakdown.
 * 
 * Design Consistency: Maintains RK Institute professional standards
 */

export interface AutomationStatus {
  systemStatus: {
    automationEngine: string;
    scheduler: string;
    timestamp: string;
  };
  runningJobs: RunningJob[];
  scheduledJobs: ScheduledJob[];
  summary: {
    totalRunningJobs: number;
    totalScheduledJobs: number;
    activeScheduledJobs: number;
  };
}

export interface RunningJob {
  id: string;
  type: string;
  status: string;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  description: string;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
}

export type ActiveTab = 'overview' | 'reminders' | 'reports';
export type ReminderType = 'early' | 'due' | 'overdue';
export type ReportType = 'weekly' | 'monthly' | 'outstanding';
export type JobType = 'monthly-billing' | `fee-reminder-${ReminderType}` | `report-${ReportType}`;

// Component Props Interfaces
export interface OperationsHubProps {
  automationStatus: AutomationStatus | null;
  loading: boolean;
  error: string | null;
  activeTab: ActiveTab;
  triggeringJob: string | null;
  onTabChange: (tab: ActiveTab) => void;
  onTriggerMonthlyBilling: () => Promise<void>;
  onTriggerFeeReminder: (type: ReminderType) => Promise<void>;
  onTriggerReport: (type: ReportType) => Promise<void>;
}

export interface OperationsStatsOverviewProps {
  automationStatus: AutomationStatus | null;
  loading: boolean;
  error: string | null;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export interface OperationsAutomationControlProps {
  automationStatus: AutomationStatus | null;
  triggeringJob: string | null;
  activeTab: ActiveTab;
  onTriggerMonthlyBilling: () => Promise<void>;
  onTriggerFeeReminder: (type: ReminderType) => Promise<void>;
  onTriggerReport: (type: ReportType) => Promise<void>;
}

export interface OperationsJobMonitorProps {
  automationStatus: AutomationStatus | null;
  loading: boolean;
}

export interface OperationsSystemHealthProps {
  automationStatus: AutomationStatus | null;
  loading: boolean;
}

export interface OperationsDataInsightsProps {
  onAutomationStatusUpdate: (status: AutomationStatus | null) => void;
  onLoadingChange: (loading: boolean) => void;
  onErrorChange: (error: string | null) => void;
}

// Utility Types
export interface JobTriggerResult {
  success: boolean;
  data?: {
    successfulBills?: number;
    totalStudents?: number;
    successfulReminders?: number;
    totalAllocations?: number;
    executionTime?: number;
  };
  error?: string;
  details?: string;
}
