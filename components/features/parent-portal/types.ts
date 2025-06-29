/**
 * Parent Portal Feature Components - Type Definitions
 *
 * Defines TypeScript interfaces for the Parent Portal feature components
 * following the three-principle methodology for component breakdown.
 *
 * Design Consistency: Maintains RK Institute professional standards
 */

import React from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Child {
  id: string;
  name: string;
  grade: string;
  studentId: string;
  dateOfBirth?: string;
  enrollmentDate?: string;
  averageGrade?: number;
  attendance?: number;
}

export interface FamilyProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  discountAmount: number;
  children: Child[];
  emergencyContacts?: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface DashboardStats {
  totalChildren: number;
  totalMonthlyFee: number;
  outstandingDues: number;
  totalAchievements: number;
  totalConcerns: number;
  lastPaymentDate: string;
}

export type ActiveTab = 'overview' | 'children' | 'fees' | 'assignments' | 'academic';

// Component Props Interfaces
export interface ParentPortalProps {
  user: User | null;
  familyProfile: FamilyProfile | null;
  stats: DashboardStats;
  loading: boolean;
  activeTab: ActiveTab;
  selectedChild: string;
  onTabChange: (tab: ActiveTab) => void;
  onChildChange: (childId: string) => void;
  onLogout: () => void;
}

export interface ParentHeaderProps {
  familyProfile: FamilyProfile | null;
  onLogout: () => void;
}

export interface ParentChildSelectorProps {
  familyProfile: FamilyProfile | null;
  selectedChild: string;
  onChildChange: (childId: string) => void;
}

export interface ParentNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export interface ParentStatsOverviewProps {
  familyProfile: FamilyProfile | null;
  stats: DashboardStats;
  loading: boolean;
}

export interface ParentQuickActionsProps {
  stats: DashboardStats;
  onTabChange: (tab: ActiveTab) => void;
}

export interface ParentDataInsightsProps {
  onUserUpdate: (user: User | null) => void;
  onFamilyProfileUpdate: (profile: FamilyProfile | null) => void;
  onStatsUpdate: (stats: DashboardStats) => void;
  onLoadingChange: (loading: boolean) => void;
}

// Navigation Tab Interface
export interface NavigationTab {
  id: ActiveTab;
  name: string;
  icon: React.ReactNode; // Changed from string to ReactNode
}

// Quick Action Interface
export interface QuickAction {
  id: ActiveTab;
  title: string;
  description: string;
  icon: React.ReactNode; // Standardized to React.ReactNode
  bgColor: string;
  hoverColor: string;
}

// Stat Card Interface
export interface StatCardData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string | React.ReactNode;
  bgColor: string;
  textColor?: string;
  valueColor?: string;
}

// Family Financial Types
export interface FamilyFeeAllocation {
  id: string;
  month: string;
  year: number;
  childId: string;
  childName: string;
  tuitionFee: number;
  transportFee: number;
  examFee: number;
  otherFees: number;
  familyDiscount: number;
  totalAmount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount: number;
  remainingAmount: number;
}

export interface FamilyPayment {
  id: string;
  allocationIds: string[];
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'upi';
  transactionId?: string;
  receiptNumber: string;
  status: 'completed' | 'pending' | 'failed';
  childrenCovered: string[];
}

// Academic Progress Types
export interface ChildAcademicProgress {
  childId: string;
  childName: string;
  grade: string;
  subjects: SubjectProgress[];
  overallGrade: number;
  attendance: number;
  achievements: Achievement[];
  concerns: Concern[];
  recentLogs: AcademicLog[];
}

export interface SubjectProgress {
  subject: string;
  teacher: string;
  currentGrade: number;
  attendance: number;
  lastAssignment: string;
  lastAssignmentGrade?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  subject?: string;
  teacher: string;
  type: 'academic' | 'extracurricular' | 'behavior';
}

export interface Concern {
  id: string;
  title: string;
  description: string;
  date: string;
  subject?: string;
  teacher: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'addressed' | 'resolved';
}

export interface AcademicLog {
  id: string;
  studentId: string;
  subject: string;
  logType: 'ACHIEVEMENT' | 'CONCERN' | 'PROGRESS';
  description: string;
  date: string;
  isPrivate: boolean;
  createdBy: string;
  teacherName: string;
}

// Assignment Types
export interface ChildAssignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacher: string;
  childId: string;
  childName: string;
  dueDate: string;
  submissionDate?: string;
  grade?: number;
  maxGrade: number;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  feedback?: string;
}
