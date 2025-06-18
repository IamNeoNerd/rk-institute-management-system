'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, MessageSquare, Send, Plus, Filter } from 'lucide-react';

interface Message {
  id: string;
  subject: string;
  content: string;
  sender: {
    name: string;
    role: string;
  };
  recipient: {
    name: string;
    role: string;
  };
  timestamp: string;
  isRead: boolean;
  type: 'RECEIVED' | 'SENT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  studentName?: string;
}

export default function TeacherMessages() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterSender, setFilterSender] = useState('all');
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    recipientType: 'STUDENT',
    subject: '',
    content: '',
    studentName: ''
  });

  useEffect(() => {
    // Handle query parameters
    const type = searchParams.get('type');
    const action = searchParams.get('action');

    if (type === 'student') {
      setFilterSender('student');
    } else if (type === 'parent') {
      setFilterSender('parent');
    }
    if (action === 'compose') {
      setShowCompose(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Mock data for teacher's messages - separate effect to avoid infinite loop
    setMessages([
      {
        id: '1',
        subject: 'Question about Assignment Requirements',
        content: 'Hello Dr. Johnson, I have a question about the integration problems assignment. Could you please clarify whether we need to show the step-by-step work for problem #15? Thank you!',
        sender: { name: 'Emma Wilson', role: 'STUDENT' },
        recipient: { name: 'Dr. Sarah Johnson', role: 'TEACHER' },
        timestamp: '2024-06-15T10:30:00Z',
        isRead: false,
        type: 'RECEIVED',
        priority: 'MEDIUM',
        studentName: 'Emma Wilson'
      },
      {
        id: '2',
        subject: 'Request for Parent-Teacher Conference',
        content: 'Dear Dr. Johnson, I would like to schedule a parent-teacher conference to discuss Emma&apos;s progress in mathematics. Could we arrange a meeting next week? Thank you.',
        sender: { name: 'Sarah Wilson', role: 'PARENT' },
        recipient: { name: 'Dr. Sarah Johnson', role: 'TEACHER' },
        timestamp: '2024-06-14T14:20:00Z',
        isRead: true,
        type: 'RECEIVED',
        priority: 'HIGH',
        studentName: 'Emma Wilson'
      },
      {
        id: '3',
        subject: 'Assignment Feedback - Calculus Mid-term',
        content: 'Excellent work on your calculus mid-term! You demonstrated a strong understanding of differential calculus concepts. Your solutions were well-organized and clearly explained. Keep up the great work!',
        sender: { name: 'Dr. Sarah Johnson', role: 'TEACHER' },
        recipient: { name: 'Emma Wilson', role: 'STUDENT' },
        timestamp: '2024-06-13T16:45:00Z',
        isRead: true,
        type: 'SENT',
        priority: 'MEDIUM',
        studentName: 'Emma Wilson'
      },
      {
        id: '4',
        subject: 'Thank you for extra help session',
        content: 'Thank you for staying after class to help me understand the thermodynamics concepts. The additional explanation really helped clarify the material.',
        sender: { name: 'Alex Chen', role: 'STUDENT' },
        recipient: { name: 'Dr. Sarah Johnson', role: 'TEACHER' },
        timestamp: '2024-06-12T11:15:00Z',
        isRead: true,
        type: 'RECEIVED',
        priority: 'LOW',
        studentName: 'Alex Chen'
      },
      {
        id: '5',
        subject: 'Conference Confirmation',
        content: 'Thank you for scheduling the parent-teacher conference. I have confirmed our meeting for Friday at 3:00 PM in my office. Looking forward to discussing Emma&apos;s progress.',
        sender: { name: 'Dr. Sarah Johnson', role: 'TEACHER' },
        recipient: { name: 'Sarah Wilson', role: 'PARENT' },
        timestamp: '2024-06-10T09:00:00Z',
        isRead: true,
        type: 'SENT',
        priority: 'HIGH',
        studentName: 'Emma Wilson'
      },
      {
        id: '6',
        subject: 'Homework Extension Request',
        content: 'Dear Dr. Johnson, I was sick yesterday and missed the class. Could I please have a one-day extension on the homework assignment? I will submit it by tomorrow evening.',
        sender: { name: 'Mike Johnson', role: 'STUDENT' },
        recipient: { name: 'Dr. Sarah Johnson', role: 'TEACHER' },
        timestamp: '2024-06-08T18:30:00Z',
        isRead: true,
        type: 'RECEIVED',
        priority: 'MEDIUM',
        studentName: 'Mike Johnson'
      }
    ]);

    setLoading(false);
  }, []); // Empty dependency array for initial data load

  const filteredMessages = messages.filter(message => {
    const matchesType = filterType === 'all' || 
      (filterType === 'unread' && !message.isRead) ||
      (filterType === 'sent' && message.type === 'SENT') ||
      (filterType === 'received' && message.type === 'RECEIVED');
    
    const matchesSender = filterSender === 'all' || 
      (filterSender === 'student' && message.sender.role === 'STUDENT') ||
      (filterSender === 'parent' && message.sender.role === 'PARENT') ||
      (filterSender === 'admin' && message.sender.role === 'ADMIN');
    
    return matchesType && matchesSender;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;
  const sentCount = messages.filter(m => m.type === 'SENT').length;
  const receivedCount = messages.filter(m => m.type === 'RECEIVED').length;
  const totalMessages = messages.length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = () => {
    // Mock sending message
    const message: Message = {
      id: Date.now().toString(),
      subject: newMessage.subject,
      content: newMessage.content,
      sender: { name: 'Dr. Sarah Johnson', role: 'TEACHER' },
      recipient: { name: newMessage.recipient, role: newMessage.recipientType },
      timestamp: new Date().toISOString(),
      isRead: true,
      type: 'SENT',
      priority: 'MEDIUM',
      studentName: newMessage.studentName
    };

    setMessages([message, ...messages]);
    setNewMessage({ recipient: '', recipientType: 'STUDENT', subject: '', content: '', studentName: '' });
    setShowCompose(false);
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading messages...</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <HubHeader
          title="Messages & Communication"
          subtitle="Communicate with students, parents, and school administration"
          actions={
            <>
              <HubActionButton href="/teacher/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton 
                href="#" 
                icon={Plus} 
                label="Compose Message" 
                color="blue"
                onClick={() => setShowCompose(true)}
              />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Messages"
            value={totalMessages}
            subtitle="All conversations"
            icon="message-square"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Unread Messages"
            value={unreadCount}
            subtitle="Need attention"
            icon="mail"
            color={unreadCount > 0 ? 'red' : 'green'}
          />
          <ProfessionalMetricCard
            title="Sent Messages"
            value={sentCount}
            subtitle="Your messages"
            icon="send"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Received Messages"
            value={receivedCount}
            subtitle="From students/parents"
            icon="inbox"
            color="green"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Sender</label>
              <select
                value={filterSender}
                onChange={(e) => setFilterSender(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Senders</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
                <option value="admin">Administration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Found</h3>
              <p className="text-gray-600">Try adjusting your filters or compose a new message.</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                  !message.isRead ? 'border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{message.subject}</h3>
                      {!message.isRead && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>
                        <strong>{message.type === 'SENT' ? 'To:' : 'From:'}</strong> {
                          message.type === 'SENT' ? message.recipient.name : message.sender.name
                        }
                      </span>
                      <span>
                        <strong>Role:</strong> {
                          message.type === 'SENT' ? message.recipient.role : message.sender.role
                        }
                      </span>
                      {message.studentName && (
                        <span><strong>Student:</strong> {message.studentName}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(message.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{message.content}</p>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Reply
                  </button>
                  {!message.isRead && (
                    <button
                      onClick={() => {
                        setMessages(messages.map(m =>
                          m.id === message.id ? { ...m, isRead: true } : m
                        ));
                      }}
                      className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Compose Message Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compose Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Type</label>
                  <select
                    value={newMessage.recipientType}
                    onChange={(e) => setNewMessage({...newMessage, recipientType: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="PARENT">Parent</option>
                    <option value="ADMIN">Administration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                  <select
                    value={newMessage.recipient}
                    onChange={(e) => setNewMessage({...newMessage, recipient: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select recipient...</option>
                    {newMessage.recipientType === 'STUDENT' && (
                      <>
                        <option value="Emma Wilson">Emma Wilson</option>
                        <option value="Alex Chen">Alex Chen</option>
                        <option value="Mike Johnson">Mike Johnson</option>
                      </>
                    )}
                    {newMessage.recipientType === 'PARENT' && (
                      <>
                        <option value="Sarah Wilson">Sarah Wilson (Emma&apos;s Parent)</option>
                        <option value="David Chen">David Chen (Alex&apos;s Parent)</option>
                        <option value="Lisa Johnson">Lisa Johnson (Mike&apos;s Parent)</option>
                      </>
                    )}
                    {newMessage.recipientType === 'ADMIN' && (
                      <>
                        <option value="Principal Office">Principal Office</option>
                        <option value="Finance Office">Finance Office</option>
                        <option value="Academic Office">Academic Office</option>
                      </>
                    )}
                  </select>
                </div>
                {newMessage.recipientType !== 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Regarding Student</label>
                    <input
                      type="text"
                      placeholder="Student name (if applicable)..."
                      value={newMessage.studentName}
                      onChange={(e) => setNewMessage({...newMessage, studentName: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Enter message subject..."
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Enter your message..."
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.recipient || !newMessage.subject || !newMessage.content}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
