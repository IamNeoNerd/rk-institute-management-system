'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ScheduleEvent {
  id: string;
  title: string;
  subject: string;
  grade: string;
  time: string;
  duration: string;
  room: string;
  students: number;
  type: 'class' | 'meeting' | 'exam' | 'break';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  description?: string;
}

export default function TeacherSchedule() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [showEventForm, setShowEventForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'TEACHER') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  useEffect(() => {
    // Handle query parameters
    const date = searchParams.get('date');
    const view = searchParams.get('view');
    const action = searchParams.get('action');
    
    if (date) setSelectedDate(date);
    if (view) setViewMode(view as 'day' | 'week');
    if (action === 'add') setShowEventForm(true);
  }, [searchParams]);

  useEffect(() => {
    // Mock data for teacher's schedule - separate effect to avoid infinite loop
    setEvents([
      {
        id: '1',
        title: 'Mathematics Class',
        subject: 'Mathematics',
        grade: 'Grade 10',
        time: '09:00',
        duration: '45 min',
        room: 'Room 101',
        students: 28,
        type: 'class',
        status: 'scheduled',
        description: 'Algebra and Functions'
      },
      {
        id: '2',
        title: 'Physics Lab',
        subject: 'Physics',
        grade: 'Grade 11',
        time: '10:30',
        duration: '90 min',
        room: 'Lab 201',
        students: 24,
        type: 'class',
        status: 'scheduled',
        description: 'Electromagnetic Induction Experiments'
      },
      {
        id: '3',
        title: 'Parent Meeting',
        subject: 'General',
        grade: 'Grade 10',
        time: '14:00',
        duration: '30 min',
        room: 'Office 105',
        students: 1,
        type: 'meeting',
        status: 'scheduled',
        description: 'Discussion about student progress'
      },
      {
        id: '4',
        title: 'Mathematics Test',
        subject: 'Mathematics',
        grade: 'Grade 12',
        time: '15:30',
        duration: '60 min',
        room: 'Room 103',
        students: 32,
        type: 'exam',
        status: 'scheduled',
        description: 'Calculus and Derivatives'
      }
    ]);

    setLoading(false);
  }, []); // Empty dependency array for initial data load

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting': return 'bg-green-100 text-green-800 border-green-200';
      case 'exam': return 'bg-red-100 text-red-800 border-red-200';
      case 'break': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/teacher/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
              <span className="ml-4 px-3 py-1 bg-gradient-to-r from-teal-100 to-blue-100 text-teal-800 text-sm font-medium rounded-full">
                📅 Teaching Schedule
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="font-semibold text-gray-900">{user?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Day View
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Week View
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowEventForm(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Schedule Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            
            {events.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
                <p className="text-gray-600 mb-4">You have a free day! Add events to your schedule.</p>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add First Event
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Time:</span> {event.time} ({event.duration})
                          </div>
                          <div>
                            <span className="font-medium">Subject:</span> {event.subject}
                          </div>
                          <div>
                            <span className="font-medium">Room:</span> {event.room}
                          </div>
                          <div>
                            <span className="font-medium">Students:</span> {event.students}
                          </div>
                        </div>
                        {event.description && (
                          <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
