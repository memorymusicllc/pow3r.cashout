/**
 * Lead Monitoring Store - Phase 2 Core
 * Handles real-time lead tracking, scoring, and priority management
 * 
 * @version 2.0.0
 * @date 2025-01-08
 */

import { create } from 'zustand'
import { api } from '@/lib/api-client'

export interface Lead {
  id: string
  listingId: string
  platform: string
  contactInfo: {
    name: string
    email?: string
    phone?: string
    profileUrl?: string
  }
  message: string
  timestamp: string
  status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'sold' | 'lost'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  score: number
  tags: string[]
  notes: string[]
  followUpScheduled?: string
  lastActivity: string
  createdAt: string
  updatedAt: string
}

export interface LeadScoring {
  id: string
  criteria: {
    messageQuality: number
    responseTime: number
    profileCompleteness: number
    previousInteractions: number
    budgetIndication: number
  }
  weights: {
    messageQuality: number
    responseTime: number
    profileCompleteness: number
    previousInteractions: number
    budgetIndication: number
  }
  thresholds: {
    high: number
    medium: number
    low: number
  }
}

export interface NotificationRule {
  id: string
  name: string
  conditions: {
    priority: string[]
    status: string[]
    scoreRange: [number, number]
    platforms: string[]
  }
  actions: {
    email: boolean
    sms: boolean
    dashboard: boolean
    sound: boolean
  }
  isActive: boolean
}

export interface LeadMetrics {
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  conversionRate: number
  averageResponseTime: number
  highPriorityLeads: number
  platformBreakdown: Record<string, number>
  lastUpdated: string
}

interface LeadMonitoringState {
  // Lead data
  leads: Lead[]
  leadScoring: LeadScoring
  notificationRules: NotificationRule[]
  
  // Metrics
  metrics: LeadMetrics
  
  // Loading states
  loading: boolean
  processing: boolean
  notifying: boolean
  
  // Real-time updates
  isConnected: boolean
  lastUpdate: string
  
  // Actions
  fetchLeads: () => Promise<void>
  createLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity'>) => Promise<void>
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>
  deleteLead: (id: string) => Promise<void>
  
  // Lead scoring
  scoreLead: (lead: Lead) => number
  updateScoringCriteria: (criteria: Partial<LeadScoring>) => Promise<void>
  
  // Priority management
  updateLeadPriority: (id: string, priority: Lead['priority']) => Promise<void>
  bulkUpdatePriority: (leadIds: string[], priority: Lead['priority']) => Promise<void>
  
  // Status management
  updateLeadStatus: (id: string, status: Lead['status']) => Promise<void>
  bulkUpdateStatus: (leadIds: string[], status: Lead['status']) => Promise<void>
  
  // Notifications
  fetchNotificationRules: () => Promise<void>
  createNotificationRule: (rule: Omit<NotificationRule, 'id'>) => Promise<void>
  updateNotificationRule: (id: string, updates: Partial<NotificationRule>) => Promise<void>
  deleteNotificationRule: (id: string) => Promise<void>
  
  // Metrics
  fetchMetrics: () => Promise<void>
  refreshAll: () => Promise<void>
  
  // Real-time
  startRealTimeUpdates: () => void
  stopRealTimeUpdates: () => void
  
  // Helper functions
  checkNotificationRules: (lead: any) => void
}

export const useLeadMonitoringStore = create<LeadMonitoringState>((set, get) => ({
  // Initial state
  leads: [],
  leadScoring: {
    id: 'default',
    criteria: {
      messageQuality: 0,
      responseTime: 0,
      profileCompleteness: 0,
      previousInteractions: 0,
      budgetIndication: 0
    },
    weights: {
      messageQuality: 0.3,
      responseTime: 0.2,
      profileCompleteness: 0.2,
      previousInteractions: 0.15,
      budgetIndication: 0.15
    },
    thresholds: {
      high: 80,
      medium: 60,
      low: 40
    }
  },
  notificationRules: [],
  metrics: {
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
    averageResponseTime: 0,
    highPriorityLeads: 0,
    platformBreakdown: {},
    lastUpdated: new Date().toISOString()
  },
  loading: false,
  processing: false,
  notifying: false,
  isConnected: false,
  lastUpdate: new Date().toISOString(),

  // Lead management
  fetchLeads: async () => {
    set({ loading: true })
    try {
      const response = await api.getLeads('default-seller')
      set({ 
        leads: Array.isArray(response.data) ? response.data : [],
        loading: false,
        lastUpdate: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to fetch leads:', error)
      set({ loading: false })
    }
  },

  createLead: async (leadData) => {
    set({ processing: true })
    try {
      const newLead = {
        ...leadData,
        id: `lead-${Date.now()}`,
        score: get().scoreLead(leadData as Lead),
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const response = await api.createLead(newLead)
      set(state => ({
        leads: [...state.leads, response.data],
        processing: false
      }))
      
      // Check notification rules
      get().checkNotificationRules(response.data)
    } catch (error) {
      console.error('Failed to create lead:', error)
      set({ processing: false })
    }
  },

  updateLead: async (id, updates) => {
    try {
      const response = await api.updateLead(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      })
      
      set(state => ({
        leads: state.leads.map(lead => 
          lead.id === id ? { ...lead, ...response.data } : lead
        )
      }))
    } catch (error) {
      console.error('Failed to update lead:', error)
    }
  },

  deleteLead: async (id) => {
    try {
      await api.deleteLead(id)
      set(state => ({
        leads: state.leads.filter(lead => lead.id !== id)
      }))
    } catch (error) {
      console.error('Failed to delete lead:', error)
    }
  },

  // Lead scoring
  scoreLead: (lead) => {
    const { criteria, weights } = get().leadScoring
    
    // Calculate score based on criteria and weights
    const score = (
      criteria.messageQuality * weights.messageQuality +
      criteria.responseTime * weights.responseTime +
      criteria.profileCompleteness * weights.profileCompleteness +
      criteria.previousInteractions * weights.previousInteractions +
      criteria.budgetIndication * weights.budgetIndication
    ) * 100
    
    return Math.round(score)
  },

  updateScoringCriteria: async (criteria) => {
    try {
      const response = await api.updateLeadScoring(criteria)
      set({ leadScoring: { ...get().leadScoring, ...response.data } })
    } catch (error) {
      console.error('Failed to update scoring criteria:', error)
    }
  },

  // Priority management
  updateLeadPriority: async (id, priority) => {
    await get().updateLead(id, { priority })
  },

  bulkUpdatePriority: async (leadIds, priority) => {
    set({ processing: true })
    try {
      await Promise.all(
        leadIds.map(id => get().updateLeadPriority(id, priority))
      )
      set({ processing: false })
    } catch (error) {
      console.error('Failed to bulk update priority:', error)
      set({ processing: false })
    }
  },

  // Status management
  updateLeadStatus: async (id, status) => {
    await get().updateLead(id, { status })
  },

  bulkUpdateStatus: async (leadIds, status) => {
    set({ processing: true })
    try {
      await Promise.all(
        leadIds.map(id => get().updateLeadStatus(id, status))
      )
      set({ processing: false })
    } catch (error) {
      console.error('Failed to bulk update status:', error)
      set({ processing: false })
    }
  },

  // Notification management
  fetchNotificationRules: async () => {
    try {
      const response = await api.getNotificationRules()
      set({ notificationRules: Array.isArray(response.data) ? response.data : [] })
    } catch (error) {
      console.error('Failed to fetch notification rules:', error)
    }
  },

  createNotificationRule: async (ruleData) => {
    try {
      const newRule = {
        ...ruleData,
        id: `rule-${Date.now()}`
      }
      
      const response = await api.createNotificationRule(newRule)
      set(state => ({
        notificationRules: [...state.notificationRules, response.data]
      }))
    } catch (error) {
      console.error('Failed to create notification rule:', error)
    }
  },

  updateNotificationRule: async (id, updates) => {
    try {
      const response = await api.updateNotificationRule(id, updates)
      set(state => ({
        notificationRules: state.notificationRules.map(rule => 
          rule.id === id ? { ...rule, ...response.data } : rule
        )
      }))
    } catch (error) {
      console.error('Failed to update notification rule:', error)
    }
  },

  deleteNotificationRule: async (id) => {
    try {
      await api.deleteNotificationRule(id)
      set(state => ({
        notificationRules: state.notificationRules.filter(rule => rule.id !== id)
      }))
    } catch (error) {
      console.error('Failed to delete notification rule:', error)
    }
  },

  // Metrics
  fetchMetrics: async () => {
    try {
      const response = await api.getLeadMetrics()
      set({ metrics: response.data })
    } catch (error) {
      console.error('Failed to fetch lead metrics:', error)
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().fetchLeads(),
      get().fetchNotificationRules(),
      get().fetchMetrics()
    ])
  },

  // Real-time updates
  startRealTimeUpdates: () => {
    set({ isConnected: true })
    // Implement WebSocket or polling for real-time updates
    const interval = setInterval(() => {
      get().fetchLeads()
      get().fetchMetrics()
    }, 30000) // Update every 30 seconds
    
    // Store interval ID for cleanup
    ;(get() as any).updateInterval = interval
  },

  stopRealTimeUpdates: () => {
    set({ isConnected: false })
    const interval = (get() as any).updateInterval
    if (interval) {
      clearInterval(interval)
    }
  },

  // Helper function for notifications
  checkNotificationRules: (lead: any) => {
    const { notificationRules } = get()
    const activeRules = notificationRules.filter(rule => rule.isActive)
    
    for (const rule of activeRules) {
      const { conditions } = rule
      
      // Check if lead matches rule conditions
      const matchesPriority = conditions.priority.includes(lead.priority)
      const matchesStatus = conditions.status.includes(lead.status)
      const matchesScore = lead.score >= conditions.scoreRange[0] && 
                          lead.score <= conditions.scoreRange[1]
      const matchesPlatform = conditions.platforms.includes(lead.platform)
      
      if (matchesPriority && matchesStatus && matchesScore && matchesPlatform) {
        // Trigger notification actions
        if (rule.actions.dashboard) {
          // Show dashboard notification
          console.log(`Dashboard notification for lead ${lead.id}`)
        }
        if (rule.actions.email) {
          // Send email notification
          console.log(`Email notification for lead ${lead.id}`)
        }
        if (rule.actions.sms) {
          // Send SMS notification
          console.log(`SMS notification for lead ${lead.id}`)
        }
        if (rule.actions.sound) {
          // Play notification sound
          console.log(`Sound notification for lead ${lead.id}`)
        }
      }
    }
  }
}))
