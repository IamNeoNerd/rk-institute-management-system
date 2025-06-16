'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Award,
  MessageSquare,
  Calendar,
  CreditCard,
  FileText,
  Flame
} from 'lucide-react';
import ProfessionalPieChart from '../charts/ProfessionalPieChart';
import ProfessionalBarChart from '../charts/ProfessionalBarChart';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface DataInsightCardProps {
  title: string;
  description: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo' | 'orange';
  href: string;
  chartType?: 'pie' | 'bar' | 'none';
  chartData?: ChartData[];
  badge?: {
    text: string;
    color: 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'indigo' | 'orange';
  };
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const iconMap = {
  users: Users,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle,
  clock: Clock,
  award: Award,
  'message-square': MessageSquare,
  calendar: Calendar,
  'credit-card': CreditCard,
  'file-text': FileText,
  flame: Flame,
};

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    border: 'border-blue-200',
    text: 'text-blue-600',
    lightBg: 'bg-blue-50'
  },
  green: {
    bg: 'from-green-500 to-green-600',
    border: 'border-green-200',
    text: 'text-green-600',
    lightBg: 'bg-green-50'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    border: 'border-purple-200',
    text: 'text-purple-600',
    lightBg: 'bg-purple-50'
  },
  red: {
    bg: 'from-red-500 to-red-600',
    border: 'border-red-200',
    text: 'text-red-600',
    lightBg: 'bg-red-50'
  },
  yellow: {
    bg: 'from-yellow-500 to-yellow-600',
    border: 'border-yellow-200',
    text: 'text-yellow-600',
    lightBg: 'bg-yellow-50'
  },
  indigo: {
    bg: 'from-indigo-500 to-indigo-600',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    lightBg: 'bg-indigo-50'
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    border: 'border-orange-200',
    text: 'text-orange-600',
    lightBg: 'bg-orange-50'
  }
};

const badgeClasses = {
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200'
};

export default function DataInsightCard({
  title,
  description,
  value,
  icon,
  color,
  href,
  chartType = 'none',
  chartData = [],
  badge,
  trend,
  className = ''
}: DataInsightCardProps) {
  const colors = colorClasses[color];
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Users;

  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4, scale: 1.02 }}
        className={`group relative bg-white p-6 rounded-2xl border ${colors.border} transition-all duration-300 hover:shadow-xl cursor-pointer ${className}`}
      >
        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClasses[badge.color]}`}>
              {badge.text}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${colors.bg} rounded-xl shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 ml-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              {description}
            </p>
          </div>
        </div>

        {/* Value and Trend */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {trend && (
            <div className={`flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span className="text-sm font-medium">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Chart */}
        {chartType !== 'none' && chartData.length > 0 && (
          <div className="mb-4">
            {chartType === 'pie' && (
              <ProfessionalPieChart
                data={chartData}
                title=""
                size="sm"
                showLegend={false}
                className="border-0 shadow-none p-0"
              />
            )}
            {chartType === 'bar' && (
              <ProfessionalBarChart
                data={chartData}
                title=""
                height={120}
                color={colors.bg.split(' ')[1]}
                showGrid={false}
                className="border-0 shadow-none p-0"
              />
            )}
          </div>
        )}

        {/* Action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className={`text-sm font-medium ${colors.text}`}>
            View Details
          </span>
          <ArrowRight className={`w-4 h-4 ${colors.text} group-hover:translate-x-1 transition-transform`} />
        </div>
      </motion.div>
    </Link>
  );
}
