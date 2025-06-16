'use client';

import { ManagementCard } from '@/components/hub';
import { BookOpen, Users, FileText, Target, PenTool, BarChart3 } from 'lucide-react';

export default function TeacherManagementActions() {
  return (
    <div className="animate-slide-up">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Teaching Management
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ManagementCard
          href="/teacher/students"
          icon={Users}
          title="My Students"
          description="View and manage student information, track academic progress and performance"
          color="blue"
          delay={0.1}
        />
        <ManagementCard
          href="/teacher/courses"
          icon={BookOpen}
          title="My Courses"
          description="Manage course content, curriculum, and student enrollments"
          color="green"
          delay={0.2}
        />
        <ManagementCard
          href="/teacher/academic-logs"
          icon={FileText}
          title="Academic Logs"
          description="Create and manage student progress reports, achievements, and concerns"
          color="purple"
          delay={0.3}
        />
        <ManagementCard
          href="/teacher/assignments"
          icon={PenTool}
          title="Assignments"
          description="Create homework, projects, and study materials for students"
          color="orange"
          delay={0.4}
        />
        <ManagementCard
          href="/teacher/analytics"
          icon={BarChart3}
          title="Performance Analytics"
          description="View detailed analytics on student performance and course effectiveness"
          color="indigo"
          delay={0.5}
        />
        <ManagementCard
          href="/teacher/resources"
          icon={Target}
          title="Teaching Resources"
          description="Access teaching materials, lesson plans, and educational resources"
          color="teal"
          delay={0.6}
        />
      </div>
    </div>
  );
}
