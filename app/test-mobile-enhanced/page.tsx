'use client';

import { 
  CompactStatsCard, 
  CondensedMetricCard, 
  ListCard,
  CardGrid,
  StatsGrid,
  CompactGrid,
  HorizontalList
} from '@/components/ui';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

export default function TestMobileEnhanced() {
  const sampleListItems = [
    {
      id: '1',
      title: 'John Smith',
      subtitle: 'Grade 10A - Overdue: ₹5,000',
      icon: <ProfessionalIcon name="students" size={16} />,
      badge: { text: 'Urgent', color: 'red' as const },
      value: '15 days'
    },
    {
      id: '2',
      title: 'Sarah Johnson',
      subtitle: 'Grade 9B - Overdue: ₹3,200',
      icon: <ProfessionalIcon name="students" size={16} />,
      badge: { text: 'High', color: 'yellow' as const },
      value: '8 days'
    },
    {
      id: '3',
      title: 'Mike Wilson',
      subtitle: 'Grade 11C - Overdue: ₹2,800',
      icon: <ProfessionalIcon name="students" size={16} />,
      badge: { text: 'Medium', color: 'blue' as const },
      value: '5 days'
    },
    {
      id: '4',
      title: 'Emma Davis',
      subtitle: 'Grade 8A - Overdue: ₹1,500',
      icon: <ProfessionalIcon name="students" size={16} />,
      badge: { text: 'Low', color: 'green' as const },
      value: '2 days'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Enhanced Mobile-First Cards
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            Ultra-compact designs for maximum mobile productivity
          </p>
        </div>

        {/* Compact Stats Cards - Condensed Grid */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
            Compact Stats (Condensed Layout)
          </h2>
          <StatsGrid density="condensed">
            <CompactStatsCard
              title="Students"
              value={245}
              subtitle="Active"
              icon={<ProfessionalIcon name="students" size={18} />}
              color="blue"
              trend={{ value: 8.2, isPositive: true }}
            />
            <CompactStatsCard
              title="Courses"
              value={12}
              subtitle="Running"
              icon={<ProfessionalIcon name="courses" size={18} />}
              color="green"
            />
            <CompactStatsCard
              title="Fees"
              value="₹125K"
              subtitle="Outstanding"
              icon={<ProfessionalIcon name="fees" size={18} />}
              color="red"
              trend={{ value: 12.5, isPositive: false }}
            />
            <CompactStatsCard
              title="Services"
              value={8}
              subtitle="Available"
              icon={<ProfessionalIcon name="transport" size={18} />}
              color="purple"
            />
            <CompactStatsCard
              title="Teachers"
              value={24}
              subtitle="Active"
              icon={<ProfessionalIcon name="teacher" size={18} />}
              color="teal"
            />
            <CompactStatsCard
              title="Revenue"
              value="₹2.4M"
              subtitle="Monthly"
              icon={<ProfessionalIcon name="fees" size={18} />}
              color="orange"
              trend={{ value: 15.3, isPositive: true }}
            />
          </StatsGrid>
        </section>

        {/* Horizontal Compact Stats */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
            Horizontal Layout (Space Efficient)
          </h2>
          <HorizontalList>
            <CompactStatsCard
              title="Monthly Revenue"
              value="₹2,45,000"
              subtitle="This month"
              icon={<ProfessionalIcon name="fees" size={20} />}
              color="green"
              trend={{ value: 15.2, isPositive: true }}
              layout="horizontal"
            />
            <CompactStatsCard
              title="New Enrollments"
              value={28}
              subtitle="This week"
              icon={<ProfessionalIcon name="students" size={20} />}
              color="blue"
              trend={{ value: 8.5, isPositive: true }}
              layout="horizontal"
            />
            <CompactStatsCard
              title="Attendance Rate"
              value="94.5%"
              subtitle="This month"
              icon={<ProfessionalIcon name="courses" size={20} />}
              color="purple"
              layout="horizontal"
            />
          </HorizontalList>
        </section>

        {/* Condensed Metric Cards */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
            Condensed Metrics (Ultra-Compact)
          </h2>
          <CardGrid density="condensed">
            <CondensedMetricCard
              title="Total Revenue"
              value="₹12,45,000"
              subtitle="This year"
              icon={<ProfessionalIcon name="fees" size={16} />}
              color="green"
              trend={{
                value: 18.5,
                label: "vs last year",
                isPositive: true
              }}
            />
            <CondensedMetricCard
              title="Active Students"
              value={245}
              subtitle="Currently enrolled"
              icon={<ProfessionalIcon name="students" size={16} />}
              color="blue"
              trend={{
                value: 12.3,
                label: "vs last month",
                isPositive: true
              }}
            />
            <CondensedMetricCard
              title="Course Completion"
              value="96.5%"
              subtitle="Success rate"
              icon={<ProfessionalIcon name="courses" size={16} />}
              color="purple"
            />
            <CondensedMetricCard
              title="Outstanding Fees"
              value="₹85,000"
              subtitle="Pending collection"
              icon={<ProfessionalIcon name="fees" size={16} />}
              color="red"
              trend={{
                value: 5.2,
                label: "vs last month",
                isPositive: false
              }}
            />
            <CondensedMetricCard
              title="Teacher Satisfaction"
              value="4.8/5"
              subtitle="Average rating"
              icon={<ProfessionalIcon name="teacher" size={16} />}
              color="indigo"
            />
            <CondensedMetricCard
              title="System Uptime"
              value="99.9%"
              subtitle="Last 30 days"
              icon={<ProfessionalIcon name="settings" size={16} />}
              color="gray"
            />
          </CardGrid>
        </section>

        {/* List-Style Cards */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
            List Cards (Progressive Disclosure)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <ListCard
              items={sampleListItems}
              maxItems={3}
              showMore={() => console.log('Show more clicked')}
            />
            <ListCard
              items={[
                {
                  id: '1',
                  title: 'Mathematics Grade 10',
                  subtitle: '28/30 students enrolled',
                  icon: <ProfessionalIcon name="courses" size={16} />,
                  badge: { text: 'Full', color: 'red' as const },
                  value: '93%'
                },
                {
                  id: '2',
                  title: 'Physics Grade 11',
                  subtitle: '22/25 students enrolled',
                  icon: <ProfessionalIcon name="courses" size={16} />,
                  badge: { text: 'High', color: 'yellow' as const },
                  value: '88%'
                },
                {
                  id: '3',
                  title: 'Chemistry Grade 12',
                  subtitle: '18/30 students enrolled',
                  icon: <ProfessionalIcon name="courses" size={16} />,
                  badge: { text: 'Available', color: 'green' as const },
                  value: '60%'
                }
              ]}
              maxItems={2}
              showMore={() => console.log('Show more courses')}
            />
          </div>
        </section>

        {/* Mobile Optimization Features */}
        <section className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
            Enhanced Mobile Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Ultra-Compact Padding:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Mobile: p-1.5, Desktop: p-3</li>
                <li>• Minimal gaps (1.5px mobile)</li>
                <li>• 44px touch targets maintained</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Content Density:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 2-6 cards per row on mobile</li>
                <li>• Horizontal layouts for efficiency</li>
                <li>• Progressive disclosure patterns</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Typography:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Optimized font scaling</li>
                <li>• Smart text truncation</li>
                <li>• Improved readability</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Performance:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Reduced visual complexity</li>
                <li>• Faster information scanning</li>
                <li>• Better mobile productivity</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
          <h2 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
            Mobile Density Comparison
          </h2>
          <div className="text-xs sm:text-sm text-blue-800">
            <p className="mb-2">
              <strong>Before:</strong> 4 cards visible on mobile viewport (375px width)
            </p>
            <p>
              <strong>After:</strong> 6-8 cards visible with enhanced layouts - 
              <span className="font-semibold"> 50-100% more content density</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
