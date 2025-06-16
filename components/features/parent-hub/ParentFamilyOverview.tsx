'use client';

import { FamilyProfile } from '@/hooks/parent/useParentDashboardData';
import { Calendar, Mail, Phone, MapPin, Users, GraduationCap, Percent } from 'lucide-react';

interface ParentFamilyOverviewProps {
  familyProfile: FamilyProfile | null;
  loading?: boolean;
}

export default function ParentFamilyOverview({ familyProfile, loading }: ParentFamilyOverviewProps) {
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
    );
  }

  if (!familyProfile) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 animate-slide-up">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div className="h-16 w-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{familyProfile.name}</h3>
            <p className="text-lg text-gray-600">{familyProfile.children.length} Children Enrolled</p>
            <p className="text-sm text-gray-500">Family ID: {familyProfile.id.toUpperCase()}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Active Family
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Family Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-3 text-gray-400" />
                <span className="text-sm">{familyProfile.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-3 text-gray-400" />
                <span className="text-sm">{familyProfile.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                <span className="text-sm">{familyProfile.address}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Percent className="h-4 w-4 mr-3 text-gray-400" />
                <span className="text-sm">
                  Family Discount: ₹{familyProfile.discountAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
              Children Overview
            </h4>
            <div className="space-y-4">
              {familyProfile.children.map((child) => (
                <div key={child.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-gray-900">{child.name}</h5>
                    <span className="text-sm text-gray-500">{child.studentId}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{child.grade}</span>
                    <div className="flex items-center space-x-4">
                      <span>Grade: {child.averageGrade}%</span>
                      <span>Attendance: {child.attendance}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600">
                        🏆 {child.achievements} Achievements
                      </span>
                      {child.concerns > 0 && (
                        <span className="text-orange-600">
                          ⚠️ {child.concerns} Concerns
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {familyProfile.children.length} Children
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Family Discount Applied
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Academic Year 2024-25
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Active Enrollment
          </span>
        </div>
      </div>
    </div>
  );
}
