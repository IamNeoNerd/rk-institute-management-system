'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StudentLayout from '@/components/layout/StudentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Calendar, Clock, Plus } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  type: 'CLASS' | 'EXAM' | 'ASSIGNMENT' | 'STUDY_SESSION';
  startTime: string;
  endTime: string;
  date: string;
  location: string;
  description?: string;
}

export default function StudentSchedule() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Handle query parameters
    const date = searchParams.get('date');
    const view = searchParams.get('view');

    if (date) {
      setSelectedDate(date);
    }
  }, [searchParams]);

  useEffect(() => {
    // Mock data for student's schedule - separate effect to avoid infinite loop
    setEvents([
      {
        id: '1',
        title: 'Advanced Mathematics',
        subject: 'Mathematics',
        teacher: 'Dr. Sarah Johnson',
        type: 'CLASS',
        startTime: '09:00',
        endTime: '10:30',
        date: '2024-06-17',
        location: 'Room 101',
        description: 'Differential Calculus - Chapter 5'
      },
      {
        id: '2',
        title: 'Physics Lab',
        subject: 'Physics',
        teacher: 'Prof. Michael Chen',
        type: 'CLASS',
        startTime: '11:00',
        endTime: '12:30',
        date: '2024-06-17',
        location: 'Physics Lab A',
        description: 'Thermodynamics Experiment'
      },
      {
        id: '3',
        title: 'English Literature Essay',
        subject: 'English Literature',
        teacher: 'System Administrator',
        type: 'ASSIGNMENT',
        startTime: '14:00',
        endTime: '15:00',
        date: '2024-06-17',
        location: 'Library',
        description: 'Due: Contemporary Literature Analysis'
      },
      {
        id: '4',
        title: 'Mathematics Mid-term',
        subject: 'Mathematics',
        teacher: 'Dr. Sarah Johnson',
        type: 'EXAM',
        startTime: '10:00',
        endTime: '12:00',
        date: '2024-06-18',
        location: 'Exam Hall B',
        description: 'Calculus and Statistics'
      },
      {
        id: '5',
        title: 'Study Group - Physics',
        subject: 'Physics',
        teacher: 'Student Group',
        type: 'STUDY_SESSION',
        startTime: '16:00',
        endTime: '17:30',
        date: '2024-06-18',
        location: 'Study Room 3',
        description: 'Group study for upcoming physics test'
      }
    ]);

    setLoading(false);
  }, []); // Empty dependency array for initial data load

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'CLASS':
        return '📚';
      case 'EXAM':
        return '📝';
      case 'ASSIGNMENT':
        return '📋';
      case 'STUDY_SESSION':
        return '👥';
      default:
        return '📅';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'CLASS':
        return 'bg-blue-100 text-blue-800';
      case 'EXAM':
        return 'bg-red-100 text-red-800';
      case 'ASSIGNMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'STUDY_SESSION':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = events.filter(event => event.date === selectedDate);
  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).slice(0, 5);
  const todayEvents = events.filter(event => event.date === new Date().toISOString().split('T')[0]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading schedule...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        <HubHeader
          title="My Schedule"
          subtitle="View your class schedule, exams, and study sessions"
          actions={
            <>
              <HubActionButton href="/student/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="#" icon={Plus} label="Book Study Session" color="blue" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Today's Events"
            value={todayEvents.length}
            subtitle="Scheduled for today"
            icon="calendar"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Upcoming Events"
            value={upcomingEvents.length}
            subtitle="Next 7 days"
            icon="clock"
            color="green"
          />
          <ProfessionalMetricCard
            title="Study Sessions"
            value={events.filter(e => e.type === 'STUDY_SESSION').length}
            subtitle="This week"
            icon="users"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Exams Scheduled"
            value={events.filter(e => e.type === 'EXAM').length}
            subtitle="This month"
            icon="file-text"
            color="red"
          />
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📅 Select Date</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Schedule for Selected Date */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Schedule for {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Events Scheduled</h4>
              <p className="text-gray-600">You have no events scheduled for this date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                          <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.type)}`}>
                            {event.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
                            <p><strong>Subject:</strong> {event.subject}</p>
                          </div>
                          <div className="space-y-1">
                            <p><strong>Teacher:</strong> {event.teacher}</p>
                            <p><strong>Location:</strong> {event.location}</p>
                          </div>
                        </div>
                        {event.description && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{event.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}