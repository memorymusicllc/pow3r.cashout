import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Users, 
  MessageSquare, 
  Settings, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Pause
} from 'lucide-react';

export interface WorkflowCardProps {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused' | 'draft';
  progress: number;
  participants?: number;
  lastActivity?: string;
  priority?: 'low' | 'medium' | 'high';
  type: 'project' | 'message' | 'flow' | 'post';
  onView?: () => void;
  onEdit?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onComplete?: () => void;
}

const statusConfig = {
  active: { 
    icon: CheckCircle, 
    color: 'bg-green-500', 
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  completed: { 
    icon: CheckCircle, 
    color: 'bg-blue-500', 
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  paused: { 
    icon: Pause, 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  draft: { 
    icon: AlertCircle, 
    color: 'bg-gray-500', 
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
};

const typeConfig = {
  project: { icon: Settings, color: 'text-purple-600' },
  message: { icon: MessageSquare, color: 'text-blue-600' },
  flow: { icon: Settings, color: 'text-green-600' },
  post: { icon: MessageSquare, color: 'text-orange-600' }
};

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800' },
  medium: { color: 'bg-yellow-100 text-yellow-800' },
  high: { color: 'bg-red-100 text-red-800' }
};

export function WorkflowCard({
  id,
  title,
  description,
  status,
  progress,
  participants = 0,
  lastActivity,
  priority = 'medium',
  type,
  onView,
  onEdit,
  onPause,
  onResume,
  onComplete
}: WorkflowCardProps) {
  const statusStyle = statusConfig[status];
  const typeStyle = typeConfig[type];
  const priorityStyle = priorityConfig[priority];
  const StatusIcon = statusStyle.icon;
  const TypeIcon = typeStyle.icon;

  return (
    <Card className={`${statusStyle.bgColor} ${statusStyle.borderColor} border-2 hover:shadow-lg transition-all duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${statusStyle.bgColor}`}>
              <TypeIcon className={`h-5 w-5 ${typeStyle.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                {description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${priorityStyle.color} text-xs`}>
              {priority}
            </Badge>
            <div className={`p-1 rounded-full ${statusStyle.color}`}>
              <StatusIcon className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {participants > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{participants}</span>
              </div>
            )}
            {lastActivity && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{lastActivity}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {status === 'active' && onPause && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPause}
                className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            {status === 'paused' && onResume && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResume}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}
            {status === 'active' && onComplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onComplete}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-gray-600 hover:text-gray-800"
              >
                Edit
              </Button>
            )}
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onView}
                className="text-gray-600 hover:text-gray-800"
              >
                View
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
