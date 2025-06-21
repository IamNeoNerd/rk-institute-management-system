'use client';

import Link from 'next/link';
import { PeopleQuickActionsProps } from './types';

/**
 * People Quick Actions Component
 * 
 * Displays quick action cards for common People hub operations like
 * adding students, families, users, and bulk import functionality.
 * 
 * Design Features:
 * - Professional card layout with hover animations
 * - Consistent gradient colors matching RK Institute design
 * - Responsive grid layout for different screen sizes
 * - Icon-based visual hierarchy for quick recognition
 */

export default function PeopleQuickActions({ actions }: PeopleQuickActionsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center text-white text-lg mr-3 group-hover:scale-110 transition-transform duration-200`}>
                {action.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {action.title}
                </h3>
              </div>
            </div>
            <p className="text-sm text-gray-600">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
