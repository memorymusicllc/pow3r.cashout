/**
 * Auto Responder Manager Component
 * Configure and manage automated response rules and templates
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Features
 * @tags auto-responder, automation, templates, rules, phase2
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Target,
  MessageCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface AutoResponseTemplate {
  id: string;
  name: string;
  trigger: string;
  response: string;
  category: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryColors: Record<string, string> = {
  AVAILABILITY: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  PRICING: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  SPECIFICATIONS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  LOGISTICS: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  QUALIFICATION: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
};

const categoryIcons: Record<string, any> = {
  AVAILABILITY: CheckCircle2,
  PRICING: Target,
  SPECIFICATIONS: Settings,
  LOGISTICS: Clock,
  QUALIFICATION: MessageCircle,
};

export function AutoResponderManager() {
  const [templates, setTemplates] = useState<AutoResponseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AutoResponseTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger: '',
    response: '',
    category: 'AVAILABILITY',
    priority: 5,
    isActive: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/auto-responses');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load auto-response templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (template?: AutoResponseTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        trigger: template.trigger,
        response: template.response,
        category: template.category,
        priority: template.priority,
        isActive: template.isActive,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        trigger: '',
        response: '',
        category: 'AVAILABILITY',
        priority: 5,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const saveTemplate = async () => {
    try {
      const method = editingTemplate ? 'PUT' : 'POST';
      const url = editingTemplate ? `/api/auto-responses/${editingTemplate.id}` : '/api/auto-responses';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Template ${editingTemplate ? 'updated' : 'created'} successfully`,
        });
        loadTemplates();
        setIsDialogOpen(false);
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/auto-responses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Template deleted successfully',
        });
        loadTemplates();
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const toggleTemplate = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/auto-responses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        loadTemplates();
        toast({
          title: 'Success',
          description: `Template ${isActive ? 'activated' : 'deactivated'}`,
        });
      }
    } catch (error) {
      console.error('Error toggling template:', error);
    }
  };

  const generateResponse = async () => {
    if (!formData.trigger) {
      toast({
        title: 'Trigger Required',
        description: 'Please enter a trigger phrase first',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: formData.trigger,
          category: formData.category,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') return;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.status === 'completed') {
                  setFormData(prev => ({
                    ...prev,
                    response: parsed.result.response
                  }));
                  toast({
                    title: 'Success',
                    description: 'Response generated successfully!',
                  });
                  return;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate response',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">Loading auto-response templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Auto-Responder
          </h1>
          <p className="text-muted-foreground">
            Manage automated response templates for efficient lead handling
          </p>
        </div>
        <Button onClick={() => openDialog()} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-sm text-muted-foreground">Total Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{templates.filter(t => t.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Active Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Object.keys(templates.reduce((acc, t) => ({ ...acc, [t.category]: true }), {})).length}
                </p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((templates.filter(t => t.isActive).length / Math.max(templates.length, 1)) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Active Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template, index) => {
          const CategoryIcon = categoryIcons[template.category] || MessageCircle;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                        <CategoryIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={categoryColors[template.category]} variant="secondary">
                            {template.category.toLowerCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Priority {template.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={(checked) => toggleTemplate(template.id, checked)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Trigger</p>
                    <p className="text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded-md font-mono">
                      {template.trigger}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Response</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md line-clamp-4">
                      {template.response}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                      Updated {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(template)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'New Auto-Response Template'}
            </DialogTitle>
            <DialogDescription>
              Create automated responses to handle common inquiries efficiently
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Initial Availability Response"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABILITY">Availability</SelectItem>
                    <SelectItem value="PRICING">Pricing</SelectItem>
                    <SelectItem value="SPECIFICATIONS">Specifications</SelectItem>
                    <SelectItem value="LOGISTICS">Logistics</SelectItem>
                    <SelectItem value="QUALIFICATION">Qualification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Trigger Keywords/Phrases</label>
                <Input
                  value={formData.trigger}
                  onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
                  placeholder="e.g., is this still available, price, specs"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 5 }))}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Response Message</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateResponse}
                  disabled={isGenerating || !formData.trigger}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generate
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={formData.response}
                onChange={(e) => setFormData(prev => ({ ...prev, response: e.target.value }))}
                placeholder="Enter the automated response message..."
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <label className="text-sm font-medium">Active Template</label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate}>
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
