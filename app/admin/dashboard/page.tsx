'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { MetricCard, ActionCard, InsightCard } from '@/components/cards';
import { CondensedMetricCard } from '@/components/ui';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalServices: number;
  outstandingFees: number;
  recentEnrollments: number;
  systemAlerts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      setStats({
        totalStudents: 245,
        totalCourses: 12,
        totalServices: 8,
        outstandingFees: 125000,
        recentEnrollments: 15,
        systemAlerts: 3
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            System Overview
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Institute-wide metrics and priority actions
          </p>
        </div>

        {/* Key Metrics - Mobile Optimized */}
        <div className="animate-slide-up">
          {/* Mobile: Condensed horizontal layout for better density */}
          <div className="block sm:hidden space-y-2">
            <CondensedMetricCard
              title="Total Students"
              value={stats?.totalStudents || 0}
              subtitle="Active learners"
              icon={<ProfessionalIcon name="students" size={16} />}
              color="blue"
              trend={{
                value: 8.2,
                label: "vs last month",
                isPositive: true
              }}
              showTrendLabel={false}
            />
            <CondensedMetricCard
              title="Active Courses"
              value={stats?.totalCourses || 0}
              subtitle="Running programs"
              icon={<ProfessionalIcon name="courses" size={16} />}
              color="green"
            />
            <CondensedMetricCard
              title="Available Services"
              value={stats?.totalServices || 0}
              subtitle="Institute services"
              icon={<ProfessionalIcon name="transport" size={16} />}
              color="purple"
            />
            <CondensedMetricCard
              title="Outstanding Fees"
              value={`₹${((stats?.outstandingFees || 0) / 1000).toFixed(0)}K`}
              subtitle="Pending collection"
              icon={<ProfessionalIcon name="fees" size={16} />}
              color="red"
              trend={{
                value: 12.5,
                label: "vs last month",
                isPositive: false
              }}
              showTrendLabel={false}
            />
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <MetricCard
              title="Total Students"
              value={stats?.totalStudents || 0}
              subtitle="Active learners"
              icon={<ProfessionalIcon name="students" size={24} />}
              color="blue"
              trend={{
                value: 8.2,
                label: "vs last month",
                isPositive: true
              }}
            />
            <MetricCard
              title="Active Courses"
              value={stats?.totalCourses || 0}
              subtitle="Running programs"
              icon={<ProfessionalIcon name="courses" size={24} />}
              color="green"
            />
            <MetricCard
              title="Available Services"
              value={stats?.totalServices || 0}
              subtitle="Institute services"
              icon={<ProfessionalIcon name="transport" size={24} />}
              color="purple"
            />
            <MetricCard
              title="Outstanding Fees"
              value={`₹${((stats?.outstandingFees || 0) / 1000).toFixed(0)}K`}
              subtitle="Pending collection"
              icon={<ProfessionalIcon name="fees" size={24} />}
              color="red"
              trend={{
                value: 12.5,
                label: "vs last month",
                isPositive: false
              }}
            />
          </div>
        </div>

        {/* Priority Insights */}
        <div className="animate-slide-up">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Priority Insights
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InsightCard
              title="Students with Overdue Fees"
              description="Students requiring immediate fee collection attention"
              value={Math.floor((stats?.outstandingFees || 0) / 5000)}
              icon={<ProfessionalIcon name="warning" size={24} />}
              color="red"
              href="/admin/students?filter=overdue"
              badge={{
                text: "Urgent",
                color: "red"
              }}
            />

            <InsightCard
              title="Recent Enrollments"
              description="New students enrolled in the last 30 days"
              value={stats?.recentEnrollments || 0}
              icon={<ProfessionalIcon name="graduation" size={24} />}
              color="green"
              href="/admin/students?filter=recent"
              badge={{
                text: "New",
                color: "green"
              }}
            />

            <InsightCard
              title="Course Capacity"
              description="Courses approaching maximum enrollment"
              value={Math.floor((stats?.totalCourses || 0) * 0.3)}
              icon={<ProfessionalIcon name="analytics" size={24} />}
              color="yellow"
              href="/admin/courses?filter=capacity"
              badge={{
                text: "Monitor",
                color: "yellow"
              }}
            />
          </div>
        </div>

        {/* Today's Focus */}
        <div className="animate-slide-up">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Today&apos;s Focus
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard
              title="Generate Monthly Report"
              description="Create comprehensive monthly performance report"
              icon={<ProfessionalIcon name="report" size={24} />}
              color="blue"
              action={{
                type: "link",
                href: "/admin/reports?action=generate&type=monthly",
                label: "Generate Report"
              }}
            />

            <ActionCard
              title="View Outstanding Fees"
              description="Monitor and track overdue payments requiring attention"
              icon={<ProfessionalIcon name="alert" size={24} />}
              color="orange"
              action={{
                type: "link",
                href: "/admin/students?filter=overdue",
                label: "View Details"
              }}
            />

            <ActionCard
              title="Review Academic Logs"
              description="Check recent academic progress entries"
              icon={<ProfessionalIcon name="report" size={24} />}
              color="purple"
              action={{
                type: "link",
                href: "/admin/academic-logs?filter=recent",
                label: "Review Logs"
              }}
            />

            <ActionCard
              title="System Health Check"
              description="Monitor automation and system performance"
              icon={<ProfessionalIcon name="settings" size={24} />}
              color="indigo"
              action={{
                type: "link",
                href: "/admin/operations",
                label: "Check System"
              }}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card animate-slide-up">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ProfessionalIcon name="analytics" size={32} className="text-white" />
            </div>
            <p className="text-gray-600 font-medium">No recent activity to display.</p>
            <p className="text-sm text-gray-500 mt-2">Activity will appear here as you use the system.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
