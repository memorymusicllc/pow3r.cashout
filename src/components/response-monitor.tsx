/**
 * Response Monitor Component
 * Real-time monitoring and tracking of automated responses
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Features
 * @tags response, monitoring, tracking, automation, phase2
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  MessageSquare,
  Bot,
  Settings,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Users,
  TrendingUp,
  Filter,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAutoResponder } from '@/hooks/use-auto-responder';
import { dataGenerator } from '@/lib/utils/data-generator';
import { useDashboardStore } from '@/lib/stores/dashboard.store';

interface ResponseRule {
  id: string;
  trigger: string[];
  response: string;
  active: boolean;
  platform: string;
  priority: number;
}

interface MonitorStats {
  totalMessages: number;
  autoResponses: number;
  qualified: number;
  responseRate: number;
}

interface IncomingMessage {
  id: string;
  platform: string;
  sender: string;
  message: string;
  timestamp: string;
  responded: boolean;
  autoResponse?: string;
  qualified: boolean;
}

export function ResponseMonitor() {
  const {
    rules,
    loading,
    error,
    isActive,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    toggleSystem,
    refresh,
    stats
  } = useAutoResponder();

  const { metrics: dashboardData } = useDashboardStore();
  
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState('');
  const [newRuleResponse, setNewRuleResponse] = useState('');
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const { toast } = useToast();

  // Get real message data from data generator
  const messages = dataGenerator.generateLeads()
    .flatMap(lead => lead.inquiries.map(inquiry => ({
      id: inquiry.id,
      platform: lead.platform,
      sender: lead.contactInfo.name || lead.contactInfo.platformHandle,
      message: inquiry.message,
      timestamp: new Date(inquiry.timestamp).toLocaleString(),
      responded: inquiry.responded,
      autoResponse: inquiry.autoResponse,
      qualified: inquiry.qualified
    })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10); // Show latest 10

  const handleAddRule = async () => {
    if (!newRuleName.trim() || !newRuleTrigger.trim() || !newRuleResponse.trim()) {
      toast({
        title: 'Invalid Rule',
        description: 'Please provide name, trigger words, and response text',
        variant: 'destructive',
      });
      return;
    }

    const success = await createRule({
      name: newRuleName,
      triggers: newRuleTrigger,
      response: newRuleResponse,
      conditions: {
        timeWindow: 60,
        maxResponses: 1,
        skipIfReplied: true
      },
      platforms: ['facebook', 'offerup', 'craigslist']
    });

    if (success) {
      setNewRuleName('');
      setNewRuleTrigger('');
      setNewRuleResponse('');
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    await toggleRule(ruleId);
  };

  const handleDeleteRule = async (ruleId: string) => {
    await deleteRule(ruleId);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">Loading response monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6 space-y-4 sm:space-y-8">
      {/* Mobile-First Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Response Monitor
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Automated response management and lead qualification
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Auto-Responder</span>
              <Switch checked={isActive} onCheckedChange={toggleSystem} />
            </div>
            <Badge 
              variant={isActive ? "default" : "secondary"}
              className={`${isActive ? "bg-green-500" : "bg-red-500"} text-xs`}
            >
              {isActive ? (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 mr-1" />
                  Paused
                </>
              )}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          {
            title: 'Total Rules',
            value: stats.totalRules,
            change: `${stats.activeRules} active`,
            icon: MessageSquare,
            color: 'blue'
          },
          {
            title: 'Auto-Responses',
            value: stats.totalUsage,
            change: `${Math.round(stats.averageSuccessRate)}% success`, 
            icon: Bot,
            color: 'purple'
          },
          {
            title: 'Qualified Leads',
            value: messages.filter(m => m.qualified).length,
            change: '+2 today',
            icon: Users,
            color: 'green'
          },
          {
            title: 'Response Rate',
            value: `${Math.round(stats.averageSuccessRate)}%`,
            change: messages.filter(m => m.responded).length > 0 ? '+100%' : '0%',
            icon: TrendingUp,
            color: 'orange'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                    <p className={`text-xs flex items-center mt-1 ${
                      stat.color === 'green' ? 'text-green-500' : 'text-blue-500'
                    }`}>
                      <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{stat.change}</span>
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex-shrink-0`}>
                    <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Recent Messages - Mobile Optimized */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-sm sm:text-base">Recent Messages</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Latest inquiries and automated responses
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="space-y-3 sm:space-y-4 max-h-96 sm:max-h-none overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 sm:p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {message.platform}
                          </Badge>
                          <span className="font-medium text-xs sm:text-sm truncate">{message.sender}</span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">{message.timestamp}</span>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {message.qualified && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              Qualified
                            </Badge>
                          )}
                          {message.responded ? (
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                          ) : (
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="sm:hidden text-xs text-muted-foreground mb-2">
                        {message.timestamp}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">Message:</p>
                          <p className="text-xs sm:text-sm italic line-clamp-2">"{message.message}"</p>
                        </div>
                        
                        {message.autoResponse && (
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-blue-600">Auto-Response:</p>
                            <p className="text-xs bg-blue-50 dark:bg-blue-950/20 p-2 rounded border-l-2 border-blue-500 line-clamp-3">
                              {message.autoResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Rules - Mobile Optimized */}
        <div className="space-y-4 sm:space-y-6">
          <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span className="text-sm sm:text-base">Response Rules</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage auto-response triggers and templates
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-4">
              {/* Add New Rule Form */}
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Rule
                </h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Rule name (e.g., Availability Inquiry)"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Trigger words (comma separated)"
                    value={newRuleTrigger}
                    onChange={(e) => setNewRuleTrigger(e.target.value)}
                    className="text-sm"
                  />
                  <Textarea
                    placeholder="Auto-response message"
                    value={newRuleResponse}
                    onChange={(e) => setNewRuleResponse(e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                  <Button 
                    onClick={handleAddRule} 
                    size="sm" 
                    className="w-full"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </div>

              {/* Existing Rules */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {rules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No rules configured</p>
                  </div>
                ) : (
                  rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`p-3 rounded-lg border transition-all ${
                        rule.isActive 
                          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                          : 'bg-slate-50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => handleToggleRule(rule.id)}
                            disabled={loading}
                          />
                          <span className="font-medium text-xs sm:text-sm truncate">{rule.name}</span>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {rule.usageCount}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            disabled={loading}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Triggers: {rule.triggers?.join(', ') || 'No triggers'}
                        </p>
                        <p className="text-xs bg-white dark:bg-slate-900 p-2 rounded border line-clamp-2">
                          {rule.response}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Priority: {rule.priority}</span>
                          <span>Success: {Math.round(rule.successRate)}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
