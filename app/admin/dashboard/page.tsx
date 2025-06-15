'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { MetricCard, ActionCard, InsightCard } from '@/components/cards';

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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          <MetricCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            subtitle="Active learners"
            icon="👨‍🎓"
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
            icon="📚"
            color="green"
          />

          <MetricCard
            title="Available Services"
            value={stats?.totalServices || 0}
            subtitle="Institute services"
            icon="🚌"
            color="purple"
          />

          <MetricCard
            title="Outstanding Fees"
            value={`₹${((stats?.outstandingFees || 0) / 1000).toFixed(0)}K`}
            subtitle="Pending collection"
            icon="💰"
            color="red"
            trend={{
              value: 12.5,
              label: "vs last month",
              isPositive: false
            }}
          />
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
              icon="⚠️"
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
              icon="🎓"
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
              icon="📊"
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
              icon="📊"
              color="blue"
              action={{
                type: "link",
                href: "/admin/reports?action=generate&type=monthly",
                label: "Generate Report"
              }}
            />

            <ActionCard
              title="Send Fee Reminders"
              description="Send automated reminders to students with pending fees"
              icon="📧"
              color="orange"
              action={{
                type: "link",
                href: "/admin/operations?action=reminders",
                label: "Send Reminders"
              }}
            />

            <ActionCard
              title="Review Academic Logs"
              description="Check recent academic progress entries"
              icon="📝"
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
              icon="🔧"
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
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-gray-600 font-medium">No recent activity to display.</p>
            <p className="text-sm text-gray-500 mt-2">Activity will appear here as you use the system.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
