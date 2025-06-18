'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Download, BarChart3, TrendingUp } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'ACADEMIC' | 'ATTENDANCE' | 'FINANCIAL' | 'PROGRESS';
  description: string;
  generatedDate: string;
  period: string;
  size: string;
  downloadUrl: string;
}

export default function StudentReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // Mock data for student's reports
    setReports([
      {
        id: '1',
        title: 'Academic Performance Report',
        type: 'ACADEMIC',
        description: 'Comprehensive academic performance analysis including grades, assignments, and teacher feedback',
        generatedDate: '2024-06-15',
        period: 'June 2024',
        size: '2.3 MB',
        downloadUrl: '/reports/academic-june-2024.pdf'
      },
      {
        id: '2',
        title: 'Attendance Summary',
        type: 'ATTENDANCE',
        description: 'Monthly attendance record with class-wise breakdown and absence details',
        generatedDate: '2024-06-01',
        period: 'May 2024',
        size: '1.1 MB',
        downloadUrl: '/reports/attendance-may-2024.pdf'
      },
      {
        id: '3',
        title: 'Fee Payment History',
        type: 'FINANCIAL',
        description: 'Complete fee payment history with receipts and outstanding dues information',
        generatedDate: '2024-06-10',
        period: 'Academic Year 2023-24',
        size: '1.8 MB',
        downloadUrl: '/reports/fees-2023-24.pdf'
      },
      {
        id: '4',
        title: 'Progress Tracking Report',
        type: 'PROGRESS',
        description: 'Detailed progress tracking with learning objectives, achievements, and improvement areas',
        generatedDate: '2024-06-12',
        period: 'Semester 1, 2024',
        size: '3.2 MB',
        downloadUrl: '/reports/progress-sem1-2024.pdf'
      },
      {
        id: '5',
        title: 'Mid-term Assessment Report',
        type: 'ACADEMIC',
        description: 'Mid-term examination results with subject-wise analysis and recommendations',
        generatedDate: '2024-05-20',
        period: 'Mid-term 2024',
        size: '2.7 MB',
        downloadUrl: '/reports/midterm-2024.pdf'
      }
    ]);

    setLoading(false);
  }, []);

  const filteredReports = reports.filter(report => {
    if (filterType === 'all') return true;
    return report.type === filterType;
  });

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'ACADEMIC':
        return '📚';
      case 'ATTENDANCE':
        return '📅';
      case 'FINANCIAL':
        return '💰';
      case 'PROGRESS':
        return '📈';
      default:
        return '📄';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'ACADEMIC':
        return 'bg-blue-100 text-blue-800';
      case 'ATTENDANCE':
        return 'bg-green-100 text-green-800';
      case 'FINANCIAL':
        return 'bg-purple-100 text-purple-800';
      case 'PROGRESS':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = (report: Report) => {
    // Mock download functionality
    console.log(`Downloading report: ${report.title}`);
    // In a real implementation, this would trigger the actual download
  };

  const academicReports = reports.filter(r => r.type === 'ACADEMIC').length;
  const attendanceReports = reports.filter(r => r.type === 'ATTENDANCE').length;
  const financialReports = reports.filter(r => r.type === 'FINANCIAL').length;
  const progressReports = reports.filter(r => r.type === 'PROGRESS').length;

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading reports...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Academic Reports"
          subtitle="Download and view your academic progress and performance reports"
          actions={
            <>
              <HubActionButton href="/student/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="/student/grades" icon={BarChart3} label="View Grades" color="blue" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Academic Reports"
            value={academicReports}
            subtitle="Performance & grades"
            icon="book-open"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Attendance Reports"
            value={attendanceReports}
            subtitle="Class attendance"
            icon="calendar"
            color="green"
          />
          <ProfessionalMetricCard
            title="Financial Reports"
            value={financialReports}
            subtitle="Fee payments"
            icon="dollar-sign"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Progress Reports"
            value={progressReports}
            subtitle="Learning progress"
            icon="trending-up"
            color="orange"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filter Reports</h3>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reports</option>
              <option value="ACADEMIC">Academic Reports</option>
              <option value="ATTENDANCE">Attendance Reports</option>
              <option value="FINANCIAL">Financial Reports</option>
              <option value="PROGRESS">Progress Reports</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for new reports.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getReportTypeIcon(report.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReportTypeColor(report.type)}`}>
                        {report.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{report.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span><strong>Period:</strong> {report.period}</span>
                      <span><strong>Generated:</strong> {new Date(report.generatedDate).toLocaleDateString()}</span>
                      <span><strong>Size:</strong> {report.size}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleDownload(report)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Report Generation Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 Report Information</h3>
          <div className="space-y-2 text-blue-800 text-sm">
            <p><strong>Academic Reports:</strong> Generated monthly with comprehensive performance analysis</p>
            <p><strong>Attendance Reports:</strong> Updated weekly with class-wise attendance tracking</p>
            <p><strong>Financial Reports:</strong> Available quarterly with complete payment history</p>
            <p><strong>Progress Reports:</strong> Generated at semester end with detailed learning outcomes</p>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Reports are automatically generated and available for download.
              If you need a custom report or have questions about any report, please contact your teacher or the administration office.
            </p>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}