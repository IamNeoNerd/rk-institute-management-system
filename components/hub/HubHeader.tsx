'use client';

import { Motion, slideDown } from '@/components/ui/animations/SSRSafeMotion';
import { ReactNode } from 'react';

interface HubHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export default function HubHeader({ title, subtitle, actions }: HubHeaderProps) {
  return (
    <Motion
      {...slideDown}
      className="flex justify-between items-center"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          {subtitle}
        </p>
      </div>
      {actions && (
        <div className="flex space-x-4">
          {actions}
        </div>
      )}
    </Motion>
  );
}
