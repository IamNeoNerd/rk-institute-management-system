'use client';

import { useState, useEffect } from 'react';
import ParentLayout from '@/components/layout/ParentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, MessageSquare, Send, Plus } from 'lucide-react';

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
  childName?: string;
}

export default function ParentMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterChild, setFilterChild] = useState('all');
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: '',
    childName: ''
  });

  useEffect(() => {
    // Mock data for parent's messages
    setMessages([
      {
        id: '1',
        subject: 'Emma\'s Outstanding Performance in Mathematics',
        content: 'I wanted to share some wonderful news about Emma\'s performance in Advanced Mathematics. She has consistently scored above 95% in all assessments and shows exceptional problem-solving skills.',
        sender: { name: 'Dr. Sarah Johnson', role: 'TEACHER' },
        recipient: { name: 'Sarah Wilson', role: 'PARENT' },
        timestamp: '2024-06-15T10:30:00Z',
        isRead: false,
        type: 'RECEIVED',
        priority: 'MEDIUM',
        childName: 'Emma Wilson'
      },
      {
        id: '2',
        subject: 'Parent-Teacher Conference Request',
        content: 'I would like to schedule a parent-teacher conference to discuss Alex\'s progress in Science. He has shown significant improvement and I\'d like to share some strategies to continue this positive trend.',
        sender: { name: 'Dr. Robert Brown', role: 'TEACHER' },
        recipient: { name: 'Sarah Wilson', role: 'PARENT' },
        timestamp: '2024-06-14T14:20:00Z',
        isRead: true,
        type: 'RECEIVED',
        priority: 'HIGH',
        childName: 'Alex Wilson'
      },
      {
        id: '3',
        subject: 'Question about Emma\'s Physics Project',
        content: 'Hello Prof. Chen, I wanted to ask about the requirements for Emma\'s upcoming physics project. Could you please clarify the submission deadline and format requirements?',
        sender: { name: 'Sarah Wilson', role: 'PARENT' },
        recipient: { name: 'Prof. Michael Chen', role: 'TEACHER' },
        timestamp: '2024-06-13T16:45:00Z',
        isRead: true,
        type: 'SENT',
        priority: 'LOW',
        childName: 'Emma Wilson'
      },
      {
        id: '4',
        subject: 'Alex\'s Improvement in English Writing',
        content: 'I\'m pleased to inform you that Alex has shown remarkable improvement in his English writing skills. His latest essay demonstrated sophisticated analysis and excellent expression of ideas.',
        sender: { name: 'Ms. Lisa Davis', role: 'TEACHER' },
        recipient: { name: 'Sarah Wilson', role: 'PARENT' },
        timestamp: '2024-06-12T11:15:00Z',
        isRead: true,
        type: 'RECEIVED',
        priority: 'MEDIUM',
        childName: 'Alex Wilson'
      },
      {
        id: '5',
        subject: 'Fee Payment Confirmation',
        content: 'This is to confirm that the fee payments for both Emma and Alex for June 2024 have been successfully processed. Thank you for your prompt payment.',
        sender: { name: 'Finance Office', role: 'ADMIN' },
        recipient: { name: 'Sarah Wilson', role: 'PARENT' },
        timestamp: '2024-06-10T09:00:00Z',
        isRead: true,
        type: 'RECEIVED',
        priority: 'LOW'
      },
      {
        id: '6',
        subject: 'Thank you for the conference',
        content: 'Thank you for taking the time to meet with me yesterday to discuss Emma\'s academic progress. The strategies you suggested are very helpful and we will implement them at home.',
        sender: { name: 'Sarah Wilson', role: 'PARENT' },
        recipient: { name: 'Dr. Sarah Johnson', role: 'TEACHER' },
        timestamp: '2024-06-08T18:30:00Z',
        isRead: true,
        type: 'SENT',
        priority: 'LOW',
        childName: 'Emma Wilson'
      }
    ]);

    setLoading(false);
  }, []);

  const filteredMessages = messages.filter(message => {
    const matchesType = filterType === 'all' ||
      (filterType === 'unread' && !message.isRead) ||
      (filterType === 'sent' && message.type === 'SENT') ||
      (filterType === 'received' && message.type === 'RECEIVED');

    const matchesChild = filterChild === 'all' || message.childName?.includes(filterChild);

    return matchesType && matchesChild;
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
      sender: { name: 'Sarah Wilson', role: 'PARENT' },
      recipient: { name: newMessage.recipient, role: 'TEACHER' },
      timestamp: new Date().toISOString(),
      isRead: true,
      type: 'SENT',
      priority: 'MEDIUM',
      childName: newMessage.childName
    };

    setMessages([message, ...messages]);
    setNewMessage({ recipient: '', subject: '', content: '', childName: '' });
    setShowCompose(false);
  };

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading messages...</div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Messages & Communication"
          subtitle="Communicate with teachers and school administration about your children"
          actions={
            <>
              <HubActionButton href="/parent/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
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
            subtitle="From teachers"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Child</label>
              <select
                value={filterChild}
                onChange={(e) => setFilterChild(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Children</option>
                <option value="Emma">Emma Wilson</option>
                <option value="Alex">Alex Wilson</option>
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
                      {message.childName && (
                        <span><strong>Regarding:</strong> {message.childName}</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient (Teacher)</label>
                  <select
                    value={newMessage.recipient}
                    onChange={(e) => setNewMessage({...newMessage, recipient: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a teacher...</option>
                    <option value="Dr. Sarah Johnson">Dr. Sarah Johnson (Mathematics)</option>
                    <option value="Prof. Michael Chen">Prof. Michael Chen (Physics)</option>
                    <option value="Ms. Lisa Davis">Ms. Lisa Davis (English)</option>
                    <option value="Dr. Robert Brown">Dr. Robert Brown (Science)</option>
                    <option value="Finance Office">Finance Office (Administration)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Regarding Child</label>
                  <select
                    value={newMessage.childName}
                    onChange={(e) => setNewMessage({...newMessage, childName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a child...</option>
                    <option value="Emma Wilson">Emma Wilson</option>
                    <option value="Alex Wilson">Alex Wilson</option>
                    <option value="">General Inquiry</option>
                  </select>
                </div>
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
    </ParentLayout>
  );
}