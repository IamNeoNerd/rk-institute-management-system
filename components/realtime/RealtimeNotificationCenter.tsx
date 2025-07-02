/**
 * Real-time Notification Center
 *
 * Comprehensive notification system that displays real-time alerts, updates,
 * and collaborative messages. Provides toast notifications, notification panel,
 * and interactive notification management.
 *
 * Features:
 * - Toast notifications with auto-dismiss
 * - Notification panel with history
 * - Real-time updates and alerts
 * - Interactive notification actions
 * - Notification filtering and search
 * - Sound and visual alerts
 * - Mobile-optimized interface
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';
import {
  realtimeCollaboration,
  NotificationMessage,
  NotificationAction
} from '@/lib/realtime/RealtimeCollaborationEngine';

interface ToastNotification extends NotificationMessage {
  isVisible: boolean;
  timeoutId?: NodeJS.Timeout;
}

interface NotificationCenterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts?: number;
  defaultDuration?: number;
  enableSounds?: boolean;
  enableBrowserNotifications?: boolean;
}

export default function RealtimeNotificationCenter({
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000,
  enableSounds = true,
  enableBrowserNotifications = true
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'system' | 'user'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Initialize notification center
   */
  useEffect(() => {
    // Request browser notification permission
    if (enableBrowserNotifications && 'Notification' in window) {
      Notification.requestPermission();
    }

    // Setup audio for notification sounds
    if (enableSounds) {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.3;
    }

    // Listen for real-time notifications
    realtimeCollaboration.on('notification', handleNewNotification);
    realtimeCollaboration.on('notification_read', handleNotificationRead);
    realtimeCollaboration.on(
      'notification_dismissed',
      handleNotificationDismissed
    );

    // Load existing notifications
    loadNotifications();

    return () => {
      realtimeCollaboration.off('notification', handleNewNotification);
      realtimeCollaboration.off('notification_read', handleNotificationRead);
      realtimeCollaboration.off(
        'notification_dismissed',
        handleNotificationDismissed
      );
    };
  }, [enableBrowserNotifications, enableSounds]);

  /**
   * Load existing notifications
   */
  const loadNotifications = useCallback(() => {
    const existingNotifications = realtimeCollaboration.getNotifications();
    setNotifications(existingNotifications);
  }, []);

  /**
   * Handle new notification
   */
  const handleNewNotification = useCallback(
    (notification: NotificationMessage) => {
      setNotifications(prev => [notification, ...prev]);

      // Show toast notification
      showToast(notification);

      // Play sound
      if (enableSounds && audioRef.current) {
        audioRef.current.play().catch(console.error);
      }

      // Show browser notification
      if (
        enableBrowserNotifications &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/notification-icon.png',
          tag: notification.id
        });
      }
    },
    [enableSounds, enableBrowserNotifications]
  );

  /**
   * Handle notification read
   */
  const handleNotificationRead = useCallback(
    (notification: NotificationMessage) => {
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
      );
    },
    []
  );

  /**
   * Handle notification dismissed
   */
  const handleNotificationDismissed = useCallback((data: { id: string }) => {
    setNotifications(prev => prev.filter(n => n.id !== data.id));
    setToasts(prev => prev.filter(t => t.id !== data.id));
  }, []);

  /**
   * Show toast notification
   */
  const showToast = useCallback(
    (notification: NotificationMessage) => {
      const toast: ToastNotification = {
        ...notification,
        isVisible: true
      };

      setToasts(prev => {
        const newToasts = [toast, ...prev.slice(0, maxToasts - 1)];

        // Auto-dismiss after duration
        const duration = notification.autoExpire || defaultDuration;
        if (duration > 0) {
          toast.timeoutId = setTimeout(() => {
            dismissToast(toast.id);
          }, duration);
        }

        return newToasts;
      });
    },
    [maxToasts, defaultDuration]
  );

  /**
   * Dismiss toast notification
   */
  const dismissToast = useCallback((toastId: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === toastId);
      if (toast?.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      return prev.filter(t => t.id !== toastId);
    });
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId: string) => {
    realtimeCollaboration.markNotificationAsRead(notificationId);
  }, []);

  /**
   * Dismiss notification
   */
  const dismissNotification = useCallback((notificationId: string) => {
    realtimeCollaboration.dismissNotification(notificationId);
  }, []);

  /**
   * Handle notification action
   */
  const handleNotificationAction = useCallback(
    (notification: NotificationMessage, action: NotificationAction) => {
      console.log(
        `Executing action: ${action.action} for notification: ${notification.id}`
      );

      // Mark as read when action is taken
      markAsRead(notification.id);

      // Execute the action (would integrate with actual action handlers)
      switch (action.action) {
        case 'view_details':
          // Navigate to details page
          break;
        case 'approve':
          // Handle approval action
          break;
        case 'reject':
          // Handle rejection action
          break;
        default:
          console.warn('Unknown action:', action.action);
      }
    },
    [markAsRead]
  );

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(() => {
    notifications
      .filter(n => !n.read)
      .forEach(n => {
        markAsRead(n.id);
      });
  }, [notifications, markAsRead]);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    notifications.forEach(n => {
      dismissNotification(n.id);
    });
  }, [notifications, dismissNotification]);

  /**
   * Filter notifications
   */
  const filteredNotifications = notifications.filter(notification => {
    // Apply filter
    switch (filter) {
      case 'unread':
        if (notification.read) return false;
        break;
      case 'system':
        if (notification.type !== 'system') return false;
        break;
      case 'user':
        if (notification.type === 'system') return false;
        break;
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }

    return true;
  });

  /**
   * Get notification icon
   */
  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'success':
        return 'check';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'system':
        return 'settings';
      default:
        return 'info';
    }
  };

  /**
   * Get notification color classes
   */
  const getNotificationColors = (type: string): string => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'system':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  /**
   * Get toast position classes
   */
  const getToastPositionClasses = (): string => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Notification Bell Icon */}
      <div className='relative'>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant='ghost'
          size='sm'
          className='relative p-2'
        >
          <ProfessionalIcon name='bell' size={20} />
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Notification Panel */}
        {isOpen && (
          <div className='absolute right-0 top-full mt-2 w-96 max-w-screen-sm z-50'>
            <Card className='shadow-lg border-gray-200'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>Notifications</CardTitle>
                  <div className='flex items-center space-x-2'>
                    {unreadCount > 0 && (
                      <Button onClick={markAllAsRead} variant='ghost' size='sm'>
                        Mark all read
                      </Button>
                    )}
                    <Button onClick={clearAll} variant='ghost' size='sm'>
                      <ProfessionalIcon name='trash' size={16} />
                    </Button>
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant='ghost'
                      size='sm'
                    >
                      <ProfessionalIcon name='close' size={16} />
                    </Button>
                  </div>
                </div>

                {/* Filters and Search */}
                <div className='space-y-3'>
                  <div className='flex space-x-2'>
                    {['all', 'unread', 'system', 'user'].map(filterOption => (
                      <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption as any)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          filter === filterOption
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filterOption.charAt(0).toUpperCase() +
                          filterOption.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className='relative'>
                    <ProfessionalIcon
                      name='search'
                      size={16}
                      className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    />
                    <input
                      type='text'
                      placeholder='Search notifications...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className='p-0'>
                <div className='max-h-96 overflow-y-auto'>
                  {filteredNotifications.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <ProfessionalIcon
                        name='bell'
                        size={48}
                        className='mx-auto mb-4 text-gray-300'
                      />
                      <p>No notifications found</p>
                    </div>
                  ) : (
                    <div className='divide-y divide-gray-100'>
                      {filteredNotifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className='flex items-start space-x-3'>
                            <div
                              className={`flex-shrink-0 p-2 rounded-full ${getNotificationColors(notification.type)}`}
                            >
                              <ProfessionalIcon
                                name={
                                  getNotificationIcon(notification.type) as any
                                }
                                size={16}
                              />
                            </div>

                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center justify-between'>
                                <p className='text-sm font-medium text-gray-900 truncate'>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2' />
                                )}
                              </div>

                              <p className='text-sm text-gray-600 mt-1'>
                                {notification.message}
                              </p>

                              <div className='flex items-center justify-between mt-2'>
                                <p className='text-xs text-gray-500'>
                                  {new Date(
                                    notification.timestamp
                                  ).toLocaleString()}
                                </p>

                                <div className='flex items-center space-x-2'>
                                  {notification.actions?.map(action => (
                                    <Button
                                      key={action.id}
                                      onClick={() =>
                                        handleNotificationAction(
                                          notification,
                                          action
                                        )
                                      }
                                      variant={
                                        action.style === 'primary'
                                          ? 'primary'
                                          : 'outline'
                                      }
                                      size='sm'
                                      className='text-xs'
                                    >
                                      {action.label}
                                    </Button>
                                  ))}

                                  {!notification.read && (
                                    <Button
                                      onClick={() =>
                                        markAsRead(notification.id)
                                      }
                                      variant='ghost'
                                      size='sm'
                                    >
                                      <ProfessionalIcon
                                        name='check'
                                        size={14}
                                      />
                                    </Button>
                                  )}

                                  <Button
                                    onClick={() =>
                                      dismissNotification(notification.id)
                                    }
                                    variant='ghost'
                                    size='sm'
                                  >
                                    <ProfessionalIcon name='close' size={14} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className={`fixed ${getToastPositionClasses()} z-50 space-y-2`}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`max-w-sm w-full bg-white shadow-lg rounded-lg border border-gray-200 transform transition-all duration-300 ${
              toast.isVisible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0'
            }`}
          >
            <div className='p-4'>
              <div className='flex items-start space-x-3'>
                <div
                  className={`flex-shrink-0 p-2 rounded-full ${getNotificationColors(toast.type)}`}
                >
                  <ProfessionalIcon
                    name={getNotificationIcon(toast.type) as any}
                    size={16}
                  />
                </div>

                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900'>
                    {toast.title}
                  </p>
                  <p className='text-sm text-gray-600 mt-1'>{toast.message}</p>

                  {toast.actions && toast.actions.length > 0 && (
                    <div className='flex space-x-2 mt-3'>
                      {toast.actions.map(action => (
                        <Button
                          key={action.id}
                          onClick={() =>
                            handleNotificationAction(toast, action)
                          }
                          variant={
                            action.style === 'primary' ? 'primary' : 'outline'
                          }
                          size='sm'
                          className='text-xs'
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => dismissToast(toast.id)}
                  variant='ghost'
                  size='sm'
                  className='flex-shrink-0'
                >
                  <ProfessionalIcon name='close' size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
