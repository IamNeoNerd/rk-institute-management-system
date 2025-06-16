'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

const variantStyles = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-700',
    icon: 'text-red-500',
    iconBg: 'bg-red-100'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    icon: 'text-yellow-500',
    iconBg: 'bg-yellow-100'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-700',
    icon: 'text-blue-500',
    iconBg: 'bg-blue-100'
  }
};

export default function ErrorAlert({ 
  message, 
  onDismiss, 
  variant = 'error',
  className = '' 
}: ErrorAlertProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`${styles.container} border px-6 py-4 rounded-xl ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${styles.iconBg} rounded-full p-2 mr-3`}>
            <AlertTriangle className={`w-4 h-4 ${styles.icon}`} />
          </div>
          <span className="font-medium">{message}</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${styles.icon} hover:opacity-70 transition-opacity`}
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
