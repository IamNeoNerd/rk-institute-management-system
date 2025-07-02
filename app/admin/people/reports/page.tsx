'use client';

import Link from 'next/link';

import AdminLayout from '@/components/layout/AdminLayout';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

export default function PeopleReportsPage() {
  return (
    <AdminLayout>
      <div className='space-y-8'>
        {/* Header */}
        <div className='flex justify-between items-center animate-fade-in'>
          <div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
              People Reports
            </h1>
            <p className='mt-2 text-lg text-gray-600'>
              Generate and manage reports for students, families, and users
            </p>
          </div>
          <Link
            href='/admin/people'
            className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl'
          >
            ← Back to People Hub
          </Link>
        </div>

        {/* Coming Soon Message */}
        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center'>
          <div className='text-6xl mb-6'>📊</div>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>
            Reports Coming Soon
          </h2>
          <p className='text-lg text-gray-600 mb-8 max-w-2xl mx-auto'>
            We&apos;re working on comprehensive reporting features for people
            management. This will include student performance reports, family
            summaries, user activity reports, and more.
          </p>

          {/* Planned Features */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
            <div className='p-6 bg-blue-50 rounded-xl'>
              <div className='text-2xl mb-3'>👥</div>
              <h3 className='font-semibold text-gray-900 mb-2'>
                Student Reports
              </h3>
              <p className='text-sm text-gray-600'>
                Individual and batch student performance reports
              </p>
            </div>

            <div className='p-6 bg-green-50 rounded-xl'>
              <div className='mb-3'>
                <ProfessionalIcon
                  name='family'
                  size={32}
                  className='text-green-600'
                />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>
                Family Reports
              </h3>
              <p className='text-sm text-gray-600'>
                Family-wise summaries and multi-child reports
              </p>
            </div>

            <div className='p-6 bg-purple-50 rounded-xl'>
              <div className='mb-3'>
                <ProfessionalIcon
                  name='user'
                  size={32}
                  className='text-purple-600'
                />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>
                User Activity
              </h3>
              <p className='text-sm text-gray-600'>
                System usage and activity reports
              </p>
            </div>

            <div className='p-6 bg-orange-50 rounded-xl'>
              <div className='mb-3'>
                <ProfessionalIcon
                  name='analytics'
                  size={32}
                  className='text-orange-600'
                />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>Analytics</h3>
              <p className='text-sm text-gray-600'>
                Enrollment trends and demographic analysis
              </p>
            </div>

            <div className='p-6 bg-red-50 rounded-xl'>
              <div className='mb-3'>
                <ProfessionalIcon
                  name='list'
                  size={32}
                  className='text-red-600'
                />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>
                Custom Reports
              </h3>
              <p className='text-sm text-gray-600'>
                Build custom reports with flexible filters
              </p>
            </div>

            <div className='p-6 bg-yellow-50 rounded-xl'>
              <div className='mb-3'>
                <ProfessionalIcon
                  name='export'
                  size={32}
                  className='text-yellow-600'
                />
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>
                Export Options
              </h3>
              <p className='text-sm text-gray-600'>
                PDF, Excel, and CSV export formats
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
