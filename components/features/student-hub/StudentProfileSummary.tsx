'use client';

import { StudentProfile } from '@/hooks/student/useStudentDashboardData';
import { Calendar, Mail, Phone, User, GraduationCap } from 'lucide-react';

interface StudentProfileSummaryProps {
  profile: StudentProfile | null;
  loading?: boolean;
}

export default function StudentProfileSummary({ profile, loading }: StudentProfileSummaryProps) {
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-xl h-48"></div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 animate-slide-up">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{profile.name}</h3>
            <p className="text-lg text-gray-600">{profile.grade}</p>
            <p className="text-sm text-gray-500">Student ID: {profile.studentId}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Active Student
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Personal Information
          </h4>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-sm">
                Born: {new Date(profile.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <GraduationCap className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-sm">
                Enrolled: {new Date(profile.enrollmentDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-green-600" />
            Family Contact
          </h4>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <User className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-sm">{profile.family.name}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-sm">{profile.family.email}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-sm">{profile.family.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {profile.grade}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Regular Student
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Academic Year 2024-25
          </span>
        </div>
      </div>
    </div>
  );
}
