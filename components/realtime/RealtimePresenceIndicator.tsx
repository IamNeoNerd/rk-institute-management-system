/**
 * Real-time Presence Indicator
 *
 * Component that displays real-time user presence information across the platform.
 * Shows who is currently online, what they're working on, and their activity status.
 *
 * Features:
 * - Live user presence tracking
 * - Activity status indicators
 * - Page/section-specific presence
 * - User avatars and status
 * - Hover tooltips with details
 * - Mobile-optimized display
 * - Customizable appearance
 */

'use client';

import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';

import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';
import {
  realtimeCollaboration,
  CollaborationUser,
  PresenceInfo
} from '@/lib/realtime/RealtimeCollaborationEngine';

interface RealtimePresenceIndicatorProps {
  showCurrentPageOnly?: boolean;
  maxUsers?: number;
  size?: 'sm' | 'md' | 'lg';
  showActivity?: boolean;
  showTooltips?: boolean;
  className?: string;
}

interface UserPresence {
  user: CollaborationUser;
  presence: PresenceInfo;
  color: string;
}

export default function RealtimePresenceIndicator({
  showCurrentPageOnly = false,
  maxUsers = 8,
  size = 'md',
  showActivity = true,
  showTooltips = true,
  className = ''
}: RealtimePresenceIndicatorProps) {
  const [userPresences, setUserPresences] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  // User colors for presence indicators
  const userColors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#6366F1',
    '#14B8A6',
    '#F59E0B'
  ];

  /**
   * Initialize presence tracking
   */
  useEffect(() => {
    setCurrentPage(window.location.pathname);
    setIsConnected(realtimeCollaboration.isConnected());

    // Listen for real-time events
    realtimeCollaboration.on('connected', handleConnected);
    realtimeCollaboration.on('user_joined', handleUserJoined);
    realtimeCollaboration.on('user_left', handleUserLeft);
    realtimeCollaboration.on('presence_update', handlePresenceUpdate);

    // Load initial data
    loadPresenceData();

    // Update current page on navigation
    const handleNavigation = () => {
      setCurrentPage(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);

    return () => {
      realtimeCollaboration.off('connected', handleConnected);
      realtimeCollaboration.off('user_joined', handleUserJoined);
      realtimeCollaboration.off('user_left', handleUserLeft);
      realtimeCollaboration.off('presence_update', handlePresenceUpdate);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  /**
   * Load presence data
   */
  const loadPresenceData = useCallback(() => {
    const connectedUsers = realtimeCollaboration.getConnectedUsers();
    const presenceData = realtimeCollaboration.getPresenceData();

    const userPresenceMap = new Map<string, UserPresence>();

    // Combine user and presence data
    connectedUsers.forEach((user, index) => {
      const presence = presenceData.find(p => p.userId === user.id);
      if (presence) {
        userPresenceMap.set(user.id, {
          user,
          presence,
          color: userColors[index % userColors.length]
        });
      }
    });

    let filteredPresences = Array.from(userPresenceMap.values());

    // Filter by current page if requested
    if (showCurrentPageOnly) {
      filteredPresences = filteredPresences.filter(
        up => up.presence.page === currentPage
      );
    }

    // Sort by activity (most recent first)
    filteredPresences.sort(
      (a, b) => b.presence.timestamp - a.presence.timestamp
    );

    // Limit number of users
    if (maxUsers > 0) {
      filteredPresences = filteredPresences.slice(0, maxUsers);
    }

    setUserPresences(filteredPresences);
  }, [showCurrentPageOnly, currentPage, maxUsers]);

  /**
   * Handle connection established
   */
  const handleConnected = useCallback(() => {
    setIsConnected(true);
    loadPresenceData();
  }, [loadPresenceData]);

  /**
   * Handle user joined
   */
  const handleUserJoined = useCallback(
    (user: CollaborationUser) => {
      loadPresenceData();
    },
    [loadPresenceData]
  );

  /**
   * Handle user left
   */
  const handleUserLeft = useCallback((user: CollaborationUser) => {
    setUserPresences(prev => prev.filter(up => up.user.id !== user.id));
  }, []);

  /**
   * Handle presence update
   */
  const handlePresenceUpdate = useCallback(
    (presence: PresenceInfo) => {
      loadPresenceData();
    },
    [loadPresenceData]
  );

  /**
   * Get size classes
   */
  const getSizeClasses = (): {
    avatar: string;
    text: string;
    container: string;
  } => {
    switch (size) {
      case 'sm':
        return {
          avatar: 'w-6 h-6 text-xs',
          text: 'text-xs',
          container: 'space-x-1'
        };
      case 'lg':
        return {
          avatar: 'w-10 h-10 text-sm',
          text: 'text-sm',
          container: 'space-x-3'
        };
      default:
        return {
          avatar: 'w-8 h-8 text-xs',
          text: 'text-sm',
          container: 'space-x-2'
        };
    }
  };

  /**
   * Get activity status
   */
  const getActivityStatus = (
    presence: PresenceInfo
  ): { label: string; color: string } => {
    const timeSinceUpdate = Date.now() - presence.timestamp;

    if (timeSinceUpdate < 30000) {
      // Less than 30 seconds
      return { label: 'Active', color: 'bg-green-500' };
    } else if (timeSinceUpdate < 300000) {
      // Less than 5 minutes
      return { label: 'Recently active', color: 'bg-yellow-500' };
    } else {
      return { label: 'Away', color: 'bg-gray-500' };
    }
  };

  /**
   * Get page name from path
   */
  const getPageName = (path: string): string => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';

    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  /**
   * Format activity description
   */
  const formatActivity = (presence: PresenceInfo): string => {
    const pageName = getPageName(presence.page);
    const activity = presence.activity || 'viewing';

    if (presence.section) {
      return `${activity} ${presence.section} in ${pageName}`;
    }

    return `${activity} ${pageName}`;
  };

  /**
   * Get tooltip content
   */
  const getTooltipContent = (userPresence: UserPresence): string => {
    const { user, presence } = userPresence;
    const activity = formatActivity(presence);
    const status = getActivityStatus(presence);
    const timeAgo = Math.floor((Date.now() - presence.timestamp) / 1000);

    let timeText = '';
    if (timeAgo < 60) {
      timeText = 'just now';
    } else if (timeAgo < 3600) {
      timeText = `${Math.floor(timeAgo / 60)}m ago`;
    } else {
      timeText = `${Math.floor(timeAgo / 3600)}h ago`;
    }

    return `${user.name}\n${activity}\n${status.label} • ${timeText}`;
  };

  const sizeClasses = getSizeClasses();

  if (!isConnected || userPresences.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center ${sizeClasses.container} ${className}`}>
      {/* Connection indicator */}
      <div className='flex items-center space-x-1'>
        <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
        {size !== 'sm' && (
          <span className={`text-gray-600 ${sizeClasses.text}`}>
            {userPresences.length} online
          </span>
        )}
      </div>

      {/* User avatars */}
      <div className='flex -space-x-1'>
        {userPresences.map(userPresence => {
          const { user, presence } = userPresence;
          const activityStatus = getActivityStatus(presence);

          return (
            <div
              key={user.id}
              className='relative group'
              title={showTooltips ? getTooltipContent(userPresence) : undefined}
            >
              {/* User avatar */}
              <div
                className={`${sizeClasses.avatar} rounded-full border-2 border-white flex items-center justify-center font-medium text-white relative overflow-hidden`}
                style={{ backgroundColor: userPresence.color }}
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 32px, 40px'
                    priority={false}
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}

                {/* Activity status indicator */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${activityStatus.color} rounded-full border-2 border-white`}
                />
              </div>

              {/* Tooltip */}
              {showTooltips && (
                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-pre-line opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50'>
                  {getTooltipContent(userPresence)}
                  <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900' />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overflow indicator */}
      {userPresences.length >= maxUsers && (
        <div
          className={`${sizeClasses.avatar} rounded-full border-2 border-white bg-gray-500 flex items-center justify-center font-medium text-white`}
        >
          <ProfessionalIcon name='more' size={size === 'sm' ? 12 : 16} />
        </div>
      )}

      {/* Activity summary */}
      {showActivity && size !== 'sm' && userPresences.length > 0 && (
        <div className='flex flex-col'>
          <span className={`text-gray-900 font-medium ${sizeClasses.text}`}>
            {userPresences[0].user.name}
            {userPresences.length > 1 && ` +${userPresences.length - 1} others`}
          </span>
          <span className={`text-gray-500 ${sizeClasses.text}`}>
            {formatActivity(userPresences[0].presence)}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact presence indicator for navigation bars
 */
export function CompactPresenceIndicator({
  className = ''
}: {
  className?: string;
}) {
  return (
    <RealtimePresenceIndicator
      showCurrentPageOnly={true}
      maxUsers={5}
      size='sm'
      showActivity={false}
      showTooltips={true}
      className={className}
    />
  );
}

/**
 * Detailed presence indicator for sidebars
 */
export function DetailedPresenceIndicator({
  className = ''
}: {
  className?: string;
}) {
  return (
    <RealtimePresenceIndicator
      showCurrentPageOnly={false}
      maxUsers={10}
      size='md'
      showActivity={true}
      showTooltips={true}
      className={className}
    />
  );
}

/**
 * Page-specific presence indicator
 */
export function PagePresenceIndicator({
  className = '',
  maxUsers = 6
}: {
  className?: string;
  maxUsers?: number;
}) {
  return (
    <RealtimePresenceIndicator
      showCurrentPageOnly={true}
      maxUsers={maxUsers}
      size='md'
      showActivity={true}
      showTooltips={true}
      className={className}
    />
  );
}
