'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color:
    | 'blue'
    | 'green'
    | 'purple'
    | 'red'
    | 'yellow'
    | 'indigo'
    | 'pink'
    | 'gray';
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100',
    text: 'text-blue-600',
    trendPositive: 'text-blue-600',
    trendNegative: 'text-blue-500'
  },
  green: {
    bg: 'from-green-500 to-green-600',
    iconBg: 'bg-green-100',
    text: 'text-green-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-green-500'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-100',
    text: 'text-purple-600',
    trendPositive: 'text-purple-600',
    trendNegative: 'text-purple-500'
  },
  red: {
    bg: 'from-red-500 to-red-600',
    iconBg: 'bg-red-100',
    text: 'text-red-600',
    trendPositive: 'text-red-600',
    trendNegative: 'text-red-500'
  },
  yellow: {
    bg: 'from-yellow-500 to-yellow-600',
    iconBg: 'bg-yellow-100',
    text: 'text-yellow-600',
    trendPositive: 'text-yellow-600',
    trendNegative: 'text-yellow-500'
  },
  indigo: {
    bg: 'from-indigo-500 to-indigo-600',
    iconBg: 'bg-indigo-100',
    text: 'text-indigo-600',
    trendPositive: 'text-indigo-600',
    trendNegative: 'text-indigo-500'
  },
  pink: {
    bg: 'from-pink-500 to-pink-600',
    iconBg: 'bg-pink-100',
    text: 'text-pink-600',
    trendPositive: 'text-pink-600',
    trendNegative: 'text-pink-500'
  },
  gray: {
    bg: 'from-gray-500 to-gray-600',
    iconBg: 'bg-gray-100',
    text: 'text-gray-600',
    trendPositive: 'text-gray-600',
    trendNegative: 'text-gray-500'
  }
};

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  className = ''
}: MetricCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1 min-w-0'>
          <p className='text-xs sm:text-sm font-medium text-gray-600 mb-1'>
            {title}
          </p>
          <p className='text-xl sm:text-3xl font-bold text-gray-900 mb-1 truncate'>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs sm:text-sm ${colors.text} font-medium`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className='flex items-center mt-1 sm:mt-2'>
              <span
                className={`text-xs sm:text-sm font-medium ${trend.isPositive ? colors.trendPositive : colors.trendNegative}`}
              >
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className='text-xs text-gray-500 ml-1 sm:ml-2 truncate'>
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-2 sm:p-3 ${colors.iconBg} rounded-lg ml-2 sm:ml-4 flex-shrink-0`}
        >
          <span className='text-xl sm:text-2xl'>{icon}</span>
        </div>
      </div>
    </div>
  );
}
