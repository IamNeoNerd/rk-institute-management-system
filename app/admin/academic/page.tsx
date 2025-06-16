'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { HubHeader, HubActionButton, ManagementCard } from '@/components/hub';
import { BookOpen, Target, FileText, BarChart3, TrendingUp } from 'lucide-react';

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Academic Performance Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Performance Overview</h2>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalEnrollments}</div>
                <div className="text-sm text-blue-800 font-medium">Total Enrollments</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.averageProgress}%</div>
                <div className="text-sm text-green-800 font-medium">Average Progress</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.recentLogs}</div>
                <div className="text-sm text-purple-800 font-medium">Recent Logs (7 days)</div>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-100">
                <div className="text-3xl font-bold text-orange-600 mb-2">{stats.activeCourses + stats.activeServices}</div>
                <div className="text-sm text-orange-800 font-medium">Active Offerings</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg">Loading performance data...</p>
            </div>
          )}
        </div>

        {/* Academic Performance Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Academic Performance Overview</h2>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{stats.totalEnrollments}</div>
                <div className="text-sm text-blue-800">Total Enrollments</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{stats.averageProgress}%</div>
                <div className="text-sm text-green-800">Average Progress</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{stats.recentLogs}</div>
                <div className="text-sm text-purple-800">Recent Logs (7 days)</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">{stats.activeCourses + stats.activeServices}</div>
                <div className="text-sm text-orange-800">Active Offerings</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <p className="text-gray-500">Loading performance data...</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Academic Activity</h2>
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <p className="text-gray-500">Recent activity tracking coming soon</p>
            <p className="text-sm text-gray-400 mt-2">This will show recent course enrollments, academic log entries, and service subscriptions</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
