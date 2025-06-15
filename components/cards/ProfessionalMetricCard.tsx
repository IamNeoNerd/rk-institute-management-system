'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Award,
  FileText
} from 'lucide-react';

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
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo';
  trend?: TrendData;
  className?: string;
}

const iconMap = {
  users: Users,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle,
  clock: Clock,
  target: Target,
  award: Award,
  'file-text': FileText,
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
  }
};

export default function ProfessionalMetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  className = ''
}: ProfessionalMetricCardProps) {
  const colors = colorClasses[color];
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Users;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={`bg-gradient-to-br ${colors.bg} p-6 rounded-xl border ${colors.border} hover:shadow-lg transition-all duration-300 ${className}`}
    >
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
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium flex items-center ${trend.isPositive ? colors.trendPositive : colors.trendNegative}`}>
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        
        <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${colors.icon} rounded-xl shadow-lg`}>
          <IconComponent className="w-8 h-8 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
