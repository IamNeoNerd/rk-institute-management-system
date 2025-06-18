'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/layout/AdminLayout';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import DataInsightCard from '@/components/cards/DataInsightCard';
import { HubHeader, HubActionButton, ManagementCard } from '@/components/hub';
import { BookOpen, Target, FileText, BarChart3, TrendingUp } from 'lucide-react';

// Dynamic import for chart component (SSR disabled for vendor bundle compatibility)
const ProfessionalPieChart = dynamic(() => import('@/components/charts/ProfessionalPieChart'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>,
  ssr: false
});

interface AcademicStats {
  totalCourses: number;
  totalServices: number;
  totalAcademicLogs: number;
  activeCourses: number;
  activeServices: number;
  recentLogs: number;
  totalEnrollments: number;
  averageProgress: number;
}



export default function AcademicsHubPage() {
  const [stats, setStats] = useState<AcademicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAcademicStats();
  }, []);

  const fetchAcademicStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/academic/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Failed to fetch academic statistics');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading academic data...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <HubHeader
          title="Academic Management"
          subtitle="Unified hub for courses, services and student progress"
          actions={
            <>
              <HubActionButton href="/admin/academic/analytics" icon={TrendingUp} label="Academic Analytics" color="gray" />
              <HubActionButton href="/admin/academic/reports" icon={BarChart3} label="Academic Reports" color="blue" />
            </>
          }
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl animate-fade-in">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          <ProfessionalMetricCard
            title="Total Courses"
            value={stats?.totalCourses || 0}
            subtitle="Academic offerings"
            icon="book-open"
            color="blue"
            trend={{
              value: 5.2,
              label: "vs last month",
              isPositive: true
            }}
          />
          <ProfessionalMetricCard
            title="Active Services"
            value={stats?.totalServices || 0}
            subtitle="Institute services"
            icon="target"
            color="green"
          />
          <ProfessionalMetricCard
            title="Academic Logs"
            value={stats?.totalAcademicLogs || 0}
            subtitle="Progress entries"
            icon="file-text"
            color="purple"
            trend={{
              value: 12.8,
              label: "vs last month",
              isPositive: true
            }}
          />
          <ProfessionalMetricCard
            title="Total Enrollments"
            value={stats?.totalEnrollments || 0}
            subtitle="Active enrollments"
            icon="trending-up"
            color="indigo"
            trend={{
              value: 8.5,
              label: "vs last month",
              isPositive: true
            }}
          />
        </div>

        {/* Primary Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ManagementCard
            href="/admin/courses"
            icon={BookOpen}
            title="Course Management"
            description="Manage academic courses, curriculum, and course-related fee structures"
            color="blue"
            delay={0.1}
          />
          <ManagementCard
            href="/admin/services"
            icon={Target}
            title="Service Management"
            description="Manage institute services like transport, meals, and extracurricular activities"
            color="green"
            delay={0.2}
          />
          <ManagementCard
            href="/admin/academic-logs"
            icon={FileText}
            title="Academic Progress"
            description="Track student academic performance, assignments, and progress reports"
            color="purple"
            delay={0.3}
          />
        </div>

        {/* Data Insights */}
        <div className="animate-slide-up">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Academic Insights
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            <DataInsightCard
              title="Course Completion Rate"
              description="Students completing courses successfully"
              value={stats ? Math.floor(stats.averageProgress) : 0}
              icon="trending-up"
              color="green"
              href="/admin/courses?filter=completion"
              badge={{
                text: "Excellent",
                color: "green"
              }}
              trend={{
                value: 8.5,
                isPositive: true
              }}
            />

            <DataInsightCard
              title="Active Enrollments"
              description="Current student enrollments across all courses"
              value={stats?.totalEnrollments || 0}
              icon="users"
              color="blue"
              href="/admin/courses?filter=enrollments"
              badge={{
                text: "Active",
                color: "blue"
              }}
              trend={{
                value: 12.3,
                isPositive: true
              }}
            />

            <DataInsightCard
              title="Service Utilization"
              description="Students using institute services"
              value={stats ? Math.floor(stats.totalEnrollments * 0.6) : 0}
              icon="target"
              color="purple"
              href="/admin/services?filter=utilization"
              badge={{
                text: "High",
                color: "purple"
              }}
            />
          </div>
        </div>

        {/* Data Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Course Distribution</h3>
            {stats ? (
              <ProfessionalPieChart
                title="Course Distribution"
                data={[
                  { name: 'Active Courses', value: stats.activeCourses, color: '#3B82F6' },
                  { name: 'Inactive Courses', value: stats.totalCourses - stats.activeCourses, color: '#E5E7EB' },
                ]}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-400">Loading chart data...</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Service Distribution</h3>
            {stats ? (
              <ProfessionalPieChart
                title="Service Distribution"
                data={[
                  { name: 'Active Services', value: stats.activeServices, color: '#10B981' },
                  { name: 'Inactive Services', value: stats.totalServices - stats.activeServices, color: '#E5E7EB' },
                ]}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-400">Loading chart data...</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Academic Activity</h3>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-gray-600 font-medium">Recent activity tracking coming soon</p>
            <p className="text-sm text-gray-500 mt-2">This will show recent course enrollments, academic log entries, and service subscriptions</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
