/**
 * Advanced Reporting System - Type Definitions
 *
 * Comprehensive reporting system for RK Institute Management System.
 * Leverages existing architecture and components for rapid development.
 *
 * Features:
 * - Academic progress reports
 * - Financial summary reports
 * - Attendance and performance analytics
 * - Custom report generation
 * - Cross-portal report access
 */

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'financial' | 'attendance' | 'performance' | 'custom';
  userRoles: ('admin' | 'teacher' | 'parent' | 'student')[];
  parameters: ReportParameter[];
  outputFormats: ('pdf' | 'excel' | 'csv')[];
  estimatedTime: number; // in seconds
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportParameter {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  userId: string;
  userRole: string;
  parameters: Record<string, any>;
  status: 'generating' | 'completed' | 'failed' | 'expired';
  format: 'pdf' | 'excel' | 'csv';
  fileUrl?: string;
  fileSize?: number;
  generatedAt: string;
  expiresAt: string;
  downloadCount: number;
  error?: string;
}

export interface ReportStats {
  totalReports: number;
  reportsThisMonth: number;
  popularTemplates: Array<{
    templateId: string;
    templateName: string;
    usageCount: number;
  }>;
  averageGenerationTime: number;
  successRate: number;
  storageUsed: number; // in MB
}

// Component Props Interfaces
export interface ReportingSystemProps {
  userRole: 'admin' | 'teacher' | 'parent' | 'student';
  userId: string;
  onReportGenerated?: (report: GeneratedReport) => void;
}

export interface ReportTemplateListProps {
  templates: ReportTemplate[];
  userRole: string;
  onSelectTemplate: (template: ReportTemplate) => void;
  loading?: boolean;
}

export interface ReportGeneratorProps {
  template: ReportTemplate | null;
  onGenerate: (
    templateId: string,
    parameters: Record<string, any>,
    format: string
  ) => void;
  onCancel: () => void;
  generating?: boolean;
}

export interface ReportHistoryProps {
  reports: GeneratedReport[];
  onDownload: (reportId: string) => void;
  onDelete: (reportId: string) => void;
  loading?: boolean;
}

export interface ReportStatsOverviewProps {
  stats: ReportStats;
  userRole: string;
  loading?: boolean;
}

export interface ReportDataInsightsProps {
  userRole: string;
  userId: string;
  onTemplatesUpdate: (templates: ReportTemplate[]) => void;
  onReportsUpdate: (reports: GeneratedReport[]) => void;
  onStatsUpdate: (stats: ReportStats) => void;
  onLoadingChange: (loading: boolean) => void;
}

// Academic Report Types
export interface AcademicReportData {
  studentId: string;
  studentName: string;
  grade: string;
  subjects: Array<{
    name: string;
    teacher: string;
    currentGrade: number;
    attendance: number;
    assignments: number;
    achievements: string[];
    concerns: string[];
  }>;
  overallGrade: number;
  overallAttendance: number;
  behaviorNotes: string[];
  recommendations: string[];
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
}

// Financial Report Types
export interface FinancialReportData {
  familyId?: string;
  familyName?: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalFees: number;
    totalPaid: number;
    totalOutstanding: number;
    discountsApplied: number;
  };
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
    type: 'fee' | 'payment' | 'discount' | 'penalty';
    status: 'completed' | 'pending' | 'failed';
  }>;
  children: Array<{
    childId: string;
    childName: string;
    grade: string;
    monthlyFee: number;
    totalPaid: number;
    outstanding: number;
  }>;
}

// Attendance Report Types
export interface AttendanceReportData {
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  students: Array<{
    studentId: string;
    studentName: string;
    grade: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    attendanceRate: number;
    lateArrivals: number;
    earlyDepartures: number;
  }>;
  classAverages: {
    [grade: string]: {
      averageAttendance: number;
      totalStudents: number;
    };
  };
  trends: Array<{
    date: string;
    attendanceRate: number;
  }>;
}

// Performance Report Types
export interface PerformanceReportData {
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  overview: {
    totalStudents: number;
    averageGrade: number;
    improvementRate: number;
    concernsCount: number;
  };
  gradeDistribution: {
    [grade: string]: {
      excellent: number; // 90-100
      good: number; // 80-89
      average: number; // 70-79
      needsWork: number; // <70
    };
  };
  subjectPerformance: Array<{
    subject: string;
    teacher: string;
    averageGrade: number;
    studentCount: number;
    improvementTrend: 'up' | 'down' | 'stable';
  }>;
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    grade: string;
    overallScore: number;
  }>;
  needsAttention: Array<{
    studentId: string;
    studentName: string;
    grade: string;
    concerns: string[];
    recommendedActions: string[];
  }>;
}

// Report Generation Request
export interface ReportGenerationRequest {
  templateId: string;
  parameters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv';
  userId: string;
  userRole: string;
}

// Report Filter Options
export interface ReportFilters {
  category?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  status?: string;
  format?: string;
  userRole?: string;
}
