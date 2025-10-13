import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  startDate: string;
  dueDate?: string;
  completedDate?: string;
  participants: string[];
  tags: string[];
  category: string;
  estimatedHours?: number;
  actualHours?: number;
  budget?: number;
  spent?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface ProjectStep {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  order: number;
  estimatedHours?: number;
  actualHours?: number;
  assignedTo?: string;
  dueDate?: string;
  completedDate?: string;
  dependencies?: string[];
  deliverables?: string[];
  notes?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: Omit<ProjectStep, 'id' | 'projectId'>[];
  estimatedDuration: number;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
}

export interface ProjectFilters {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

interface ProjectWorkflowState {
  // Projects
  projects: Project[];
  currentProject: Project | null;
  projectTemplates: ProjectTemplate[];
  
  // Steps
  projectSteps: ProjectStep[];
  currentStep: ProjectStep | null;
  
  // Filters and search
  filters: ProjectFilters;
  searchQuery: string;
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchProjects: (filters?: ProjectFilters) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  
  // Project steps
  fetchProjectSteps: (projectId: string) => Promise<void>;
  createProjectStep: (step: Omit<ProjectStep, 'id'>) => Promise<void>;
  updateProjectStep: (id: string, updates: Partial<ProjectStep>) => Promise<void>;
  deleteProjectStep: (id: string) => Promise<void>;
  reorderSteps: (projectId: string, stepIds: string[]) => Promise<void>;
  
  // Templates
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<ProjectTemplate, 'id' | 'usageCount'>) => Promise<void>;
  useTemplate: (templateId: string, projectData: Partial<Project>) => Promise<void>;
  
  // Project management
  startProject: (id: string) => Promise<void>;
  pauseProject: (id: string) => Promise<void>;
  resumeProject: (id: string) => Promise<void>;
  completeProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  
  // Step management
  startStep: (id: string) => Promise<void>;
  completeStep: (id: string) => Promise<void>;
  skipStep: (id: string) => Promise<void>;
  
  // Filters and search
  setFilters: (filters: Partial<ProjectFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Selection
  setCurrentProject: (project: Project | null) => void;
  setCurrentStep: (step: ProjectStep | null) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useProjectWorkflowStore = create<ProjectWorkflowState>()(
  devtools(
    (set, get) => ({
      // Initial state
      projects: [],
      currentProject: null,
      projectTemplates: [],
      projectSteps: [],
      currentStep: null,
      filters: {},
      searchQuery: '',
      loading: false,
      creating: false,
      updating: false,
      deleting: false,
      error: null,

      // Fetch projects
      fetchProjects: async (filters) => {
        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (filters?.status) queryParams.append('status', filters.status);
          if (filters?.priority) queryParams.append('priority', filters.priority);
          if (filters?.category) queryParams.append('category', filters.category);
          if (filters?.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
          if (filters?.tags) queryParams.append('tags', filters.tags.join(','));
          if (filters?.dateRange) {
            queryParams.append('startDate', filters.dateRange.start);
            queryParams.append('endDate', filters.dateRange.end);
          }

          const response = await fetch(`/api/projects?${queryParams.toString()}`);
          if (!response.ok) throw new Error('Failed to fetch projects');
          
          const data = await response.json();
          set({ projects: data.projects || [], loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch projects', loading: false });
        }
      },

      // Create project
      createProject: async (projectData) => {
        set({ creating: true, error: null });
        try {
          const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
          });
          
          if (!response.ok) throw new Error('Failed to create project');
          
          const newProject = await response.json();
          set(state => ({
            projects: [newProject, ...state.projects],
            creating: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create project', creating: false });
        }
      },

      // Update project
      updateProject: async (id, updates) => {
        set({ updating: true, error: null });
        try {
          const response = await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) throw new Error('Failed to update project');
          
          const updatedProject = await response.json();
          set(state => ({
            projects: state.projects.map(p => p.id === id ? updatedProject : p),
            currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
            updating: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update project', updating: false });
        }
      },

      // Delete project
      deleteProject: async (id) => {
        set({ deleting: true, error: null });
        try {
          const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete project');
          
          set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
            deleting: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete project', deleting: false });
        }
      },

      // Duplicate project
      duplicateProject: async (id) => {
        const project = get().projects.find(p => p.id === id);
        if (!project) return;

        const duplicatedProject = {
          ...project,
          name: `${project.name} (Copy)`,
          status: 'draft' as const,
          progress: 0,
          startDate: new Date().toISOString(),
          dueDate: undefined,
          completedDate: undefined,
          actualHours: 0,
          spent: 0,
          createdBy: 'user-001',
          author: 'user-001',
          participants: [],
          tags: [],
          category: project.category || '',
          description: project.description || '',
          priority: project.priority || 'medium' as const,
          estimatedHours: project.estimatedHours || 0,
          budget: project.budget || 0
        };

        await get().createProject(duplicatedProject);
      },

      // Fetch project steps
      fetchProjectSteps: async (projectId) => {
        try {
          const response = await fetch(`/api/projects/${projectId}/steps`);
          if (!response.ok) throw new Error('Failed to fetch project steps');
          
          const data = await response.json();
          set({ projectSteps: data.steps || [] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch project steps' });
        }
      },

      // Create project step
      createProjectStep: async (stepData) => {
        try {
          const response = await fetch('/api/project-steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stepData)
          });
          
          if (!response.ok) throw new Error('Failed to create project step');
          
          const newStep = await response.json();
          set(state => ({
            projectSteps: [...state.projectSteps, newStep]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create project step' });
        }
      },

      // Update project step
      updateProjectStep: async (id, updates) => {
        try {
          const response = await fetch(`/api/project-steps/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) throw new Error('Failed to update project step');
          
          const updatedStep = await response.json();
          set(state => ({
            projectSteps: state.projectSteps.map(s => s.id === id ? updatedStep : s),
            currentStep: state.currentStep?.id === id ? updatedStep : state.currentStep
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update project step' });
        }
      },

      // Delete project step
      deleteProjectStep: async (id) => {
        try {
          const response = await fetch(`/api/project-steps/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete project step');
          
          set(state => ({
            projectSteps: state.projectSteps.filter(s => s.id !== id),
            currentStep: state.currentStep?.id === id ? null : state.currentStep
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete project step' });
        }
      },

      // Reorder steps
      reorderSteps: async (projectId, stepIds) => {
        try {
          const response = await fetch(`/api/projects/${projectId}/steps/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stepIds })
          });
          
          if (!response.ok) throw new Error('Failed to reorder steps');
          
          // Refresh steps
          await get().fetchProjectSteps(projectId);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to reorder steps' });
        }
      },

      // Fetch templates
      fetchTemplates: async () => {
        try {
          const response = await fetch('/api/project-templates');
          if (!response.ok) throw new Error('Failed to fetch templates');
          
          const data = await response.json();
          set({ projectTemplates: data.templates || [] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch templates' });
        }
      },

      // Create template
      createTemplate: async (templateData) => {
        try {
          const response = await fetch('/api/project-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData)
          });
          
          if (!response.ok) throw new Error('Failed to create template');
          
          const newTemplate = await response.json();
          set(state => ({
            projectTemplates: [newTemplate, ...state.projectTemplates]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create template' });
        }
      },

      // Use template
      useTemplate: async (templateId, projectData) => {
        const template = get().projectTemplates.find(t => t.id === templateId);
        if (!template) return;

        const newProject = {
          ...projectData,
          name: projectData.name || template.name,
          description: projectData.description || template.description,
          category: projectData.category || template.category,
          tags: [...(projectData.tags || []), ...template.tags],
          estimatedHours: template.estimatedDuration,
          status: 'draft' as const,
          progress: 0,
          startDate: new Date().toISOString(),
          participants: [],
          priority: 'medium' as const,
          createdBy: 'user-001'
        };

        // Create the project first
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProject)
        });
        
        if (!response.ok) throw new Error('Failed to create project');
        
        const createdProject = await response.json();
        
        // Create steps from template
        for (const stepTemplate of template.steps) {
          await get().createProjectStep({
            ...stepTemplate,
            projectId: createdProject.id
          });
        }
      },

      // Project management actions
      startProject: async (id) => {
        await get().updateProject(id, { 
          status: 'active', 
          startDate: new Date().toISOString() 
        });
      },

      pauseProject: async (id) => {
        await get().updateProject(id, { status: 'paused' });
      },

      resumeProject: async (id) => {
        await get().updateProject(id, { status: 'active' });
      },

      completeProject: async (id) => {
        await get().updateProject(id, { 
          status: 'completed', 
          progress: 100,
          completedDate: new Date().toISOString() 
        });
      },

      archiveProject: async (id) => {
        await get().updateProject(id, { status: 'archived' });
      },

      // Step management actions
      startStep: async (id) => {
        await get().updateProjectStep(id, { status: 'active' });
      },

      completeStep: async (id) => {
        await get().updateProjectStep(id, { 
          status: 'completed',
          completedDate: new Date().toISOString()
        });
      },

      skipStep: async (id) => {
        await get().updateProjectStep(id, { status: 'skipped' });
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

      // Selection
      setCurrentProject: (project) => {
        set({ currentProject: project });
        if (project) {
          get().fetchProjectSteps(project.id);
        }
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
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
      name: 'project-workflow-store'
    }
  )
);
