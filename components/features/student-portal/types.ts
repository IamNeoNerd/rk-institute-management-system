/**
 * Student Portal Feature Components - Type Definitions
 * 
 * Defines TypeScript interfaces for the Student Portal feature components
 * following the three-principle methodology for component breakdown.
 * 
 * Design Consistency: Maintains RK Institute professional standards
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  studentId: string;
  dateOfBirth: string;
  enrollmentDate: string;
  family: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface DashboardStats {
  totalCourses: number;
  totalServices: number;
  currentMonthFee: number;
  outstandingDues: number;
  academicLogs: number;
  achievements: number;
}

export type ActiveTab = 'overview' | 'my-courses' | 'my-fees' | 'assignments' | 'academic-logs';

// Component Props Interfaces
export interface StudentPortalProps {
  user: User | null;
  studentProfile: StudentProfile | null;
  stats: DashboardStats;
  loading: boolean;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export interface StudentHeaderProps {
  studentProfile: StudentProfile | null;
  onLogout: () => void;
}

export interface StudentNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export interface StudentStatsOverviewProps {
  studentProfile: StudentProfile | null;
  stats: DashboardStats;
  loading: boolean;
}

export interface StudentQuickActionsProps {
  stats: DashboardStats;
  onTabChange: (tab: ActiveTab) => void;
}

export interface StudentProfileSummaryProps {
  studentProfile: StudentProfile | null;
}

export interface StudentDataInsightsProps {
  onUserUpdate: (user: User | null) => void;
  onStudentProfileUpdate: (profile: StudentProfile | null) => void;
  onStatsUpdate: (stats: DashboardStats) => void;
  onLoadingChange: (loading: boolean) => void;
}

// Navigation Tab Interface
export interface NavigationTab {
  id: ActiveTab;
  name: string;
  icon: string;
}

// Quick Action Interface
export interface QuickAction {
  id: ActiveTab;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  hoverColor: string;
}

// Stat Card Interface
export interface StatCardData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  bgColor: string;
  textColor?: string;
  valueColor?: string;
}
