/**
 * Teacher Navigation Component
 * 
 * Provides tab-based navigation for the Teacher Portal with active state
 * indicators and smooth transitions between different sections.
 * 
 * Design Features:
 * - Tab-based navigation with icons
 * - Active state indicators with teal accent
 * - Hover effects for better user experience
 * - Responsive design with proper spacing
 * - Professional styling consistent with RK Institute standards
 */

'use client';

import { LayoutDashboard, FileText, TrendingUp, Users, BookOpen } from 'lucide-react';
import { TeacherNavigationProps, NavigationTab } from './types';

export default function TeacherNavigation({
  activeTab,
  onTabChange
}: TeacherNavigationProps) {

  const navigationTabs: NavigationTab[] = [
    { id: 'overview', name: 'Dashboard Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'assignments', name: 'Assignments & Notes', icon: <FileText size={16} /> },
    { id: 'academic-logs', name: 'Academic Logs', icon: <TrendingUp size={16} /> },
    { id: 'my-students', name: 'My Students', icon: <Users size={16} /> },
    { id: 'my-courses', name: 'My Courses', icon: <BookOpen size={16} /> },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
