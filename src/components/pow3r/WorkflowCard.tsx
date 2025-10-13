/**
 * Pow3r WorkflowCard Component
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

export interface WorkflowCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'draft' | 'paused' | 'completed' | 'error' | 'cancelled';
  progress?: number;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onComplete?: () => void;
  onArchive?: () => void;
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: '●'
  },
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    icon: '○'
  },
  paused: {
    label: 'Paused',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: '⏸'
  },
  completed: {
    label: 'Completed',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: '✓'
  },
  error: {
    label: 'Error',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: '⚠'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-500',
    icon: '✕'
  }
};

const priorityConfig = {
  low: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  },
  medium: {
    label: 'Medium',
    className: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
  },
  high: {
    label: 'High',
    className: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
  }
};

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  id,
  title,
  description,
  status,
  progress = 0,
  priority = 'medium',
  tags = [],
  createdAt,
  updatedAt,
  className,
  children,
  onClick,
  onEdit,
  onDelete,
  onPause,
  onResume,
  onComplete,
  onArchive
}) => {
  const statusInfo = statusConfig[status];
  const priorityInfo = priorityConfig[priority];

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer',
        'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Workflow card: ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          
          {/* Status Badge */}
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0',
              statusInfo.className
            )}
            aria-label={`Status: ${statusInfo.label}`}
          >
            <span className="mr-1" aria-hidden="true">
              {statusInfo.icon}
            </span>
            {statusInfo.label}
          </span>
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                aria-label={`Progress: ${Math.round(progress)}%`}
              />
            </div>
          </div>
        )}

        {/* Tags and Priority */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{tags.length - 3} more
              </span>
            )}
          </div>
          
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
              priorityInfo.className
            )}
            aria-label={`Priority: ${priorityInfo.label}`}
          >
            {priorityInfo.label}
          </span>
        </div>
      </div>

      {/* Content */}
      {children && (
        <div className="px-4 pb-3">
          {children}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {createdAt && (
              <span>Created {new Date(createdAt).toLocaleDateString()}</span>
            )}
            {updatedAt && createdAt !== updatedAt && (
              <span className="ml-2">
                Updated {new Date(updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Edit workflow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {status === 'active' && onPause && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPause();
                }}
                className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                aria-label="Pause workflow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            
            {status === 'paused' && onResume && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResume();
                }}
                className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                aria-label="Resume workflow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            
            {onComplete && status !== 'completed' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Complete workflow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
            
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Archive workflow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4m0 0l4-4m-4 4V3" />
                </svg>
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                aria-label="Delete workflow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;
