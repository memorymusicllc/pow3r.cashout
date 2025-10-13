/**
 * Pow3r WorkflowProgress Component
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

export interface WorkflowProgressProps {
  totalSteps: number;
  completedSteps: number;
  currentStep?: number;
  estimatedTime?: string;
  actualTime?: string;
  className?: string;
  showTime?: boolean;
  showPercentage?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  totalSteps,
  completedSteps,
  currentStep,
  estimatedTime,
  actualTime,
  className,
  showTime = true,
  showPercentage = true,
  variant = 'default'
}) => {
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isOverdue = estimatedTime && actualTime && new Date(actualTime) > new Date(estimatedTime);

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
            aria-label={`Progress: ${Math.round(progressPercentage)}%`}
          />
        </div>
        {showPercentage && (
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {Math.round(progressPercentage)}%
          </span>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {completedSteps} of {totalSteps} steps
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
              aria-label={`Progress: ${Math.round(progressPercentage)}%`}
            />
          </div>
          {showPercentage && (
            <div className="text-right text-sm text-gray-600 dark:text-gray-400">
              {Math.round(progressPercentage)}% complete
            </div>
          )}
        </div>

        {/* Step Indicators */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber <= completedSteps;
            const isCurrent = stepNumber === currentStep;
            const isPending = stepNumber > completedSteps;

            return (
              <div
                key={index}
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border-2',
                  isCompleted && 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700',
                  isCurrent && !isCompleted && 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700',
                  isPending && 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                )}
                aria-label={`Step ${stepNumber}: ${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Pending'}`}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
            );
          })}
        </div>

        {/* Time Information */}
        {showTime && (estimatedTime || actualTime) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {estimatedTime && (
              <div className="space-y-1">
                <div className="text-gray-600 dark:text-gray-400">Estimated Time</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {estimatedTime}
                </div>
              </div>
            )}
            {actualTime && (
              <div className="space-y-1">
                <div className="text-gray-600 dark:text-gray-400">Actual Time</div>
                <div
                  className={cn(
                    'font-medium',
                    isOverdue
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-white'
                  )}
                >
                  {actualTime}
                  {isOverdue && (
                    <span className="ml-1 text-xs">(Overdue)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress Header */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Progress
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {completedSteps}/{totalSteps} steps
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
          aria-label={`Progress: ${Math.round(progressPercentage)}%`}
        />
      </div>

      {/* Progress Details */}
      <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
        {showPercentage && (
          <span>{Math.round(progressPercentage)}% complete</span>
        )}
        {showTime && estimatedTime && (
          <span>Est: {estimatedTime}</span>
        )}
      </div>

      {/* Current Step Indicator */}
      {currentStep && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Currently on step {currentStep} of {totalSteps}
        </div>
      )}
    </div>
  );
};

export default WorkflowProgress;
