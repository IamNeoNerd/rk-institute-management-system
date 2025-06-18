'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, BookOpen, Calendar } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  grade: string;
  teacher: {
    name: string;
  };
  feeStructure?: {
    amount: number;
    billingCycle: string;
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  feeStructure?: {
    amount: number;
    billingCycle: string;
  };
}

export default function StudentCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for student's enrolled courses and services
    setCourses([
      {
        id: 'math-advanced',
        name: 'Advanced Mathematics',
        description: 'Calculus, Statistics, and Advanced Algebra for high school students',
        grade: 'Grade 11-12',
        teacher: { name: 'Dr. Sarah Johnson' },
        feeStructure: { amount: 2500, billingCycle: 'MONTHLY' },
      },
      {
        id: 'science-physics',
        name: 'Physics',
        description: 'Mechanics, thermodynamics, and modern physics',
        grade: 'Grade 11-12',
        teacher: { name: 'Prof. Michael Chen' },
        feeStructure: { amount: 2800, billingCycle: 'MONTHLY' },
      },
      {
        id: 'english-literature',
        name: 'English Literature',
        description: 'Classic and modern literature analysis and writing',
        grade: 'Grade 9-12',
        teacher: { name: 'System Administrator' },
        feeStructure: { amount: 2200, billingCycle: 'MONTHLY' },
      },
    ]);

    setServices([
      {
        id: 'transport-bus',
        name: 'Bus Transportation',
        description: 'Daily school bus service with multiple routes',
        feeStructure: { amount: 1000, billingCycle: 'MONTHLY' },
      },
      {
        id: 'library-access',
        name: 'Library Access',
        description: 'Extended library hours and digital resources',
        feeStructure: { amount: 400, billingCycle: 'MONTHLY' },
      },
    ]);

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading courses...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        <HubHeader
          title="My Courses & Services"
          subtitle="View your enrolled courses and subscribed services"
          actions={
            <>
              <HubActionButton href="/student/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="/student/schedule" icon={Calendar} label="View Schedule" color="blue" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProfessionalMetricCard
            title="Enrolled Courses"
            value={courses.length}
            subtitle="Active courses"
            icon="book-open"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Active Services"
            value={services.length}
            subtitle="Subscribed services"
            icon="check-circle"
            color="green"
          />
          <ProfessionalMetricCard
            title="Total Monthly Fee"
            value={`₹${(courses.reduce((sum, course) => sum + (course.feeStructure?.amount || 0), 0) +
                  services.reduce((sum, service) => sum + (service.feeStructure?.amount || 0), 0)).toLocaleString()}`}
            subtitle="Per month"
            icon="dollar-sign"
            color="purple"
          />
        </div>

        {/* Enrolled Courses */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📚 Enrolled Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{course.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{course.grade}</p>
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📚 Course
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Instructor:</span>
                    <span className="font-medium">{course.teacher.name}</span>
                  </div>

                  {course.feeStructure && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Fee:</span>
                      <span className="font-medium text-green-600">
                        ₹{course.feeStructure.amount.toLocaleString()}/{course.feeStructure.billingCycle.toLowerCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 font-medium">✅ Enrolled</span>
                    <div className="flex space-x-2">
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribed Services */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🚌 Subscribed Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🚌 Service
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{service.description}</p>

                <div className="space-y-3">
                  {service.feeStructure && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Fee:</span>
                      <span className="font-medium text-green-600">
                        ₹{service.feeStructure.amount.toLocaleString()}/{service.feeStructure.billingCycle.toLowerCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 font-medium">✅ Active</span>
                    <div className="flex space-x-2">
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}