'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface HubActionButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  color?: 'gray' | 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'yellow';
  onClick?: () => void;
}

const colorClasses = {
  gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
  blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
  yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
};

export default function HubActionButton({
  href,
  icon: Icon,
  label,
  color = 'blue',
  onClick
}: HubActionButtonProps) {
  const baseClasses = `flex items-center space-x-2 bg-gradient-to-r ${colorClasses[color]} text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl`;

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={baseClasses}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={baseClasses}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}
