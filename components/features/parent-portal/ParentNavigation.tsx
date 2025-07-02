/**
 * Parent Navigation Component
 *
 * Provides tab-based navigation for the Parent Portal with active state
 * indicators and smooth transitions between different sections.
 *
 * Design Features:
 * - Tab-based navigation with icons
 * - Active state indicators with green accent
 * - Hover effects for better user experience
 * - Responsive design with proper spacing
 * - Professional styling consistent with RK Institute standards
 */

'use client';

import { ParentNavigationProps, NavigationTab } from './types';

export default function ParentNavigation({
  activeTab,
  onTabChange
}: ParentNavigationProps) {
  const navigationTabs: NavigationTab[] = [
    { id: 'overview', name: 'Family Overview', icon: '🏠' },
    { id: 'children', name: 'My Children', icon: '👨‍👩‍👧‍👦' },
    { id: 'fees', name: 'Fees & Payments', icon: '💰' },
    { id: 'assignments', name: 'Assignments & Notes', icon: '📋' },
    { id: 'academic', name: 'Academic Progress', icon: '📚' }
  ];

  return (
    <div className='bg-white border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <nav className='flex space-x-8'>
          {navigationTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className='mr-2'>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
