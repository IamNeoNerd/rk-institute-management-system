/**
 * Real-time Dashboard Integration
 *
 * Comprehensive real-time dashboard that integrates all collaboration features
 * including live notifications, user presence, collaborative editing, and
 * real-time data updates across the entire platform.
 *
 * Features:
 * - Real-time data synchronization
 * - Live user activity feed
 * - Collaborative workspace indicators
 * - System-wide notifications
 * - Performance monitoring integration
 * - Cross-platform compatibility
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';
import {
  realtimeCollaboration,
  CollaborationUser,
  RealtimeEvent,
  NotificationMessage
} from '@/lib/realtime/RealtimeCollaborationEngine';

import RealtimeNotificationCenter from './RealtimeNotificationCenter';
import {
  DetailedPresenceIndicator,
  PagePresenceIndicator
} from './RealtimePresenceIndicator';

interface RealtimeDashboardProps {
  user: CollaborationUser;
  showActivityFeed?: boolean;
  showPresencePanel?: boolean;
  showNotifications?: boolean;
  autoConnect?: boolean;
}

interface ActivityFeedItem {
  id: string;
  type: 'user_action' | 'system_event' | 'collaboration' | 'notification';
  user?: CollaborationUser;
  title: string;
  description: string;
  timestamp: number;
  icon: string;
  color: string;
}

interface SystemMetrics {
  activeUsers: number;
  totalConnections: number;
  messagesPerMinute: number;
  systemHealth: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
}

export default function RealtimeDashboard({
  user,
  showActivityFeed = true,
  showPresencePanel = true,
  showNotifications = true,
  autoConnect = true
}: RealtimeDashboardProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(
    null
  );
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);

  /**
   * Initialize real-time dashboard
   */
  useEffect(() => {
    if (autoConnect && user) {
      connectToRealtime();
    }

    return () => {
      if (realtimeCollaboration.isConnected()) {
        realtimeCollaboration.disconnect();
      }
    };
  }, [autoConnect, user]);

  /**
   * Connect to real-time collaboration
   */
  const connectToRealtime = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Setup event listeners
      realtimeCollaboration.on('connected', handleConnected);
      realtimeCollaboration.on('connection_failed', handleConnectionFailed);
      realtimeCollaboration.on('user_joined', handleUserJoined);
      realtimeCollaboration.on('user_left', handleUserLeft);
      realtimeCollaboration.on('edit_operation', handleEditOperation);
      realtimeCollaboration.on('notification', handleNotification);
      realtimeCollaboration.on('system_alert', handleSystemAlert);
      realtimeCollaboration.on('data_sync', handleDataSync);

      // Initialize collaboration engine
      await realtimeCollaboration.initialize(user);

      console.log('✅ Real-time dashboard connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to real-time collaboration:', error);
      setConnectionError(
        error instanceof Error ? error.message : 'Connection failed'
      );
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, user]);

  /**
   * Disconnect from real-time collaboration
   */
  const disconnectFromRealtime = useCallback(() => {
    realtimeCollaboration.disconnect();
    setIsConnected(false);
    setConnectedUsers([]);
    addActivityFeedItem({
      type: 'system_event',
      title: 'Disconnected',
      description: 'Disconnected from real-time collaboration',
      icon: 'wifi-off',
      color: 'text-red-600'
    });
  }, []);

  /**
   * Handle successful connection
   */
  const handleConnected = useCallback(() => {
    setIsConnected(true);
    setConnectionError(null);
    setConnectedUsers(realtimeCollaboration.getConnectedUsers());

    addActivityFeedItem({
      type: 'system_event',
      title: 'Connected',
      description: 'Connected to real-time collaboration',
      icon: 'wifi',
      color: 'text-green-600'
    });

    // Start collecting system metrics
    startMetricsCollection();
  }, []);

  /**
   * Handle connection failure
   */
  const handleConnectionFailed = useCallback((data: any) => {
    setIsConnected(false);
    setConnectionError(`Connection failed after ${data.attempts} attempts`);

    addActivityFeedItem({
      type: 'system_event',
      title: 'Connection Failed',
      description: `Failed to connect after ${data.attempts} attempts`,
      icon: 'warning',
      color: 'text-red-600'
    });
  }, []);

  /**
   * Handle user joined
   */
  const handleUserJoined = useCallback((joinedUser: CollaborationUser) => {
    setConnectedUsers(prev => [...prev, joinedUser]);

    addActivityFeedItem({
      type: 'collaboration',
      user: joinedUser,
      title: 'User Joined',
      description: `${joinedUser.name} joined the collaboration`,
      icon: 'user-plus',
      color: 'text-blue-600'
    });
  }, []);

  /**
   * Handle user left
   */
  const handleUserLeft = useCallback((leftUser: CollaborationUser) => {
    setConnectedUsers(prev => prev.filter(u => u.id !== leftUser.id));

    addActivityFeedItem({
      type: 'collaboration',
      user: leftUser,
      title: 'User Left',
      description: `${leftUser.name} left the collaboration`,
      icon: 'user-minus',
      color: 'text-gray-600'
    });
  }, []);

  /**
   * Handle edit operation
   */
  const handleEditOperation = useCallback(
    (operation: any) => {
      const operationUser = connectedUsers.find(u => u.id === operation.userId);
      if (operationUser) {
        addActivityFeedItem({
          type: 'collaboration',
          user: operationUser,
          title: 'Content Edited',
          description: `${operationUser.name} ${operation.type}ed ${operation.entityType}`,
          icon: 'edit',
          color: 'text-purple-600'
        });
      }
    },
    [connectedUsers]
  );

  /**
   * Handle notification
   */
  const handleNotification = useCallback(
    (notification: NotificationMessage) => {
      addActivityFeedItem({
        type: 'notification',
        title: notification.title,
        description: notification.message,
        icon: notification.type === 'error' ? 'warning' : 'info',
        color: notification.type === 'error' ? 'text-red-600' : 'text-blue-600'
      });
    },
    []
  );

  /**
   * Handle system alert
   */
  const handleSystemAlert = useCallback((alert: any) => {
    addActivityFeedItem({
      type: 'system_event',
      title: 'System Alert',
      description: alert.message,
      icon: 'warning',
      color: alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
    });
  }, []);

  /**
   * Handle data synchronization
   */
  const handleDataSync = useCallback((data: any) => {
    addActivityFeedItem({
      type: 'system_event',
      title: 'Data Synchronized',
      description: `${data.type} data updated`,
      icon: 'refresh',
      color: 'text-green-600'
    });
  }, []);

  /**
   * Add item to activity feed
   */
  const addActivityFeedItem = useCallback(
    (item: Omit<ActivityFeedItem, 'id' | 'timestamp'>) => {
      const feedItem: ActivityFeedItem = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...item
      };

      setActivityFeed(prev => [feedItem, ...prev.slice(0, 49)]); // Keep last 50 items
    },
    []
  );

  /**
   * Start collecting system metrics
   */
  const startMetricsCollection = useCallback(() => {
    const updateMetrics = () => {
      const metrics: SystemMetrics = {
        activeUsers: connectedUsers.length,
        totalConnections: connectedUsers.length + 1, // Include current user
        messagesPerMinute: Math.floor(Math.random() * 50), // Simulated
        systemHealth: 'healthy',
        uptime: Date.now() - (Date.now() - Math.random() * 86400000) // Simulated uptime
      };

      setSystemMetrics(metrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [connectedUsers]);

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  /**
   * Format uptime
   */
  const formatUptime = (uptime: number): string => {
    const hours = Math.floor(uptime / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className='space-y-6'>
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span className='flex items-center'>
              <ProfessionalIcon name='activity' size={20} className='mr-2' />
              Real-time Collaboration
            </span>
            <div className='flex items-center space-x-2'>
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected
                    ? 'bg-green-500'
                    : isConnecting
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-red-500'
                }`}
              />
              <span className='text-sm text-gray-600'>
                {isConnected
                  ? 'Connected'
                  : isConnecting
                    ? 'Connecting...'
                    : 'Disconnected'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectionError && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-800 text-sm'>{connectionError}</p>
            </div>
          )}

          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              {isConnected && systemMetrics && (
                <>
                  <div className='text-center'>
                    <p className='text-2xl font-bold text-blue-600'>
                      {systemMetrics.activeUsers}
                    </p>
                    <p className='text-xs text-gray-500'>Active Users</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold text-green-600'>
                      {systemMetrics.messagesPerMinute}
                    </p>
                    <p className='text-xs text-gray-500'>Messages/min</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold text-purple-600'>
                      {formatUptime(systemMetrics.uptime)}
                    </p>
                    <p className='text-xs text-gray-500'>Uptime</p>
                  </div>
                </>
              )}
            </div>

            <div className='flex space-x-2'>
              {!isConnected && !isConnecting && (
                <Button onClick={connectToRealtime} variant='primary' size='sm'>
                  <ProfessionalIcon name='wifi' size={16} className='mr-2' />
                  Connect
                </Button>
              )}
              {isConnected && (
                <Button
                  onClick={disconnectFromRealtime}
                  variant='outline'
                  size='sm'
                >
                  <ProfessionalIcon
                    name='wifi-off'
                    size={16}
                    className='mr-2'
                  />
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Activity Feed */}
        {showActivityFeed && (
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <ProfessionalIcon
                    name='activity'
                    size={20}
                    className='mr-2'
                  />
                  Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {activityFeed.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <ProfessionalIcon
                        name='activity'
                        size={48}
                        className='mx-auto mb-4 text-gray-300'
                      />
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    activityFeed.map(item => (
                      <div
                        key={item.id}
                        className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'
                      >
                        <div
                          className={`flex-shrink-0 p-2 rounded-full bg-white ${item.color}`}
                        >
                          <ProfessionalIcon name={item.icon as any} size={16} />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-900'>
                            {item.title}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {item.description}
                          </p>
                          <p className='text-xs text-gray-500 mt-1'>
                            {formatTimestamp(item.timestamp)}
                          </p>
                        </div>
                        {item.user && (
                          <div className='flex-shrink-0'>
                            <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-medium text-white'>
                              {item.user.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Presence Panel */}
        {showPresencePanel && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <ProfessionalIcon name='users' size={20} className='mr-2' />
                  Online Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <DetailedPresenceIndicator />

                  {isConnected && (
                    <div className='pt-4 border-t border-gray-200'>
                      <h4 className='text-sm font-medium text-gray-900 mb-2'>
                        Current Page
                      </h4>
                      <PagePresenceIndicator maxUsers={4} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Notifications */}
      {showNotifications && isConnected && (
        <div className='fixed top-4 right-4 z-50'>
          <RealtimeNotificationCenter
            position='top-right'
            maxToasts={3}
            enableSounds={true}
            enableBrowserNotifications={true}
          />
        </div>
      )}
    </div>
  );
}
