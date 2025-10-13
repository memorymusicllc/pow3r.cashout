import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'archived' | 'failed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  images: string[];
  scheduledAt?: string;
  publishedAt?: string;
  author: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface PostTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  platforms: string[];
  isPublic: boolean;
  usageCount: number;
  successRate: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostAnalytics {
  postId: string;
  platform: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  conversions: number;
  engagement: number;
  reach: number;
  impressions: number;
  lastUpdated: string;
}

export interface PostSchedule {
  id: string;
  postId: string;
  platform: string;
  scheduledAt: string;
  status: 'pending' | 'published' | 'failed' | 'cancelled';
  publishedAt?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface PostFilters {
  status?: string;
  priority?: string;
  category?: string;
  platform?: string;
  tags?: string[];
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface PostWorkflowState {
  // Posts
  posts: Post[];
  currentPost: Post | null;
  postTemplates: PostTemplate[];
  
  // Analytics
  analytics: Record<string, PostAnalytics>;
  
  // Scheduling
  schedules: PostSchedule[];
  
  // Filters and search
  filters: PostFilters;
  searchQuery: string;
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  publishing: boolean;
  scheduling: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchPosts: (filters?: PostFilters) => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  duplicatePost: (id: string) => Promise<void>;
  
  // Post management
  publishPost: (id: string, platforms?: string[]) => Promise<void>;
  schedulePost: (id: string, scheduledAt: string, platforms?: string[]) => Promise<void>;
  archivePost: (id: string) => Promise<void>;
  unarchivePost: (id: string) => Promise<void>;
  
  // Templates
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<PostTemplate, 'id' | 'usageCount' | 'successRate' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<PostTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  useTemplate: (templateId: string, postData: Partial<Post>) => Promise<void>;
  
  // Analytics
  fetchAnalytics: (postId?: string) => Promise<void>;
  updateAnalytics: (postId: string, platform: string, analytics: Partial<PostAnalytics>) => Promise<void>;
  
  // Scheduling
  fetchSchedules: (postId?: string) => Promise<void>;
  cancelSchedule: (scheduleId: string) => Promise<void>;
  reschedulePost: (scheduleId: string, newScheduledAt: string) => Promise<void>;
  
  // Bulk operations
  bulkPublish: (postIds: string[], platforms?: string[]) => Promise<void>;
  bulkSchedule: (postIds: string[], scheduledAt: string, platforms?: string[]) => Promise<void>;
  bulkArchive: (postIds: string[]) => Promise<void>;
  bulkDelete: (postIds: string[]) => Promise<void>;
  
  // Selection
  setCurrentPost: (post: Post | null) => void;
  
  // Filters and search
  setFilters: (filters: Partial<PostFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePostWorkflowStore = create<PostWorkflowState>()(
  devtools(
    (set, get) => ({
      // Initial state
      posts: [],
      currentPost: null,
      postTemplates: [],
      analytics: {},
      schedules: [],
      filters: {},
      searchQuery: '',
      loading: false,
      creating: false,
      updating: false,
      deleting: false,
      publishing: false,
      scheduling: false,
      error: null,

      // Fetch posts
      fetchPosts: async (filters) => {
        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (filters?.status) queryParams.append('status', filters.status);
          if (filters?.priority) queryParams.append('priority', filters.priority);
          if (filters?.category) queryParams.append('category', filters.category);
          if (filters?.platform) queryParams.append('platform', filters.platform);
          if (filters?.tags) queryParams.append('tags', filters.tags.join(','));
          if (filters?.author) queryParams.append('author', filters.author);
          if (filters?.dateRange) {
            queryParams.append('startDate', filters.dateRange.start);
            queryParams.append('endDate', filters.dateRange.end);
          }

          const response = await fetch(`/api/posts?${queryParams.toString()}`);
          if (!response.ok) throw new Error('Failed to fetch posts');
          
          const data = await response.json();
          set({ posts: data.posts || [], loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch posts', loading: false });
        }
      },

      // Fetch single post
      fetchPost: async (id) => {
        try {
          const response = await fetch(`/api/posts/${id}`);
          if (!response.ok) throw new Error('Failed to fetch post');
          
          const post = await response.json();
          set({ currentPost: post });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch post' });
        }
      },

      // Create post
      createPost: async (postData) => {
        set({ creating: true, error: null });
        try {
          const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
          });
          
          if (!response.ok) throw new Error('Failed to create post');
          
          const newPost = await response.json();
          set(state => ({
            posts: [newPost, ...state.posts],
            creating: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create post', creating: false });
        }
      },

      // Update post
      updatePost: async (id, updates) => {
        set({ updating: true, error: null });
        try {
          const response = await fetch(`/api/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) throw new Error('Failed to update post');
          
          const updatedPost = await response.json();
          set(state => ({
            posts: state.posts.map(p => p.id === id ? updatedPost : p),
            currentPost: state.currentPost?.id === id ? updatedPost : state.currentPost,
            updating: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update post', updating: false });
        }
      },

      // Delete post
      deletePost: async (id) => {
        set({ deleting: true, error: null });
        try {
          const response = await fetch(`/api/posts/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete post');
          
          set(state => ({
            posts: state.posts.filter(p => p.id !== id),
            currentPost: state.currentPost?.id === id ? null : state.currentPost,
            deleting: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete post', deleting: false });
        }
      },

      // Duplicate post
      duplicatePost: async (id) => {
        const post = get().posts.find(p => p.id === id);
        if (!post) return;

        const duplicatedPost = {
          ...post,
          title: `${post.title} (Copy)`,
          status: 'draft' as const,
          scheduledAt: undefined,
          publishedAt: undefined
        };

        await get().createPost(duplicatedPost);
      },

      // Publish post
      publishPost: async (id, platforms) => {
        set({ publishing: true, error: null });
        try {
          const response = await fetch(`/api/posts/${id}/publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platforms })
          });
          
          if (!response.ok) throw new Error('Failed to publish post');
          
          const updatedPost = await response.json();
          set(state => ({
            posts: state.posts.map(p => p.id === id ? updatedPost : p),
            currentPost: state.currentPost?.id === id ? updatedPost : state.currentPost,
            publishing: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to publish post', publishing: false });
        }
      },

      // Schedule post
      schedulePost: async (id, scheduledAt, platforms) => {
        set({ scheduling: true, error: null });
        try {
          const response = await fetch(`/api/posts/${id}/schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scheduledAt, platforms })
          });
          
          if (!response.ok) throw new Error('Failed to schedule post');
          
          const updatedPost = await response.json();
          set(state => ({
            posts: state.posts.map(p => p.id === id ? updatedPost : p),
            currentPost: state.currentPost?.id === id ? updatedPost : state.currentPost,
            scheduling: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to schedule post', scheduling: false });
        }
      },

      // Archive post
      archivePost: async (id) => {
        await get().updatePost(id, { status: 'archived' });
      },

      // Unarchive post
      unarchivePost: async (id) => {
        await get().updatePost(id, { status: 'draft' });
      },

      // Templates
      fetchTemplates: async () => {
        try {
          const response = await fetch('/api/post-templates');
          if (!response.ok) throw new Error('Failed to fetch templates');
          
          const data = await response.json();
          set({ postTemplates: data.templates || [] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch templates' });
        }
      },

      createTemplate: async (templateData) => {
        try {
          const response = await fetch('/api/post-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData)
          });
          
          if (!response.ok) throw new Error('Failed to create template');
          
          const newTemplate = await response.json();
          set(state => ({
            postTemplates: [newTemplate, ...state.postTemplates]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create template' });
        }
      },

      updateTemplate: async (id, updates) => {
        try {
          const response = await fetch(`/api/post-templates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) throw new Error('Failed to update template');
          
          const updatedTemplate = await response.json();
          set(state => ({
            postTemplates: state.postTemplates.map(t => t.id === id ? updatedTemplate : t)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update template' });
        }
      },

      deleteTemplate: async (id) => {
        try {
          const response = await fetch(`/api/post-templates/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete template');
          
          set(state => ({
            postTemplates: state.postTemplates.filter(t => t.id !== id)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete template' });
        }
      },

      useTemplate: async (templateId, postData) => {
        const template = get().postTemplates.find(t => t.id === templateId);
        if (!template) return;

        const newPost = {
          ...postData,
          title: postData.title || template.name,
          description: postData.description || template.description,
          content: template.content,
          category: postData.category || template.category,
          tags: [...(postData.tags || []), ...template.tags],
          platforms: template.platforms,
          status: 'draft' as const,
          priority: 'medium' as const,
          images: [],
          author: 'user-001', // This would come from auth context
          createdBy: 'user-001' // This would come from auth context
        };

        await get().createPost(newPost);
      },

      // Analytics
      fetchAnalytics: async (postId) => {
        try {
          const queryParams = new URLSearchParams();
          if (postId) queryParams.append('postId', postId);

          const response = await fetch(`/api/posts/analytics?${queryParams.toString()}`);
          if (!response.ok) throw new Error('Failed to fetch analytics');
          
          const data = await response.json();
          set({ analytics: data.analytics || {} });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch analytics' });
        }
      },

      updateAnalytics: async (postId, platform, analytics) => {
        try {
          const response = await fetch(`/api/posts/${postId}/analytics/${platform}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analytics)
          });
          
          if (!response.ok) throw new Error('Failed to update analytics');
          
          const updatedAnalytics = await response.json();
          set(state => ({
            analytics: {
              ...state.analytics,
              [`${postId}-${platform}`]: updatedAnalytics
            }
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update analytics' });
        }
      },

      // Scheduling
      fetchSchedules: async (postId) => {
        try {
          const queryParams = new URLSearchParams();
          if (postId) queryParams.append('postId', postId);

          const response = await fetch(`/api/post-schedules?${queryParams.toString()}`);
          if (!response.ok) throw new Error('Failed to fetch schedules');
          
          const data = await response.json();
          set({ schedules: data.schedules || [] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch schedules' });
        }
      },

      cancelSchedule: async (scheduleId) => {
        try {
          const response = await fetch(`/api/post-schedules/${scheduleId}/cancel`, {
            method: 'POST'
          });
          
          if (!response.ok) throw new Error('Failed to cancel schedule');
          
          set(state => ({
            schedules: state.schedules.map(s => 
              s.id === scheduleId 
                ? { ...s, status: 'cancelled' }
                : s
            )
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to cancel schedule' });
        }
      },

      reschedulePost: async (scheduleId, newScheduledAt) => {
        try {
          const response = await fetch(`/api/post-schedules/${scheduleId}/reschedule`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scheduledAt: newScheduledAt })
          });
          
          if (!response.ok) throw new Error('Failed to reschedule post');
          
          const updatedSchedule = await response.json();
          set(state => ({
            schedules: state.schedules.map(s => 
              s.id === scheduleId ? updatedSchedule : s
            )
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to reschedule post' });
        }
      },

      // Bulk operations
      bulkPublish: async (postIds, platforms) => {
        set({ publishing: true, error: null });
        try {
          const response = await fetch('/api/posts/bulk-publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postIds, platforms })
          });
          
          if (!response.ok) throw new Error('Failed to bulk publish posts');
          
          // Refresh posts
          await get().fetchPosts(get().filters);
          set({ publishing: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to bulk publish posts', publishing: false });
        }
      },

      bulkSchedule: async (postIds, scheduledAt, platforms) => {
        set({ scheduling: true, error: null });
        try {
          const response = await fetch('/api/posts/bulk-schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postIds, scheduledAt, platforms })
          });
          
          if (!response.ok) throw new Error('Failed to bulk schedule posts');
          
          // Refresh posts
          await get().fetchPosts(get().filters);
          set({ scheduling: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to bulk schedule posts', scheduling: false });
        }
      },

      bulkArchive: async (postIds) => {
        try {
          const response = await fetch('/api/posts/bulk-archive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postIds })
          });
          
          if (!response.ok) throw new Error('Failed to bulk archive posts');
          
          // Refresh posts
          await get().fetchPosts(get().filters);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to bulk archive posts' });
        }
      },

      bulkDelete: async (postIds) => {
        set({ deleting: true, error: null });
        try {
          const response = await fetch('/api/posts/bulk-delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postIds })
          });
          
          if (!response.ok) throw new Error('Failed to bulk delete posts');
          
          set(state => ({
            posts: state.posts.filter(p => !postIds.includes(p.id)),
            currentPost: state.currentPost && postIds.includes(state.currentPost.id) ? null : state.currentPost,
            deleting: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to bulk delete posts', deleting: false });
        }
      },

      // Selection
      setCurrentPost: (post) => {
        set({ currentPost: post });
        if (post) {
          get().fetchAnalytics(post.id);
          get().fetchSchedules(post.id);
        }
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
      name: 'post-workflow-store'
    }
  )
);







