/**
 * Pow3r WorkflowActions Component
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

export interface WorkflowActionsProps {
  status: 'active' | 'draft' | 'paused' | 'completed' | 'error' | 'cancelled';
  className?: string;
  onView?: () => void;
  onEdit?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onComplete?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

const actionConfig = {
  view: {
    label: 'View',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    className: 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
  },
  edit: {
    label: 'Edit',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    className: 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
  },
  pause: {
    label: 'Pause',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    className: 'text-gray-600 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400'
  },
  resume: {
    label: 'Resume',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    className: 'text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400'
  },
  complete: {
    label: 'Complete',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    className: 'text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400'
  },
  archive: {
    label: 'Archive',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4m0 0l4-4m-4 4V3" />
      </svg>
    ),
    className: 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
  },
  delete: {
    label: 'Delete',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    className: 'text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
  },
  duplicate: {
    label: 'Duplicate',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    className: 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
  },
  export: {
    label: 'Export',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    className: 'text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400'
  },
  share: {
    label: 'Share',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
    ),
    className: 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
  }
};

export const WorkflowActions: React.FC<WorkflowActionsProps> = ({
  status,
  className,
  onView,
  onEdit,
  onPause,
  onResume,
  onComplete,
  onArchive,
  onDelete,
  onDuplicate,
  onExport,
  onShare,
  disabled = false,
  loading = false,
  variant = 'default'
}) => {
  const getAvailableActions = () => {
    const actions = [];

    if (onView) actions.push({ key: 'view', ...actionConfig.view, onClick: onView });
    if (onEdit) actions.push({ key: 'edit', ...actionConfig.edit, onClick: onEdit });
    
    if (status === 'active' && onPause) {
      actions.push({ key: 'pause', ...actionConfig.pause, onClick: onPause });
    }
    
    if (status === 'paused' && onResume) {
      actions.push({ key: 'resume', ...actionConfig.resume, onClick: onResume });
    }
    
    if (status !== 'completed' && onComplete) {
      actions.push({ key: 'complete', ...actionConfig.complete, onClick: onComplete });
    }
    
    if (onArchive) actions.push({ key: 'archive', ...actionConfig.archive, onClick: onArchive });
    if (onDuplicate) actions.push({ key: 'duplicate', ...actionConfig.duplicate, onClick: onDuplicate });
    if (onExport) actions.push({ key: 'export', ...actionConfig.export, onClick: onExport });
    if (onShare) actions.push({ key: 'share', ...actionConfig.share, onClick: onShare });
    if (onDelete) actions.push({ key: 'delete', ...actionConfig.delete, onClick: onDelete });

    return actions;
  };

  const availableActions = getAvailableActions();

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        {availableActions.slice(0, 3).map((action) => (
          <button
            key={action.key}
            onClick={action.onClick}
            disabled={disabled || loading}
            className={cn(
              'p-1 rounded transition-colors',
              action.className,
              disabled && 'opacity-50 cursor-not-allowed',
              loading && 'opacity-50 cursor-wait'
            )}
            aria-label={action.label}
            title={action.label}
          >
            {action.icon}
          </button>
        ))}
        {availableActions.length > 3 && (
          <div className="relative group">
            <button
              disabled={disabled || loading}
              className={cn(
                'p-1 rounded transition-colors text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
                disabled && 'opacity-50 cursor-not-allowed',
                loading && 'opacity-50 cursor-wait'
              )}
              aria-label="More actions"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              {availableActions.slice(3).map((action) => (
                <button
                  key={action.key}
                  onClick={action.onClick}
                  disabled={disabled || loading}
                  className={cn(
                    'w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                    action.className,
                    disabled && 'opacity-50 cursor-not-allowed',
                    loading && 'opacity-50 cursor-wait'
                  )}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {availableActions.map((action) => (
          <button
            key={action.key}
            onClick={action.onClick}
            disabled={disabled || loading}
            className={cn(
              'flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded transition-colors',
              action.className,
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              disabled && 'opacity-50 cursor-not-allowed',
              loading && 'opacity-50 cursor-wait'
            )}
            aria-label={action.label}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {availableActions.map((action) => (
        <button
          key={action.key}
          onClick={action.onClick}
          disabled={disabled || loading}
          className={cn(
            'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
            action.className,
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            disabled && 'opacity-50 cursor-not-allowed',
            loading && 'opacity-50 cursor-wait'
          )}
          aria-label={action.label}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default WorkflowActions;
