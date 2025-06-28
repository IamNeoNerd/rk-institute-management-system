'use client';

import { Card, StatsCard, QuickActionCard } from '@/components/ui/Card';
import MetricCard from '@/components/cards/MetricCard';
import ActionCard from '@/components/cards/ActionCard';
import InsightCard from '@/components/cards/InsightCard';
import StatCard from '@/components/shared/StatCard';
import { CardGrid, StatsGrid } from '@/components/ui/Layout';

export default function TestMobileCards() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Mobile-Optimized Cards Test
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Testing responsive card layouts for mobile devices
          </p>
        </div>

        {/* Stats Cards Grid */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Stats Cards</h2>
          <StatsGrid>
            <StatsCard
              title="Total Students"
              value={245}
              subtitle="Active learners"
              icon="👨‍🎓"
              color="blue"
              trend={{ value: 8.2, isPositive: true }}
            />
            <StatsCard
              title="Active Courses"
              value={12}
              subtitle="Running programs"
              icon="📚"
              color="green"
            />
            <StatsCard
              title="Outstanding Fees"
              value="₹125K"
              subtitle="Pending collection"
              icon="💰"
              color="red"
              trend={{ value: 12.5, isPositive: false }}
            />
            <StatsCard
              title="Services"
              value={8}
              subtitle="Available services"
              icon="🚌"
              color="purple"
            />
          </StatsGrid>
        </section>

        {/* Metric Cards */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Metric Cards</h2>
          <CardGrid>
            <MetricCard
              title="Monthly Revenue"
              value="₹2,45,000"
              subtitle="This month"
              icon="💰"
              color="green"
              trend={{
                value: 15.2,
                label: "vs last month",
                isPositive: true
              }}
            />
            <MetricCard
              title="New Enrollments"
              value={28}
              subtitle="This week"
              icon="🎓"
              color="blue"
              trend={{
                value: 8.5,
                label: "vs last week",
                isPositive: true
              }}
            />
            <MetricCard
              title="Attendance Rate"
              value="94.5%"
              subtitle="This month"
              icon="📊"
              color="purple"
            />
          </CardGrid>
        </section>

        {/* Action Cards */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Action Cards</h2>
          <CardGrid>
            <ActionCard
              title="Generate Report"
              description="Create monthly performance report"
              icon="📊"
              color="blue"
              action={{
                type: "button",
                label: "Generate",
                onClick: () => alert('Generate Report')
              }}
            />
            <ActionCard
              title="Send Reminders"
              description="Send fee reminders to students"
              icon="📧"
              color="orange"
              action={{
                type: "button",
                label: "Send",
                onClick: () => alert('Send Reminders')
              }}
            />
            <ActionCard
              title="Backup Data"
              description="Create system backup"
              icon="💾"
              color="green"
              action={{
                type: "button",
                label: "Backup",
                onClick: () => alert('Backup Data')
              }}
            />
          </CardGrid>
        </section>

        {/* Insight Cards */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Insight Cards</h2>
          <CardGrid>
            <InsightCard
              title="Overdue Fees"
              description="Students requiring immediate attention"
              value={25}
              icon="⚠️"
              color="red"
              href="/admin/students?filter=overdue"
              badge={{
                text: "Urgent",
                color: "red"
              }}
            />
            <InsightCard
              title="Course Capacity"
              description="Courses approaching maximum enrollment"
              value={4}
              icon="📊"
              color="yellow"
              href="/admin/courses?filter=capacity"
              badge={{
                text: "Monitor",
                color: "yellow"
              }}
            />
            <InsightCard
              title="New Enrollments"
              description="Students enrolled in the last 30 days"
              value={15}
              icon="🎓"
              color="green"
              href="/admin/students?filter=recent"
              badge={{
                text: "New",
                color: "green"
              }}
            />
          </CardGrid>
        </section>

        {/* Quick Action Cards */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Action Cards</h2>
          <CardGrid>
            <QuickActionCard
              title="Student Portal"
              description="Access student management"
              icon="👨‍🎓"
              href="/admin/students"
              color="from-blue-500 to-blue-600"
            />
            <QuickActionCard
              title="Fee Management"
              description="Manage student fees"
              icon="💰"
              href="/admin/fees"
              color="from-green-500 to-green-600"
            />
            <QuickActionCard
              title="Reports"
              description="View system reports"
              icon="📊"
              href="/admin/reports"
              color="from-purple-500 to-purple-600"
            />
            <QuickActionCard
              title="Settings"
              description="System configuration"
              icon="⚙️"
              href="/admin/settings"
              color="from-gray-500 to-gray-600"
            />
          </CardGrid>
        </section>

        {/* Stat Cards */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Stat Cards</h2>
          <StatsGrid>
            <StatCard
              title="Total Revenue"
              value="₹12,45,000"
              subtitle="This year"
              icon="💰"
              color="green"
            />
            <StatCard
              title="Active Students"
              value={245}
              subtitle="Currently enrolled"
              icon="👨‍🎓"
              color="blue"
            />
            <StatCard
              title="Completion Rate"
              value="96.5%"
              subtitle="Course completion"
              icon="🎯"
              color="purple"
            />
            <StatCard
              title="Satisfaction"
              value="4.8/5"
              subtitle="Student rating"
              icon="⭐"
              color="yellow"
            />
          </StatsGrid>
        </section>

        {/* Mobile Optimization Notes */}
        <section className="bg-blue-50 p-4 sm:p-6 rounded-xl">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4">
            Mobile Optimization Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-semibold mb-2">Responsive Padding:</h3>
              <ul className="space-y-1">
                <li>• Mobile: p-3, Desktop: p-6</li>
                <li>• Smaller gaps on mobile</li>
                <li>• Flexible icon sizes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Typography:</h3>
              <ul className="space-y-1">
                <li>• Smaller fonts on mobile</li>
                <li>• Truncated text overflow</li>
                <li>• Better line spacing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Layout:</h3>
              <ul className="space-y-1">
                <li>• Mobile-first grid system</li>
                <li>• Flexible card layouts</li>
                <li>• Touch-friendly sizing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Performance:</h3>
              <ul className="space-y-1">
                <li>• Reduced visual complexity</li>
                <li>• Optimized spacing</li>
                <li>• Better readability</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
