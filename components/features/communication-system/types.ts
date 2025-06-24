/**
 * Real-time Communication System - Type Definitions
 * 
 * Comprehensive messaging and notification system for RK Institute Management System.
 * Leverages existing architecture patterns for rapid development.
 * 
 * Features:
 * - Cross-portal messaging between all user roles
 * - Real-time notifications and status updates
 * - Message threading and conversation management
 * - File attachments and rich media support
 * - Notification preferences and delivery management
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'teacher' | 'parent' | 'student';
  content: string;
  type: 'text' | 'file' | 'image' | 'announcement' | 'system';
  attachments?: MessageAttachment[];
  timestamp: string;
  isRead: boolean;
  isEdited: boolean;
  editedAt?: string;
  replyToId?: string;
  reactions?: MessageReaction[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  size: number;
  mimeType: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'announcement' | 'class';
  title?: string;
  description?: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    classId?: string;
    subjectId?: string;
    studentId?: string;
    isOfficial?: boolean;
  };
}

export interface ConversationParticipant {
  userId: string;
  userName: string;
  userRole: 'admin' | 'teacher' | 'parent' | 'student';
  joinedAt: string;
  lastReadAt?: string;
  permissions: {
    canSendMessages: boolean;
    canAddParticipants: boolean;
    canRemoveParticipants: boolean;
    canEditConversation: boolean;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'announcement' | 'reminder' | 'system' | 'grade' | 'attendance';
  title: string;
  content: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  expiresAt?: string;
  metadata?: {
    conversationId?: string;
    messageId?: string;
    senderId?: string;
    senderName?: string;
  };
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: {
    messages: boolean;
    announcements: boolean;
    reminders: boolean;
    grades: boolean;
    attendance: boolean;
  };
  pushNotifications: {
    messages: boolean;
    announcements: boolean;
    reminders: boolean;
    grades: boolean;
    attendance: boolean;
  };
  inAppNotifications: {
    messages: boolean;
    announcements: boolean;
    reminders: boolean;
    grades: boolean;
    attendance: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

// Component Props Interfaces
export interface CommunicationSystemProps {
  userRole: 'admin' | 'teacher' | 'parent' | 'student';
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
}

export interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  loading?: boolean;
}

export interface MessageThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string, attachments?: File[]) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  loading?: boolean;
}

export interface MessageComposerProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  allowAttachments?: boolean;
  maxAttachmentSize?: number; // in bytes
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onNotificationClick: (notification: Notification) => void;
  loading?: boolean;
}

export interface UserSelectorProps {
  users: User[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  userRole: string;
  placeholder?: string;
  maxSelections?: number;
}

export interface ConversationCreatorProps {
  onCreateConversation: (participants: string[], title?: string, type?: Conversation['type']) => void;
  onCancel: () => void;
  userRole: string;
  availableUsers: User[];
}

// API Request/Response Types
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: Message['type'];
  attachments?: File[];
  replyToId?: string;
}

export interface CreateConversationRequest {
  type: Conversation['type'];
  participantIds: string[];
  title?: string;
  description?: string;
  metadata?: Conversation['metadata'];
}

export interface UpdateNotificationPreferencesRequest {
  userId: string;
  preferences: Partial<NotificationPreferences>;
}

// Real-time Event Types
export interface MessageEvent {
  type: 'message_sent' | 'message_edited' | 'message_deleted' | 'message_reaction';
  conversationId: string;
  message: Message;
  userId: string;
}

export interface ConversationEvent {
  type: 'conversation_created' | 'conversation_updated' | 'participant_added' | 'participant_removed';
  conversation: Conversation;
  userId: string;
}

export interface NotificationEvent {
  type: 'notification_created' | 'notification_read' | 'notification_deleted';
  notification: Notification;
  userId: string;
}

export interface UserStatusEvent {
  type: 'user_online' | 'user_offline' | 'user_typing' | 'user_stopped_typing';
  userId: string;
  conversationId?: string;
  timestamp: string;
}

// Filter and Search Types
export interface ConversationFilters {
  type?: Conversation['type'];
  isArchived?: boolean;
  hasUnread?: boolean;
  participantId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface MessageFilters {
  senderId?: string;
  type?: Message['type'];
  hasAttachments?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  searchQuery?: string;
}

export interface NotificationFilters {
  type?: Notification['type'];
  priority?: Notification['priority'];
  isRead?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

// Statistics and Analytics
export interface CommunicationStats {
  totalConversations: number;
  totalMessages: number;
  unreadMessages: number;
  activeConversations: number;
  messagesSentToday: number;
  messagesReceivedToday: number;
  averageResponseTime: number; // in minutes
  mostActiveConversations: Array<{
    conversationId: string;
    title: string;
    messageCount: number;
  }>;
  communicationTrends: Array<{
    date: string;
    messagesSent: number;
    messagesReceived: number;
  }>;
}
