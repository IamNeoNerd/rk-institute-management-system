'use client';

import Link from 'next/link';

interface InsightCardProps {
  title: string;
  description: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo' | 'pink' | 'orange';
  href: string;
  badge?: {
    text: string;
    color: 'red' | 'yellow' | 'green' | 'blue' | 'purple';
  };
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200 hover:border-blue-300',
    iconBg: 'from-blue-500 to-blue-600',
    value: 'text-blue-600'
  },
  green: {
    bg: 'from-green-50 to-green-100',
    border: 'border-green-200 hover:border-green-300',
    iconBg: 'from-green-500 to-green-600',
    value: 'text-green-600'
  },
  purple: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200 hover:border-purple-300',
    iconBg: 'from-purple-500 to-purple-600',
    value: 'text-purple-600'
  },
  red: {
    bg: 'from-red-50 to-red-100',
    border: 'border-red-200 hover:border-red-300',
    iconBg: 'from-red-500 to-red-600',
    value: 'text-red-600'
  },
  yellow: {
    bg: 'from-yellow-50 to-yellow-100',
    border: 'border-yellow-200 hover:border-yellow-300',
    iconBg: 'from-yellow-500 to-yellow-600',
    value: 'text-yellow-600'
  },
  indigo: {
    bg: 'from-indigo-50 to-indigo-100',
    border: 'border-indigo-200 hover:border-indigo-300',
    iconBg: 'from-indigo-500 to-indigo-600',
    value: 'text-indigo-600'
  },
  pink: {
    bg: 'from-pink-50 to-pink-100',
    border: 'border-pink-200 hover:border-pink-300',
    iconBg: 'from-pink-500 to-pink-600',
    value: 'text-pink-600'
  },
  orange: {
    bg: 'from-orange-50 to-orange-100',
    border: 'border-orange-200 hover:border-orange-300',
    iconBg: 'from-orange-500 to-orange-600',
    value: 'text-orange-600'
  }
};

const badgeClasses = {
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200'
};

export default function InsightCard({
  title,
  description,
  value,
  icon,
  color,
  href,
  badge,
  className = ''
}: InsightCardProps) {
  const colors = colorClasses[color];

  return (
    <Link href={href}>
      <div className={`group relative bg-gradient-to-br ${colors.bg} p-3 sm:p-6 rounded-2xl border ${colors.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${className}`}>
        {badge && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-medium border ${badgeClasses[badge.color]}`}>
              {badge.text}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${colors.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0`}>
            <span className="text-lg sm:text-xl text-white">{icon}</span>
          </div>
          <div className="text-right">
            <div className={`text-xl sm:text-2xl font-bold ${colors.value}`}>
              {value}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">
            {description}
          </p>
        </div>
        
        <div className="mt-4 flex items-center text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-200">
          <span>View details</span>
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
