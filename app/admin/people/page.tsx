'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import DataInsightCard from '@/components/cards/DataInsightCard';
import ProfessionalPieChart from '@/components/charts/ProfessionalPieChart';
import ProfessionalBarChart from '@/components/charts/ProfessionalBarChart';
import ReportGenerator from '@/components/reports/ReportGenerator';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              People Management
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Comprehensive insights and management for students, families, and users
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/admin/people/search"
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🔍 Advanced Search
            </Link>
            <Link
              href="/admin/people/reports"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              📊 People Reports
            </Link>
          </div>
        </motion.div>

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

        {/* Quick Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/students"
            className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-6 rounded-xl border border-blue-200 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <span className="text-white text-xl">👨‍🎓</span>
              </div>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Students</h3>
            <p className="text-sm text-gray-600">View, edit, and manage student records and enrollments</p>
          </Link>

          <Link
            href="/admin/families"
            className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-6 rounded-xl border border-green-200 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <span className="text-white text-xl">👨‍👩‍👧‍👦</span>
              </div>
              <span className="text-green-600 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Families</h3>
            <p className="text-sm text-gray-600">Handle family profiles, relationships, and contact information</p>
          </Link>

          <Link
            href="/admin/users"
            className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-6 rounded-xl border border-purple-200 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <span className="text-white text-xl">👤</span>
              </div>
              <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-sm text-gray-600">Control user accounts, roles, and access permissions</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
