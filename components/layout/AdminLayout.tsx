'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  DollarSign,
  FileText,
  Settings
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      description: 'System overview and analytics',
      badge: null
    },
    {
      name: 'People',
      href: '/admin/people',
      icon: <Users className="w-5 h-5" />,
      color: 'from-green-500 to-green-600',
      description: 'Manage students, teachers, and staff',
      badge: null
    },
    {
      name: 'Academic',
      href: '/admin/academic',
      icon: <GraduationCap className="w-5 h-5" />,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Courses, curriculum, and academic records',
      badge: null
    },
    {
      name: 'Financials',
      href: '/admin/financials',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Fees, payments, and financial management',
      badge: null
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-red-500 to-red-600',
      description: 'Analytics and reporting dashboard',
      badge: null
    },
    {
      name: 'Operations',
      href: '/admin/operations',
      icon: <Settings className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      description: 'System automation and operations',
      badge: null
    },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white/95 backdrop-blur-xl border-r border-white/20">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">RK Institute</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1" role="navigation" aria-label="Main navigation">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r text-white shadow-lg ' + item.color
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className={`mr-4 flex-shrink-0 h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`}>
                      {item.icon}
                    </div>
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto inline-block py-0.5 px-3 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white/95 backdrop-blur-xl border-r border-white/20">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">RK Institute</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1" role="navigation" aria-label="Main navigation">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r text-white shadow-lg ' + item.color
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`}>
                      {item.icon}
                    </div>
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto inline-block py-0.5 px-3 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white/95 backdrop-blur-xl border-b border-white/20">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
