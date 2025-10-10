/**
 * AI Response System Component - Phase 2 Core
 * AI-powered auto-responses, template management, and escalation
 * 
 * @version 2.0.0
 * @date 2025-01-08
 */

import React, { useEffect, useState } from 'react'
import { useAIResponseStore } from '@/lib/stores/ai-response.store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bot, 
  MessageSquare, 
  Settings, 
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Zap,
  Target
} from 'lucide-react'

export function AIResponseSystem() {
  const {
    templates,
    rules,
    activeSessions,
    metrics,
    loading,
    processing,
    generating,
    fetchTemplates,
    fetchRules,
    createTemplate,
    createRule,
    generateResponse,
    startSession,
    endSession,
    escalateSession,
    refreshAll
  } = useAIResponseStore()

  const [activeTab, setActiveTab] = useState('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  useEffect(() => {
    refreshAll()
  }, [])

  const handleCreateTemplate = async () => {
    const newTemplate = {
      name: 'New Template',
      category: 'greeting' as const,
      triggerKeywords: ['hello', 'hi', 'interested'],
      responseTemplate: 'Hello! Thank you for your interest. I\'d be happy to help you with any questions.',
      variables: ['name', 'product'],
      tone: 'friendly' as const,
      priority: 1,
      isActive: true
    }
    await createTemplate(newTemplate)
  }

  const handleCreateRule = async () => {
    const newRule = {
      name: 'New Rule',
      conditions: {
        leadScore: [70, 100] as [number, number],
        messageLength: [10, 500] as [number, number],
        keywords: ['price', 'cost'],
        platform: ['facebook', 'offerup'],
        timeOfDay: ['morning', 'afternoon'],
        dayOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      actions: {
        templateId: selectedTemplate || '',
        delay: 30,
        escalation: false,
        followUp: true
      },
      isActive: true,
      priority: 1
    }
    await createRule(newRule)
  }

  const handleGenerateResponse = async (leadId: string, message: string) => {
    try {
      const context = {
        leadScore: 75,
        platform: 'facebook',
        timeOfDay: 'afternoon',
        dayOfWeek: 'monday'
      }
      const response = await generateResponse(leadId, message, context)
      console.log('Generated response:', response)
    } catch (error) {
      console.error('Failed to generate response:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'greeting': return 'default'
      case 'pricing': return 'secondary'
      case 'availability': return 'outline'
      case 'negotiation': return 'destructive'
      case 'meetup': return 'default'
      case 'followup': return 'secondary'
      default: return 'outline'
    }
  }

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'default'
      case 'friendly': return 'secondary'
      case 'casual': return 'outline'
      case 'urgent': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Response System</h2>
          <p className="text-muted-foreground">AI-powered auto-responses and intelligent escalation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshAll} disabled={loading}>
            <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Bot className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.successfulResponses} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalResponses > 0 ? Math.round((metrics.successfulResponses / metrics.totalResponses) * 100) : 0}%
            </div>
            <Progress 
              value={metrics.totalResponses > 0 ? (metrics.successfulResponses / metrics.totalResponses) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {metrics.escalatedResponses} escalated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.averageConfidence * 100)}%</div>
            <Progress value={metrics.averageConfidence * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active AI Sessions</CardTitle>
            <CardDescription>Real-time AI conversations in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Lead {session.leadId}</div>
                      <div className="text-sm text-muted-foreground">
                        {session.messages.length} messages • 
                        Confidence: {Math.round(session.aiConfidence * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => escalateSession(session.id, 'Manual escalation')}
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Escalate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => endSession(session.id, 'completed')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      End
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Response Templates</h3>
            <Button onClick={handleCreateTemplate}>
              <Bot className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>
                        {template.category} • {template.tone} tone • {template.variables.length} variables
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      <Badge variant={getToneColor(template.tone)}>
                        {template.tone}
                      </Badge>
                      <Badge variant={template.isActive ? 'default' : 'outline'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Template:</strong> {template.responseTemplate}
                    </div>
                    <div className="text-sm">
                      <strong>Keywords:</strong> {template.triggerKeywords.join(', ')}
                    </div>
                    <div className="text-sm">
                      <strong>Variables:</strong> {template.variables.join(', ')}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Used {template.usageCount} times • 
                        Success rate: {Math.round(template.successRate * 100)}%
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-1" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Response Rules</h3>
            <Button onClick={handleCreateRule}>
              <Zap className="w-4 h-4 mr-2" />
              New Rule
            </Button>
          </div>

          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                      <CardDescription>
                        Priority: {rule.priority} • 
                        Delay: {rule.actions.delay}s • 
                        {rule.actions.escalation ? 'Escalation enabled' : 'No escalation'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.isActive ? 'default' : 'outline'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant={rule.actions.escalation ? 'destructive' : 'secondary'}>
                        {rule.actions.escalation ? 'Escalates' : 'Auto-responds'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Conditions:</strong> Score {rule.conditions.leadScore[0]}-{rule.conditions.leadScore[1]}, 
                      {rule.conditions.messageLength[0]}-{rule.conditions.messageLength[1]} chars, 
                      Keywords: {rule.conditions.keywords.join(', ')}
                    </div>
                    <div className="text-sm">
                      <strong>Platforms:</strong> {rule.conditions.platform.join(', ')} • 
                      <strong>Time:</strong> {rule.conditions.timeOfDay.join(', ')} • 
                      <strong>Days:</strong> {rule.conditions.dayOfWeek.join(', ')}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Used {rule.usageCount} times • 
                        Success rate: {Math.round(rule.successRate * 100)}%
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Target className="w-4 h-4 mr-1" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI Sessions</h3>
            <Button onClick={() => handleGenerateResponse('lead-001', 'Hello, I\'m interested in your item')}>
              <Bot className="w-4 h-4 mr-2" />
              Test Response
            </Button>
          </div>

          <div className="grid gap-4">
            {activeSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Session {session.id}</CardTitle>
                      <CardDescription>
                        Lead {session.leadId} • 
                        Started: {new Date(session.startedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                          {Math.round(session.aiConfidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Messages:</strong> {session.messages.length} total
                    </div>
                    <div className="text-sm">
                      <strong>Last Activity:</strong> {new Date(session.lastActivity).toLocaleString()}
                    </div>
                    {session.escalationReason && (
                      <div className="text-sm text-destructive">
                        <strong>Escalation Reason:</strong> {session.escalationReason}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        AI Confidence: {Math.round(session.aiConfidence * 100)}%
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => escalateSession(session.id, 'Manual escalation')}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Escalate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => endSession(session.id, 'completed')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          End
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
