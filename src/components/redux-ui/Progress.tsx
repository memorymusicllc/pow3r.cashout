/**
 * Redux UI Progress Component
 * Unbound progress bar with flexible styling and animation
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Redux UI
 * @tags progress, indicator, loading, ui
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  className?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';
