import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Clock, 
  Target,
  TrendingUp,
  Settings,
  Play,
  Pause,
  CheckCircle,
  Archive,
  MoreHorizontal
} from 'lucide-react';

import { WorkflowCard } from './WorkflowCard';
import { WorkflowProgress } from './WorkflowProgress';
import { WorkflowActions } from './WorkflowActions';
import { WorkflowStatus } from './WorkflowStatus';
import { useProjectWorkflowStore } from '@/lib/stores/project-workflow.store';

export function ProjectManagementWorkflow() {
  const {
    projects,
    currentProject,
    projectTemplates,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    startProject,
    pauseProject,
    resumeProject,
    completeProject,
    archiveProject,
    fetchTemplates,
    useTemplate,
    setCurrentProject,
    setFilters,
    setSearchQuery,
    clearError
  } = useProjectWorkflowStore();

  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Form state for new project
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    tags: [] as string[],
    estimatedHours: 0,
    budget: 0,
    dueDate: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createProject({
        ...newProject,
        status: 'draft',
        progress: 0,
        startDate: new Date().toISOString(),
        participants: [],
        createdBy: 'user-001', // This would come from auth context
        metadata: {}
      });

      toast({
        title: 'Success',
        description: 'Project created successfully',
      });

      setIsCreateDialogOpen(false);
      setNewProject({
        name: '',
        description: '',
        priority: 'medium',
        category: '',
        tags: [],
        estimatedHours: 0,
        budget: 0,
        dueDate: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      await useTemplate(templateId, {
        name: newProject.name || 'New Project',
        description: newProject.description,
        priority: newProject.priority,
        category: newProject.category,
        tags: newProject.tags,
        estimatedHours: newProject.estimatedHours,
        budget: newProject.budget,
        dueDate: newProject.dueDate
      });

      toast({
        title: 'Success',
        description: 'Project created from template',
      });

      setIsTemplateDialogOpen(false);
      setNewProject({
        name: '',
        description: '',
        priority: 'medium',
        category: '',
        tags: [],
        estimatedHours: 0,
        budget: 0,
        dueDate: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project from template',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQueryLocal(query);
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleStatusFilter = useCallback((status: string) => {
    setSelectedStatus(status);
    setFilters({ status: status === 'all' ? undefined : status });
  }, [setFilters]);

  const handlePriorityFilter = useCallback((priority: string) => {
    setSelectedPriority(priority);
    setFilters({ priority: priority === 'all' ? undefined : priority });
  }, [setFilters]);

  const getProjectActions = (project: any) => ({
    onView: () => setCurrentProject(project),
    onEdit: () => {
      // Open edit dialog
      toast({
        title: 'Edit Project',
        description: 'Edit functionality coming soon',
      });
    },
    onPause: () => pauseProject(project.id),
    onResume: () => resumeProject(project.id),
    onComplete: () => completeProject(project.id),
    onArchive: () => archiveProject(project.id),
    onDelete: () => {
      if (confirm('Are you sure you want to delete this project?')) {
        deleteProject(project.id);
      }
    }
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusCounts = () => {
    return {
      active: projects.filter(p => p.status === 'active').length,
      paused: projects.filter(p => p.status === 'paused').length,
      completed: projects.filter(p => p.status === 'completed').length,
      draft: projects.filter(p => p.status === 'draft').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">Manage and track your projects</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>From Template</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Project from Template</DialogTitle>
                <DialogDescription>
                  Choose a template to quickly create a new project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectTemplates.map(template => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="secondary">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {template.steps.length} steps • {template.estimatedDuration}h
                          </span>
                          <Button 
                            size="sm" 
                            onClick={() => handleUseTemplate(template.id)}
                          >
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Set up a new project with basic information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={newProject.priority} 
                      onValueChange={(value: 'low' | 'medium' | 'high') => 
                        setNewProject(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newProject.category}
                      onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Enter category"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      value={newProject.estimatedHours}
                      onChange={(e) => setNewProject(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => setNewProject(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newProject.dueDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject}>
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pause className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Paused</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.paused}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Archive className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedPriority} onValueChange={handlePriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first project'
              }
            </p>
            {!searchQuery && selectedStatus === 'all' && selectedPriority === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        ) : (
          filteredProjects.map(project => (
            <WorkflowCard
              key={project.id}
              id={project.id}
              title={project.name}
              description={project.description}
              status={project.status === 'archived' ? 'paused' : project.status}
              progress={project.progress}
              participants={project.participants.length}
              lastActivity={new Date(project.updatedAt).toLocaleDateString()}
              priority={project.priority}
              type="project"
              {...getProjectActions(project)}
            />
          ))
        )}
      </div>

      {/* Current Project Details */}
      {currentProject && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{currentProject.name}</span>
                  <WorkflowStatus status={currentProject.status === 'archived' ? 'cancelled' : currentProject.status === 'draft' ? 'draft' : currentProject.status === 'active' ? 'active' : 'paused'} />
                </CardTitle>
                <CardDescription>{currentProject.description}</CardDescription>
              </div>
              <WorkflowActions
                status={currentProject.status === 'archived' ? 'paused' : currentProject.status === 'draft' ? 'draft' : currentProject.status === 'active' ? 'active' : 'paused'}
                onView={() => setCurrentProject(null)}
                onEdit={() => {
                  toast({
                    title: 'Edit Project',
                    description: 'Edit functionality coming soon',
                  });
                }}
                onPause={() => pauseProject(currentProject.id)}
                onResume={() => resumeProject(currentProject.id)}
                onArchive={() => archiveProject(currentProject.id)}
                onDelete={() => {
                  if (confirm('Are you sure you want to delete this project?')) {
                    deleteProject(currentProject.id);
                    setCurrentProject(null);
                  }
                }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <WorkflowProgress
              totalSteps={10} // This would come from project steps
              completedSteps={Math.round(currentProject.progress / 10)}
              participants={currentProject.participants.length}
              estimatedTime={`${currentProject.estimatedHours}h`}
              actualTime={currentProject.actualHours ? `${currentProject.actualHours}h` : undefined}
              efficiency={currentProject.estimatedHours && currentProject.actualHours 
                ? Math.round((currentProject.estimatedHours / currentProject.actualHours) * 100)
                : undefined
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
