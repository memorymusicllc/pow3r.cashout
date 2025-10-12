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
  Play, 
  Pause, 
  Square,
  Settings,
  Copy,
  Trash2,
  Save,
  TestTube,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Zap,
  Workflow,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';

import { WorkflowCard } from './WorkflowCard';
import { WorkflowProgress } from './WorkflowProgress';
import { WorkflowActions } from './WorkflowActions';
import { WorkflowStatus } from './WorkflowStatus';
import { useFlowWorkflowStore } from '@/lib/stores/flow-workflow.store';

// Simple flow canvas component (in a real app, you'd use a proper flow editor like React Flow)
const FlowCanvas: React.FC<{
  nodes: any[];
  connections: any[];
  onNodeClick: (nodeId: string) => void;
  onConnectionClick: (connectionId: string) => void;
  selectedNodes: string[];
  selectedConnections: string[];
}> = ({ nodes, connections, onNodeClick, onConnectionClick, selectedNodes, selectedConnections }) => {
  return (
    <div className="w-full h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative overflow-hidden">
      {nodes.map(node => (
        <div
          key={node.id}
          className={`absolute w-32 h-16 bg-white border-2 rounded-lg cursor-pointer flex items-center justify-center text-xs font-medium ${
            selectedNodes.includes(node.id) 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          style={{
            left: node.position.x,
            top: node.position.y
          }}
          onClick={() => onNodeClick(node.id)}
        >
          <div className="text-center">
            <div className="font-semibold">{node.title}</div>
            <div className="text-gray-500 text-xs">{node.type}</div>
          </div>
        </div>
      ))}
      
      {connections.map(connection => (
        <div
          key={connection.id}
          className={`absolute w-1 h-1 bg-gray-400 cursor-pointer ${
            selectedConnections.includes(connection.id) ? 'bg-blue-500' : ''
          }`}
          style={{
            left: (connection.sourcePosition?.x || 0) + 64,
            top: (connection.sourcePosition?.y || 0) + 32
          }}
          onClick={() => onConnectionClick(connection.id)}
        />
      ))}
      
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Workflow className="h-12 w-12 mx-auto mb-2" />
            <p>No nodes in flow</p>
            <p className="text-sm">Add nodes to start building your workflow</p>
          </div>
        </div>
      )}
    </div>
  );
};

export function FlowModificationWorkflow() {
  const {
    flows,
    currentFlow,
    flowTemplates,
    executions,
    selectedNodes,
    selectedConnections,
    loading,
    saving,
    executing,
    testing,
    error,
    fetchFlows,
    createFlow,
    updateFlow,
    deleteFlow,
    duplicateFlow,
    startFlow,
    pauseFlow,
    resumeFlow,
    stopFlow,
    fetchTemplates,
    useTemplate,
    fetchExecutions,
    executeFlow,
    testFlow,
    validateFlow,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    deleteConnection,
    selectNode,
    deselectNode,
    selectConnection,
    deselectConnection,
    selectAll,
    clearSelection,
    copySelection,
    pasteFromClipboard,
    setCurrentFlow,
    setFilters,
    setSearchQuery,
    clearError
  } = useFlowWorkflowStore();

  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isNodeDialogOpen, setIsNodeDialogOpen] = useState(false);
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('flows');

  // Form state for new flow
  const [newFlow, setNewFlow] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    autoStart: false,
    maxExecutions: 100,
    timeout: 300,
    retryAttempts: 3,
    retryDelay: 60
  });

  // Form state for new node
  const [newNode, setNewNode] = useState({
    type: 'action' as 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'sms' | 'notification',
    title: '',
    description: '',
    data: {} as Record<string, any>
  });

  useEffect(() => {
    fetchFlows();
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

  const handleCreateFlow = async () => {
    if (!newFlow.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Flow name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createFlow({
        ...newFlow,
        status: 'draft',
        nodes: [],
        connections: [],
        variables: {},
        settings: {
          autoStart: newFlow.autoStart,
          maxExecutions: newFlow.maxExecutions,
          timeout: newFlow.timeout,
          retryAttempts: newFlow.retryAttempts,
          retryDelay: newFlow.retryDelay
        },
        createdBy: 'user-001' // This would come from auth context
      });

      toast({
        title: 'Success',
        description: 'Flow created successfully',
      });

      setIsCreateDialogOpen(false);
      setNewFlow({
        name: '',
        description: '',
        category: '',
        tags: [],
        autoStart: false,
        maxExecutions: 100,
        timeout: 300,
        retryAttempts: 3,
        retryDelay: 60
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create flow',
        variant: 'destructive',
      });
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      await useTemplate(templateId, {
        name: newFlow.name || 'New Flow',
        description: newFlow.description,
        category: newFlow.category,
        tags: newFlow.tags,
        settings: {
          autoStart: newFlow.autoStart,
          maxExecutions: newFlow.maxExecutions,
          timeout: newFlow.timeout,
          retryAttempts: newFlow.retryAttempts,
          retryDelay: newFlow.retryDelay
        }
      });

      toast({
        title: 'Success',
        description: 'Flow created from template',
      });

      setIsTemplateDialogOpen(false);
      setNewFlow({
        name: '',
        description: '',
        category: '',
        tags: [],
        autoStart: false,
        maxExecutions: 100,
        timeout: 300,
        retryAttempts: 3,
        retryDelay: 60
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create flow from template',
        variant: 'destructive',
      });
    }
  };

  const handleAddNode = async () => {
    if (!currentFlow || !newNode.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Node title is required',
        variant: 'destructive',
      });
      return;
    }

    const node = {
      id: `node-${Date.now()}`,
      type: newNode.type,
      title: newNode.title,
      description: newNode.description,
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50
      },
      data: newNode.data,
      connections: { inputs: [], outputs: [] }
    };

    addNode(node);
    setIsNodeDialogOpen(false);
    setNewNode({
      type: 'action',
      title: '',
      description: '',
      data: {}
    });

    toast({
      title: 'Success',
      description: 'Node added to flow',
    });
  };

  const handleSaveFlow = async () => {
    if (!currentFlow) return;

    try {
      await updateFlow(currentFlow.id, currentFlow);
      toast({
        title: 'Success',
        description: 'Flow saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save flow',
        variant: 'destructive',
      });
    }
  };

  const handleTestFlow = async () => {
    if (!currentFlow) return;

    const validation = validateFlow(currentFlow);
    if (!validation.isValid) {
      toast({
        title: 'Validation Error',
        description: validation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    try {
      await testFlow(currentFlow.id, {});
      toast({
        title: 'Success',
        description: 'Flow test completed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Flow test failed',
        variant: 'destructive',
      });
    }
  };

  const handleExecuteFlow = async () => {
    if (!currentFlow) return;

    const validation = validateFlow(currentFlow);
    if (!validation.isValid) {
      toast({
        title: 'Validation Error',
        description: validation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    try {
      await executeFlow(currentFlow.id, {});
      toast({
        title: 'Success',
        description: 'Flow execution started',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to execute flow',
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

  const handleCategoryFilter = useCallback((category: string) => {
    setSelectedCategory(category);
    setFilters({ category: category === 'all' ? undefined : category });
  }, [setFilters]);

  const getFlowActions = (flow: any) => ({
    onView: () => setCurrentFlow(flow),
    onEdit: () => setCurrentFlow(flow),
    onPause: () => pauseFlow(flow.id),
    onResume: () => resumeFlow(flow.id),
    onStop: () => stopFlow(flow.id),
    onDelete: () => {
      if (confirm('Are you sure you want to delete this flow?')) {
        deleteFlow(flow.id);
      }
    }
  });

  const filteredFlows = flows.filter(flow => {
    const matchesSearch = !searchQuery || 
      flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || flow.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || flow.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusCounts = () => {
    return {
      active: flows.filter(f => f.status === 'active').length,
      paused: flows.filter(f => f.status === 'paused').length,
      draft: flows.filter(f => f.status === 'draft').length,
      archived: flows.filter(f => f.status === 'archived').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flow Builder</h1>
          <p className="text-gray-600 mt-1">Create and manage automated workflows</p>
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
                <DialogTitle>Create Flow from Template</DialogTitle>
                <DialogDescription>
                  Choose a template to quickly create a new flow
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flowTemplates.map(template => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="secondary">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {template.nodes.length} nodes • Used {template.usageCount} times
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
                <span>New Flow</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Flow</DialogTitle>
                <DialogDescription>
                  Set up a new automated workflow
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="flowName">Flow Name</Label>
                  <Input
                    id="flowName"
                    value={newFlow.name}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter flow name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="flowDescription">Description</Label>
                  <Textarea
                    id="flowDescription"
                    value={newFlow.description}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter flow description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newFlow.category}
                      onChange={(e) => setNewFlow(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Enter category"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxExecutions">Max Executions</Label>
                    <Input
                      id="maxExecutions"
                      type="number"
                      value={newFlow.maxExecutions}
                      onChange={(e) => setNewFlow(prev => ({ ...prev, maxExecutions: parseInt(e.target.value) || 100 }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFlow}>
                    Create Flow
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
              <Settings className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.archived}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flows">Flows</TabsTrigger>
          <TabsTrigger value="editor">Flow Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search flows..."
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
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="workflow">Workflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flows Grid */}
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
            ) : filteredFlows.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flows found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Get started by creating your first flow'
                  }
                </p>
                {!searchQuery && selectedStatus === 'all' && selectedCategory === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Flow
                  </Button>
                )}
              </div>
            ) : (
              filteredFlows.map(flow => (
                <WorkflowCard
                  key={flow.id}
                  id={flow.id}
                  title={flow.name}
                  description={flow.description}
                  status={flow.status === 'archived' ? 'paused' : flow.status}
                  progress={Math.round((flow.statistics.successfulExecutions / Math.max(flow.statistics.totalExecutions, 1)) * 100)}
                  participants={0}
                  lastActivity={new Date(flow.updatedAt).toLocaleDateString()}
                  priority="medium"
                  type="flow"
                  {...getFlowActions(flow)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          {currentFlow ? (
            <div className="space-y-6">
              {/* Flow Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{currentFlow.name}</span>
                        <WorkflowStatus status={currentFlow.status === 'archived' ? 'cancelled' : currentFlow.status === 'draft' ? 'draft' : currentFlow.status === 'active' ? 'active' : 'paused'} />
                      </CardTitle>
                      <CardDescription>{currentFlow.description}</CardDescription>
                    </div>
                    <WorkflowActions
                      status={currentFlow.status === 'archived' ? 'paused' : currentFlow.status === 'draft' ? 'draft' : currentFlow.status === 'active' ? 'active' : 'paused'}
                      onView={() => setCurrentFlow(null)}
                      onEdit={() => {
                        toast({
                          title: 'Edit Flow',
                          description: 'Edit functionality coming soon',
                        });
                      }}
                      onPause={() => pauseFlow(currentFlow.id)}
                      onResume={() => resumeFlow(currentFlow.id)}
                      onStop={() => stopFlow(currentFlow.id)}
                      onDelete={() => {
                        if (confirm('Are you sure you want to delete this flow?')) {
                          deleteFlow(currentFlow.id);
                          setCurrentFlow(null);
                        }
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Button onClick={handleSaveFlow} disabled={saving} className="flex items-center space-x-1">
                      <Save className="h-4 w-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </Button>
                    <Button onClick={handleTestFlow} disabled={testing} variant="outline" className="flex items-center space-x-1">
                      <TestTube className="h-4 w-4" />
                      <span>{testing ? 'Testing...' : 'Test'}</span>
                    </Button>
                    <Button onClick={handleExecuteFlow} disabled={executing} className="flex items-center space-x-1">
                      <Play className="h-4 w-4" />
                      <span>{executing ? 'Executing...' : 'Execute'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Flow Canvas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Flow Canvas</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Dialog open={isNodeDialogOpen} onOpenChange={setIsNodeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex items-center space-x-1">
                            <Plus className="h-4 w-4" />
                            <span>Add Node</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Node</DialogTitle>
                            <DialogDescription>
                              Add a new node to your flow
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="nodeType">Node Type</Label>
                              <Select 
                                value={newNode.type} 
                                onValueChange={(value: any) => 
                                  setNewNode(prev => ({ ...prev, type: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="trigger">Trigger</SelectItem>
                                  <SelectItem value="action">Action</SelectItem>
                                  <SelectItem value="condition">Condition</SelectItem>
                                  <SelectItem value="delay">Delay</SelectItem>
                                  <SelectItem value="webhook">Webhook</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="sms">SMS</SelectItem>
                                  <SelectItem value="notification">Notification</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="nodeTitle">Title</Label>
                              <Input
                                id="nodeTitle"
                                value={newNode.title}
                                onChange={(e) => setNewNode(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter node title"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="nodeDescription">Description</Label>
                              <Textarea
                                id="nodeDescription"
                                value={newNode.description}
                                onChange={(e) => setNewNode(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter node description"
                                rows={2}
                              />
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsNodeDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddNode}>
                                Add Node
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <FlowCanvas
                    nodes={currentFlow.nodes}
                    connections={currentFlow.connections}
                    onNodeClick={(nodeId) => {
                      if (selectedNodes.includes(nodeId)) {
                        deselectNode(nodeId);
                      } else {
                        selectNode(nodeId);
                      }
                    }}
                    onConnectionClick={(connectionId) => {
                      if (selectedConnections.includes(connectionId)) {
                        deselectConnection(connectionId);
                      } else {
                        selectConnection(connectionId);
                      }
                    }}
                    selectedNodes={selectedNodes}
                    selectedConnections={selectedConnections}
                  />
                </CardContent>
              </Card>

              {/* Flow Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Flow Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <WorkflowProgress
                    totalSteps={currentFlow.nodes.length}
                    completedSteps={currentFlow.statistics.successfulExecutions}
                    estimatedTime={`${currentFlow.settings.timeout}s`}
                    actualTime={currentFlow.statistics.averageExecutionTime ? `${currentFlow.statistics.averageExecutionTime}ms` : undefined}
                    efficiency={currentFlow.statistics.totalExecutions > 0 
                      ? Math.round((currentFlow.statistics.successfulExecutions / currentFlow.statistics.totalExecutions) * 100)
                      : undefined
                    }
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flow selected</h3>
              <p className="text-gray-600 mb-4">
                Select a flow from the list to start editing
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
