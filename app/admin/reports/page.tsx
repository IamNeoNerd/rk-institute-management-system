'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

interface ReportData {
  totalStudents: number;
  totalFamilies: number;
  totalCourses: number;
  totalServices: number;
  monthlyRevenue: number;
  outstandingDues: number;
  totalDiscounts: number;
  recentPayments: {
    id: string;
    amount: number;
    paymentDate: string;
    family: {
      name: string;
      students: {
        name: string;
      }[];
    };
  }[];
  topCourses: {
    id: string;
    name: string;
    studentCount: number;
    revenue: number;
  }[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports?month=${selectedMonth}&year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        setError('Failed to fetch report data');
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
          <div className="text-lg">Loading reports...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex justify-between items-center animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Reports & Analytics</h1>
              <p className="mt-2 text-lg text-gray-600">
                Comprehensive insights into institute performance
              </p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl animate-fade-in">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Reports & Analytics</h1>
            <p className="mt-2 text-lg text-gray-600">
              Comprehensive insights into institute performance
            </p>
          </div>
          <div className="flex space-x-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="input-field"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input-field"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={selectedYear - 2 + i} value={selectedYear - 2 + i}>
                  {selectedYear - 2 + i}
                </option>
              ))}
            </select>
          </div>
        </div>

        {reportData && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              <div className="card-compact">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="card-compact">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{reportData.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="card-compact">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Outstanding Dues</p>
                    <p className="text-2xl font-bold text-gray-900">₹{reportData.outstandingDues.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="card-compact">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Discounts</p>
                    <p className="text-2xl font-bold text-gray-900">₹{reportData.totalDiscounts.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Payments */}
              <div className="card animate-fade-in">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Payments</h3>
                <div className="space-y-4">
                  {reportData.recentPayments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent payments found</p>
                  ) : (
                    reportData.recentPayments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{payment.family.students[0]?.name || 'Unknown Student'}</p>
                          <p className="text-sm text-gray-500">{payment.family.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Courses */}
              <div className="card animate-fade-in">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Courses</h3>
                <div className="space-y-4">
                  {reportData.topCourses.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No course data available</p>
                  ) : (
                    reportData.topCourses.map((course, index) => (
                      <div key={course.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{course.name}</p>
                            <p className="text-sm text-gray-500">{course.studentCount} students</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{course.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Revenue</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div className="card-compact text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{reportData.totalFamilies}</div>
                <div className="text-sm font-medium text-gray-600">Total Families</div>
              </div>
              <div className="card-compact text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{reportData.totalCourses}</div>
                <div className="text-sm font-medium text-gray-600">Active Courses</div>
              </div>
              <div className="card-compact text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{reportData.totalServices}</div>
                <div className="text-sm font-medium text-gray-600">Available Services</div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
