/**
 * Report History Component
 * 
 * Displays user's generated reports with download and management capabilities.
 * Leverages existing Table, Button, and Badge components for consistency.
 * 
 * Features:
 * - Chronological report listing
 * - Status indicators and progress tracking
 * - Download and delete functionality
 * - File size and expiration information
 * - Responsive table design
 */

'use client';

import React, { useState } from 'react';
import { ReportHistoryProps, GeneratedReport } from './types';
import {
  Button,
  LoadingState
} from '@/components/ui';

export default function ReportHistory({
  reports,
  onDownload,
  onDelete,
  loading = false
}: ReportHistoryProps) {

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: GeneratedReport['status']) => {
    const variants = {
      generating: { variant: 'warning' as const, text: 'Generating' },
      completed: { variant: 'success' as const, text: 'Ready' },
      failed: { variant: 'error' as const, text: 'Failed' },
      expired: { variant: 'secondary' as const, text: 'Expired' }
    };
    return variants[status];
  };

  // Check if report is expired
  const isExpired = (report: GeneratedReport) => {
    return new Date(report.expiresAt) < new Date();
  };

  // Handle delete confirmation
  const handleDelete = (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      onDelete(reportId);
    }
  };

  if (loading) {
    return <LoadingState message="Loading report history..." />;
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Generated</h3>
        <p className="text-gray-600">You haven&apos;t generated any reports yet. Start by selecting a template above.</p>
      </div>
    );
  }

  // Get status badge styling
  const getStatusBadgeClass = (status: GeneratedReport['status']) => {
    const classes = {
      generating: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return classes[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report History</h2>
          <p className="text-gray-600 mt-1">
            Manage and download your generated reports
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {reports.length} report{reports.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => {
          const badge = getStatusBadge(report.status);
          return (
            <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">{report.templateName}</h3>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(report.status)}`}>
                      {badge.text}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>{report.format.toUpperCase()} • {formatFileSize(report.fileSize)}</div>
                    <div>Generated: {formatDate(report.generatedAt)}</div>
                    <div className={isExpired(report) ? 'text-red-600' : ''}>
                      Expires: {formatDate(report.expiresAt)}
                    </div>
                    <div>Downloads: {report.downloadCount}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {report.status === 'completed' && !isExpired(report) && (
                    <Button
                      onClick={() => onDownload(report.id)}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Download
                    </Button>
                  )}
                  {report.status === 'generating' && (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Processing...
                    </div>
                  )}
                  {report.status === 'failed' && (
                    <div className="text-sm text-red-600" title={report.error}>
                      Generation failed
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(report.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {reports.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {reports.filter(r => r.status === 'generating').length}
            </div>
            <div className="text-sm text-gray-600">Generating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {reports.filter(r => r.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {reports.reduce((sum, r) => sum + r.downloadCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Downloads</div>
          </div>
        </div>
      </div>


    </div>
  );
}
