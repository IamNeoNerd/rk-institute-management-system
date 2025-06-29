/**
 * Student Navigation Component
 * 
 * Provides tab-based navigation for the Student Portal with active state
 * indicators and smooth transitions between different sections.
 * 
 * Design Features:
 * - Tab-based navigation with icons
 * - Active state indicators with blue accent
 * - Hover effects for better user experience
 * - Responsive design with proper spacing
 * - Professional styling consistent with RK Institute standards
 */

'use client';

import { LayoutDashboard, BookOpen, CreditCard, FileText, TrendingUp } from 'lucide-react';
import { StudentNavigationProps, NavigationTab } from './types';

export default function StudentNavigation({
  activeTab,
  onTabChange
}: StudentNavigationProps) {

  const navigationTabs: NavigationTab[] = [
    { id: 'overview', name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'my-courses', name: 'My Courses', icon: <BookOpen size={16} /> },
    { id: 'my-fees', name: 'Fees & Payments', icon: <CreditCard size={16} /> },
    { id: 'assignments', name: 'Assignments & Notes', icon: <FileText size={16} /> },
    { id: 'academic-logs', name: 'Academic Progress', icon: <TrendingUp size={16} /> },
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
                  ? 'border-blue-500 text-blue-600'
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
