import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Pause, 
  AlertCircle, 
  XCircle,
  Play,
  RotateCcw
} from 'lucide-react';

export interface WorkflowStatusProps {
  status: 'active' | 'paused' | 'completed' | 'draft' | 'error' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

const statusConfig = {
  active: {
    icon: Play,
    label: 'Active',
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600'
  },
  paused: {
    icon: Pause,
    label: 'Paused',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconColor: 'text-yellow-600'
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600'
  },
  draft: {
    icon: Clock,
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconColor: 'text-gray-600'
  },
  error: {
    icon: AlertCircle,
    label: 'Error',
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600'
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconColor: 'text-gray-600'
  }
};

const sizeConfig = {
  sm: {
    badge: 'text-xs px-2 py-1',
    icon: 'h-3 w-3'
  },
  md: {
    badge: 'text-sm px-2.5 py-1.5',
    icon: 'h-4 w-4'
  },
  lg: {
    badge: 'text-base px-3 py-2',
    icon: 'h-5 w-5'
  }
};

export function WorkflowStatus({
  status,
  size = 'md',
  showIcon = true,
  showText = true,
  className = ''
}: WorkflowStatusProps) {
  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];
  const StatusIcon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${sizeStyle.badge} ${className} flex items-center space-x-1`}
    >
      {showIcon && (
        <StatusIcon className={`${sizeStyle.icon} ${config.iconColor}`} />
      )}
      {showText && (
        <span>{config.label}</span>
      )}
    </Badge>
  );
}

// Additional status indicator component for more detailed status display
export interface WorkflowStatusIndicatorProps {
  status: 'active' | 'paused' | 'completed' | 'draft' | 'error' | 'cancelled';
  progress?: number;
  lastUpdated?: string;
  showProgress?: boolean;
  showLastUpdated?: boolean;
  className?: string;
}

export function WorkflowStatusIndicator({
  status,
  progress,
  lastUpdated,
  showProgress = false,
  showLastUpdated = false,
  className = ''
}: WorkflowStatusIndicatorProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Status Icon */}
      <div className={`p-2 rounded-full ${config.color.replace('text-', 'bg-').replace('-800', '-100')}`}>
        <StatusIcon className={`h-5 w-5 ${config.iconColor}`} />
      </div>
      
      {/* Status Details */}
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{config.label}</span>
          {showProgress && progress !== undefined && (
            <span className="text-sm text-gray-600">({progress}%)</span>
          )}
        </div>
        
        {showLastUpdated && lastUpdated && (
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated}
          </div>
        )}
      </div>
    </div>
  );
}
