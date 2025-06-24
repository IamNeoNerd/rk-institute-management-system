/**
 * Teacher Portal Feature Components - Type Definitions
 * 
 * Defines TypeScript interfaces for the Teacher Portal feature components
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

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  experience: string;
  qualifications: string[];
  employeeId: string;
  joinDate: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalLogs: number;
  achievements: number;
  concerns: number;
  progressReports: number;
}

export type ActiveTab = 'overview' | 'assignments' | 'academic-logs' | 'my-students' | 'my-courses';

// Component Props Interfaces
export interface TeacherPortalProps {
  user: User | null;
  teacherProfile: TeacherProfile | null;
  stats: DashboardStats;
  loading: boolean;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export interface TeacherHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export interface TeacherNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export interface TeacherStatsOverviewProps {
  user: User | null;
  stats: DashboardStats;
  loading: boolean;
}

export interface TeacherQuickActionsProps {
  stats: DashboardStats;
  onTabChange: (tab: ActiveTab) => void;
}

export interface TeacherDataInsightsProps {
  onUserUpdate: (user: User | null) => void;
  onTeacherProfileUpdate: (profile: TeacherProfile | null) => void;
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

// Academic Log Types
export interface AcademicLog {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  logType: 'ACHIEVEMENT' | 'CONCERN' | 'PROGRESS';
  description: string;
  date: string;
  isPrivate: boolean;
  createdBy: string;
}

// Course Types
export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  schedule: string;
  enrolledStudents: number;
  maxCapacity: number;
  materials: CourseMaterial[];
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  uploadDate: string;
}

// Assignment Types
export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  maxGrade: number;
  instructions: string;
  attachments: string[];
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late';
}

// Student Types
export interface Student {
  id: string;
  name: string;
  grade: string;
  studentId: string;
  email: string;
  enrolledCourses: string[];
  academicLogs: AcademicLog[];
  averageGrade: number;
  attendance: number;
}
