import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Message {
  id: string;
  leadId: string;
  platform: string;
  sender: string;
  content: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'inquiry' | 'negotiation' | 'complaint' | 'question' | 'other';
  autoResponse?: string;
  manualResponse?: string;
  responseTime?: number; // in minutes
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags: string[];
  attachments?: string[];
  metadata?: Record<string, any>;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'greeting' | 'pricing' | 'availability' | 'shipping' | 'negotiation' | 'closing' | 'followup';
  platform: string[];
  triggers: string[];
  isActive: boolean;
  usageCount: number;
  successRate: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    platforms?: string[];
    keywords?: string[];
    timeWindow?: number; // in minutes
    maxResponses?: number;
    skipIfReplied?: boolean;
    priority?: string[];
    sentiment?: string[];
  };
  actions: {
    templateId?: string;
    autoResponse?: string;
    priority?: string;
    assignTo?: string;
    tags?: string[];
    delay?: number; // in minutes
  };
  isActive: boolean;
  priority: number;
  usageCount: number;
  successRate: number;
}

export interface MessageFilters {
  status?: string;
  priority?: string;
  platform?: string;
  type?: string;
  sentiment?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  assignedTo?: string;
}

export interface MessageAnalytics {
  totalMessages: number;
  unreadCount: number;
  responseRate: number;
  averageResponseTime: number;
  platformBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  sentimentBreakdown: Record<string, number>;
  topKeywords: Array<{ word: string; count: number }>;
  responseTimeTrend: Array<{ date: string; avgTime: number }>;
}

interface MessageWorkflowState {
  // Messages
  messages: Message[];
  currentMessage: Message | null;
  selectedMessages: string[];
  
  // Templates and rules
  templates: MessageTemplate[];
  rules: MessageRule[];
  
  // Analytics
  analytics: MessageAnalytics | null;
  
  // Filters and search
  filters: MessageFilters;
  searchQuery: string;
  
  // Loading states
  loading: boolean;
  sending: boolean;
  processing: boolean;
  generating: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchMessages: (filters?: MessageFilters) => Promise<void>;
  fetchMessage: (id: string) => Promise<void>;
  sendMessage: (message: Partial<Message>) => Promise<void>;
  updateMessage: (id: string, updates: Partial<Message>) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  archiveMessage: (id: string) => Promise<void>;
  unarchiveMessage: (id: string) => Promise<void>;
  
  // Bulk operations
  bulkUpdate: (ids: string[], updates: Partial<Message>) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkArchive: (ids: string[]) => Promise<void>;
  bulkMarkAsRead: (ids: string[]) => Promise<void>;
  
  // Templates
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<MessageTemplate, 'id' | 'usageCount' | 'successRate' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  useTemplate: (templateId: string, messageId: string, variables?: Record<string, string>) => Promise<void>;
  
  // Rules
  fetchRules: () => Promise<void>;
  createRule: (rule: Omit<MessageRule, 'id' | 'usageCount' | 'successRate'>) => Promise<void>;
  updateRule: (id: string, updates: Partial<MessageRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string) => Promise<void>;
  
  // Auto-response
  generateAutoResponse: (messageId: string) => Promise<string>;
  processIncomingMessage: (message: Partial<Message>) => Promise<void>;
  
  // Analytics
  fetchAnalytics: (dateRange?: { start: string; end: string }) => Promise<void>;
  
  // Selection
  selectMessage: (id: string) => void;
  deselectMessage: (id: string) => void;
  selectAllMessages: () => void;
  clearSelection: () => void;
  setCurrentMessage: (message: Message | null) => void;
  
  // Filters and search
  setFilters: (filters: Partial<MessageFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useMessageWorkflowStore = create<MessageWorkflowState>()(
  devtools(
    (set, get) => ({
      // Initial state
      messages: [],
      currentMessage: null,
      selectedMessages: [],
      templates: [],
      rules: [],
      analytics: null,
      filters: {},
      searchQuery: '',
      loading: false,
      sending: false,
      processing: false,
      generating: false,
      error: null,

      // Fetch messages
      fetchMessages: async (filters) => {
        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (filters?.status) queryParams.append('status', filters.status);
          if (filters?.priority) queryParams.append('priority', filters.priority);
          if (filters?.platform) queryParams.append('platform', filters.platform);
          if (filters?.type) queryParams.append('type', filters.type);
          if (filters?.sentiment) queryParams.append('sentiment', filters.sentiment);
          if (filters?.tags) queryParams.append('tags', filters.tags.join(','));
          if (filters?.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
          if (filters?.dateRange) {
            queryParams.append('startDate', filters.dateRange.start);
            queryParams.append('endDate', filters.dateRange.end);
          }

          const response = await fetch(`/api/messages?${queryParams.toString()}`);
          if (!response.ok) throw new Error('Failed to fetch messages');
          
          const data = await response.json();
          set({ messages: data.messages || [], loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch messages', loading: false });
        }
      },

      // Fetch single message
      fetchMessage: async (id) => {
        try {
          const response = await fetch(`/api/messages/${id}`);
          if (!response.ok) throw new Error('Failed to fetch message');
          
          const message = await response.json();
          set({ currentMessage: message });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch message' });
        }
      },

      // Send message
      sendMessage: async (messageData) => {
        set({ sending: true, error: null });
        try {
          const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
          });
          
          if (!response.ok) throw new Error('Failed to send message');
          
          const newMessage = await response.json();
          set(state => ({
            messages: [newMessage, ...state.messages],
            sending: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to send message', sending: false });
        }
      },

      // Update message
      updateMessage: async (id, updates) => {
        try {
          const response = await fetch(`/api/messages/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) throw new Error('Failed to update message');
          
          const updatedMessage = await response.json();
          set(state => ({
            messages: state.messages.map(m => m.id === id ? updatedMessage : m),
            currentMessage: state.currentMessage?.id === id ? updatedMessage : state.currentMessage
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update message' });
        }
      },

      // Delete message
      deleteMessage: async (id) => {
        try {
          const response = await fetch(`/api/messages/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete message');
          
          set(state => ({
            messages: state.messages.filter(m => m.id !== id),
            currentMessage: state.currentMessage?.id === id ? null : state.currentMessage,
            selectedMessages: state.selectedMessages.filter(msgId => msgId !== id)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete message' });
        }
      },

      // Mark as read
      markAsRead: async (id) => {
        await get().updateMessage(id, { status: 'read' });
      },

      // Mark as unread
      markAsUnread: async (id) => {
        await get().updateMessage(id, { status: 'unread' });
      },

      // Archive message
      archiveMessage: async (id) => {
        await get().updateMessage(id, { status: 'archived' });
      },

      // Unarchive message
      unarchiveMessage: async (id) => {
        await get().updateMessage(id, { status: 'unread' });
      },

      // Bulk operations
      bulkUpdate: async (ids, updates) => {
        set({ processing: true, error: null });
        try {
          const response = await fetch('/api/messages/bulk-update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, updates })
          });
          
          if (!response.ok) throw new Error('Failed to bulk update messages');
          
          // Refresh messages
          await get().fetchMessages(get().filters);
          set({ processing: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to bulk update messages', processing: false });
        }
      },

      bulkDelete: async (ids) => {
        set({ processing: true, error: null });
        try {
          const response = await fetch('/api/messages/bulk-delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
          });
          
          if (!response.ok) throw new Error('Failed to bulk delete messages');
          
          set(state => ({
            messages: state.messages.filter(m => !ids.includes(m.id)),
            selectedMessages: [],
            processing: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to bulk delete messages', processing: false });
        }
      },

      bulkArchive: async (ids) => {
        await get().bulkUpdate(ids, { status: 'archived' });
      },

      bulkMarkAsRead: async (ids) => {
        await get().bulkUpdate(ids, { status: 'read' });
      },

      // Templates
      fetchTemplates: async () => {
        try {
          const response = await fetch('/api/message-templates');
          if (!response.ok) throw new Error('Failed to fetch templates');
          
          const data = await response.json();
          set({ templates: data.templates || [] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch templates' });
        }
      },

      createTemplate: async (templateData) => {
        try {
          const response = await fetch('/api/message-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData)
          });
          
          if (!response.ok) throw new Error('Failed to create template');
          
          const newTemplate = await response.json();
          set(state => ({
            templates: [newTemplate, ...state.templates]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create template' });
        }
      },

      updateTemplate: async (id, updates) => {
        try {
          const response = await fetch(`/api/message-templates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) throw new Error('Failed to update template');
          
          const updatedTemplate = await response.json();
          set(state => ({
            templates: state.templates.map(t => t.id === id ? updatedTemplate : t)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update template' });
        }
      },

      deleteTemplate: async (id) => {
        try {
          const response = await fetch(`/api/message-templates/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete template');
          
          set(state => ({
            templates: state.templates.filter(t => t.id !== id)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete template' });
        }
      },

      useTemplate: async (templateId, messageId, variables = {}) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) return;

        let content = template.content;
        Object.entries(variables).forEach(([key, value]) => {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });

        await get().updateMessage(messageId, { manualResponse: content });
      },

      // Rules
      fetchRules: async () => {
        try {
          const response = await fetch('/api/message-rules');
          if (!response.ok) throw new Error('Failed to fetch rules');
          
          const data = await response.json();
          set({ rules: data.rules || [] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch rules' });
        }
      },

      createRule: async (ruleData) => {
        try {
          const response = await fetch('/api/message-rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ruleData)
          });
          
          if (!response.ok) throw new Error('Failed to create rule');
          
          const newRule = await response.json();
          set(state => ({
            rules: [newRule, ...state.rules]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create rule' });
        }
      },

      updateRule: async (id, updates) => {
        try {
          const response = await fetch(`/api/message-rules/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) throw new Error('Failed to update rule');
          
          const updatedRule = await response.json();
          set(state => ({
            rules: state.rules.map(r => r.id === id ? updatedRule : r)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update rule' });
        }
      },

      deleteRule: async (id) => {
        try {
          const response = await fetch(`/api/message-rules/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete rule');
          
          set(state => ({
            rules: state.rules.filter(r => r.id !== id)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete rule' });
        }
      },

      toggleRule: async (id) => {
        const rule = get().rules.find(r => r.id === id);
        if (!rule) return;

        await get().updateRule(id, { isActive: !rule.isActive });
      },

      // Auto-response
      generateAutoResponse: async (messageId) => {
        set({ generating: true, error: null });
        try {
          const response = await fetch(`/api/messages/${messageId}/auto-response`, {
            method: 'POST'
          });
          
          if (!response.ok) throw new Error('Failed to generate auto response');
          
          const data = await response.json();
          set({ generating: false });
          return data.response;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to generate auto response', generating: false });
          throw error;
        }
      },

      processIncomingMessage: async (messageData) => {
        set({ processing: true, error: null });
        try {
          const response = await fetch('/api/messages/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
          });
          
          if (!response.ok) throw new Error('Failed to process message');
          
          const processedMessage = await response.json();
          set(state => ({
            messages: [processedMessage, ...state.messages],
            processing: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to process message', processing: false });
        }
      },

      // Analytics
      fetchAnalytics: async (dateRange) => {
        try {
          const queryParams = new URLSearchParams();
          if (dateRange) {
            queryParams.append('startDate', dateRange.start);
            queryParams.append('endDate', dateRange.end);
          }

          const response = await fetch(`/api/messages/analytics?${queryParams.toString()}`);
          if (!response.ok) throw new Error('Failed to fetch analytics');
          
          const data = await response.json();
          set({ analytics: data.analytics });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch analytics' });
        }
      },

      // Selection
      selectMessage: (id) => {
        set(state => ({
          selectedMessages: [...state.selectedMessages, id]
        }));
      },

      deselectMessage: (id) => {
        set(state => ({
          selectedMessages: state.selectedMessages.filter(msgId => msgId !== id)
        }));
      },

      selectAllMessages: () => {
        set(state => ({
          selectedMessages: state.messages.map(m => m.id)
        }));
      },

      clearSelection: () => {
        set({ selectedMessages: [] });
      },

      setCurrentMessage: (message) => {
        set({ currentMessage: message });
      },

      // Filters and search
      setFilters: (filters) => {
        set(state => ({ filters: { ...state.filters, ...filters } }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      clearFilters: () => {
        set({ filters: {}, searchQuery: '' });
      },

      // Error handling
      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'message-workflow-store'
    }
  )
);
