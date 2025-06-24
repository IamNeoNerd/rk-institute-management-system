/**
 * Parent Header Component
 * 
 * Displays the header section with RK Institute branding, parent portal badge,
 * welcome message, and logout functionality for the Parent Portal.
 * 
 * Design Features:
 * - Professional RK Institute branding
 * - Parent portal identification badge with green gradient
 * - Personalized welcome message with family name
 * - Logout functionality with hover effects
 * - Responsive design for all screen sizes
 */

'use client';

import { ParentHeaderProps } from './types';
import { Button } from '@/components/ui';

export default function ParentHeader({
  familyProfile,
  onLogout
}: ParentHeaderProps) {

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Branding */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">RK Institute</h1>
            <span className="ml-4 px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-sm font-medium rounded-full">
              👨‍👩‍👧‍👦 Parent Portal
            </span>
          </div>

          {/* Right Side - User Info & Logout */}
          <div className="flex items-center space-x-4">
            {/* Welcome Message */}
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome,</p>
              <p className="font-semibold text-gray-900">
                {familyProfile?.name || 'Family'}
              </p>
            </div>

            {/* Logout Button */}
            <Button
              onClick={onLogout}
              variant="danger"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
