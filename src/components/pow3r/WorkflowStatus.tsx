/**
 * Pow3r WorkflowStatus Component
 * Enterprise-ready, unbound design system component
 * 
 * Features:
 * - Mobile-first responsive design
 * - Dark/light mode support
 * - Accessibility compliant (WCAG)
 * - TypeScript support
 * - Unbound from design concerns
 * - Modular and reusable
 * 
 * @version 1.0.0
 * @date 2024-12-20
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface WorkflowStatusProps {
  status: 'active' | 'draft' | 'paused' | 'completed' | 'error' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
  variant?: 'badge' | 'pill' | 'dot' | 'text';
}

const statusConfig = {
  active: {
    label: 'Active',
    icon: '●',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    dotClassName: 'bg-green-500',
    description: 'Workflow is currently running'
  },
  draft: {
    label: 'Draft',
    icon: '○',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    dotClassName: 'bg-gray-500',
    description: 'Workflow is in draft state'
  },
  paused: {
    label: 'Paused',
    icon: '⏸',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    dotClassName: 'bg-yellow-500',
    description: 'Workflow is temporarily paused'
  },
  completed: {
    label: 'Completed',
    icon: '✓',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    dotClassName: 'bg-blue-500',
    description: 'Workflow has been completed'
  },
  error: {
    label: 'Error',
    icon: '⚠',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    dotClassName: 'bg-red-500',
    description: 'Workflow encountered an error'
  },
  cancelled: {
    label: 'Cancelled',
    icon: '✕',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-500',
    dotClassName: 'bg-gray-400',
    description: 'Workflow has been cancelled'
  }
};

const sizeConfig = {
  sm: {
    text: 'text-xs',
    padding: 'px-2 py-0.5',
    icon: 'text-xs',
    dot: 'w-2 h-2'
  },
  md: {
    text: 'text-sm',
    padding: 'px-2.5 py-0.5',
    icon: 'text-sm',
    dot: 'w-3 h-3'
  },
  lg: {
    text: 'text-base',
    padding: 'px-3 py-1',
    icon: 'text-base',
    dot: 'w-4 h-4'
  }
};

export const WorkflowStatus: React.FC<WorkflowStatusProps> = ({
  status,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className,
  variant = 'badge'
}) => {
  const statusInfo = statusConfig[status];
  const sizeInfo = sizeConfig[size];

  if (variant === 'dot') {
    return (
      <div
        className={cn(
          'inline-flex items-center',
          className
        )}
        title={statusInfo.description}
        aria-label={`Status: ${statusInfo.label}`}
      >
        <div
          className={cn(
            'rounded-full',
            statusInfo.dotClassName,
            sizeInfo.dot
          )}
          aria-hidden="true"
        />
        {showLabel && (
          <span className={cn('ml-2 font-medium', sizeInfo.text, 'text-gray-700 dark:text-gray-300')}>
            {statusInfo.label}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span
        className={cn(
          'font-medium',
          sizeInfo.text,
          status === 'active' && 'text-green-700 dark:text-green-400',
          status === 'draft' && 'text-gray-700 dark:text-gray-300',
          status === 'paused' && 'text-yellow-700 dark:text-yellow-400',
          status === 'completed' && 'text-blue-700 dark:text-blue-400',
          status === 'error' && 'text-red-700 dark:text-red-400',
          status === 'cancelled' && 'text-gray-600 dark:text-gray-500',
          className
        )}
        title={statusInfo.description}
        aria-label={`Status: ${statusInfo.label}`}
      >
        {showIcon && (
          <span className="mr-1" aria-hidden="true">
            {statusInfo.icon}
          </span>
        )}
        {showLabel && statusInfo.label}
      </span>
    );
  }

  if (variant === 'pill') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          statusInfo.className,
          sizeInfo.padding,
          sizeInfo.text,
          className
        )}
        title={statusInfo.description}
        aria-label={`Status: ${statusInfo.label}`}
      >
        {showIcon && (
          <span className="mr-1" aria-hidden="true">
            {statusInfo.icon}
          </span>
        )}
        {showLabel && statusInfo.label}
      </span>
    );
  }

  // Default badge variant
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium',
        statusInfo.className,
        sizeInfo.padding,
        sizeInfo.text,
        className
      )}
      title={statusInfo.description}
      aria-label={`Status: ${statusInfo.label}`}
    >
      {showIcon && (
        <span className="mr-1" aria-hidden="true">
          {statusInfo.icon}
        </span>
      )}
      {showLabel && statusInfo.label}
    </span>
  );
};

export default WorkflowStatus;
