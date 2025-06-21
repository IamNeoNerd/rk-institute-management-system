'use client';

import { Motion, slideUp } from '@/components/ui/animations/SSRSafeMotion';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ManagementCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'yellow' | 'indigo' | 'teal';
  delay?: number;
}

const colorClasses = {
  blue: {
    border: 'border-blue-200 hover:border-blue-300',
    icon: 'from-blue-500 to-blue-600',
    text: 'group-hover:text-blue-600',
    arrow: 'text-blue-600',
    action: 'text-blue-600'
  },
  green: {
    border: 'border-green-200 hover:border-green-300',
    icon: 'from-green-500 to-green-600',
    text: 'group-hover:text-green-600',
    arrow: 'text-green-600',
    action: 'text-green-600'
  },
  purple: {
    border: 'border-purple-200 hover:border-purple-300',
    icon: 'from-purple-500 to-purple-600',
    text: 'group-hover:text-purple-600',
    arrow: 'text-purple-600',
    action: 'text-purple-600'
  },
  red: {
    border: 'border-red-200 hover:border-red-300',
    icon: 'from-red-500 to-red-600',
    text: 'group-hover:text-red-600',
    arrow: 'text-red-600',
    action: 'text-red-600'
  },
  orange: {
    border: 'border-orange-200 hover:border-orange-300',
    icon: 'from-orange-500 to-orange-600',
    text: 'group-hover:text-orange-600',
    arrow: 'text-orange-600',
    action: 'text-orange-600'
  },
  yellow: {
    border: 'border-yellow-200 hover:border-yellow-300',
    icon: 'from-yellow-500 to-yellow-600',
    text: 'group-hover:text-yellow-600',
    arrow: 'text-yellow-600',
    action: 'text-yellow-600'
  },
  indigo: {
    border: 'border-indigo-200 hover:border-indigo-300',
    icon: 'from-indigo-500 to-indigo-600',
    text: 'group-hover:text-indigo-600',
    arrow: 'text-indigo-600',
    action: 'text-indigo-600'
  },
  teal: {
    border: 'border-teal-200 hover:border-teal-300',
    icon: 'from-teal-500 to-teal-600',
    text: 'group-hover:text-teal-600',
    arrow: 'text-teal-600',
    action: 'text-teal-600'
  }
};

export default function ManagementCard({
  href,
  icon: Icon,
  title,
  description,
  color,
  delay = 0
}: ManagementCardProps) {
  const colors = colorClasses[color];

  return (
    <Motion
      {...slideUp}
      transition={{ duration: 0.3, delay }}
    >
      <Link
        href={href}
        className={`group block bg-white p-6 rounded-2xl border ${colors.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${colors.icon} rounded-2xl shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className={`${colors.arrow} group-hover:translate-x-2 transition-transform duration-300`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
        <h3 className={`text-xl font-bold text-gray-900 mb-2 ${colors.text} transition-colors`}>
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
        <div className={`mt-4 flex items-center text-sm ${colors.action} font-medium`}>
          <span>Access {title}</span>
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </Motion>
  );
}
