'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HubHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export default function HubHeader({ title, subtitle, actions }: HubHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
    </motion.div>
  );
}
