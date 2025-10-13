import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export interface WorkflowStepProps {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'active' | 'pending' | 'skipped' | 'error';
  isOptional?: boolean;
  estimatedTime?: string;
  onActivate?: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
  onRetry?: () => void;
  showNavigation?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  children?: React.ReactNode;
}

const statusConfig = {
  completed: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconBg: 'bg-green-100'
  },
  active: { 
    icon: Circle, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100'
  },
  pending: { 
    icon: Circle, 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconBg: 'bg-gray-100'
  },
  skipped: { 
    icon: Circle, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconBg: 'bg-yellow-100'
  },
  error: { 
    icon: AlertCircle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-100'
  }
};

export function WorkflowStep({
  id,
  title,
  description,
  status,
  isOptional = false,
  estimatedTime,
  onActivate,
  onComplete,
  onSkip,
  onRetry,
  showNavigation = false,
  onNext,
  onPrevious,
  canGoNext = true,
  canGoPrevious = true,
  children
}: WorkflowStepProps) {
  const statusStyle = statusConfig[status];
  const StatusIcon = statusStyle.icon;

  const handleActivate = () => {
    if (status === 'pending' && onActivate) {
      onActivate();
    }
  };

  const handleComplete = () => {
    if (status === 'active' && onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const handleRetry = () => {
    if (status === 'error' && onRetry) {
      onRetry();
    }
  };

  return (
    <Card className={`${statusStyle.bgColor} ${statusStyle.borderColor} border-2 transition-all duration-200`}>
      <CardContent className="p-6">
        {/* Step Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${statusStyle.iconBg}`}>
              <StatusIcon className={`h-5 w-5 ${statusStyle.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <span>{title}</span>
                {isOptional && (
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                )}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {estimatedTime && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{estimatedTime}</span>
              </div>
            )}
            <Badge 
              variant={status === 'completed' ? 'default' : 'secondary'}
              className={`text-xs ${
                status === 'completed' ? 'bg-green-100 text-green-800' :
                status === 'active' ? 'bg-blue-100 text-blue-800' :
                status === 'error' ? 'bg-red-100 text-red-800' :
                status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {status}
            </Badge>
          </div>
        </div>

        {/* Step Content */}
        {children && (
          <div className="mb-4">
            {children}
          </div>
        )}

        {/* Step Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {status === 'pending' && onActivate && (
              <Button
                onClick={handleActivate}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Step
              </Button>
            )}
            
            {status === 'active' && onComplete && (
              <Button
                onClick={handleComplete}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Complete
              </Button>
            )}
            
            {status === 'error' && onRetry && (
              <Button
                onClick={handleRetry}
                size="sm"
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Retry
              </Button>
            )}
            
            {isOptional && status === 'pending' && onSkip && (
              <Button
                onClick={handleSkip}
                size="sm"
                variant="outline"
                className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              >
                Skip
              </Button>
            )}
          </div>

          {/* Navigation */}
          {showNavigation && (
            <div className="flex items-center space-x-2">
              {onPrevious && canGoPrevious && (
                <Button
                  onClick={onPrevious}
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
              )}
              
              {onNext && canGoNext && (
                <Button
                  onClick={onNext}
                  size="sm"
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
