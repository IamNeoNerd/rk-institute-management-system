'use client';

import {
  ParentHeader,
  ParentChildSelector,
  ParentNavigation,
  ParentStatsOverview,
  ParentQuickActions,
  ParentDataInsights,
  User,
  FamilyProfile,
  DashboardStats,
  ActiveTab
} from '@/components/features/parent-portal';
import { useParentPortalData } from '@/hooks';

import ChildrenView from '../components/ChildrenView';
import FamilyAcademicView from '../components/FamilyAcademicView';
import FamilyAssignmentsView from '../components/FamilyAssignmentsView';
import FamilyFeesView from '../components/FamilyFeesView';
import FamilyOverview from '../components/FamilyOverview';

export default function ParentDashboard() {
  const {
    user,
    familyProfile,
    stats,
    loading,
    activeTab,
    selectedChild,
    setUser,
    setFamilyProfile,
    setStats,
    setLoading,
    setActiveTab,
    setSelectedChild,
    handleLogout
  } = useParentPortalData();

  // Mock data for development - in production this would come from the data insights component
  if (loading && !familyProfile) {
    // Set mock data for development
    setFamilyProfile({
      id: 'family-1',
      name: 'The Johnson Family',
      email: 'johnson.family@email.com',
      phone: '+1-217-555-0101',
      address: '123 Oak Street, Springfield, IL 62701',
      discountAmount: 500,
      children: [
        {
          id: 'student-1',
          name: 'Emma Johnson',
          grade: 'Grade 11',
          studentId: 'STU001'
        },
        {
          id: 'student-2',
          name: 'Liam Johnson',
          grade: 'Grade 9',
          studentId: 'STU002'
        }
      ]
    });

    setStats({
      totalChildren: 2,
      totalMonthlyFee: 17000,
      outstandingDues: 0,
      totalAchievements: 3,
      totalConcerns: 0,
      lastPaymentDate: '2024-06-10'
    });

    setLoading(false);
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Data Management Component - handles all API calls and state */}
      <ParentDataInsights
        onUserUpdate={setUser}
        onFamilyProfileUpdate={setFamilyProfile}
        onStatsUpdate={setStats}
        onLoadingChange={setLoading}
      />

      {/* Header */}
      <ParentHeader familyProfile={familyProfile} onLogout={handleLogout} />

      {/* Child Selector */}
      <ParentChildSelector
        familyProfile={familyProfile}
        selectedChild={selectedChild}
        onChildChange={setSelectedChild}
      />

      {/* Navigation */}
      <ParentNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {activeTab === 'overview' && (
          <div className='space-y-8'>
            {/* Stats Overview */}
            <ParentStatsOverview
              familyProfile={familyProfile}
              stats={stats}
              loading={loading}
            />

            {/* Quick Actions */}
            <ParentQuickActions stats={stats} onTabChange={setActiveTab} />
          </div>
        )}

        {activeTab === 'children' && (
          <ChildrenView selectedChild={selectedChild} />
        )}
        {activeTab === 'fees' && (
          <FamilyFeesView selectedChild={selectedChild} />
        )}
        {activeTab === 'assignments' && (
          <FamilyAssignmentsView selectedChild={selectedChild} />
        )}
        {activeTab === 'academic' && (
          <FamilyAcademicView selectedChild={selectedChild} />
        )}
      </main>
    </div>
  );
}
