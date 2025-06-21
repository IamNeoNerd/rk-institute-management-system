'use client';

// Temporary minimal version to isolate webpack runtime issue
import { Users } from 'lucide-react';

interface TrendData {
  value: number;
  label: string;
  isPositive: boolean;
}

interface ProfessionalMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo' | 'orange';
  trend?: TrendData;
  className?: string;
}

// Minimal icon map to isolate webpack runtime issue
const iconMap = {
  users: Users,
  default: Users,
};

const colorClasses = {
  blue: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    icon: 'from-blue-500 to-blue-600',
    text: 'text-blue-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  green: {
    bg: 'from-green-50 to-green-100',
    border: 'border-green-200',
    icon: 'from-green-500 to-green-600',
    text: 'text-green-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  purple: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    icon: 'from-purple-500 to-purple-600',
    text: 'text-purple-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  red: {
    bg: 'from-red-50 to-red-100',
    border: 'border-red-200',
    icon: 'from-red-500 to-red-600',
    text: 'text-red-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  yellow: {
    bg: 'from-yellow-50 to-yellow-100',
    border: 'border-yellow-200',
    icon: 'from-yellow-500 to-yellow-600',
    text: 'text-yellow-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  indigo: {
    bg: 'from-indigo-50 to-indigo-100',
    border: 'border-indigo-200',
    icon: 'from-indigo-500 to-indigo-600',
    text: 'text-indigo-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  },
  orange: {
    bg: 'from-orange-50 to-orange-100',
    border: 'border-orange-200',
    icon: 'from-orange-500 to-orange-600',
    text: 'text-orange-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600'
  }
};

// Minimal component to isolate webpack runtime issue
export default function ProfessionalMetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  className = ''
}: ProfessionalMetricCardProps) {
  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-gradient-to-br ${colors.bg} p-6 rounded-xl border ${colors.border} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className={`text-sm ${colors.text} font-medium`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${colors.icon} rounded-xl shadow-lg`}>
          <Users className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}
