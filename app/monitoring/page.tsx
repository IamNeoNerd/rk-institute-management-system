'use client';

/**
 * 📊 Monitoring Dashboard
 * Phase 2, Step 2: Real-time system health monitoring
 * 
 * Features:
 * - Real-time health endpoint monitoring
 * - Visual status indicators
 * - Performance metrics display
 * - Auto-refresh capabilities
 * - Deployment status tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Database, Server, Zap } from 'lucide-react';

interface HealthStatus {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'loading' | 'error';
  responseTime: number;
  lastChecked: string;
  data?: any;
  error?: string;
}

interface MonitoringData {
  healthChecks: HealthStatus[];
  systemInfo: {
    uptime: number;
    environment: string;
    version: string;
    deployment: string;
  };
  lastUpdate: string;
}

const HEALTH_ENDPOINTS = [
  { path: '/api/health-simple', name: 'Basic Health', icon: Activity },
  { path: '/api/health', name: 'Comprehensive Health', icon: Server },
  { path: '/api/health/database', name: 'Database Health', icon: Database },
  { path: '/api/health/automation', name: 'Automation Health', icon: Zap }
];

export default function MonitoringDashboard() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    healthChecks: [],
    systemInfo: {
      uptime: 0,
      environment: 'unknown',
      version: 'unknown',
      deployment: 'unknown'
    },
    lastUpdate: new Date().toISOString()
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkHealthEndpoint = async (endpoint: string): Promise<HealthStatus> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          endpoint,
          status: data.status || 'healthy',
          responseTime,
          lastChecked: new Date().toISOString(),
          data
        };
      } else {
        return {
          endpoint,
          status: 'error',
          responseTime,
          lastChecked: new Date().toISOString(),
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        endpoint,
        status: 'error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const refreshMonitoringData = async () => {
    setIsLoading(true);
    
    try {
      // Check all health endpoints
      const healthPromises = HEALTH_ENDPOINTS.map(ep => 
        checkHealthEndpoint(ep.path)
      );
      
      const healthChecks = await Promise.all(healthPromises);
      
      // Extract system info from comprehensive health check
      const comprehensiveHealth = healthChecks.find(hc => 
        hc.endpoint === '/api/health' && hc.data
      );
      
      const systemInfo = comprehensiveHealth?.data ? {
        uptime: comprehensiveHealth.data.checks?.uptime?.seconds || 0,
        environment: comprehensiveHealth.data.environment || 'unknown',
        version: comprehensiveHealth.data.version || 'unknown',
        deployment: comprehensiveHealth.data.deployment || 'unknown'
      } : monitoringData.systemInfo;
      
      setMonitoringData({
        healthChecks,
        systemInfo,
        lastUpdate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to refresh monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    refreshMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(refreshMonitoringData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      case 'error': return 'bg-red-600';
      case 'loading': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'unhealthy': return 'destructive';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const overallStatus = monitoringData.healthChecks.length > 0 
    ? monitoringData.healthChecks.every(hc => hc.status === 'healthy') 
      ? 'healthy' 
      : monitoringData.healthChecks.some(hc => hc.status === 'unhealthy' || hc.status === 'error')
      ? 'unhealthy'
      : 'degraded'
    : 'loading';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time health monitoring for RK Institute Management System
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(overallStatus)}`} />
            <span className="text-sm font-medium">
              System {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
            </span>
          </div>
          
          <Button
            onClick={refreshMonitoringData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Environment</p>
                <p className="text-lg font-semibold">{monitoringData.systemInfo.environment}</p>
              </div>
              <Server className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-lg font-semibold">{formatUptime(monitoringData.systemInfo.uptime)}</p>
              </div>
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="text-lg font-semibold">{monitoringData.systemInfo.version}</p>
              </div>
              <Zap className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Update</p>
                <p className="text-sm font-medium">
                  {new Date(monitoringData.lastUpdate).toLocaleTimeString()}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Health Check Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HEALTH_ENDPOINTS.map((endpoint, index) => {
              const healthCheck = monitoringData.healthChecks[index];
              const IconComponent = endpoint.icon;
              
              return (
                <div key={endpoint.path} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{endpoint.name}</span>
                    </div>
                    <Badge variant={getStatusBadgeVariant(healthCheck?.status || 'loading')}>
                      {healthCheck?.status || 'loading'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Endpoint: {endpoint.path}</div>
                    {healthCheck && (
                      <>
                        <div>Response Time: {healthCheck.responseTime}ms</div>
                        <div>Last Checked: {new Date(healthCheck.lastChecked).toLocaleTimeString()}</div>
                        {healthCheck.error && (
                          <div className="text-red-600">Error: {healthCheck.error}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
