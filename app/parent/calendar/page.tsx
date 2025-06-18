'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Calendar, Clock, Filter } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'ACADEMIC' | 'EXAM' | 'HOLIDAY' | 'MEETING' | 'EVENT' | 'DEADLINE';
  location?: string;
  childName?: string;
  childId?: string;
  isAllDay: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export default function ParentCalendar() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('all');
  const [filterChild, setFilterChild] = useState('all');
  const [viewMode, setViewMode] = useState('month');

  useEffect(() => {
    // Handle query parameters
    const date = searchParams.get('date');
    const type = searchParams.get('type');
    const view = searchParams.get('view');
    
    if (date) setSelectedDate(date);
    if (type) setFilterType(type);
    if (view) setViewMode(view);

    // Mock data for calendar events
    setEvents([
      {
        id: '1',
        title: 'Parent-Teacher Conference',
        description: 'Scheduled meeting with Dr. Sarah Johnson to discuss Emma\'s academic progress in Mathematics.',
        date: '2024-06-20',
        startTime: '15:00',
        endTime: '15:30',
        type: 'MEETING',
        location: 'Teacher\'s Office - Room 101',
        childName: 'Emma Wilson',
        childId: '1',
        isAllDay: false,
        priority: 'HIGH',
        status: 'UPCOMING'
      },
      {
        id: '2',
        title: 'Mathematics Mid-term Exam',
        description: 'Mid-term examination for Advanced Mathematics course.',
        date: '2024-06-22',
        startTime: '09:00',
        endTime: '11:00',
        type: 'EXAM',
        location: 'Examination Hall A',
        childName: 'Emma Wilson',
        childId: '1',
        isAllDay: false,
        priority: 'HIGH',
        status: 'UPCOMING'
      },
      {
        id: '3',
        title: 'Science Fair',
        description: 'Annual science fair where students present their research projects.',
        date: '2024-06-25',
        startTime: '10:00',
        endTime: '16:00',
        type: 'EVENT',
        location: 'School Auditorium',
        isAllDay: false,
        priority: 'MEDIUM',
        status: 'UPCOMING'
      },
      {
        id: '4',
        title: 'Fee Payment Deadline',
        description: 'Last date for June 2024 fee payment without late charges.',
        date: '2024-06-30',
        startTime: '23:59',
        endTime: '23:59',
        type: 'DEADLINE',
        isAllDay: true,
        priority: 'HIGH',
        status: 'UPCOMING'
      },
      {
        id: '5',
        title: 'Summer Holiday Begins',
        description: 'Start of summer vacation for all students.',
        date: '2024-07-01',
        startTime: '00:00',
        endTime: '23:59',
        type: 'HOLIDAY',
        isAllDay: true,
        priority: 'LOW',
        status: 'UPCOMING'
      },
      {
        id: '6',
        title: 'Physics Project Submission',
        description: 'Final submission deadline for renewable energy research project.',
        date: '2024-06-24',
        startTime: '23:59',
        endTime: '23:59',
        type: 'DEADLINE',
        childName: 'Emma Wilson',
        childId: '1',
        isAllDay: true,
        priority: 'HIGH',
        status: 'UPCOMING'
      },
      {
        id: '7',
        title: 'English Literature Quiz',
        description: 'Weekly quiz on contemporary literature topics.',
        date: '2024-06-21',
        startTime: '14:00',
        endTime: '15:00',
        type: 'EXAM',
        location: 'Classroom 305',
        childName: 'Alex Wilson',
        childId: '2',
        isAllDay: false,
        priority: 'MEDIUM',
        status: 'UPCOMING'
      },
      {
        id: '8',
        title: 'Sports Day',
        description: 'Annual sports day with various athletic competitions and events.',
        date: '2024-06-28',
        startTime: '08:00',
        endTime: '17:00',
        type: 'EVENT',
        location: 'School Sports Ground',
        isAllDay: false,
        priority: 'MEDIUM',
        status: 'UPCOMING'
      }
    ]);

    setLoading(false);
  }, [searchParams]);

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesChild = filterChild === 'all' || 
      (filterChild === '1' && event.childName?.includes('Emma')) ||
      (filterChild === '2' && event.childName?.includes('Alex')) ||
      (!event.childName && filterChild === 'general');
    return matchesType && matchesChild;
  });

  const todayEvents = events.filter(event => event.date === new Date().toISOString().split('T')[0]);
  const upcomingEvents = events.filter(event => 
    new Date(event.date) > new Date() && event.status === 'UPCOMING'
  ).slice(0, 5);
  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= weekFromNow;
  });

  const totalEvents = events.length;
  const highPriorityEvents = events.filter(e => e.priority === 'HIGH' && e.status === 'UPCOMING').length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EXAM':
        return 'bg-red-100 text-red-800';
      case 'MEETING':
        return 'bg-blue-100 text-blue-800';
      case 'EVENT':
        return 'bg-green-100 text-green-800';
      case 'DEADLINE':
        return 'bg-orange-100 text-orange-800';
      case 'HOLIDAY':
        return 'bg-purple-100 text-purple-800';
      case 'ACADEMIC':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-red-500';
      case 'MEDIUM':
        return 'border-l-yellow-500';
      case 'LOW':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EXAM':
        return '📝';
      case 'MEETING':
        return '👥';
      case 'EVENT':
        return '🎉';
      case 'DEADLINE':
        return '⏰';
      case 'HOLIDAY':
        return '🏖️';
      case 'ACADEMIC':
        return '📚';
      default:
        return '📅';
    }
  };

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading calendar...</div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-8">
        <HubHeader
          title="School Events Calendar"
          subtitle="Stay updated with school events, exams, meetings, and important dates"
          actions={
            <>
              <HubActionButton href="/parent/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="/parent/meetings?action=schedule" icon={Calendar} label="Schedule Meeting" color="blue" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Events"
            value={totalEvents}
            subtitle="All calendar events"
            icon="calendar"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Today's Events"
            value={todayEvents.length}
            subtitle="Scheduled for today"
            icon="clock"
            color="green"
          />
          <ProfessionalMetricCard
            title="This Week"
            value={thisWeekEvents.length}
            subtitle="Next 7 days"
            icon="calendar-days"
            color="purple"
          />
          <ProfessionalMetricCard
            title="High Priority"
            value={highPriorityEvents}
            subtitle="Important events"
            icon="alert-triangle"
            color="red"
          />
        </div>

        {/* View Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Calendar View</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Month View
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Week View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                List View
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="EXAM">Exams</option>
                <option value="MEETING">Meetings</option>
                <option value="EVENT">Events</option>
                <option value="DEADLINE">Deadlines</option>
                <option value="HOLIDAY">Holidays</option>
                <option value="ACADEMIC">Academic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Child</label>
              <select
                value={filterChild}
                onChange={(e) => setFilterChild(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="1">Emma Wilson</option>
                <option value="2">Alex Wilson</option>
                <option value="general">General Events</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {viewMode === 'list' ? 'All Events' : 'Upcoming Events'}
            </h3>
            <span className="text-sm text-gray-500">
              {filteredEvents.length} events found
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more events.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(event.priority)}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getTypeIcon(event.type)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        {event.priority === 'HIGH' && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            High Priority
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="space-y-1">
                          <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                          {!event.isAllDay && (
                            <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
                          )}
                          {event.location && (
                            <p><strong>Location:</strong> {event.location}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          {event.childName && (
                            <p><strong>Student:</strong> {event.childName}</p>
                          )}
                          <p><strong>Status:</strong> {event.status}</p>
                          {event.isAllDay && (
                            <p><strong>Duration:</strong> All Day</p>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{event.description}</p>
                    </div>
                    <div className="ml-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        {!event.isAllDay && (
                          <div className="text-xs text-gray-500">{event.startTime}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Event Actions */}
                  <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                    {event.type === 'MEETING' && (
                      <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        View Details
                      </button>
                    )}
                    {event.type === 'DEADLINE' && event.status === 'UPCOMING' && (
                      <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Take Action
                      </button>
                    )}
                    <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      Add to Calendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-gray-900">Schedule Meeting</div>
              <div className="text-sm text-gray-600">Book parent-teacher conference</div>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
              <div className="text-2xl mb-2">💳</div>
              <div className="font-medium text-gray-900">Pay Fees</div>
              <div className="text-sm text-gray-600">Make fee payments</div>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900">View Reports</div>
              <div className="text-sm text-gray-600">Academic progress reports</div>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
              <div className="text-2xl mb-2">📧</div>
              <div className="font-medium text-gray-900">Send Message</div>
              <div className="text-sm text-gray-600">Contact teachers</div>
            </button>
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}
