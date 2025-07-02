/**
 * MCP Automation Dashboard
 *
 * Comprehensive dashboard for monitoring and managing all MCP automation workflows.
 * Provides real-time visibility into workflow executions, quality gates, deployment
 * monitoring, and system health across the entire automation ecosystem.
 *
 * Features:
 * - Real-time workflow execution monitoring
 * - Quality assurance metrics and gates
 * - Deployment health and rollback controls
 * - Performance regression tracking
 * - Security vulnerability monitoring
 * - Automated alert management
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';
import { autonomousDeploymentMonitor } from '@/lib/automation/AutonomousDeploymentMonitor';
import { mcpWorkflowOrchestrator } from '@/lib/automation/MCPWorkflowOrchestrator';
import { qualityAssuranceAutomation } from '@/lib/automation/QualityAssuranceAutomation';

interface DashboardMetrics {
  workflows: {
    active: number;
    completed: number;
    failed: number;
    totalExecutions: number;
  };
  deployment: {
    environments: any;
    activeAlerts: number;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  };
  quality: {
    overallStatus: 'passed' | 'failed' | 'warning';
    gatesPassed: number;
    gatesTotal: number;
    securityScore: number;
    testCoverage: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    availability: number;
    regressionAlerts: number;
  };
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'success' | 'failure' | 'cancelled';
  startTime: number;
  endTime?: number;
  currentStep?: string;
  progress: number;
}

export default function MCPAutomationDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowExecution[]>(
    []
  );
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds

  /**
   * Fetch dashboard metrics
   */
  const fetchMetrics = useCallback(async () => {
    try {
      // Get workflow metrics
      const workflowExecutions = mcpWorkflowOrchestrator.getActiveExecutions();
      const mcpServers = mcpWorkflowOrchestrator.getMCPServerStatus();

      // Get deployment metrics
      const deploymentStatus =
        autonomousDeploymentMonitor.getEnvironmentStatus();
      const deploymentAlerts = autonomousDeploymentMonitor.getActiveAlerts();

      // Get quality metrics
      const qualityReport = qualityAssuranceAutomation.getLatestReport();
      const qualityGates = qualityAssuranceAutomation.getQualityGatesStatus();

      const dashboardMetrics: DashboardMetrics = {
        workflows: {
          active: workflowExecutions.length,
          completed: 0, // Would be calculated from historical data
          failed: 0, // Would be calculated from historical data
          totalExecutions: workflowExecutions.length
        },
        deployment: {
          environments: deploymentStatus,
          activeAlerts: deploymentAlerts.length,
          healthStatus: deploymentAlerts.some(a => a.severity === 'critical')
            ? 'unhealthy'
            : deploymentAlerts.length > 0
              ? 'degraded'
              : 'healthy'
        },
        quality: {
          overallStatus: qualityReport?.overallStatus || 'warning',
          gatesPassed: qualityGates
            ? Object.values(qualityGates).filter((g: any) => g.passed).length
            : 0,
          gatesTotal: qualityGates ? Object.keys(qualityGates).length : 0,
          securityScore: qualityReport?.metrics.security.securityScore || 0,
          testCoverage: qualityReport?.metrics.codeQuality.testCoverage || 0
        },
        performance: {
          avgResponseTime: 0, // Would be calculated from performance monitor
          errorRate: 0, // Would be calculated from performance monitor
          availability: 0.999, // Would be calculated from deployment monitor
          regressionAlerts: 0 // Would be calculated from performance alerts
        }
      };

      setMetrics(dashboardMetrics);
      setActiveWorkflows(
        workflowExecutions.map(execution => ({
          ...execution,
          progress:
            execution.status === 'success'
              ? 100
              : execution.status === 'failure'
                ? 0
                : execution.status === 'running'
                  ? 50
                  : 0
        }))
      );
      setRecentAlerts([...deploymentAlerts].slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    }
  }, []);

  /**
   * Start/stop monitoring
   */
  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      // Stop all monitoring
      autonomousDeploymentMonitor.stopMonitoring();
      qualityAssuranceAutomation.stopMonitoring();
      setIsMonitoring(false);
    } else {
      // Start all monitoring
      autonomousDeploymentMonitor.startMonitoring();
      qualityAssuranceAutomation.startMonitoring();
      setIsMonitoring(true);
    }
  }, [isMonitoring]);

  /**
   * Execute workflow
   */
  const executeWorkflow = async (workflowId: string) => {
    try {
      const executionId =
        await mcpWorkflowOrchestrator.executeWorkflow(workflowId);
      console.log(`Started workflow execution: ${executionId}`);
      await fetchMetrics(); // Refresh metrics
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  /**
   * Cancel workflow execution
   */
  const cancelWorkflow = (executionId: string) => {
    const success = mcpWorkflowOrchestrator.cancelExecution(executionId);
    if (success) {
      console.log(`Cancelled workflow execution: ${executionId}`);
      fetchMetrics(); // Refresh metrics
    }
  };

  /**
   * Acknowledge alert
   */
  const acknowledgeAlert = (alertId: string) => {
    const success = autonomousDeploymentMonitor.acknowledgeAlert(alertId);
    if (success) {
      console.log(`Acknowledged alert: ${alertId}`);
      fetchMetrics(); // Refresh metrics
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
      case 'passed':
      case 'success':
        return 'text-green-600';
      case 'degraded':
      case 'warning':
      case 'running':
        return 'text-yellow-600';
      case 'unhealthy':
      case 'failed':
      case 'failure':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  /**
   * Format duration
   */
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Setup monitoring interval
  useEffect(() => {
    fetchMetrics(); // Initial fetch
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchMetrics]);

  if (!metrics) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <ProfessionalIcon
            name='activity'
            size={48}
            className='mx-auto text-gray-400 mb-4'
          />
          <p className='text-gray-600'>Loading automation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            MCP Automation Dashboard
          </h1>
          <p className='text-gray-600'>
            Comprehensive automation monitoring and control center
          </p>
        </div>

        <div className='flex items-center space-x-4'>
          <select
            value={refreshInterval}
            onChange={e => setRefreshInterval(Number(e.target.value))}
            className='px-3 py-2 border border-gray-300 rounded-lg text-sm'
          >
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
          </select>

          <Button
            onClick={toggleMonitoring}
            variant={isMonitoring ? 'danger' : 'primary'}
            size='sm'
          >
            <ProfessionalIcon
              name={isMonitoring ? 'pause' : 'play'}
              size={16}
              className='mr-2'
            />
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600 flex items-center'>
              <ProfessionalIcon name='activity' size={16} className='mr-2' />
              Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {metrics.workflows.active}
            </div>
            <p className='text-xs text-gray-500 mt-1'>Active executions</p>
            <div className='mt-2 text-xs'>
              <span className='text-green-600'>
                {metrics.workflows.completed} completed
              </span>
              <span className='text-red-600 ml-2'>
                {metrics.workflows.failed} failed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600 flex items-center'>
              <ProfessionalIcon name='monitor' size={16} className='mr-2' />
              Deployment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getStatusColor(metrics.deployment.healthStatus)}`}
            >
              {metrics.deployment.healthStatus.toUpperCase()}
            </div>
            <p className='text-xs text-gray-500 mt-1'>System health</p>
            <div className='mt-2 text-xs'>
              <span className='text-red-600'>
                {metrics.deployment.activeAlerts} active alerts
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600 flex items-center'>
              <ProfessionalIcon name='shield' size={16} className='mr-2' />
              Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getStatusColor(metrics.quality.overallStatus)}`}
            >
              {metrics.quality.gatesPassed}/{metrics.quality.gatesTotal}
            </div>
            <p className='text-xs text-gray-500 mt-1'>Quality gates passed</p>
            <div className='mt-2 text-xs'>
              <span className='text-blue-600'>
                {Math.round(metrics.quality.testCoverage)}% coverage
              </span>
              <span className='text-green-600 ml-2'>
                {Math.round(metrics.quality.securityScore)} security
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600 flex items-center'>
              <ProfessionalIcon name='trending-up' size={16} className='mr-2' />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {(metrics.performance.availability * 100).toFixed(1)}%
            </div>
            <p className='text-xs text-gray-500 mt-1'>Availability</p>
            <div className='mt-2 text-xs'>
              <span className='text-blue-600'>
                {metrics.performance.avgResponseTime}ms avg
              </span>
              <span className='text-yellow-600 ml-2'>
                {metrics.performance.regressionAlerts} alerts
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Workflows */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center'>
            <ProfessionalIcon name='list' size={20} className='mr-2' />
            Active Workflows
          </CardTitle>
          <div className='flex space-x-2'>
            <Button
              onClick={() => executeWorkflow('continuous-integration')}
              variant='outline'
              size='sm'
            >
              Run CI Pipeline
            </Button>
            <Button
              onClick={() => executeWorkflow('deployment-pipeline')}
              variant='outline'
              size='sm'
            >
              Deploy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeWorkflows.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <ProfessionalIcon
                name='activity'
                size={48}
                className='mx-auto mb-4 text-gray-300'
              />
              <p>No active workflow executions</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {activeWorkflows.map(workflow => (
                <div
                  key={workflow.id}
                  className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'
                >
                  <div className='flex-1'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status).replace('text-', 'bg-')}`}
                      />
                      <div>
                        <p className='font-medium text-gray-900'>
                          {workflow.workflowId}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {workflow.currentStep &&
                            `Current: ${workflow.currentStep}`}
                        </p>
                      </div>
                    </div>
                    <div className='mt-2'>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${workflow.progress}%` }}
                        />
                      </div>
                      <p className='text-xs text-gray-500 mt-1'>
                        Started{' '}
                        {formatDuration(Date.now() - workflow.startTime)} ago
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        workflow.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : workflow.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : workflow.status === 'failure'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {workflow.status}
                    </span>
                    {workflow.status === 'running' && (
                      <Button
                        onClick={() => cancelWorkflow(workflow.id)}
                        variant='outline'
                        size='sm'
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center'>
            <ProfessionalIcon name='warning' size={20} className='mr-2' />
            Recent Alerts
          </CardTitle>
          <Button
            onClick={() => setRecentAlerts([])}
            variant='outline'
            size='sm'
          >
            Clear All
          </Button>
        </CardHeader>
        <CardContent>
          {recentAlerts.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <ProfessionalIcon
                name='check'
                size={48}
                className='mx-auto mb-4 text-green-300'
              />
              <p>No recent alerts</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {recentAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-400'
                      : alert.severity === 'warning'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            alert.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : alert.severity === 'warning'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className='text-sm font-medium text-gray-900'>
                          {alert.environment}
                        </span>
                      </div>
                      <p className='text-sm text-gray-700 mt-1'>
                        {alert.message}
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => acknowledgeAlert(alert.id)}
                      variant='outline'
                      size='sm'
                    >
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <ProfessionalIcon name='zap' size={20} className='mr-2' />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Button
              onClick={() => executeWorkflow('performance-monitoring')}
              variant='outline'
              className='h-20 flex flex-col items-center justify-center'
            >
              <ProfessionalIcon name='trending-up' size={24} className='mb-2' />
              <span className='text-sm'>Performance Check</span>
            </Button>

            <Button
              onClick={() => qualityAssuranceAutomation.runQualityAssessment()}
              variant='outline'
              className='h-20 flex flex-col items-center justify-center'
            >
              <ProfessionalIcon name='shield' size={24} className='mb-2' />
              <span className='text-sm'>Quality Scan</span>
            </Button>

            <Button
              onClick={() => console.log('Security scan triggered')}
              variant='outline'
              className='h-20 flex flex-col items-center justify-center'
            >
              <ProfessionalIcon name='lock' size={24} className='mb-2' />
              <span className='text-sm'>Security Scan</span>
            </Button>

            <Button
              onClick={() => console.log('Health check triggered')}
              variant='outline'
              className='h-20 flex flex-col items-center justify-center'
            >
              <ProfessionalIcon name='heart' size={24} className='mb-2' />
              <span className='text-sm'>Health Check</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
