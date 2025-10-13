import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Users,
  Target,
  TrendingUp
} from 'lucide-react';

export interface WorkflowProgressProps {
  totalSteps: number;
  completedSteps: number;
  activeStep?: number;
  skippedSteps?: number;
  errorSteps?: number;
  participants?: number;
  estimatedTime?: string;
  actualTime?: string;
  efficiency?: number;
  showDetails?: boolean;
  showMetrics?: boolean;
  className?: string;
}

export function WorkflowProgress({
  totalSteps,
  completedSteps,
  activeStep,
  skippedSteps = 0,
  errorSteps = 0,
  participants = 0,
  estimatedTime,
  actualTime,
  efficiency,
  showDetails = true,
  showMetrics = true,
  className = ''
}: WorkflowProgressProps) {
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const pendingSteps = totalSteps - completedSteps - skippedSteps - errorSteps;

  const getProgressColor = () => {
    if (errorSteps > 0) return 'bg-red-500';
    if (progressPercentage === 100) return 'bg-green-500';
    if (progressPercentage >= 75) return 'bg-blue-500';
    if (progressPercentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getEfficiencyColor = () => {
    if (!efficiency) return 'text-gray-600';
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 75) return 'text-blue-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        {/* Main Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Workflow Progress</h3>
            <Badge 
              variant="secondary" 
              className={`text-sm ${
                progressPercentage === 100 ? 'bg-green-100 text-green-800' :
                progressPercentage >= 75 ? 'bg-blue-100 text-blue-800' :
                progressPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-3 mb-2"
            style={{
              '--progress-background': getProgressColor()
            } as React.CSSProperties}
          />
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{completedSteps} of {totalSteps} steps completed</span>
            {activeStep && (
              <span>Currently on step {activeStep}</span>
            )}
          </div>
        </div>

        {/* Step Breakdown */}
        {showDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">{completedSteps}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Circle className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">{pendingSteps}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>
            
            {skippedSteps > 0 && (
              <div className="flex items-center space-x-2">
                <Circle className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{skippedSteps}</div>
                  <div className="text-xs text-gray-600">Skipped</div>
                </div>
              </div>
            )}
            
            {errorSteps > 0 && (
              <div className="flex items-center space-x-2">
                <Circle className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{errorSteps}</div>
                  <div className="text-xs text-gray-600">Errors</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metrics */}
        {showMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {participants > 0 && (
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{participants}</div>
                  <div className="text-xs text-gray-600">Participants</div>
                </div>
              </div>
            )}
            
            {estimatedTime && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {actualTime || estimatedTime}
                  </div>
                  <div className="text-xs text-gray-600">
                    {actualTime ? 'Actual Time' : 'Estimated Time'}
                  </div>
                </div>
              </div>
            )}
            
            {efficiency !== undefined && (
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <div>
                  <div className={`text-sm font-medium ${getEfficiencyColor()}`}>
                    {efficiency}%
                  </div>
                  <div className="text-xs text-gray-600">Efficiency</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
