/**
 * Collaborative Editor Component
 *
 * Real-time collaborative editing component that allows multiple users to
 * simultaneously edit content with live updates, conflict resolution,
 * and user presence indicators.
 *
 * Features:
 * - Real-time collaborative editing
 * - User presence indicators
 * - Conflict resolution with operational transformation
 * - Live cursor tracking
 * - Change history and versioning
 * - Auto-save functionality
 * - Mobile-optimized interface
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';
import {
  realtimeCollaboration,
  EditOperation,
  CollaborationUser,
  PresenceInfo
} from '@/lib/realtime/RealtimeCollaborationEngine';

interface CollaborativeEditorProps {
  entityType: 'student' | 'course' | 'assignment' | 'fee' | 'user';
  entityId: string;
  initialContent: string;
  onSave?: (content: string) => void;
  onContentChange?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

interface UserCursor {
  userId: string;
  user: CollaborationUser;
  position: number;
  selection?: { start: number; end: number };
  color: string;
}

interface ChangeHistoryEntry {
  id: string;
  operation: EditOperation;
  content: string;
  timestamp: number;
  user: CollaborationUser;
}

export { CollaborativeEditor };
export default function CollaborativeEditor({
  entityType,
  entityId,
  initialContent,
  onSave,
  onContentChange,
  readOnly = false,
  placeholder = 'Start typing...',
  autoSave = true,
  autoSaveInterval = 5000
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const [userCursors, setUserCursors] = useState<UserCursor[]>([]);
  const [changeHistory, setChangeHistory] = useState<ChangeHistoryEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastOperationRef = useRef<string>('');

  // User colors for cursors and presence
  const userColors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16'
  ];

  /**
   * Initialize collaborative editor
   */
  useEffect(() => {
    // Check connection status
    setIsConnected(realtimeCollaboration.isConnected());

    // Listen for real-time events
    realtimeCollaboration.on('connected', handleConnected);
    realtimeCollaboration.on('user_joined', handleUserJoined);
    realtimeCollaboration.on('user_left', handleUserLeft);
    realtimeCollaboration.on('edit_operation', handleEditOperation);
    realtimeCollaboration.on('presence_update', handlePresenceUpdate);

    // Load connected users
    setConnectedUsers(realtimeCollaboration.getConnectedUsers());

    return () => {
      realtimeCollaboration.off('connected', handleConnected);
      realtimeCollaboration.off('user_joined', handleUserJoined);
      realtimeCollaboration.off('user_left', handleUserLeft);
      realtimeCollaboration.off('edit_operation', handleEditOperation);
      realtimeCollaboration.off('presence_update', handlePresenceUpdate);

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle connection established
   */
  const handleConnected = useCallback(() => {
    setIsConnected(true);
  }, []);

  /**
   * Handle user joined
   */
  const handleUserJoined = useCallback((user: CollaborationUser) => {
    setConnectedUsers(prev => [...prev, user]);
  }, []);

  /**
   * Handle user left
   */
  const handleUserLeft = useCallback((user: CollaborationUser) => {
    setConnectedUsers(prev => prev.filter(u => u.id !== user.id));
    setUserCursors(prev => prev.filter(c => c.userId !== user.id));
  }, []);

  /**
   * Handle edit operation from other users
   */
  const handleEditOperation = useCallback(
    (operation: EditOperation) => {
      // Only process operations for this entity
      if (
        operation.entityType !== entityType ||
        operation.entityId !== entityId
      ) {
        return;
      }

      // Don't process our own operations
      const currentUser = realtimeCollaboration.getCurrentUser();
      if (operation.userId === currentUser?.id) {
        return;
      }

      // Apply the operation
      applyOperation(operation);

      // Add to change history
      const user = connectedUsers.find(u => u.id === operation.userId);
      if (user) {
        const historyEntry: ChangeHistoryEntry = {
          id: operation.id,
          operation,
          content: content, // This would be the content after applying the operation
          timestamp: operation.timestamp,
          user
        };

        setChangeHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 changes
      }
    },
    [entityType, entityId, connectedUsers, content]
  );

  /**
   * Handle presence update
   */
  const handlePresenceUpdate = useCallback(
    (presence: PresenceInfo) => {
      // Update user cursor position if they're editing this entity
      if (presence.page === window.location.pathname && presence.selection) {
        const user = connectedUsers.find(u => u.id === presence.userId);
        if (user) {
          const colorIndex =
            connectedUsers.findIndex(u => u.id === presence.userId) %
            userColors.length;
          const cursor: UserCursor = {
            userId: presence.userId,
            user,
            position: presence.selection.start,
            selection: presence.selection,
            color: userColors[colorIndex]
          };

          setUserCursors(prev => {
            const filtered = prev.filter(c => c.userId !== presence.userId);
            return [...filtered, cursor];
          });
        }
      }
    },
    [connectedUsers]
  );

  /**
   * Apply edit operation to content
   */
  const applyOperation = useCallback((operation: EditOperation) => {
    setContent(prevContent => {
      let newContent = prevContent;

      switch (operation.type) {
        case 'insert':
          if (operation.position !== undefined && operation.content) {
            newContent =
              prevContent.slice(0, operation.position) +
              operation.content +
              prevContent.slice(operation.position);
          }
          break;

        case 'delete':
          if (operation.position !== undefined && operation.content) {
            const deleteLength = operation.content.length;
            newContent =
              prevContent.slice(0, operation.position) +
              prevContent.slice(operation.position + deleteLength);
          }
          break;

        case 'update':
          if (operation.content) {
            newContent = operation.content;
          }
          break;
      }

      return newContent;
    });
  }, []);

  /**
   * Handle content change
   */
  const handleContentChange = useCallback(
    (newContent: string) => {
      const oldContent = content;
      setContent(newContent);
      setHasUnsavedChanges(true);

      // Call onChange callback
      if (onContentChange) {
        onContentChange(newContent);
      }

      // Create and send edit operation
      if (isConnected && !readOnly) {
        const operation = createEditOperation(oldContent, newContent);
        if (operation) {
          realtimeCollaboration.sendEditOperation(operation);
        }
      }

      // Update presence with cursor position
      if (textareaRef.current) {
        const selectionStart = textareaRef.current.selectionStart;
        const selectionEnd = textareaRef.current.selectionEnd;

        realtimeCollaboration.updatePresence({
          page: window.location.pathname,
          section: `${entityType}-${entityId}`,
          activity: 'editing',
          selection: { start: selectionStart, end: selectionEnd }
        });
      }

      // Setup auto-save
      if (autoSave) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
          saveContent(newContent);
        }, autoSaveInterval);
      }
    },
    [
      content,
      isConnected,
      readOnly,
      entityType,
      entityId,
      autoSave,
      autoSaveInterval,
      onContentChange
    ]
  );

  /**
   * Create edit operation from content changes
   */
  const createEditOperation = useCallback(
    (
      oldContent: string,
      newContent: string
    ): Omit<
      EditOperation,
      'id' | 'userId' | 'timestamp' | 'applied'
    > | null => {
      // Simple diff algorithm - in production, use a more sophisticated approach
      if (oldContent === newContent) return null;

      // Find the first difference
      let start = 0;
      while (
        start < oldContent.length &&
        start < newContent.length &&
        oldContent[start] === newContent[start]
      ) {
        start++;
      }

      // Find the last difference
      let oldEnd = oldContent.length;
      let newEnd = newContent.length;
      while (
        oldEnd > start &&
        newEnd > start &&
        oldContent[oldEnd - 1] === newContent[newEnd - 1]
      ) {
        oldEnd--;
        newEnd--;
      }

      const deletedText = oldContent.slice(start, oldEnd);
      const insertedText = newContent.slice(start, newEnd);

      if (deletedText && insertedText) {
        // Replace operation
        return {
          type: 'update',
          entityType,
          entityId,
          content: newContent
        };
      } else if (insertedText) {
        // Insert operation
        return {
          type: 'insert',
          entityType,
          entityId,
          position: start,
          content: insertedText
        };
      } else if (deletedText) {
        // Delete operation
        return {
          type: 'delete',
          entityType,
          entityId,
          position: start,
          content: deletedText
        };
      }

      return null;
    },
    [entityType, entityId]
  );

  /**
   * Save content
   */
  const saveContent = useCallback(
    async (contentToSave?: string) => {
      const saveContent = contentToSave || content;

      setIsSaving(true);

      try {
        if (onSave) {
          await onSave(saveContent);
        }

        setLastSaved(new Date());
        setHasUnsavedChanges(false);

        // Send notification
        realtimeCollaboration.showNotification({
          type: 'success',
          title: 'Content Saved',
          message: `${entityType} content saved successfully`,
          targetUsers: [realtimeCollaboration.getCurrentUser()?.id || ''],
          autoExpire: 3000
        });
      } catch (error) {
        console.error('Failed to save content:', error);

        realtimeCollaboration.showNotification({
          type: 'error',
          title: 'Save Failed',
          message: 'Failed to save content. Please try again.',
          targetUsers: [realtimeCollaboration.getCurrentUser()?.id || ''],
          autoExpire: 5000
        });
      } finally {
        setIsSaving(false);
      }
    },
    [content, onSave, entityType]
  );

  /**
   * Handle cursor position change
   */
  const handleCursorChange = useCallback(() => {
    if (textareaRef.current && isConnected) {
      const selectionStart = textareaRef.current.selectionStart;
      const selectionEnd = textareaRef.current.selectionEnd;

      realtimeCollaboration.updatePresence({
        page: window.location.pathname,
        section: `${entityType}-${entityId}`,
        activity: 'editing',
        selection: { start: selectionStart, end: selectionEnd }
      });
    }
  }, [isConnected, entityType, entityId]);

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

  return (
    <div className='space-y-4'>
      {/* Editor Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          {/* Connection Status */}
          <div className='flex items-center space-x-2'>
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className='text-sm text-gray-600'>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Connected Users */}
          {connectedUsers.length > 0 && (
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-gray-600'>Collaborators:</span>
              <div className='flex -space-x-2'>
                {connectedUsers.slice(0, 5).map((user, index) => (
                  <div
                    key={user.id}
                    className='w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white'
                    style={{
                      backgroundColor: userColors[index % userColors.length]
                    }}
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {connectedUsers.length > 5 && (
                  <div className='w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-xs font-medium text-white'>
                    +{connectedUsers.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='flex items-center space-x-2'>
          {/* Save Status */}
          {hasUnsavedChanges && (
            <span className='text-sm text-yellow-600'>Unsaved changes</span>
          )}
          {lastSaved && (
            <span className='text-sm text-gray-500'>
              Saved {formatTimestamp(lastSaved.getTime())}
            </span>
          )}

          {/* Action Buttons */}
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant='outline'
            size='sm'
          >
            <ProfessionalIcon name='history' size={16} className='mr-2' />
            History
          </Button>

          {!readOnly && (
            <Button
              onClick={() => saveContent()}
              disabled={isSaving || !hasUnsavedChanges}
              variant='primary'
              size='sm'
            >
              {isSaving ? (
                <>
                  <ProfessionalIcon
                    name='loading'
                    size={16}
                    className='mr-2 animate-spin'
                  />
                  Saving...
                </>
              ) : (
                <>
                  <ProfessionalIcon name='save' size={16} className='mr-2' />
                  Save
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className='relative'>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => handleContentChange(e.target.value)}
          onSelect={handleCursorChange}
          onKeyUp={handleCursorChange}
          onClick={handleCursorChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className='w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />

        {/* User Cursors */}
        {userCursors.map(cursor => (
          <div
            key={cursor.userId}
            className='absolute pointer-events-none'
            style={{
              // This is a simplified cursor positioning - in production, you'd need more sophisticated positioning
              top: '1rem',
              left: `${Math.min(cursor.position * 0.5, 90)}%`
            }}
          >
            <div
              className='w-0.5 h-6 animate-pulse'
              style={{ backgroundColor: cursor.color }}
            />
            <div
              className='absolute top-0 left-0 px-2 py-1 text-xs text-white rounded whitespace-nowrap transform -translate-y-full'
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.user.name}
            </div>
          </div>
        ))}
      </div>

      {/* Change History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Change History</CardTitle>
          </CardHeader>
          <CardContent>
            {changeHistory.length === 0 ? (
              <p className='text-gray-500 text-center py-4'>No changes yet</p>
            ) : (
              <div className='space-y-3 max-h-64 overflow-y-auto'>
                {changeHistory.map(entry => (
                  <div
                    key={entry.id}
                    className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
                  >
                    <div
                      className='w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white'
                      style={{
                        backgroundColor:
                          userColors[
                            connectedUsers.findIndex(
                              u => u.id === entry.user.id
                            ) % userColors.length
                          ]
                      }}
                    >
                      {entry.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        {entry.user.name} {entry.operation.type}ed content
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatTimestamp(entry.timestamp)}
                      </p>
                    </div>
                    <ProfessionalIcon
                      name={
                        entry.operation.type === 'insert'
                          ? 'plus'
                          : entry.operation.type === 'delete'
                            ? 'minus'
                            : 'edit'
                      }
                      size={16}
                      className='text-gray-400'
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
