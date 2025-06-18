'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Download, Calendar, BarChart3 } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'ACADEMIC' | 'FINANCIAL' | 'ATTENDANCE' | 'PROGRESS';
  childName: string;
  childId: string;
  period: string;
  generatedDate: string;
  fileSize: string;
  status: 'READY' | 'GENERATING' | 'FAILED';
  downloadUrl?: string;
  description: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  color: string;
}

export default function ParentReports() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChild, setFilterChild] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [newReport, setNewReport] = useState({
    type: '',
    childId: '',
    period: '',
    customDateRange: false,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    // Handle query parameters
    const action = searchParams.get('action');
    const type = searchParams.get('type');
    const child = searchParams.get('child');

    if (action === 'generate') setShowGenerateForm(true);
    if (type) setFilterType(type);
    if (child) setFilterChild(child);
  }, [searchParams]);

  useEffect(() => {
    // Mock data for available reports - separate effect to avoid infinite loop
    setReports([
      {
        id: '1',
        title: 'Academic Progress Report - Q2 2024',
        type: 'ACADEMIC',
        childName: 'Emma Wilson',
        childId: '1',
        period: 'Q2 2024',
        generatedDate: '2024-06-15T10:30:00Z',
        fileSize: '2.3 MB',
        status: 'READY',
        downloadUrl: '/reports/emma-academic-q2-2024.pdf',
        description: 'Comprehensive academic performance report including grades, teacher feedback, and recommendations.'
      },
      {
        id: '2',
        title: 'Fee Payment Summary - June 2024',
        type: 'FINANCIAL',
        childName: 'Emma Wilson',
        childId: '1',
        period: 'June 2024',
        generatedDate: '2024-06-10T14:20:00Z',
        fileSize: '1.1 MB',
        status: 'READY',
        downloadUrl: '/reports/emma-financial-june-2024.pdf',
        description: 'Detailed breakdown of fee payments, outstanding dues, and payment history.'
      },
      {
        id: '3',
        title: 'Attendance Report - May 2024',
        type: 'ATTENDANCE',
        childName: 'Alex Wilson',
        childId: '2',
        period: 'May 2024',
        generatedDate: '2024-06-01T09:15:00Z',
        fileSize: '0.8 MB',
        status: 'READY',
        downloadUrl: '/reports/alex-attendance-may-2024.pdf',
        description: 'Monthly attendance summary with daily breakdown and absence reasons.'
      },
      {
        id: '4',
        title: 'Progress Tracking Report - Semester 1',
        type: 'PROGRESS',
        childName: 'Emma Wilson',
        childId: '1',
        period: 'Semester 1 2024',
        generatedDate: '2024-05-28T16:45:00Z',
        fileSize: '3.2 MB',
        status: 'READY',
        downloadUrl: '/reports/emma-progress-sem1-2024.pdf',
        description: 'Comprehensive progress tracking with academic milestones and achievement analysis.'
      },
      {
        id: '5',
        title: 'Academic Progress Report - Q2 2024',
        type: 'ACADEMIC',
        childName: 'Alex Wilson',
        childId: '2',
        period: 'Q2 2024',
        generatedDate: '2024-06-12T11:30:00Z',
        fileSize: '2.1 MB',
        status: 'GENERATING',
        description: 'Academic performance report currently being generated.'
      },
      {
        id: '6',
        title: 'Financial Summary - Academic Year 2024',
        type: 'FINANCIAL',
        childName: 'Alex Wilson',
        childId: '2',
        period: 'Academic Year 2024',
        generatedDate: '2024-06-08T18:00:00Z',
        fileSize: '1.5 MB',
        status: 'READY',
        downloadUrl: '/reports/alex-financial-year-2024.pdf',
        description: 'Annual financial summary with complete payment history and fee breakdown.'
      }
    ]);

    // Mock report templates
    setReportTemplates([
      {
        id: '1',
        name: 'Academic Progress Report',
        type: 'ACADEMIC',
        description: 'Comprehensive academic performance with grades, feedback, and recommendations',
        icon: '📊',
        color: 'blue'
      },
      {
        id: '2',
        name: 'Financial Summary Report',
        type: 'FINANCIAL',
        description: 'Detailed fee payments, outstanding dues, and payment history',
        icon: '💰',
        color: 'green'
      },
      {
        id: '3',
        name: 'Attendance Report',
        type: 'ATTENDANCE',
        description: 'Monthly attendance summary with daily breakdown and absence tracking',
        icon: '📅',
        color: 'purple'
      },
      {
        id: '4',
        name: 'Progress Tracking Report',
        type: 'PROGRESS',
        description: 'Long-term progress analysis with academic milestones and achievements',
        icon: '📈',
        color: 'orange'
      }
    ]);

    setLoading(false);
  }, []); // Empty dependency array for initial data load

  const filteredReports = reports.filter(report => {
    const matchesChild = filterChild === 'all' || report.childId === filterChild;
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesPeriod = filterPeriod === 'all' || report.period.includes(filterPeriod);
    return matchesChild && matchesType && matchesPeriod;
  });

  const uniqueChildren = Array.from(new Set(reports.map(r => ({ id: r.childId, name: r.childName }))));
  const uniquePeriods = Array.from(new Set(reports.map(r => r.period)));
  
  const totalReports = reports.length;
  const readyReports = reports.filter(r => r.status === 'READY').length;
  const generatingReports = reports.filter(r => r.status === 'GENERATING').length;
  const recentReports = reports.filter(r => 
    new Date(r.generatedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'text-green-600 bg-green-100';
      case 'GENERATING':
        return 'text-yellow-600 bg-yellow-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ACADEMIC':
        return '📊';
      case 'FINANCIAL':
        return '💰';
      case 'ATTENDANCE':
        return '📅';
      case 'PROGRESS':
        return '📈';
      default:
        return '📄';
    }
  };

  const handleGenerateReport = () => {
    // Mock report generation
    const newReportData: Report = {
      id: Date.now().toString(),
      title: `${newReport.type} Report - ${newReport.period}`,
      type: newReport.type as any,
      childName: uniqueChildren.find(c => c.id === newReport.childId)?.name || '',
      childId: newReport.childId,
      period: newReport.period,
      generatedDate: new Date().toISOString(),
      fileSize: '0 MB',
      status: 'GENERATING',
      description: 'Report is being generated...'
    };

    setReports([newReportData, ...reports]);
    setNewReport({ type: '', childId: '', period: '', customDateRange: false, startDate: '', endDate: '' });
    setShowGenerateForm(false);

    // Simulate report generation completion
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === newReportData.id 
          ? { ...r, status: 'READY' as const, fileSize: '2.1 MB', downloadUrl: '/reports/generated-report.pdf' }
          : r
      ));
    }, 3000);
  };

  const handleDownload = (report: Report) => {
    // Mock download functionality
    console.log(`Downloading report: ${report.title}`);
    // In a real app, this would trigger the actual file download
  };

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading reports...</div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Academic Reports & Downloads"
          subtitle="Generate, download, and manage academic reports for your children"
          actions={
            <>
              <HubActionButton href="/parent/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton 
                href="#" 
                icon={BarChart3} 
                label="Generate Report" 
                color="blue"
                onClick={() => setShowGenerateForm(true)}
              />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Reports"
            value={totalReports}
            subtitle="All generated reports"
            icon="file-text"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Ready to Download"
            value={readyReports}
            subtitle="Available reports"
            icon="download"
            color="green"
          />
          <ProfessionalMetricCard
            title="Generating"
            value={generatingReports}
            subtitle="In progress"
            icon="clock"
            color="orange"
          />
          <ProfessionalMetricCard
            title="Recent Reports"
            value={recentReports}
            subtitle="This week"
            icon="calendar"
            color="purple"
          />
        </div>

        {/* Report Templates */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Report Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setNewReport({ ...newReport, type: template.type });
                  setShowGenerateForm(true);
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left"
              >
                <div className="text-2xl mb-2">{template.icon}</div>
                <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Child</label>
              <select
                value={filterChild}
                onChange={(e) => setFilterChild(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Children</option>
                {uniqueChildren.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="ACADEMIC">Academic</option>
                <option value="FINANCIAL">Financial</option>
                <option value="ATTENDANCE">Attendance</option>
                <option value="PROGRESS">Progress</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Period</label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Periods</option>
                {uniquePeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
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
              <p className="text-gray-600">Try adjusting your filters or generate a new report.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(report.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span><strong>Child:</strong> {report.childName}</span>
                      <span><strong>Period:</strong> {report.period}</span>
                      <span><strong>Generated:</strong> {new Date(report.generatedDate).toLocaleDateString()}</span>
                      {report.fileSize && <span><strong>Size:</strong> {report.fileSize}</span>}
                    </div>
                    <p className="text-gray-600 text-sm">{report.description}</p>
                  </div>
                  <div className="ml-4">
                    {report.status === 'READY' && report.downloadUrl ? (
                      <button
                        onClick={() => handleDownload(report)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    ) : report.status === 'GENERATING' ? (
                      <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                        Failed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Generate Report Modal */}
        {showGenerateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select report type...</option>
                    <option value="ACADEMIC">Academic Progress Report</option>
                    <option value="FINANCIAL">Financial Summary Report</option>
                    <option value="ATTENDANCE">Attendance Report</option>
                    <option value="PROGRESS">Progress Tracking Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Child</label>
                  <select
                    value={newReport.childId}
                    onChange={(e) => setNewReport({...newReport, childId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select child...</option>
                    {uniqueChildren.map(child => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                  <select
                    value={newReport.period}
                    onChange={(e) => setNewReport({...newReport, period: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select period...</option>
                    <option value="Current Month">Current Month</option>
                    <option value="Last Month">Last Month</option>
                    <option value="Current Quarter">Current Quarter</option>
                    <option value="Last Quarter">Last Quarter</option>
                    <option value="Current Semester">Current Semester</option>
                    <option value="Academic Year 2024">Academic Year 2024</option>
                    <option value="Custom Range">Custom Date Range</option>
                  </select>
                </div>
                {newReport.period === 'Custom Range' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={newReport.startDate}
                        onChange={(e) => setNewReport({...newReport, startDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={newReport.endDate}
                        onChange={(e) => setNewReport({...newReport, endDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Report Information</h4>
                  <p className="text-blue-800 text-sm">
                    {newReport.type === 'ACADEMIC' && 'This report will include grades, teacher feedback, academic achievements, and performance analysis.'}
                    {newReport.type === 'FINANCIAL' && 'This report will include fee payments, outstanding dues, payment history, and financial summaries.'}
                    {newReport.type === 'ATTENDANCE' && 'This report will include attendance records, absence tracking, and punctuality analysis.'}
                    {newReport.type === 'PROGRESS' && 'This report will include long-term progress tracking, milestone achievements, and development analysis.'}
                    {!newReport.type && 'Select a report type to see what will be included.'}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowGenerateForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={!newReport.type || !newReport.childId || !newReport.period}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
