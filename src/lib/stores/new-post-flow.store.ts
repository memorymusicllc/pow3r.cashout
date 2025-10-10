/**
 * New Post Flow Store
 * Zustand store for managing the New Post Flow workflow with API integration
 * 
 * @version 1.0.0
 * @date 2025-01-08
 */

import { create } from 'zustand';
import { api } from '@/lib/api-client';

// Types
export interface PostItem {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  images: string[];
  platforms: string[];
  status: 'draft' | 'active' | 'sold' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  research?: {
    marketAnalysis: any;
    pricingStrategy: any;
    sellingStrategy: any;
  };
  content?: {
    title: string;
    description: string;
    hashtags: string[];
  };
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  platform: string;
  image: string;
  url: string;
  analysis: {
    demand: 'high' | 'medium' | 'low';
    competition: 'high' | 'medium' | 'low';
    pricing: 'above' | 'at' | 'below';
  };
}

export interface PostProject {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  content: {
    title: string;
    description: string;
    hashtags: string[];
  };
  images: string[];
  research?: any;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface GarageFilters {
  search: string;
  platform: string;
  category: string;
  status: string;
  type: string;
}

interface NewPostFlowState {
  // Current workflow state
  currentStep: number;
  itemName: string;
  selectedPlatforms: string[];
  selectedImages: string[];
  selectedContent: any;
  
  // Search and research
  searchResults: SearchResult[];
  currentProject: PostProject | null;
  
  // Garage management
  garageItems: PostItem[];
  garageFilters: GarageFilters;
  
  // Loading states
  loading: boolean;
  searching: boolean;
  generating: boolean;
  posting: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  setCurrentStep: (step: number) => void;
  setItemName: (name: string) => void;
  setSelectedPlatforms: (platforms: string[]) => void;
  setSelectedImages: (images: string[]) => void;
  setSelectedContent: (content: any) => void;
  
  // API Actions
  searchItem: (itemName: string) => Promise<void>;
  createProject: (data: any) => Promise<void>;
  runDeepResearch: (data: any) => Promise<void>;
  generateContent: (data: any) => Promise<void>;
  processImages: (data: any) => Promise<void>;
  customizeProject: (projectId: string, data: any) => Promise<void>;
  confirmPost: (data: any) => Promise<void>;
  
  // Garage Actions
  fetchGarageItems: (filters?: GarageFilters) => Promise<void>;
  setGarageFilters: (filters: Partial<GarageFilters>) => void;
  updateGarageItem: (id: string, data: any) => Promise<void>;
  deleteGarageItem: (id: string) => Promise<void>;
  
  // Utility Actions
  clearError: () => void;
  resetWorkflow: () => void;
}

export const useNewPostFlowStore = create<NewPostFlowState>((set, get) => ({
  // Initial State
  currentStep: 1,
  itemName: '',
  selectedPlatforms: [],
  selectedImages: [],
  selectedContent: null,
  searchResults: [],
  currentProject: null,
  garageItems: [],
  garageFilters: {
    search: '',
    platform: 'all',
    category: 'all',
    status: 'all',
    type: 'all'
  },
  loading: false,
  searching: false,
  generating: false,
  posting: false,
  error: null,

  // Basic Actions
  setCurrentStep: (step: number) => set({ currentStep: step }),
  setItemName: (name: string) => set({ itemName: name }),
  setSelectedPlatforms: (platforms: string[]) => set({ selectedPlatforms: platforms }),
  setSelectedImages: (images: string[]) => set({ selectedImages: images }),
  setSelectedContent: (content: any) => set({ selectedContent: content }),

  // API Actions
  searchItem: async (itemName: string) => {
    set({ searching: true, error: null });
    try {
      const response = await api.searchItem({ itemName });
      
      if (response.success && response.data) {
        set({ 
          searchResults: response.data.results || [],
          searching: false 
        });
      } else {
        throw new Error(response.error || 'Search failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      set({ 
        error: errorMessage, 
        searching: false 
      });
    }
  },

  createProject: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const response = await api.createPostProject(data);
      
      if (response.success && response.data) {
        set({ 
          currentProject: response.data,
          loading: false 
        });
      } else {
        throw new Error(response.error || 'Project creation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Project creation failed';
      set({ 
        error: errorMessage, 
        loading: false 
      });
    }
  },

  runDeepResearch: async (data: any) => {
    set({ generating: true, error: null });
    try {
      const response = await api.runDeepResearch(data);
      
      if (response.success && response.data) {
        const currentProject = get().currentProject;
        if (currentProject) {
          set({ 
            currentProject: {
              ...currentProject,
              research: response.data
            },
            generating: false 
          });
        }
      } else {
        throw new Error(response.error || 'Deep research failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Deep research failed';
      set({ 
        error: errorMessage, 
        generating: false 
      });
    }
  },

  generateContent: async (data: any) => {
    set({ generating: true, error: null });
    try {
      const response = await api.generateContent(data);
      
      if (response.success && response.data) {
        set({ 
          selectedContent: response.data,
          generating: false 
        });
      } else {
        throw new Error(response.error || 'Content generation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Content generation failed';
      set({ 
        error: errorMessage, 
        generating: false 
      });
    }
  },

  processImages: async (data: any) => {
    set({ generating: true, error: null });
    try {
      const response = await api.processImages(data);
      
      if (response.success && response.data) {
        set({ 
          selectedImages: response.data.images || [],
          generating: false 
        });
      } else {
        throw new Error(response.error || 'Image processing failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Image processing failed';
      set({ 
        error: errorMessage, 
        generating: false 
      });
    }
  },

  customizeProject: async (projectId: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const response = await api.customizeProject(projectId, data);
      
      if (response.success && response.data) {
        set({ 
          currentProject: response.data,
          loading: false 
        });
      } else {
        throw new Error(response.error || 'Project customization failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Project customization failed';
      set({ 
        error: errorMessage, 
        loading: false 
      });
    }
  },

  confirmPost: async (data: any) => {
    set({ posting: true, error: null });
    try {
      const response = await api.confirmPost(data);
      
      if (response.success && response.data) {
        // Add the new item to garage
        const newItem: PostItem = {
          id: response.data.id,
          name: get().itemName,
          description: get().selectedContent?.description || '',
          category: 'electronics',
          condition: 'excellent',
          price: 150,
          images: get().selectedImages,
          platforms: get().selectedPlatforms,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: get().selectedContent?.hashtags || [],
          content: get().selectedContent
        };
        
        set({ 
          garageItems: [newItem, ...get().garageItems],
          posting: false 
        });
        
        // Reset workflow
        get().resetWorkflow();
      } else {
        throw new Error(response.error || 'Post confirmation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Post confirmation failed';
      set({ 
        error: errorMessage, 
        posting: false 
      });
    }
  },

  // Garage Actions
  fetchGarageItems: async (filters?: GarageFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = filters || get().garageFilters;
      const response = await api.getGarageItems(currentFilters);
      
      if (response.success && response.data) {
        set({ 
          garageItems: response.data,
          loading: false 
        });
      } else {
        throw new Error(response.error || 'Failed to fetch garage items');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch garage items';
      set({ 
        error: errorMessage, 
        loading: false 
      });
    }
  },

  setGarageFilters: (filters: Partial<GarageFilters>) => {
    set({ 
      garageFilters: { ...get().garageFilters, ...filters }
    });
  },

  updateGarageItem: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const response = await api.updatePostProject(id, data);
      
      if (response.success) {
        // Update local state
        const updatedItems = get().garageItems.map(item => 
          item.id === id ? { ...item, ...data, updatedAt: new Date() } : item
        );
        set({ 
          garageItems: updatedItems,
          loading: false 
        });
      } else {
        throw new Error(response.error || 'Update failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      set({ 
        error: errorMessage, 
        loading: false 
      });
    }
  },

  deleteGarageItem: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.deletePostProject(id);
      
      if (response.success) {
        // Remove from local state
        const filteredItems = get().garageItems.filter(item => item.id !== id);
        set({ 
          garageItems: filteredItems,
          loading: false 
        });
      } else {
        throw new Error(response.error || 'Delete failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      set({ 
        error: errorMessage, 
        loading: false 
      });
    }
  },

  // Utility Actions
  clearError: () => set({ error: null }),
  
  resetWorkflow: () => set({
    currentStep: 1,
    itemName: '',
    selectedPlatforms: [],
    selectedImages: [],
    selectedContent: null,
    searchResults: [],
    currentProject: null,
    error: null
  })
}));
