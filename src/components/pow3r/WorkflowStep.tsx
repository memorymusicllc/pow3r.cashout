/**
 * Pow3r WorkflowStep Component
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

export interface WorkflowStepProps {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'error';
  order: number;
  estimatedHours?: number;
  actualHours?: number;
  assignedTo?: string;
  dueDate?: string;
  dependencies?: string[];
  deliverables?: string[];
  notes?: string;
  className?: string;
  children?: React.ReactNode;
  onStatusChange?: (status: WorkflowStepProps['status']) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    icon: '○',
    color: 'gray'
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: '◐',
    color: 'blue'
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: '✓',
    color: 'green'
  },
  skipped: {
    label: 'Skipped',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: '⊘',
    color: 'yellow'
  },
  error: {
    label: 'Error',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: '⚠',
    color: 'red'
  }
};

export const WorkflowStep: React.FC<WorkflowStepProps> = ({
  id,
  title,
  description,
  status,
  order,
  estimatedHours,
  actualHours,
  assignedTo,
  dueDate,
  dependencies = [],
  deliverables = [],
  notes,
  className,
  children,
  onStatusChange,
  onEdit,
  onDelete
}) => {
  const statusInfo = statusConfig[status];
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'completed';

  return (
    <div
      className={cn(
        'relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4',
        'hover:shadow-md transition-all duration-200',
        isOverdue && 'border-red-300 dark:border-red-700',
        className
      )}
      role="listitem"
      aria-label={`Step ${order}: ${title}`}
    >
      {/* Step Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Step Number */}
          <div
            className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
              status === 'completed' && 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
              status === 'in_progress' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
              status === 'error' && 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
              status === 'skipped' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
              status === 'pending' && 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            )}
            aria-label={`Step ${order}`}
          >
            {status === 'completed' ? '✓' : order}
          </div>
          
          {/* Step Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {title}
              </h4>
              
              {/* Status Badge */}
              <span
                className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
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
            
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Edit step"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              aria-label="Delete step"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Step Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        {/* Time Tracking */}
        {(estimatedHours || actualHours) && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Time Tracking</span>
              {actualHours && estimatedHours && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    actualHours > estimatedHours
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  )}
                >
                  {actualHours > estimatedHours ? 'Over' : 'Under'} by {Math.abs(actualHours - estimatedHours)}h
                </span>
              )}
            </div>
            <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
              {estimatedHours && (
                <span>Est: {estimatedHours}h</span>
              )}
              {actualHours && (
                <span>Actual: {actualHours}h</span>
              )}
            </div>
          </div>
        )}
        
        {/* Assignment */}
        {assignedTo && (
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Assigned To</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {assignedTo}
            </div>
          </div>
        )}
        
        {/* Due Date */}
        {dueDate && (
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Due Date</div>
            <div
              className={cn(
                'text-sm font-medium',
                isOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              )}
            >
              {new Date(dueDate).toLocaleDateString()}
              {isOverdue && (
                <span className="ml-1 text-xs">(Overdue)</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dependencies</div>
          <div className="flex flex-wrap gap-1">
            {dependencies.map((dep, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Deliverables</div>
          <div className="flex flex-wrap gap-1">
            {deliverables.map((deliverable, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              >
                {deliverable}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</div>
          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
            {notes}
          </div>
        </div>
      )}

      {/* Status Change Buttons */}
      {onStatusChange && (
        <div className="flex items-center space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Change Status:</span>
          <div className="flex space-x-1">
            {Object.entries(statusConfig).map(([statusKey, config]) => (
              <button
                key={statusKey}
                onClick={() => onStatusChange(statusKey as WorkflowStepProps['status'])}
                disabled={status === statusKey}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded transition-colors',
                  status === statusKey
                    ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
                aria-label={`Change status to ${config.label}`}
              >
                {config.icon} {config.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Children Content */}
      {children && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

export default WorkflowStep;
