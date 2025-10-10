/**
 * Lead Monitor Component - Phase 2 Core
 * Real-time lead tracking, scoring, and priority management
 * 
 * @version 2.0.0
 * @date 2025-01-08
 */

import React, { useEffect, useState } from 'react'
import { useLeadMonitoringStore } from '@/lib/stores/lead-monitoring.store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/redux-ui'
import { Button } from '@/components/redux-ui'
import { Badge } from '@/components/redux-ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/redux-ui'
import { Progress } from '@/components/redux-ui'
import { 
  Users, 
  Star, 
  Clock, 
  TrendingUp,
  Bell,
  Filter,
  Search,
  MessageSquare,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export function LeadMonitor() {
  const {
    leads,
    metrics,
    loading,
    processing,
    fetchLeads,
    updateLeadPriority,
    updateLeadStatus,
    bulkUpdatePriority,
    bulkUpdateStatus,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    refreshAll
  } = useLeadMonitoringStore()

  const [activeTab, setActiveTab] = useState('all')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [filterPriority, setFilterPriority] = useState<string>('all')

  useEffect(() => {
    refreshAll()
    startRealTimeUpdates()
    
    return () => {
      stopRealTimeUpdates()
    }
  }, [])

  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'all') return true
    if (activeTab === 'new') return lead.status === 'new'
    if (activeTab === 'qualified') return lead.status === 'qualified'
    if (activeTab === 'negotiating') return lead.status === 'negotiating'
    if (filterPriority !== 'all') return lead.priority === filterPriority
    return true
  })

  const handleBulkPriorityUpdate = async (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    if (selectedLeads.length > 0) {
      await bulkUpdatePriority(selectedLeads, priority)
      setSelectedLeads([])
    }
  }

  const handleBulkStatusUpdate = async (status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'sold' | 'lost') => {
    if (selectedLeads.length > 0) {
      await bulkUpdateStatus(selectedLeads, status)
      setSelectedLeads([])
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'default'
      case 'contacted': return 'secondary'
      case 'qualified': return 'default'
      case 'negotiating': return 'secondary'
      case 'sold': return 'default'
      case 'lost': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Monitor</h2>
          <p className="text-muted-foreground">Real-time lead tracking and management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshAll} disabled={loading}>
            <TrendingUp className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.newLeads} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.conversionRate * 100)}%</div>
            <Progress value={metrics.conversionRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}m</div>
            <p className="text-xs text-muted-foreground">
              {metrics.highPriorityLeads} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.conversionRate || 0)}%</div>
            <p className="text-xs text-muted-foreground">
              Average score
            </p>
          </CardContent>
        </Card>
        </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bulk Actions ({selectedLeads.length} selected)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkPriorityUpdate('high')}
              >
                Set High Priority
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkStatusUpdate('qualified')}
              >
                Mark Qualified
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkStatusUpdate('contacted')}
              >
                Mark Contacted
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedLeads([])}
              >
                Clear Selection
            </Button>
          </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({leads.length})</TabsTrigger>
          <TabsTrigger value="new">New ({leads.filter(l => l.status === 'new').length})</TabsTrigger>
          <TabsTrigger value="qualified">Qualified ({leads.filter(l => l.status === 'qualified').length})</TabsTrigger>
          <TabsTrigger value="negotiating">Negotiating ({leads.filter(l => l.status === 'negotiating').length})</TabsTrigger>
          <TabsTrigger value="sold">Sold ({leads.filter(l => l.status === 'sold').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className={`${selectedLeads.includes(lead.id) ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads([...selectedLeads, lead.id])
                          } else {
                            setSelectedLeads(selectedLeads.filter(id => id !== lead.id))
                          }
                        }}
                        className="rounded"
                      />
                      <div>
                        <CardTitle className="text-base">{lead.contactInfo.name}</CardTitle>
                        <CardDescription>
                          {lead.platform} • {new Date(lead.timestamp).toLocaleString()}
                        </CardDescription>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(lead.priority)}>
                      {lead.priority}
                    </Badge>
                      <Badge variant={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{lead.score}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Message:</strong> {lead.message}
                </div>
                
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {lead.contactInfo.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {lead.contactInfo.email}
                        </div>
                      )}
                      {lead.contactInfo.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {lead.contactInfo.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(lead.lastActivity).toLocaleString()}
                      </div>
                    </div>

                    {lead.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Tags:</span>
                        {lead.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                    </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateLeadPriority(lead.id, 'high')}
                        >
                          High Priority
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateLeadStatus(lead.id, 'qualified')}
                        >
                          Qualify
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateLeadStatus(lead.id, 'contacted')}
                        >
                          Contact
                        </Button>
                  </div>
                      <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                    <Button size="sm" variant="outline">
                          <Bell className="w-4 h-4 mr-1" />
                          Notify
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