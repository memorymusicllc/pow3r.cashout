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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Clock, 
  Users, 
  TrendingUp,
  Settings,
  Send,
  Reply,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Star,
  Tag,
  MoreHorizontal,
  Bot,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

import { WorkflowCard } from './WorkflowCard';
import { WorkflowProgress } from './WorkflowProgress';
import { WorkflowActions } from './WorkflowActions';
import { WorkflowStatus } from './WorkflowStatus';
import { useMessageWorkflowStore } from '@/lib/stores/message-workflow.store';

export function MessageReviewWorkflow() {
  const {
    messages,
    currentMessage,
    selectedMessages,
    templates,
    rules,
    analytics,
    loading,
    error,
    fetchMessages,
    fetchMessage,
    sendMessage,
    updateMessage,
    deleteMessage,
    markAsRead,
    markAsUnread,
    archiveMessage,
    unarchiveMessage,
    bulkUpdate,
    bulkDelete,
    bulkArchive,
    bulkMarkAsRead,
    fetchTemplates,
    createTemplate,
    useTemplate,
    generateAutoResponse,
    processIncomingMessage,
    fetchAnalytics,
    selectMessage,
    deselectMessage,
    selectAllMessages,
    clearSelection,
    setCurrentMessage,
    setFilters,
    setSearchQuery,
    clearError
  } = useMessageWorkflowStore();

  const { toast } = useToast();
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('inbox');

  // Form state for new template
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'greeting' as 'greeting' | 'pricing' | 'availability' | 'shipping' | 'negotiation' | 'closing' | 'followup',
    platform: [] as string[],
    triggers: [] as string[]
  });

  // Form state for reply
  const [replyContent, setReplyContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    fetchMessages();
    fetchTemplates();
    fetchAnalytics();
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

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template name and content are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTemplate({
        ...newTemplate,
        isActive: true,
        createdBy: 'user-001' // This would come from auth context
      });

      toast({
        title: 'Success',
        description: 'Template created successfully',
      });

      setIsTemplateDialogOpen(false);
      setNewTemplate({
        name: '',
        content: '',
        category: 'greeting',
        platform: [],
        triggers: []
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create template',
        variant: 'destructive',
      });
    }
  };

  const handleSendReply = async () => {
    if (!currentMessage || !replyContent.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Reply content is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendMessage({
        leadId: currentMessage.leadId,
        platform: currentMessage.platform,
        sender: 'user-001', // This would come from auth context
        content: replyContent,
        timestamp: new Date().toISOString(),
        status: 'replied',
        priority: currentMessage.priority,
        type: 'other'
      });

      await updateMessage(currentMessage.id, {
        status: 'replied',
        manualResponse: replyContent,
        responseTime: Math.round((Date.now() - new Date(currentMessage.timestamp).getTime()) / (1000 * 60))
      });

      toast({
        title: 'Success',
        description: 'Reply sent successfully',
      });

      setIsReplyDialogOpen(false);
      setReplyContent('');
      setSelectedTemplate('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setReplyContent(template.content);
    setSelectedTemplate(templateId);
  };

  const handleGenerateAutoResponse = async () => {
    if (!currentMessage) return;

    try {
      const response = await generateAutoResponse(currentMessage.id);
      setReplyContent(response);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate auto response',
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

  const handlePlatformFilter = useCallback((platform: string) => {
    setSelectedPlatform(platform);
    setFilters({ platform: platform === 'all' ? undefined : platform });
  }, [setFilters]);

  const handleBulkAction = async (action: string) => {
    if (selectedMessages.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select messages first',
        variant: 'destructive',
      });
      return;
    }

    try {
      switch (action) {
        case 'markRead':
          await bulkMarkAsRead(selectedMessages);
          break;
        case 'archive':
          await bulkArchive(selectedMessages);
          break;
        case 'delete':
          await bulkDelete(selectedMessages);
          break;
      }
      
      clearSelection();
      toast({
        title: 'Success',
        description: `Bulk ${action} completed`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} messages`,
        variant: 'destructive',
      });
    }
  };

  const getMessageActions = (message: any) => ({
    onView: () => setCurrentMessage(message),
    onEdit: () => {
      setIsReplyDialogOpen(true);
    },
    onReply: () => {
      setCurrentMessage(message);
      setIsReplyDialogOpen(true);
    },
    onArchive: () => archiveMessage(message.id),
    onDelete: () => {
      if (confirm('Are you sure you want to delete this message?')) {
        deleteMessage(message.id);
      }
    }
  });

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchQuery || 
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || message.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || message.priority === selectedPriority;
    const matchesPlatform = selectedPlatform === 'all' || message.platform === selectedPlatform;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesPlatform;
  });

  const getStatusCounts = () => {
    return {
      unread: messages.filter(m => m.status === 'unread').length,
      read: messages.filter(m => m.status === 'read').length,
      replied: messages.filter(m => m.status === 'replied').length,
      archived: messages.filter(m => m.status === 'archived').length
    };
  };

  const statusCounts = getStatusCounts();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'offerup': return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'craigslist': return <MessageSquare className="h-4 w-4 text-orange-600" />;
      case 'email': return <Mail className="h-4 w-4 text-gray-600" />;
      case 'phone': return <Phone className="h-4 w-4 text-gray-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Message Center</h1>
          <p className="text-gray-600 mt-1">Review and respond to messages</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Manage Templates</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Message Templates</DialogTitle>
                <DialogDescription>
                  Create and manage response templates
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">Templates</TabsTrigger>
                  <TabsTrigger value="create">Create New</TabsTrigger>
                </TabsList>
                
                <TabsContent value="list" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                    {templates.map(template => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{template.name}</h3>
                            <Badge variant="secondary">{template.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.content}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              Used {template.usageCount} times • {template.successRate}% success
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUseTemplate(template.id)}
                            >
                              Use Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="create" className="space-y-4">
                  <div>
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="templateCategory">Category</Label>
                    <Select 
                      value={newTemplate.category} 
                      onValueChange={(value: any) => 
                        setNewTemplate(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greeting">Greeting</SelectItem>
                        <SelectItem value="pricing">Pricing</SelectItem>
                        <SelectItem value="availability">Availability</SelectItem>
                        <SelectItem value="shipping">Shipping</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="closing">Closing</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="templateContent">Content</Label>
                    <Textarea
                      id="templateContent"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter template content"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTemplate}>
                      Create Template
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.read}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Reply className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.replied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Archive className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.archived}</p>
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
                  placeholder="Search messages..."
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
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedPriority} onValueChange={handlePriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedPlatform} onValueChange={handlePlatformFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="offerup">OfferUp</SelectItem>
                  <SelectItem value="craigslist">Craigslist</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedMessages.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedMessages.length} message(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('markRead')}
                >
                  Mark as Read
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('archive')}
                >
                  Archive
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedPlatform !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'No messages to display'
              }
            </p>
          </div>
        ) : (
          filteredMessages.map(message => (
            <Card 
              key={message.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                message.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''
              } ${selectedMessages.includes(message.id) ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => {
                if (selectedMessages.includes(message.id)) {
                  deselectMessage(message.id);
                } else {
                  selectMessage(message.id);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox 
                        checked={selectedMessages.includes(message.id)}
                        onChange={() => {
                          if (selectedMessages.includes(message.id)) {
                            deselectMessage(message.id);
                          } else {
                            selectMessage(message.id);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(message.priority)}
                        {getPlatformIcon(message.platform)}
                        <span className="font-medium text-gray-900">{message.sender}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.platform}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-2 line-clamp-2">{message.content}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(message.timestamp).toLocaleString()}</span>
                      </span>
                      {message.responseTime && (
                        <span>Response: {message.responseTime}m</span>
                      )}
                      {message.sentiment && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            message.sentiment === 'positive' ? 'text-green-600 border-green-300' :
                            message.sentiment === 'negative' ? 'text-red-600 border-red-300' :
                            'text-gray-600 border-gray-300'
                          }`}
                        >
                          {message.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <WorkflowStatus status={message.status === 'replied' ? 'completed' : message.status === 'unread' ? 'active' : message.status === 'read' ? 'paused' : 'cancelled'} size="sm" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentMessage(message);
                        setIsReplyDialogOpen(true);
                      }}
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              {currentMessage && `Responding to ${currentMessage.sender} via ${currentMessage.platform}`}
            </DialogDescription>
          </DialogHeader>
          
          {currentMessage && (
            <div className="space-y-4">
              {/* Original Message */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{currentMessage.sender}</span>
                    <Badge variant="outline" className="text-xs">
                      {currentMessage.platform}
                    </Badge>
                  </div>
                  <p className="text-gray-700">{currentMessage.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(currentMessage.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              
              {/* Template Selection */}
              <div>
                <Label>Quick Templates</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {templates.map(template => (
                    <Button
                      key={template.id}
                      size="sm"
                      variant="outline"
                      onClick={() => handleUseTemplate(template.id)}
                      className={selectedTemplate === template.id ? 'bg-blue-50 border-blue-300' : ''}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Reply Content */}
              <div>
                <Label htmlFor="replyContent">Your Reply</Label>
                <Textarea
                  id="replyContent"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={4}
                />
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateAutoResponse}
                    className="flex items-center space-x-1"
                  >
                    <Bot className="h-4 w-4" />
                    <span>AI Generate</span>
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendReply} className="flex items-center space-x-1">
                    <Send className="h-4 w-4" />
                    <span>Send Reply</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
