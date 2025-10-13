import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal,
  Play,
  Pause,
  Square,
  RotateCcw,
  Copy,
  Share,
  Archive,
  Trash2,
  Settings,
  Eye,
  Edit,
  Download,
  Upload
} from 'lucide-react';

export interface WorkflowAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  separator?: boolean;
}

export interface WorkflowActionsProps {
  status: 'active' | 'paused' | 'completed' | 'draft' | 'error';
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  onDownload?: () => void;
  onUpload?: () => void;
  customActions?: WorkflowAction[];
  showPrimaryActions?: boolean;
  showSecondaryActions?: boolean;
  className?: string;
}

export function WorkflowActions({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  onRestart,
  onView,
  onEdit,
  onCopy,
  onShare,
  onArchive,
  onDelete,
  onSettings,
  onDownload,
  onUpload,
  customActions = [],
  showPrimaryActions = true,
  showSecondaryActions = true,
  className = ''
}: WorkflowActionsProps) {
  const getPrimaryActions = (): WorkflowAction[] => {
    const actions: WorkflowAction[] = [];

    switch (status) {
      case 'draft':
        if (onStart) actions.push({
          id: 'start',
          label: 'Start Workflow',
          icon: Play,
          onClick: onStart,
          variant: 'default'
        });
        break;
      
      case 'active':
        if (onPause) actions.push({
          id: 'pause',
          label: 'Pause',
          icon: Pause,
          onClick: onPause,
          variant: 'outline'
        });
        if (onStop) actions.push({
          id: 'stop',
          label: 'Stop',
          icon: Square,
          onClick: onStop,
          variant: 'destructive'
        });
        break;
      
      case 'paused':
        if (onResume) actions.push({
          id: 'resume',
          label: 'Resume',
          icon: Play,
          onClick: onResume,
          variant: 'default'
        });
        if (onStop) actions.push({
          id: 'stop',
          label: 'Stop',
          icon: Square,
          onClick: onStop,
          variant: 'destructive'
        });
        break;
      
      case 'completed':
        if (onRestart) actions.push({
          id: 'restart',
          label: 'Restart',
          icon: RotateCcw,
          onClick: onRestart,
          variant: 'outline'
        });
        break;
      
      case 'error':
        if (onRestart) actions.push({
          id: 'restart',
          label: 'Retry',
          icon: RotateCcw,
          onClick: onRestart,
          variant: 'default'
        });
        break;
    }

    return actions;
  };

  const getSecondaryActions = (): WorkflowAction[] => {
    const actions: WorkflowAction[] = [];

    if (onView) actions.push({
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: onView,
      variant: 'ghost'
    });

    if (onEdit) actions.push({
      id: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: onEdit,
      variant: 'ghost'
    });

    if (onCopy) actions.push({
      id: 'copy',
      label: 'Duplicate',
      icon: Copy,
      onClick: onCopy,
      variant: 'ghost'
    });

    if (onDownload) actions.push({
      id: 'download',
      label: 'Download',
      icon: Download,
      onClick: onDownload,
      variant: 'ghost'
    });

    if (onUpload) actions.push({
      id: 'upload',
      label: 'Upload',
      icon: Upload,
      onClick: onUpload,
      variant: 'ghost'
    });

    if (onShare) actions.push({
      id: 'share',
      label: 'Share',
      icon: Share,
      onClick: onShare,
      variant: 'ghost'
    });

    if (onSettings) actions.push({
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: onSettings,
      variant: 'ghost'
    });

    if (onArchive) actions.push({
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      onClick: onArchive,
      variant: 'ghost'
    });

    if (onDelete) actions.push({
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      variant: 'destructive'
    });

    return actions;
  };

  const primaryActions = getPrimaryActions();
  const secondaryActions = getSecondaryActions();
  const allActions = [...primaryActions, ...customActions, ...secondaryActions];

  if (allActions.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Primary Actions */}
      {showPrimaryActions && primaryActions.length > 0 && (
        <div className="flex items-center space-x-2">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant || 'default'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className="flex items-center space-x-1"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{action.label}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Secondary Actions Dropdown */}
      {showSecondaryActions && (secondaryActions.length > 0 || customActions.length > 0) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {secondaryActions.map((action, index) => {
              const Icon = action.icon;
              const item = (
                <DropdownMenuItem
                  key={action.id}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={action.variant === 'destructive' ? 'text-red-600' : ''}
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </DropdownMenuItem>
              );

              if (action.separator && index > 0) {
                return (
                  <React.Fragment key={action.id}>
                    <DropdownMenuSeparator />
                    {item}
                  </React.Fragment>
                );
              }

              return item;
            })}
            
            {customActions.length > 0 && secondaryActions.length > 0 && (
              <DropdownMenuSeparator />
            )}
            
            {customActions.map((action) => {
              const Icon = action.icon;
              return (
                <DropdownMenuItem
                  key={action.id}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={action.variant === 'destructive' ? 'text-red-600' : ''}
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
