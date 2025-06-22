/**
 * Reports Hub Feature Components - Type Definitions
 * 
 * Defines TypeScript interfaces for the Reports Hub feature components
 * following the three-principle methodology for component breakdown.
 * 
 * Design Consistency: Maintains RK Institute professional standards
 */

export interface ReportData {
  totalStudents: number;
  totalFamilies: number;
  totalCourses: number;
  totalServices: number;
  monthlyRevenue: number;
  outstandingDues: number;
  totalDiscounts: number;
  recentPayments: {
    id: string;
    amount: number;
    paymentDate: string;
    family: {
      name: string;
      students: {
        name: string;
      }[];
    };
  }[];
  topCourses: {
    id: string;
    name: string;
    studentCount: number;
    revenue: number;
  }[];
}

export interface AutomationReport {
  id: string;
  name: string;
  type: 'WEEKLY' | 'MONTHLY' | 'OUTSTANDING';
  status: 'COMPLETED' | 'GENERATING' | 'FAILED';
  createdAt: string;
  executionTime?: number;
  fileSize?: number;
  downloadCount: number;
}

export type ActiveTab = 'dashboard' | 'automated' | 'history';
export type ReportType = 'weekly' | 'monthly' | 'outstanding';

export interface ReportsHubProps {
  reportData: ReportData | null;
  loading: boolean;
  error: string;
  selectedMonth: number;
  selectedYear: number;
  activeTab: ActiveTab;
  automationReports: AutomationReport[];
  generatingReport: string | null;
  onRefresh?: () => void;
}

export interface ReportsStatsOverviewProps {
  reportData: ReportData | null;
  loading: boolean;
  error: string;
  selectedMonth: number;
  selectedYear: number;
  activeTab: ActiveTab;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onTabChange: (tab: ActiveTab) => void;
}

export interface ReportsLiveDashboardProps {
  reportData: ReportData | null;
  loading: boolean;
}

export interface ReportsAutomationHubProps {
  automationReports: AutomationReport[];
  generatingReport: string | null;
  onGenerateReport: (reportType: ReportType) => void;
}

export interface ReportsHistoryManagerProps {
  // Future implementation for report history
  reports?: any[];
}

export interface ReportsDataInsightsProps {
  selectedMonth: number;
  selectedYear: number;
  activeTab: ActiveTab;
  onReportDataUpdate: (data: ReportData | null) => void;
  onLoadingChange: (loading: boolean) => void;
  onErrorChange: (error: string) => void;
  onAutomationReportsUpdate: (reports: AutomationReport[]) => void;
}
