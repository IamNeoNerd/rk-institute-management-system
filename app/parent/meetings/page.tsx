'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Calendar, Clock, Plus, Video } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  teacherName: string;
  teacherEmail: string;
  subject: string;
  childName: string;
  childId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'IN_PERSON' | 'VIRTUAL' | 'PHONE';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  location?: string;
  meetingLink?: string;
  agenda: string;
  notes?: string;
  createdAt: string;
}

interface TimeSlot {
  id: string;
  teacherName: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  available: boolean;
}

// SSR-Safe Search Params Component
function ParentMeetingsContent() {
  const searchParams = useSearchParams();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChild, setFilterChild] = useState('all');
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    teacherName: '',
    subject: '',
    childId: '',
    date: '',
    time: '',
    type: 'IN_PERSON',
    agenda: '',
    preferredDuration: 30
  });

  useEffect(() => {
    // Handle query parameters safely
    try {
      const action = searchParams?.get('action');
      const teacher = searchParams?.get('teacher');
      const child = searchParams?.get('child');

      if (action === 'schedule') setShowScheduleForm(true);
      if (teacher) setFilterTeacher(teacher);
      if (child) setFilterChild(child);
    } catch (error) {
      // Handle SSR or navigation errors gracefully
      console.warn('Search params not available:', error);
    }
  }, [searchParams]);

  useEffect(() => {
    // Mock data for scheduled meetings - separate effect to avoid infinite loop
    setMeetings([
      {
        id: '1',
        title: 'Academic Progress Discussion',
        teacherName: 'Dr. Sarah Johnson',
        teacherEmail: 'sarah.johnson@rkinstitute.com',
        subject: 'Mathematics',
        childName: 'Emma Wilson',
        childId: '1',
        date: '2024-06-20',
        time: '15:00',
        duration: 30,
        type: 'IN_PERSON',
        status: 'SCHEDULED',
        location: 'Teacher\'s Office - Room 101',
        agenda: 'Discuss Emma\'s exceptional performance in calculus and plan for advanced topics.',
        createdAt: '2024-06-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Parent-Teacher Conference',
        teacherName: 'Prof. Michael Chen',
        teacherEmail: 'michael.chen@rkinstitute.com',
        subject: 'Physics',
        childName: 'Emma Wilson',
        childId: '1',
        date: '2024-06-18',
        time: '14:00',
        duration: 45,
        type: 'VIRTUAL',
        status: 'COMPLETED',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        agenda: 'Review physics project performance and discuss upcoming lab requirements.',
        notes: 'Emma is excelling in physics. Recommended for advanced physics track next semester.',
        createdAt: '2024-06-10T14:20:00Z'
      },
      {
        id: '3',
        title: 'Academic Support Meeting',
        teacherName: 'Dr. Robert Brown',
        teacherEmail: 'robert.brown@rkinstitute.com',
        subject: 'Science',
        childName: 'Alex Wilson',
        childId: '2',
        date: '2024-06-22',
        time: '16:30',
        duration: 30,
        type: 'PHONE',
        status: 'SCHEDULED',
        agenda: 'Discuss Alex\'s improvement in science and strategies for continued progress.',
        createdAt: '2024-06-12T11:15:00Z'
      },
      {
        id: '4',
        title: 'Quarterly Review Meeting',
        teacherName: 'Ms. Lisa Davis',
        teacherEmail: 'lisa.davis@rkinstitute.com',
        subject: 'English',
        childName: 'Alex Wilson',
        childId: '2',
        date: '2024-06-15',
        time: '13:00',
        duration: 30,
        type: 'IN_PERSON',
        status: 'COMPLETED',
        location: 'English Department - Room 305',
        agenda: 'Review Alex\'s writing progress and discuss summer reading recommendations.',
        notes: 'Alex has shown significant improvement in creative writing. Recommended additional reading materials.',
        createdAt: '2024-06-08T18:30:00Z'
      },
      {
        id: '5',
        title: 'Mid-term Performance Review',
        teacherName: 'Dr. Sarah Johnson',
        teacherEmail: 'sarah.johnson@rkinstitute.com',
        subject: 'Mathematics',
        childName: 'Alex Wilson',
        childId: '2',
        date: '2024-06-25',
        time: '10:00',
        duration: 30,
        type: 'VIRTUAL',
        status: 'SCHEDULED',
        meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
        agenda: 'Discuss Alex\'s mathematics performance and plan for improvement strategies.',
        createdAt: '2024-06-14T09:00:00Z'
      }
    ]);

    // Mock available time slots
    setAvailableSlots([
      {
        id: '1',
        teacherName: 'Dr. Sarah Johnson',
        subject: 'Mathematics',
        date: '2024-06-21',
        time: '14:00',
        duration: 30,
        available: true
      },
      {
        id: '2',
        teacherName: 'Dr. Sarah Johnson',
        subject: 'Mathematics',
        date: '2024-06-21',
        time: '15:30',
        duration: 30,
        available: true
      },
      {
        id: '3',
        teacherName: 'Prof. Michael Chen',
        subject: 'Physics',
        date: '2024-06-22',
        time: '13:00',
        duration: 45,
        available: true
      },
      {
        id: '4',
        teacherName: 'Dr. Robert Brown',
        subject: 'Science',
        date: '2024-06-23',
        time: '15:00',
        duration: 30,
        available: true
      },
      {
        id: '5',
        teacherName: 'Ms. Lisa Davis',
        subject: 'English',
        date: '2024-06-24',
        time: '14:30',
        duration: 30,
        available: true
      }
    ]);

    setLoading(false);
  }, []); // Empty dependency array for initial data load

  const filteredMeetings = meetings.filter(meeting => {
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    const matchesChild = filterChild === 'all' || meeting.childId === filterChild;
    const matchesTeacher = filterTeacher === 'all' || meeting.teacherName === filterTeacher;
    return matchesStatus && matchesChild && matchesTeacher;
  });

  const uniqueChildren = Array.from(new Set(meetings.map(m => ({ id: m.childId, name: m.childName }))));
  const uniqueTeachers = Array.from(new Set(meetings.map(m => m.teacherName)));
  
  const totalMeetings = meetings.length;
  const scheduledMeetings = meetings.filter(m => m.status === 'SCHEDULED').length;
  const completedMeetings = meetings.filter(m => m.status === 'COMPLETED').length;
  const upcomingMeetings = meetings.filter(m => 
    m.status === 'SCHEDULED' && new Date(`${m.date}T${m.time}`) > new Date()
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'text-blue-600 bg-blue-100';
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      case 'RESCHEDULED':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIRTUAL':
        return '💻';
      case 'PHONE':
        return '📞';
      case 'IN_PERSON':
        return '🏢';
      default:
        return '📅';
    }
  };

  const handleScheduleMeeting = () => {
    // Mock meeting scheduling
    const meeting: Meeting = {
      id: Date.now().toString(),
      title: 'Parent-Teacher Conference',
      teacherName: newMeeting.teacherName,
      teacherEmail: `${newMeeting.teacherName.toLowerCase().replace(' ', '.')}@rkinstitute.com`,
      subject: newMeeting.subject,
      childName: uniqueChildren.find(c => c.id === newMeeting.childId)?.name || '',
      childId: newMeeting.childId,
      date: newMeeting.date,
      time: newMeeting.time,
      duration: newMeeting.preferredDuration,
      type: newMeeting.type as any,
      status: 'SCHEDULED',
      location: newMeeting.type === 'IN_PERSON' ? 'Teacher\'s Office' : undefined,
      meetingLink: newMeeting.type === 'VIRTUAL' ? 'https://meet.google.com/new-meeting' : undefined,
      agenda: newMeeting.agenda,
      createdAt: new Date().toISOString()
    };

    setMeetings([meeting, ...meetings]);
    setNewMeeting({
      teacherName: '',
      subject: '',
      childId: '',
      date: '',
      time: '',
      type: 'IN_PERSON',
      agenda: '',
      preferredDuration: 30
    });
    setShowScheduleForm(false);
  };

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading meetings...</div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Parent-Teacher Meetings"
          subtitle="Schedule, manage, and track parent-teacher conferences and meetings"
          actions={
            <>
              <HubActionButton href="/parent/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton 
                href="#" 
                icon={Plus} 
                label="Schedule Meeting" 
                color="blue"
                onClick={() => setShowScheduleForm(true)}
              />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Meetings"
            value={totalMeetings}
            subtitle="All meetings"
            icon="calendar"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Scheduled"
            value={scheduledMeetings}
            subtitle="Upcoming meetings"
            icon="clock"
            color="orange"
          />
          <ProfessionalMetricCard
            title="Completed"
            value={completedMeetings}
            subtitle="Past meetings"
            icon="check-circle"
            color="green"
          />
          <ProfessionalMetricCard
            title="This Week"
            value={upcomingMeetings}
            subtitle="Next 7 days"
            icon="calendar-days"
            color="purple"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RESCHEDULED">Rescheduled</option>
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
                {uniqueChildren.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Teacher</label>
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Teachers</option>
                {uniqueTeachers.map(teacher => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Meetings Found</h3>
              <p className="text-gray-600">Try adjusting your filters or schedule a new meeting.</p>
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(meeting.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="space-y-1">
                        <p><strong>Teacher:</strong> {meeting.teacherName}</p>
                        <p><strong>Subject:</strong> {meeting.subject}</p>
                        <p><strong>Child:</strong> {meeting.childName}</p>
                      </div>
                      <div className="space-y-1">
                        <p><strong>Date:</strong> {new Date(meeting.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {meeting.time}</p>
                        <p><strong>Duration:</strong> {meeting.duration} minutes</p>
                      </div>
                    </div>
                    {meeting.location && (
                      <p className="text-sm text-gray-600 mb-2"><strong>Location:</strong> {meeting.location}</p>
                    )}
                    {meeting.meetingLink && (
                      <p className="text-sm text-blue-600 mb-2">
                        <strong>Meeting Link:</strong>
                        <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="ml-1 hover:underline">
                          Join Virtual Meeting
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    {meeting.status === 'SCHEDULED' && (
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Reschedule
                        </button>
                        <button className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Cancel
                        </button>
                      </div>
                    )}
                    {meeting.type === 'VIRTUAL' && meeting.status === 'SCHEDULED' && (
                      <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1">
                        <Video className="w-3 h-3" />
                        <span>Join</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Meeting Agenda</h4>
                  <p className="text-gray-700 text-sm">{meeting.agenda}</p>
                </div>

                {meeting.notes && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Meeting Notes</h4>
                    <p className="text-blue-800 text-sm">{meeting.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Schedule Meeting Modal */}
        {showScheduleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Parent-Teacher Meeting</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                    <select
                      value={newMeeting.teacherName}
                      onChange={(e) => setNewMeeting({...newMeeting, teacherName: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select teacher...</option>
                      <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                      <option value="Prof. Michael Chen">Prof. Michael Chen</option>
                      <option value="Dr. Robert Brown">Dr. Robert Brown</option>
                      <option value="Ms. Lisa Davis">Ms. Lisa Davis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      value={newMeeting.subject}
                      onChange={(e) => setNewMeeting({...newMeeting, subject: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select subject...</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Child</label>
                  <select
                    value={newMeeting.childId}
                    onChange={(e) => setNewMeeting({...newMeeting, childId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select child...</option>
                    {uniqueChildren.map(child => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                    <input
                      type="date"
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                    <input
                      type="time"
                      value={newMeeting.time}
                      onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type</label>
                    <select
                      value={newMeeting.type}
                      onChange={(e) => setNewMeeting({...newMeeting, type: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="IN_PERSON">In-Person</option>
                      <option value="VIRTUAL">Virtual Meeting</option>
                      <option value="PHONE">Phone Call</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <select
                      value={newMeeting.preferredDuration}
                      onChange={(e) => setNewMeeting({...newMeeting, preferredDuration: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Agenda</label>
                  <textarea
                    rows={3}
                    placeholder="Please describe what you'd like to discuss in this meeting..."
                    value={newMeeting.agenda}
                    onChange={(e) => setNewMeeting({...newMeeting, agenda: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Meeting Information</h4>
                  <p className="text-blue-800 text-sm">
                    Your meeting request will be sent to the teacher for confirmation. You will receive an email notification once the meeting is confirmed or if any changes are needed.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleMeeting}
                  disabled={!newMeeting.teacherName || !newMeeting.childId || !newMeeting.date || !newMeeting.time || !newMeeting.agenda}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}

// Main component with Suspense wrapper for SSR safety
export default function ParentMeetings() {
  return (
    <Suspense fallback={
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading meetings...</div>
        </div>
      </ParentLayout>
    }>
      <ParentMeetingsContent />
    </Suspense>
  );
}
