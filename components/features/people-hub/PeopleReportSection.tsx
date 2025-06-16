'use client';

import dynamic from 'next/dynamic';
import { PeopleStats } from './types';

// Dynamic import for ReportGenerator to reduce initial bundle size
const ReportGenerator = dynamic(() => import('@/components/reports/ReportGenerator'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>
});

interface PeopleReportSectionProps {
  stats: PeopleStats | null;
}

export default function PeopleReportSection({ stats }: PeopleReportSectionProps) {
  if (!stats) {
    return null;
  }

  return (
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
  );
}
