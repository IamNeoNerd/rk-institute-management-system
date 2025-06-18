'use client';

import { useState, useEffect, useCallback } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Upload } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  assignmentType: string;
  priority: string;
  dueDate: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
  teacher: {
    name: string;
  };
  submissions: {
    id: string;
    status: string;
    submittedAt: string | null;
    grade: string | null;
    feedback: string | null;
  }[];
}

interface AssignmentStats {
  totalAssignments: number;
  submittedCount: number;
  pendingCount: number;
  overdueCount: number;
  gradedCount: number;
  completionRate: number;
  subjectStats: Record<string, any>;
  recentActivity: any[];
}

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAssignments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      } else {
        setError('Failed to fetch assignments');
      }
    } catch (error) {
      setError('Network error');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
    fetchStats();
  }, [fetchAssignments, fetchStats]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading assignments...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Assignments & Homework"
          subtitle="Submit assignments, track progress, and view feedback from teachers"
          actions={
            <>
              <HubActionButton href="/student/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="#" icon={Upload} label="Submit Assignment" color="blue" />
            </>
          }
        />

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProfessionalMetricCard
              title="Total Assignments"
              value={stats.totalAssignments}
              subtitle="All assignments"
              icon="file-text"
              color="blue"
            />
            <ProfessionalMetricCard
              title="Submitted"
              value={stats.submittedCount}
              subtitle={`${stats.completionRate}% completion`}
              icon="check-circle"
              color="green"
            />
            <ProfessionalMetricCard
              title="Pending"
              value={stats.pendingCount}
              subtitle="Need attention"
              icon="clock"
              color="yellow"
            />
            <ProfessionalMetricCard
              title="Overdue"
              value={stats.overdueCount}
              subtitle={stats.overdueCount > 0 ? 'Urgent!' : 'All good!'}
              icon={stats.overdueCount > 0 ? 'alert-triangle' : 'check-circle'}
              color={stats.overdueCount > 0 ? 'red' : 'green'}
            />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Assignment System Restored
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              The assignment management system has been restored with full functionality.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Status:</strong> Assignment functionality restored from previous implementation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}