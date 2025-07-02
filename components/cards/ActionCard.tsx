'use client';

import Link from 'next/link';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color:
    | 'blue'
    | 'green'
    | 'purple'
    | 'red'
    | 'yellow'
    | 'indigo'
    | 'pink'
    | 'orange';
  action: {
    type: 'link' | 'button';
    href?: string;
    onClick?: () => void;
    label: string;
  };
  className?: string;
  disabled?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200 hover:border-blue-300',
    iconBg: 'from-blue-500 to-blue-600',
    button:
      'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
  },
  green: {
    bg: 'from-green-50 to-green-100',
    border: 'border-green-200 hover:border-green-300',
    iconBg: 'from-green-500 to-green-600',
    button:
      'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
  },
  purple: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200 hover:border-purple-300',
    iconBg: 'from-purple-500 to-purple-600',
    button:
      'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
  },
  red: {
    bg: 'from-red-50 to-red-100',
    border: 'border-red-200 hover:border-red-300',
    iconBg: 'from-red-500 to-red-600',
    button:
      'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
  },
  yellow: {
    bg: 'from-yellow-50 to-yellow-100',
    border: 'border-yellow-200 hover:border-yellow-300',
    iconBg: 'from-yellow-500 to-yellow-600',
    button:
      'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
  },
  indigo: {
    bg: 'from-indigo-50 to-indigo-100',
    border: 'border-indigo-200 hover:border-indigo-300',
    iconBg: 'from-indigo-500 to-indigo-600',
    button:
      'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
  },
  pink: {
    bg: 'from-pink-50 to-pink-100',
    border: 'border-pink-200 hover:border-pink-300',
    iconBg: 'from-pink-500 to-pink-600',
    button:
      'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
  },
  orange: {
    bg: 'from-orange-50 to-orange-100',
    border: 'border-orange-200 hover:border-orange-300',
    iconBg: 'from-orange-500 to-orange-600',
    button:
      'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  }
};

export default function ActionCard({
  title,
  description,
  icon,
  color,
  action,
  className = '',
  disabled = false
}: ActionCardProps) {
  const colors = colorClasses[color];

  const cardContent = (
    <div
      className={`group relative bg-gradient-to-br ${colors.bg} p-3 sm:p-6 rounded-2xl border ${colors.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <div className='flex items-start mb-3 sm:mb-4'>
        <div
          className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${colors.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg mr-3 sm:mr-4 flex-shrink-0`}
        >
          <span className='text-lg sm:text-xl text-white'>{icon}</span>
        </div>
        <div className='flex-1 min-w-0'>
          <h3 className='text-base sm:text-lg font-bold text-gray-900 mb-1'>
            {title}
          </h3>
          <p className='text-gray-600 text-xs sm:text-sm'>{description}</p>
        </div>
      </div>

      {action.type === 'link' && action.href ? (
        <div className='mt-4'>
          <span
            className={`inline-flex items-center px-4 py-2 ${colors.button} text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg`}
          >
            {action.label}
            <svg
              className='w-4 h-4 ml-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </span>
        </div>
      ) : (
        <div className='mt-4'>
          <button
            onClick={action.onClick}
            disabled={disabled}
            className={`inline-flex items-center px-4 py-2 ${colors.button} text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {action.label}
            <svg
              className='w-4 h-4 ml-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4v16m8-8H4'
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  if (action.type === 'link' && action.href && !disabled) {
    return <Link href={action.href}>{cardContent}</Link>;
  }

  return cardContent;
}
