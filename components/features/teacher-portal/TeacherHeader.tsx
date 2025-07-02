/**
 * Teacher Header Component
 *
 * Displays the header section with RK Institute branding, teacher portal badge,
 * welcome message, and logout functionality for the Teacher Portal.
 *
 * Design Features:
 * - Professional RK Institute branding
 * - Teacher portal identification badge with teal gradient
 * - Personalized welcome message
 * - Logout functionality with hover effects
 * - Responsive design for all screen sizes
 */

'use client';

import { Button } from '@/components/ui';

import { TeacherHeaderProps } from './types';

export default function TeacherHeader({ user, onLogout }: TeacherHeaderProps) {
  return (
    <header className='bg-white shadow-sm border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Left Side - Branding */}
          <div className='flex items-center'>
            <h1 className='text-2xl font-bold text-gray-900'>RK Institute</h1>
            <span className='ml-4 px-3 py-1 bg-gradient-to-r from-teal-100 to-blue-100 text-teal-800 text-sm font-medium rounded-full'>
              🎓 Teacher&apos;s Toolkit
            </span>
          </div>

          {/* Right Side - User Info & Logout */}
          <div className='flex items-center space-x-4'>
            {/* Welcome Message */}
            <div className='text-right'>
              <p className='text-sm text-gray-600'>Welcome back,</p>
              <p className='font-semibold text-gray-900'>
                {user?.name || 'Teacher'}
              </p>
            </div>

            {/* Logout Button */}
            <Button
              onClick={onLogout}
              variant='danger'
              className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
