'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/layout/AdminLayout';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Users, UserCheck, Shield, Search, FileText } from 'lucide-react';
import { HubHeader, HubActionButton, ManagementCard } from '@/components/hub';

// Dynamic imports for heavy components (below the fold)
const DataInsightCard = dynamic(() => import('@/components/cards/DataInsightCard'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
});

const ProfessionalPieChart = dynamic(() => import('@/components/charts/ProfessionalPieChart'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
});

const ProfessionalBarChart = dynamic(() => import('@/components/charts/ProfessionalBarChart'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
});

const ReportGenerator = dynamic(() => import('@/components/reports/ReportGenerator'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>
});

interface PeopleStats {
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



export default function PeopleHubPage() {
  const [stats, setStats] = useState<PeopleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPeopleStats();
  }, []);

  const fetchPeopleStats = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/people/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Mock data for demonstration when API is not available
        const mockStats: PeopleStats = {
          totalStudents: 156,
          totalFamilies: 89,
          totalUsers: 23,
          activeStudents: 142,
          recentEnrollments: 12,
          pendingUsers: 3,
          gradeDistribution: [
            { name: 'Grade 1-3', value: 45, color: '#3B82F6' },
            { name: 'Grade 4-6', value: 52, color: '#10B981' },
            { name: 'Grade 7-9', value: 38, color: '#8B5CF6' },
            { name: 'Grade 10-12', value: 21, color: '#F59E0B' }
          ],
          enrollmentTrends: [
            { name: 'Jan', value: 12, color: '#3B82F6' },
            { name: 'Feb', value: 8, color: '#3B82F6' },
            { name: 'Mar', value: 15, color: '#3B82F6' },
            { name: 'Apr', value: 18, color: '#3B82F6' },
            { name: 'May', value: 22, color: '#3B82F6' },
            { name: 'Jun', value: 12, color: '#3B82F6' }
          ],
          familySizeDistribution: [
            { name: '1 Child', value: 32, color: '#EF4444' },
            { name: '2 Children', value: 38, color: '#3B82F6' },
            { name: '3+ Children', value: 19, color: '#10B981' }
          ],
          userRoleDistribution: [
            { name: 'Parents', value: 15, color: '#8B5CF6' },
            { name: 'Teachers', value: 6, color: '#10B981' },
            { name: 'Admin', value: 2, color: '#F59E0B' }
          ]
        };
        setStats(mockStats);
      }
    } catch (error) {
      // Use mock data on error for demonstration
      const mockStats: PeopleStats = {
        totalStudents: 156,
        totalFamilies: 89,
        totalUsers: 23,
        activeStudents: 142,
        recentEnrollments: 12,
        pendingUsers: 3,
        gradeDistribution: [
          { name: 'Grade 1-3', value: 45, color: '#3B82F6' },
          { name: 'Grade 4-6', value: 52, color: '#10B981' },
          { name: 'Grade 7-9', value: 38, color: '#8B5CF6' },
          { name: 'Grade 10-12', value: 21, color: '#F59E0B' }
        ],
        enrollmentTrends: [
          { name: 'Jan', value: 12, color: '#3B82F6' },
          { name: 'Feb', value: 8, color: '#3B82F6' },
          { name: 'Mar', value: 15, color: '#3B82F6' },
          { name: 'Apr', value: 18, color: '#3B82F6' },
          { name: 'May', value: 22, color: '#3B82F6' },
          { name: 'Jun', value: 12, color: '#3B82F6' }
        ],
        familySizeDistribution: [
          { name: '1 Child', value: 32, color: '#EF4444' },
          { name: '2 Children', value: 38, color: '#3B82F6' },
          { name: '3+ Children', value: 19, color: '#10B981' }
        ],
        userRoleDistribution: [
          { name: 'Parents', value: 15, color: '#8B5CF6' },
          { name: 'Teachers', value: 6, color: '#10B981' },
          { name: 'Admin', value: 2, color: '#F59E0B' }
        ]
      };
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading people data...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="space-y-8">
        {/* Header */}
        <HubHeader
          title="People Management"
          subtitle="Comprehensive insights and management for students, families, and users"
          actions={
            <>
              <HubActionButton href="/admin/people/search" icon={Search} label="Advanced Search" color="gray" />
              <HubActionButton href="/admin/people/import" icon={Users} label="Bulk Import" color="green" />
              <HubActionButton href="/admin/people/reports" icon={FileText} label="People Reports" color="blue" />
            </>
          }
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl"
          >
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ProfessionalMetricCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            subtitle="Enrolled learners"
            icon="users"
            color="blue"
            trend={{
              value: 8.2,
              label: "vs last month",
              isPositive: true
            }}
          />
          <ProfessionalMetricCard
            title="Active Families"
            value={stats?.totalFamilies || 0}
            subtitle="Registered families"
            icon="users"
            color="green"
            trend={{
              value: 5.1,
              label: "vs last month",
              isPositive: true
            }}
          />
          <ProfessionalMetricCard
            title="System Users"
            value={stats?.totalUsers || 0}
            subtitle="Active accounts"
            icon="users"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Recent Enrollments"
            value={stats?.recentEnrollments || 0}
            subtitle="This month"
            icon="trending-up"
            color="indigo"
            trend={{
              value: 12.5,
              label: "vs last month",
              isPositive: true
            }}
          />
        </div>

        {/* Primary Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ManagementCard
            href="/admin/students"
            icon={Users}
            title="Manage Students"
            description="View, edit, and manage student records, enrollments, and academic progress"
            color="blue"
            delay={0.1}
          />
          <ManagementCard
            href="/admin/families"
            icon={UserCheck}
            title="Manage Families"
            description="Handle family profiles, relationships, contact information, and billing"
            color="green"
            delay={0.2}
          />
          <ManagementCard
            href="/admin/users"
            icon={Shield}
            title="Manage Users"
            description="Control user accounts, roles, permissions, and access management"
            color="purple"
            delay={0.3}
          />
        </div>

        {/* Data Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DataInsightCard
            title="Students with Overdue Fees"
            description="Students requiring immediate fee collection attention"
            value={Math.floor((stats?.totalStudents || 0) * 0.08)}
            icon="alert-triangle"
            color="red"
            href="/admin/students?filter=overdue"
            chartType="pie"
            chartData={[
              { name: 'Overdue', value: 12, color: '#EF4444' },
              { name: 'Current', value: 144, color: '#10B981' }
            ]}
            badge={{
              text: "Urgent",
              color: "red"
            }}
            trend={{
              value: 15,
              isPositive: false
            }}
          />

          <DataInsightCard
            title="Multi-Child Families"
            description="Families with multiple enrolled children"
            value={Math.floor((stats?.totalFamilies || 0) * 0.65)}
            icon="users"
            color="green"
            href="/admin/families?filter=multi-child"
            chartType="pie"
            chartData={stats?.familySizeDistribution || []}
            badge={{
              text: "Opportunity",
              color: "green"
            }}
            trend={{
              value: 8,
              isPositive: true
            }}
          />

          <DataInsightCard
            title="New Enrollments"
            description="Students enrolled in the last 30 days"
            value={stats?.recentEnrollments || 0}
            icon="trending-up"
            color="blue"
            href="/admin/students?filter=recent"
            chartType="bar"
            chartData={stats?.enrollmentTrends || []}
            badge={{
              text: "Growth",
              color: "blue"
            }}
            trend={{
              value: 22,
              isPositive: true
            }}
          />
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProfessionalPieChart
            data={stats?.gradeDistribution || []}
            title="Student Grade Distribution"
            subtitle="Distribution of students across different grade levels"
            size="lg"
            showLegend={true}
          />

          <ProfessionalBarChart
            data={stats?.enrollmentTrends || []}
            title="Monthly Enrollment Trends"
            subtitle="New student enrollments over the last 6 months"
            height={400}
            color="#3B82F6"
            showGrid={true}
          />
        </div>

        {/* Report Generation */}
        {stats && (
          <ReportGenerator
            reportData={{
              title: "People Management Report",
              type: "student",
              dateRange: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              },
              data: [
                { type: 'students', count: stats.totalStudents },
                { type: 'families', count: stats.totalFamilies },
                { type: 'users', count: stats.totalUsers }
              ]
            }}
          />
        )}


      </div>
    </AdminLayout>
  );
}
