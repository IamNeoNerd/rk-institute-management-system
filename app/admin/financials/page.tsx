'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import DataInsightCard from '@/components/cards/DataInsightCard';
import ProfessionalPieChart from '@/components/charts/ProfessionalPieChart';
import { HubHeader, HubActionButton, ManagementCard } from '@/components/hub';
import { CreditCard, DollarSign, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';

interface FinancialStats {
  totalRevenueThisMonth: number;
  totalOutstandingDues: number;
  recentPaymentActivity: number;
  totalStudentsWithDues: number;
  averageMonthlyRevenue: number;
  collectionEfficiency: number;
  totalFeeAllocations: number;
  paidAllocations: number;
  pendingAllocations: number;
  overdueAllocations: number;
  totalFamilies: number;
  familiesWithOutstanding: number;
}



export default function FinancialsHubPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFinancialStats();
  }, []);

  const fetchFinancialStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/financials/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Failed to fetch financial statistics');
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
          <div className="text-lg">Loading financial data...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <HubHeader
          title="Financial Management"
          subtitle="Unified hub for fees, payments and financial operations"
          actions={
            <>
              <HubActionButton href="/admin/financials/analytics" icon={TrendingUp} label="Financial Analytics" color="gray" />
              <HubActionButton href="/admin/reports" icon={BarChart3} label="Reports & Analytics" color="blue" />
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
            title="Monthly Revenue"
            value={`₹${stats?.totalRevenueThisMonth?.toLocaleString() || '0'}`}
            subtitle="Current month collections"
            icon="dollar-sign"
            color="green"
            trend={{
              value: 12.5,
              label: "vs last month",
              isPositive: true
            }}
          />
          <ProfessionalMetricCard
            title="Outstanding Dues"
            value={`₹${stats?.totalOutstandingDues?.toLocaleString() || '0'}`}
            subtitle="Pending collections"
            icon="alert-triangle"
            color="red"
            trend={{
              value: 5.2,
              label: "vs last month",
              isPositive: false
            }}
          />
          <ProfessionalMetricCard
            title="Collection Rate"
            value={`${stats?.collectionEfficiency || 0}%`}
            subtitle="Payment efficiency"
            icon="trending-up"
            color="blue"
            trend={{
              value: 3.8,
              label: "vs last month",
              isPositive: true
            }}
          />
          <ProfessionalMetricCard
            title="Recent Payments"
            value={stats?.recentPaymentActivity || 0}
            subtitle="Last 7 days"
            icon="credit-card"
            color="purple"
          />
        </div>



        {/* Primary Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ManagementCard
            href="/admin/fees"
            icon={CreditCard}
            title="Fee Management"
            description="Manage fee structures, allocations, and billing cycles"
            color="blue"
            delay={0.1}
          />
          <ManagementCard
            href="/admin/payments"
            icon={DollarSign}
            title="Payment Processing"
            description="Record payments, track transactions, and manage payment history"
            color="green"
            delay={0.2}
          />
          <ManagementCard
            href="/admin/fees?filter=overdue"
            icon={AlertTriangle}
            title="Outstanding Dues"
            description="Track overdue payments, manage collections, and follow up with families"
            color="red"
            delay={0.3}
          />
        </div>

        {/* Data Insights */}
        <div className="animate-slide-up">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Financial Insights
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DataInsightCard
              title="Collection Efficiency"
              description="Overall payment collection rate"
              value={stats?.collectionEfficiency || 0}
              icon="trending-up"
              color="green"
              href="/admin/payments?filter=efficiency"
              badge={{
                text: stats?.collectionEfficiency && stats.collectionEfficiency > 85 ? "Excellent" : "Good",
                color: stats?.collectionEfficiency && stats.collectionEfficiency > 85 ? "green" : "yellow"
              }}
              trend={{
                value: 3.8,
                isPositive: true
              }}
            />

            <DataInsightCard
              title="Outstanding Amount"
              description="Total pending dues from families"
              value={stats?.totalOutstandingDues || 0}
              icon="alert-triangle"
              color="red"
              href="/admin/fees?filter=overdue"
              badge={{
                text: "Urgent",
                color: "red"
              }}
              trend={{
                value: 5.2,
                isPositive: false
              }}
            />

            <DataInsightCard
              title="Monthly Revenue"
              description="Current month collections"
              value={stats?.totalRevenueThisMonth || 0}
              icon="dollar-sign"
              color="blue"
              href="/admin/payments?filter=monthly"
              badge={{
                text: "On Track",
                color: "blue"
              }}
              trend={{
                value: 12.5,
                isPositive: true
              }}
            />
          </div>
        </div>

        {/* Data Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Status Distribution</h3>
            {stats ? (
              <ProfessionalPieChart
                title="Payment Status Distribution"
                data={[
                  { name: 'Paid', value: stats.paidAllocations, color: '#10B981' },
                  { name: 'Pending', value: stats.pendingAllocations, color: '#F59E0B' },
                  { name: 'Overdue', value: stats.overdueAllocations, color: '#EF4444' },
                ]}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-400">Loading chart data...</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Family Payment Status</h3>
            {stats ? (
              <ProfessionalPieChart
                title="Family Payment Status"
                data={[
                  { name: 'Families Up-to-Date', value: stats.totalFamilies - stats.familiesWithOutstanding, color: '#3B82F6' },
                  { name: 'Families with Outstanding', value: stats.familiesWithOutstanding, color: '#EF4444' },
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
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Financial Activity</h3>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-gray-600 font-medium">Recent activity tracking coming soon</p>
            <p className="text-sm text-gray-500 mt-2">This will show recent payments, fee allocations, and financial transactions</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
