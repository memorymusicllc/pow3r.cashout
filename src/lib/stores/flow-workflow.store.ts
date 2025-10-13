import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface FlowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'sms' | 'notification';
  title: string;
  description?: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  connections: {
    inputs: string[];
    outputs: string[];
  };
}

export interface FlowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: 'default' | 'success' | 'error' | 'conditional';
  label?: string;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  category: string;
  tags: string[];
  nodes: FlowNode[];
  connections: FlowConnection[];
  variables: Record<string, any>;
  settings: {
    autoStart: boolean;
    maxExecutions: number;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  statistics: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    lastExecution?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  nodes: FlowNode[];
  connections: FlowConnection[];
  variables: Record<string, any>;
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
}

export interface FlowExecution {
  id: string;
  flowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    nodeId?: string;
  }>;
}

export interface FlowFilters {
  status?: string;
  category?: string;
  tags?: string[];
  createdBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface FlowWorkflowState {
  // Flows
  flows: Flow[];
  currentFlow: Flow | null;
  flowTemplates: FlowTemplate[];
  
  // Executions
  executions: FlowExecution[];
  currentExecution: FlowExecution | null;
  
  // Editor state
  selectedNodes: string[];
  selectedConnections: string[];
  clipboard: {
    nodes: FlowNode[];
    connections: FlowConnection[];
  };
  
  // Filters and search
  filters: FlowFilters;
  searchQuery: string;
  
  // Loading states
  loading: boolean;
  saving: boolean;
  executing: boolean;
  testing: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchFlows: (filters?: FlowFilters) => Promise<void>;
  createFlow: (flow: Omit<Flow, 'id' | 'createdAt' | 'updatedAt' | 'statistics'>) => Promise<void>;
  updateFlow: (id: string, updates: Partial<Flow>) => Promise<void>;
  deleteFlow: (id: string) => Promise<void>;
  duplicateFlow: (id: string) => Promise<void>;
  
  // Flow management
  startFlow: (id: string) => Promise<void>;
  pauseFlow: (id: string) => Promise<void>;
  resumeFlow: (id: string) => Promise<void>;
  stopFlow: (id: string) => Promise<void>;
  
  // Templates
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<FlowTemplate, 'id' | 'usageCount' | 'createdAt'>) => Promise<void>;
  useTemplate: (templateId: string, flowData: Partial<Flow>) => Promise<void>;
  
  // Executions
  fetchExecutions: (flowId?: string) => Promise<void>;
  executeFlow: (flowId: string, input?: Record<string, any>) => Promise<void>;
  cancelExecution: (executionId: string) => Promise<void>;
  
  // Editor actions
  addNode: (node: FlowNode) => void;
  updateNode: (id: string, updates: Partial<FlowNode>) => void;
  deleteNode: (id: string) => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;
  
  addConnection: (connection: FlowConnection) => void;
  updateConnection: (id: string, updates: Partial<FlowConnection>) => void;
  deleteConnection: (id: string) => void;
  
  // Selection
  selectNode: (id: string) => void;
  deselectNode: (id: string) => void;
  selectConnection: (id: string) => void;
  deselectConnection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Clipboard
  copySelection: () => void;
  pasteFromClipboard: (position: { x: number; y: number }) => void;
  clearClipboard: () => void;
  
  // Testing
  testFlow: (flowId: string, input?: Record<string, any>) => Promise<void>;
  validateFlow: (flow: Flow) => { isValid: boolean; errors: string[] };
  
  // Selection
  setCurrentFlow: (flow: Flow | null) => void;
  setCurrentExecution: (execution: FlowExecution | null) => void;
  
  // Filters and search
  setFilters: (filters: Partial<FlowFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useFlowWorkflowStore = create<FlowWorkflowState>()(
  devtools(
    (set, get) => ({
      // Initial state
      flows: [],
      currentFlow: null,
      flowTemplates: [],
      executions: [],
      currentExecution: null,
      selectedNodes: [],
      selectedConnections: [],
      clipboard: { nodes: [], connections: [] },
      filters: {},
      searchQuery: '',
      loading: false,
      saving: false,
      executing: false,
      testing: false,
      error: null,

      // Fetch flows
      fetchFlows: async (filters) => {
        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (filters?.status) queryParams.append('status', filters.status);
          if (filters?.category) queryParams.append('category', filters.category);
          if (filters?.tags) queryParams.append('tags', filters.tags.join(','));
          if (filters?.createdBy) queryParams.append('createdBy', filters.createdBy);
          if (filters?.dateRange) {
            queryParams.append('startDate', filters.dateRange.start);
            queryParams.append('endDate', filters.dateRange.end);
          }

          const response = await fetch(`/api/flows?${queryParams.toString()}`);
          if (!response.ok) throw new Error('Failed to fetch flows');
          
          const data = await response.json();
          set({ flows: data.flows || [], loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch flows', loading: false });
        }
      },

      // Create flow
      createFlow: async (flowData) => {
        set({ saving: true, error: null });
        try {
          const response = await fetch('/api/flows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...flowData,
              statistics: {
                totalExecutions: 0,
                successfulExecutions: 0,
                failedExecutions: 0,
                averageExecutionTime: 0
              }
            })
          });
          
          if (!response.ok) throw new Error('Failed to create flow');
          
          const newFlow = await response.json();
          set(state => ({
            flows: [newFlow, ...state.flows],
            saving: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create flow', saving: false });
        }
      },

      // Update flow
      updateFlow: async (id, updates) => {
        set({ saving: true, error: null });
        try {
          const response = await fetch(`/api/flows/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) throw new Error('Failed to update flow');
          
          const updatedFlow = await response.json();
          set(state => ({
            flows: state.flows.map(f => f.id === id ? updatedFlow : f),
            currentFlow: state.currentFlow?.id === id ? updatedFlow : state.currentFlow,
            saving: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update flow', saving: false });
        }
      },

      // Delete flow
      deleteFlow: async (id) => {
        try {
          const response = await fetch(`/api/flows/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete flow');
          
          set(state => ({
            flows: state.flows.filter(f => f.id !== id),
            currentFlow: state.currentFlow?.id === id ? null : state.currentFlow
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete flow' });
        }
      },

      // Duplicate flow
      duplicateFlow: async (id) => {
        const flow = get().flows.find(f => f.id === id);
        if (!flow) return;

        const duplicatedFlow = {
          ...flow,
          name: `${flow.name} (Copy)`,
          status: 'draft' as const,
          statistics: {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageExecutionTime: 0
          }
        };

        await get().createFlow(duplicatedFlow);
      },

      // Flow management actions
      startFlow: async (id) => {
        await get().updateFlow(id, { status: 'active' });
      },

      pauseFlow: async (id) => {
        await get().updateFlow(id, { status: 'paused' });
      },

      resumeFlow: async (id) => {
        await get().updateFlow(id, { status: 'active' });
      },

      stopFlow: async (id) => {
        await get().updateFlow(id, { status: 'draft' });
      },

      // Templates
      fetchTemplates: async () => {
        try {
          const response = await fetch('/api/flow-templates');
          if (!response.ok) throw new Error('Failed to fetch templates');
          
          const data = await response.json();
          set({ flowTemplates: data.templates || [] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch templates' });
        }
      },

      createTemplate: async (templateData) => {
        try {
          const response = await fetch('/api/flow-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData)
          });
          
          if (!response.ok) throw new Error('Failed to create template');
          
          const newTemplate = await response.json();
          set(state => ({
            flowTemplates: [newTemplate, ...state.flowTemplates]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create template' });
        }
      },

      useTemplate: async (templateId, flowData) => {
        const template = get().flowTemplates.find(t => t.id === templateId);
        if (!template) return;

        const newFlow = {
          ...flowData,
          name: flowData.name || template.name,
          description: flowData.description || template.description,
          category: flowData.category || template.category,
          tags: [...(flowData.tags || []), ...template.tags],
          nodes: template.nodes,
          connections: template.connections,
          variables: template.variables,
          status: 'draft' as const,
          settings: flowData.settings || {
            autoStart: false,
            maxExecutions: 100,
            timeout: 300,
            retryAttempts: 3,
            retryDelay: 60
          },
          createdBy: 'user-001' // This would come from auth context
        };

        await get().createFlow(newFlow);
      },

      // Executions
      fetchExecutions: async (flowId) => {
        try {
          const queryParams = new URLSearchParams();
          if (flowId) queryParams.append('flowId', flowId);

          const response = await fetch(`/api/flow-executions?${queryParams.toString()}`);
          if (!response.ok) throw new Error('Failed to fetch executions');
          
          const data = await response.json();
          set({ executions: data.executions || [] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch executions' });
        }
      },

      executeFlow: async (flowId, input = {}) => {
        set({ executing: true, error: null });
        try {
          const response = await fetch(`/api/flows/${flowId}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input })
          });
          
          if (!response.ok) throw new Error('Failed to execute flow');
          
          const execution = await response.json();
          set(state => ({
            executions: [execution, ...state.executions],
            executing: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to execute flow', executing: false });
        }
      },

      cancelExecution: async (executionId) => {
        try {
          const response = await fetch(`/api/flow-executions/${executionId}/cancel`, {
            method: 'POST'
          });
          
          if (!response.ok) throw new Error('Failed to cancel execution');
          
          set(state => ({
            executions: state.executions.map(e => 
              e.id === executionId 
                ? { ...e, status: 'cancelled', endTime: new Date().toISOString() }
                : e
            )
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to cancel execution' });
        }
      },

      // Editor actions
      addNode: (node) => {
        const currentFlow = get().currentFlow;
        if (!currentFlow) return;

        const updatedFlow = {
          ...currentFlow,
          nodes: [...currentFlow.nodes, node]
        };

        set({ currentFlow: updatedFlow });
      },

      updateNode: (id, updates) => {
        const currentFlow = get().currentFlow;
        if (!currentFlow) return;

        const updatedFlow = {
          ...currentFlow,
          nodes: currentFlow.nodes.map(node => 
            node.id === id ? { ...node, ...updates } : node
          )
        };

        set({ currentFlow: updatedFlow });
      },

      deleteNode: (id) => {
        const currentFlow = get().currentFlow;
        if (!currentFlow) return;

        const updatedFlow = {
          ...currentFlow,
          nodes: currentFlow.nodes.filter(node => node.id !== id),
          connections: currentFlow.connections.filter(conn => 
            conn.source !== id && conn.target !== id
          )
        };

        set({ currentFlow: updatedFlow });
      },

      moveNode: (id, position) => {
        get().updateNode(id, { position });
      },

      addConnection: (connection) => {
        const currentFlow = get().currentFlow;
        if (!currentFlow) return;

        const updatedFlow = {
          ...currentFlow,
          connections: [...currentFlow.connections, connection]
        };

        set({ currentFlow: updatedFlow });
      },

      updateConnection: (id, updates) => {
        const currentFlow = get().currentFlow;
        if (!currentFlow) return;

        const updatedFlow = {
          ...currentFlow,
          connections: currentFlow.connections.map(conn => 
            conn.id === id ? { ...conn, ...updates } : conn
          )
        };

        set({ currentFlow: updatedFlow });
      },

      deleteConnection: (id) => {
        const currentFlow = get().currentFlow;
        if (!currentFlow) return;

        const updatedFlow = {
          ...currentFlow,
          connections: currentFlow.connections.filter(conn => conn.id !== id)
        };

        set({ currentFlow: updatedFlow });
      },

      // Selection
      selectNode: (id) => {
        set(state => ({
          selectedNodes: [...state.selectedNodes, id]
        }));
      },

      deselectNode: (id) => {
        set(state => ({
          selectedNodes: state.selectedNodes.filter(nodeId => nodeId !== id)
        }));
      },

      selectConnection: (id) => {
        set(state => ({
          selectedConnections: [...state.selectedConnections, id]
        }));
      },

      deselectConnection: (id) => {
        set(state => ({
          selectedConnections: state.selectedConnections.filter(connId => connId !== id)
        }));
      },

      selectAll: () => {
        const currentFlow = get().currentFlow;
        if (!currentFlow) return;

        set({
          selectedNodes: currentFlow.nodes.map(node => node.id),
          selectedConnections: currentFlow.connections.map(conn => conn.id)
        });
      },

      clearSelection: () => {
        set({ selectedNodes: [], selectedConnections: [] });
      },

      // Clipboard
      copySelection: () => {
        const { selectedNodes, selectedConnections, currentFlow } = get();
        if (!currentFlow) return;

        const nodes = currentFlow.nodes.filter(node => selectedNodes.includes(node.id));
        const connections = currentFlow.connections.filter(conn => 
          selectedConnections.includes(conn.id) &&
          selectedNodes.includes(conn.source) &&
          selectedNodes.includes(conn.target)
        );

        set({ clipboard: { nodes, connections } });
      },

      pasteFromClipboard: (position) => {
        const { clipboard, currentFlow } = get();
        if (!currentFlow || clipboard.nodes.length === 0) return;

        const offset = {
          x: position.x - clipboard.nodes[0].position.x,
          y: position.y - clipboard.nodes[0].position.y
        };

        const newNodes = clipboard.nodes.map(node => ({
          ...node,
          id: `${node.id}-${Date.now()}`,
          position: {
            x: node.position.x + offset.x,
            y: node.position.y + offset.y
          }
        }));

        const nodeIdMap = new Map(
          clipboard.nodes.map((node, index) => [node.id, newNodes[index].id])
        );

        const newConnections = clipboard.connections.map(conn => ({
          ...conn,
          id: `${conn.id}-${Date.now()}`,
          source: nodeIdMap.get(conn.source) || conn.source,
          target: nodeIdMap.get(conn.target) || conn.target
        }));

        const updatedFlow = {
          ...currentFlow,
          nodes: [...currentFlow.nodes, ...newNodes],
          connections: [...currentFlow.connections, ...newConnections]
        };

        set({ currentFlow: updatedFlow });
      },

      clearClipboard: () => {
        set({ clipboard: { nodes: [], connections: [] } });
      },

      // Testing
      testFlow: async (flowId, input = {}) => {
        set({ testing: true, error: null });
        try {
          const response = await fetch(`/api/flows/${flowId}/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input })
          });
          
          if (!response.ok) throw new Error('Failed to test flow');
          
          const result = await response.json();
          set({ testing: false });
          return result;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to test flow', testing: false });
          throw error;
        }
      },

      validateFlow: (flow) => {
        const errors: string[] = [];

        // Check for at least one trigger node
        const hasTrigger = flow.nodes.some(node => node.type === 'trigger');
        if (!hasTrigger) {
          errors.push('Flow must have at least one trigger node');
        }

        // Check for orphaned nodes
        const connectedNodes = new Set<string>();
        flow.connections.forEach(conn => {
          connectedNodes.add(conn.source);
          connectedNodes.add(conn.target);
        });

        flow.nodes.forEach(node => {
          if (node.type !== 'trigger' && !connectedNodes.has(node.id)) {
            errors.push(`Node "${node.title}" is not connected to the flow`);
          }
        });

        // Check for cycles (simplified check)
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const hasCycle = (nodeId: string): boolean => {
          if (recursionStack.has(nodeId)) return true;
          if (visited.has(nodeId)) return false;

          visited.add(nodeId);
          recursionStack.add(nodeId);

          const outgoingConnections = flow.connections.filter(conn => conn.source === nodeId);
          for (const conn of outgoingConnections) {
            if (hasCycle(conn.target)) return true;
          }

          recursionStack.delete(nodeId);
          return false;
        };

        flow.nodes.forEach(node => {
          if (hasCycle(node.id)) {
            errors.push(`Flow contains a cycle involving node "${node.title}"`);
          }
        });

        return {
          isValid: errors.length === 0,
          errors
        };
      },

      // Selection
      setCurrentFlow: (flow) => {
        set({ currentFlow: flow });
        if (flow) {
          get().fetchExecutions(flow.id);
        }
      },

      setCurrentExecution: (execution) => {
        set({ currentExecution: execution });
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
      name: 'flow-workflow-store'
    }
  )
);
