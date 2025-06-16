export interface PeopleStats {
  totalStudents: number;
  totalFamilies: number;
  totalUsers: number;
  activeStudents: number;
  recentEnrollments: number;
  pendingUsers: number;
  gradeDistribution: { name: string; value: number; color: string }[];
  enrollmentTrends: { name: string; value: number; color: string }[];
  familySizeDistribution: { name: string; value: number; color: string }[];
  userRoleDistribution: { name: string; value: number; color: string }[];
}
