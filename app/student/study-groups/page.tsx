'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Users, Plus, Calendar } from 'lucide-react';

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  members: {
    id: string;
    name: string;
    role: 'LEADER' | 'MEMBER';
  }[];
  schedule: {
    day: string;
    time: string;
    location: string;
  };
  nextSession: string;
  isJoined: boolean;
  maxMembers: number;
  createdBy: string;
}

export default function StudentStudyGroups() {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Mock data for study groups
    setStudyGroups([
      {
        id: '1',
        name: 'Physics Masters',
        subject: 'Physics',
        description: 'Advanced physics study group focusing on thermodynamics and quantum mechanics',
        members: [
          { id: '1', name: 'Alex Chen', role: 'LEADER' },
          { id: '2', name: 'Emma Wilson', role: 'MEMBER' },
          { id: '3', name: 'Sarah Kim', role: 'MEMBER' },
          { id: '4', name: 'Mike Johnson', role: 'MEMBER' }
        ],
        schedule: {
          day: 'Friday',
          time: '4:00 PM - 6:00 PM',
          location: 'Study Room 3'
        },
        nextSession: '2024-06-21T16:00:00Z',
        isJoined: true,
        maxMembers: 6,
        createdBy: 'Alex Chen'
      },
      {
        id: '2',
        name: 'Calculus Crew',
        subject: 'Mathematics',
        description: 'Mathematics study group for calculus and advanced algebra problem solving',
        members: [
          { id: '5', name: 'David Park', role: 'LEADER' },
          { id: '6', name: 'Lisa Wang', role: 'MEMBER' },
          { id: '7', name: 'Tom Brown', role: 'MEMBER' }
        ],
        schedule: {
          day: 'Wednesday',
          time: '3:00 PM - 5:00 PM',
          location: 'Library Study Hall'
        },
        nextSession: '2024-06-19T15:00:00Z',
        isJoined: false,
        maxMembers: 8,
        createdBy: 'David Park'
      },
      {
        id: '3',
        name: 'Literature Circle',
        subject: 'English Literature',
        description: 'Discussing contemporary literature and improving essay writing skills',
        members: [
          { id: '8', name: 'Anna Smith', role: 'LEADER' },
          { id: '9', name: 'James Wilson', role: 'MEMBER' },
          { id: '10', name: 'Maria Garcia', role: 'MEMBER' },
          { id: '11', name: 'Chris Lee', role: 'MEMBER' },
          { id: '12', name: 'Emma Wilson', role: 'MEMBER' }
        ],
        schedule: {
          day: 'Tuesday',
          time: '2:00 PM - 4:00 PM',
          location: 'English Department Lounge'
        },
        nextSession: '2024-06-18T14:00:00Z',
        isJoined: true,
        maxMembers: 10,
        createdBy: 'Anna Smith'
      },
      {
        id: '4',
        name: 'Chemistry Lab Partners',
        subject: 'Chemistry',
        description: 'Collaborative chemistry study sessions and lab report discussions',
        members: [
          { id: '13', name: 'Kevin Zhang', role: 'LEADER' },
          { id: '14', name: 'Sophie Miller', role: 'MEMBER' }
        ],
        schedule: {
          day: 'Thursday',
          time: '5:00 PM - 7:00 PM',
          location: 'Chemistry Lab B'
        },
        nextSession: '2024-06-20T17:00:00Z',
        isJoined: false,
        maxMembers: 5,
        createdBy: 'Kevin Zhang'
      }
    ]);

    setLoading(false);
  }, []);

  const filteredGroups = studyGroups.filter(group => {
    if (filterSubject === 'all') return true;
    return group.subject === filterSubject;
  });

  const joinedGroups = studyGroups.filter(g => g.isJoined);
  const availableGroups = studyGroups.filter(g => !g.isJoined && g.members.length < g.maxMembers);
  const uniqueSubjects = Array.from(new Set(studyGroups.map(g => g.subject)));

  const handleJoinGroup = (groupId: string) => {
    setStudyGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? {
              ...group,
              isJoined: true,
              members: [...group.members, { id: 'current-user', name: 'Emma Wilson', role: 'MEMBER' }]
            }
          : group
      )
    );
  };

  const handleLeaveGroup = (groupId: string) => {
    setStudyGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? {
              ...group,
              isJoined: false,
              members: group.members.filter(member => member.name !== 'Emma Wilson')
            }
          : group
      )
    );
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading study groups...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Study Groups"
          subtitle="Join study groups, collaborate with classmates, and enhance your learning"
          actions={
            <>
              <HubActionButton href="/student/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton
                href="#"
                icon={Plus}
                label="Create Group"
                color="blue"
                onClick={() => setShowCreateForm(true)}
              />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Joined Groups"
            value={joinedGroups.length}
            subtitle="Active memberships"
            icon="users"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Available Groups"
            value={availableGroups.length}
            subtitle="Open for joining"
            icon="user-plus"
            color="green"
          />
          <ProfessionalMetricCard
            title="Total Groups"
            value={studyGroups.length}
            subtitle="All study groups"
            icon="users"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Subjects Covered"
            value={uniqueSubjects.length}
            subtitle="Different subjects"
            icon="book-open"
            color="orange"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filter by Subject</h3>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Study Groups List */}
        <div className="space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Study Groups Found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new study group.</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      {group.isJoined && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Joined
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {group.subject}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{group.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        <p><strong>Schedule:</strong> {group.schedule.day}, {group.schedule.time}</p>
                        <p><strong>Location:</strong> {group.schedule.location}</p>
                      </div>
                      <div className="space-y-1">
                        <p><strong>Members:</strong> {group.members.length}/{group.maxMembers}</p>
                        <p><strong>Next Session:</strong> {new Date(group.nextSession).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {group.isJoined ? (
                      <button
                        onClick={() => handleLeaveGroup(group.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Leave Group
                      </button>
                    ) : group.members.length < group.maxMembers ? (
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Join Group
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg">
                        Full
                      </span>
                    )}
                  </div>
                </div>

                {/* Members List */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Members:</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.members.map((member) => (
                      <span
                        key={member.id}
                        className={`px-2 py-1 text-xs rounded-full ${
                          member.role === 'LEADER'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.name} {member.role === 'LEADER' && '👑'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
}