'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';

export default function AcademicAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  useEffect(() => {
    // Simulate loading for now
    setTimeout(() => setLoading(false), 1000);
  }, [selectedPeriod]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics data...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Academic Analytics
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Comprehensive insights into academic performance and trends
            </p>
          </div>
          <div className="flex space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <Link
              href="/admin/academic"
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ← Back to Academic Hub
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl animate-fade-in">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enrollment Growth</p>
                <p className="text-2xl font-bold text-green-600">+12.5%</p>
              </div>
              <div className="text-green-500 text-2xl">📈</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">vs previous period</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Progress</p>
                <p className="text-2xl font-bold text-blue-600">78.3%</p>
              </div>
              <div className="text-blue-500 text-2xl">🎯</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">across all courses</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                <p className="text-2xl font-bold text-purple-600">8</p>
              </div>
              <div className="text-purple-500 text-2xl">👨‍🏫</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">managing courses</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-orange-600">85.7%</p>
              </div>
              <div className="text-orange-500 text-2xl">✅</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">course completion</p>
          </div>
        </div>

        {/* Enrollment Trends */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Enrollment Trends</h2>
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <p className="text-gray-500">Enrollment trend charts coming soon</p>
            <p className="text-sm text-gray-400 mt-2">This will show course and service enrollment trends over time</p>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Courses */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Performing Courses</h2>
            <div className="space-y-4">
              {[
                { name: 'Mathematics Advanced', enrollments: 25, progress: 82 },
                { name: 'Science Foundation', enrollments: 22, progress: 78 },
                { name: 'English Literature', enrollments: 20, progress: 85 },
                { name: 'Computer Science', enrollments: 18, progress: 90 },
                { name: 'Physics Honors', enrollments: 15, progress: 75 }
              ].map((course, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.enrollments} students enrolled</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{course.progress}%</div>
                    <div className="text-xs text-gray-500">avg progress</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Services</h2>
            <div className="space-y-4">
              {[
                { name: 'School Transport', subscriptions: 35, satisfaction: 92 },
                { name: 'Lunch Program', subscriptions: 28, satisfaction: 88 },
                { name: 'After School Care', subscriptions: 20, satisfaction: 85 },
                { name: 'Sports Activities', subscriptions: 18, satisfaction: 95 },
                { name: 'Music Lessons', subscriptions: 12, satisfaction: 90 }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.subscriptions} subscriptions</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{service.satisfaction}%</div>
                    <div className="text-xs text-gray-500">satisfaction</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Progress Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">32%</div>
              <div className="text-sm text-green-800">Excellent (90-100%)</div>
              <div className="text-xs text-gray-500 mt-1">18 students</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">28%</div>
              <div className="text-sm text-blue-800">Good (80-89%)</div>
              <div className="text-xs text-gray-500 mt-1">16 students</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600">25%</div>
              <div className="text-sm text-yellow-800">Average (70-79%)</div>
              <div className="text-xs text-gray-500 mt-1">14 students</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-3xl font-bold text-red-600">15%</div>
              <div className="text-sm text-red-800">Needs Support (<70%)</div>
              <div className="text-xs text-gray-500 mt-1">8 students</div>
            </div>
          </div>
        </div>

        {/* Teacher Performance */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Teacher Performance Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Teacher</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Students</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Avg Progress</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Logs Created</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Performance</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Dr. Sarah Johnson', students: 25, progress: 85, logs: 45, performance: 'Excellent' },
                  { name: 'Prof. Michael Chen', students: 22, progress: 82, logs: 38, performance: 'Excellent' },
                  { name: 'Ms. Emily Davis', students: 20, progress: 78, logs: 42, performance: 'Good' },
                  { name: 'Mr. David Wilson', students: 18, progress: 80, logs: 35, performance: 'Good' },
                  { name: 'Dr. Lisa Brown', students: 15, progress: 88, logs: 28, performance: 'Excellent' }
                ].map((teacher, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{teacher.name}</td>
                    <td className="py-3 px-4 text-gray-600">{teacher.students}</td>
                    <td className="py-3 px-4 text-gray-600">{teacher.progress}%</td>
                    <td className="py-3 px-4 text-gray-600">{teacher.logs}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        teacher.performance === 'Excellent' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {teacher.performance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
