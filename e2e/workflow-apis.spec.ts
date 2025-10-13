/**
 * E2E Tests for Workflow APIs
 * Comprehensive testing of all workflow endpoints
 * 
 * Tests:
 * - Project Management APIs
 * - Message Handling APIs  
 * - Flow Modification APIs
 * - Post Management APIs
 * 
 * @version 1.0.0
 * @date 2024-12-20
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const USER_ID = 'user-001';

// Test data
const testData = {
  project: {
    name: 'E2E Test Project',
    description: 'A test project for E2E testing',
    status: 'draft',
    priority: 'high',
    progress: 0,
    startDate: '2024-01-01',
    dueDate: '2024-12-31',
    participants: ['user1', 'user2'],
    tags: ['test', 'e2e'],
    category: 'development',
    estimatedHours: 100,
    actualHours: 0,
    budget: 10000,
    spent: 0,
    createdBy: USER_ID,
    metadata: { test: true }
  },
  
  message: {
    leadId: 'lead-e2e-123',
    platform: 'facebook',
    sender: 'test@example.com',
    content: 'This is an E2E test message',
    status: 'unread',
    priority: 'medium',
    type: 'inquiry',
    autoResponse: 'Thank you for your E2E test message!',
    manualResponse: '',
    responseTime: 300,
    sentiment: 'positive',
    tags: ['test', 'e2e'],
    attachments: [],
    metadata: { test: true },
    userId: USER_ID
  },
  
  flow: {
    name: 'E2E Test Flow',
    description: 'A test flow for E2E testing',
    status: 'draft',
    category: 'automation',
    tags: ['test', 'e2e'],
    nodes: [
      {
        id: 'node1',
        type: 'trigger',
        data: { event: 'e2e_test' }
      }
    ],
    connections: [],
    variables: { testVar: 'e2eValue' },
    settings: {
      autoStart: true,
      maxExecutions: 100,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    },
    statistics: {},
    createdBy: USER_ID
  },
  
  post: {
    title: 'E2E Test Post',
    description: 'A test post for E2E testing',
    content: 'This is the content of the E2E test post',
    platforms: ['facebook', 'instagram'],
    status: 'draft',
    priority: 'medium',
    category: 'marketing',
    tags: ['test', 'e2e'],
    images: ['test-image.jpg'],
    author: USER_ID,
    createdBy: USER_ID,
    metadata: { test: true }
  }
};

test.describe('Workflow APIs E2E Tests', () => {
  let projectId: string;
  let messageId: string;
  let flowId: string;
  let postId: string;

  test.beforeAll(async () => {
    // Check if backend server is running
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (!response.ok) {
        console.warn('Backend server not running - tests will be skipped');
      }
    } catch (error) {
      console.warn('Backend server not accessible - tests will be skipped');
    }
  });

  test.beforeEach(async ({ page }) => {
    // Skip tests if backend is not available
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (!response.ok) {
        test.skip(true, 'Backend server not running');
        return;
      }
    } catch (error) {
      test.skip(true, 'Backend server not accessible');
      return;
    }

    // Navigate to the application
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Project Management APIs', () => {
    test('should create a new project', async ({ page }) => {
      // Test project creation via API
      const response = await page.request.post(`${BASE_URL}/api/projects`, {
        data: testData.project
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(testData.project.name);
      
      projectId = data.data.id;
    });

    test('should retrieve all projects', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/projects?userId=${USER_ID}`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should update a project', async ({ page }) => {
      if (!projectId) {
        // Create project first if not exists
        const createResponse = await page.request.post(`${BASE_URL}/api/projects`, {
          data: testData.project
        });
        const createData = await createResponse.json();
        projectId = createData.data.id;
      }

      const updateData = { name: 'Updated E2E Test Project', progress: 25 };
      const response = await page.request.put(`${BASE_URL}/api/projects/${projectId}?userId=${USER_ID}`, {
        data: updateData
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(updateData.name);
      expect(data.data.progress).toBe(updateData.progress);
    });

    test('should create a project step', async ({ page }) => {
      if (!projectId) {
        const createResponse = await page.request.post(`${BASE_URL}/api/projects`, {
          data: testData.project
        });
        const createData = await createResponse.json();
        projectId = createData.data.id;
      }

      const stepData = {
        projectId,
        title: 'E2E Test Step',
        description: 'A test project step',
        status: 'pending',
        order: 1,
        estimatedHours: 10,
        actualHours: 0,
        assignedTo: 'user1',
        dueDate: '2024-01-15',
        dependencies: [],
        deliverables: ['deliverable1'],
        notes: 'E2E test step notes',
        userId: USER_ID
      };

      const response = await page.request.post(`${BASE_URL}/api/project-steps`, {
        data: stepData
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(stepData.title);
    });

    test('should delete a project', async ({ page }) => {
      if (!projectId) {
        const createResponse = await page.request.post(`${BASE_URL}/api/projects`, {
          data: testData.project
        });
        const createData = await createResponse.json();
        projectId = createData.data.id;
      }

      const response = await page.request.delete(`${BASE_URL}/api/projects/${projectId}?userId=${USER_ID}`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.deleted).toBe(true);
    });
  });

  test.describe('Message Handling APIs', () => {
    test('should create a new message', async ({ page }) => {
      const response = await page.request.post(`${BASE_URL}/api/messages`, {
        data: testData.message
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.content).toBe(testData.message.content);
      
      messageId = data.data.id;
    });

    test('should retrieve all messages', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/messages?userId=${USER_ID}`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should process an incoming message', async ({ page }) => {
      const processData = {
        leadId: 'lead-e2e-456',
        platform: 'instagram',
        sender: 'customer@example.com',
        content: 'Is this item still available for E2E testing?',
        metadata: { source: 'e2e_test' }
      };

      const response = await page.request.post(`${BASE_URL}/api/messages/process`, {
        data: processData
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.content).toBe(processData.content);
    });

    test('should generate auto response', async ({ page }) => {
      if (!messageId) {
        const createResponse = await page.request.post(`${BASE_URL}/api/messages`, {
          data: testData.message
        });
        const createData = await createResponse.json();
        messageId = createData.data.id;
      }

      const response = await page.request.post(`${BASE_URL}/api/messages/${messageId}/auto-response?userId=${USER_ID}`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.response).toBeDefined();
    });

    test('should delete a message', async ({ page }) => {
      if (!messageId) {
        const createResponse = await page.request.post(`${BASE_URL}/api/messages`, {
          data: testData.message
        });
        const createData = await createResponse.json();
        messageId = createData.data.id;
      }

      const response = await page.request.delete(`${BASE_URL}/api/messages/${messageId}?userId=${USER_ID}`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.deleted).toBe(true);
    });
  });

  test.describe('Flow Modification APIs', () => {
    test('should create a new flow', async ({ page }) => {
      const response = await page.request.post(`${BASE_URL}/api/flows`, {
        data: testData.flow
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(testData.flow.name);
      
      flowId = data.data.id;
    });

    test('should retrieve all flows', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/flows?userId=${USER_ID}`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should test a flow', async ({ page }) => {
      if (!flowId) {
        const createResponse = await page.request.post(`${BASE_URL}/api/flows`, {
          data: {
            name: 'Test Flow',
            description: 'E2E test flow',
            category: 'test',
            tags: ['e2e'],
            nodes: [],
            connections: [],
            variables: {},
            status: 'draft',
            createdBy: USER_ID
          }
        });
        const createData = await createResponse.json();
        flowId = createData.data.id;
      }

      const testData = { input: { testParam: 'e2eValue' } };
      const response = await page.request.post(`${BASE_URL}/api/flows/${flowId}/test?userId=${USER_ID}`, {
        data: testData
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.result).toBeDefined();
    });

    test('should execute a flow', async ({ page }) => {
      if (!flowId) {
        const createResponse = await page.request.post(`${BASE_URL}/api/flows`, {
          data: testData.flow
        });
        const createData = await createResponse.json();
        flowId = createData.data.id;
      }

      const executeData = { input: { testParam: 'e2eValue' } };
      const response = await page.request.post(`${BASE_URL}/api/flows/${flowId}/execute?userId=${USER_ID}`, {
        data: executeData
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
    });

    test('should delete a flow', async ({ page }) => {
      if (!flowId) {
        const createResponse = await page.request.post(`${BASE_URL}/api/flows`, {
          data: testData.flow
        });
        const createData = await createResponse.json();
        flowId = createData.data.id;
      }

      const response = await page.request.delete(`${BASE_URL}/api/flows/${flowId}?userId=${USER_ID}`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.deleted).toBe(true);
    });
  });

  test.describe('Post Management APIs', () => {
    test('should create a new post', async ({ page }) => {
      const response = await page.request.post(`${BASE_URL}/api/posts`, {
        data: testData.post
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(testData.post.title);
      
      postId = data.data.id;
    });

    test('should retrieve all posts', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/posts?userId=${USER_ID}`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should schedule a post', async ({ page }) => {
      if (!postId) {
        const createResponse = await page.request.post(`${BASE_URL}/api/posts`, {
          data: testData.post
        });
        const createData = await createResponse.json();
        postId = createData.data.id;
      }

      const scheduleData = {
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        platforms: ['facebook', 'instagram']
      };

      const response = await page.request.post(`${BASE_URL}/api/posts/${postId}/schedule?userId=${USER_ID}`, {
        data: scheduleData
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('scheduled');
    });

    test('should publish a post', async ({ page }) => {
      if (!postId) {
        const createResponse = await page.request.post(`${BASE_URL}/api/posts`, {
          data: testData.post
        });
        const createData = await createResponse.json();
        postId = createData.data.id;
      }

      const publishData = { platforms: ['facebook', 'instagram'] };
      const response = await page.request.post(`${BASE_URL}/api/posts/${postId}/publish?userId=${USER_ID}`, {
        data: publishData
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('published');
    });

    test('should get post analytics', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/posts/analytics?userId=${USER_ID}`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should delete a post', async ({ page }) => {
      if (!postId) {
        const createResponse = await page.request.post(`${BASE_URL}/api/posts`, {
          data: testData.post
        });
        const createData = await createResponse.json();
        postId = createData.data.id;
      }

      const response = await page.request.delete(`${BASE_URL}/api/posts/${postId}?userId=${USER_ID}`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.deleted).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid project ID', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/projects/invalid-id?userId=${USER_ID}`);
      
      expect(response.status()).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('should handle invalid message ID', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/messages/invalid-id?userId=${USER_ID}`);
      
      expect(response.status()).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('should handle invalid flow ID', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/flows/invalid-id?userId=${USER_ID}`);
      
      expect(response.status()).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('should handle invalid post ID', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/posts/invalid-id?userId=${USER_ID}`);
      
      expect(response.status()).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  test.describe('Bulk Operations', () => {
    test('should handle bulk message updates', async ({ page }) => {
      // Create multiple messages first
      const messageIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const messageData = {
          content: `Bulk test message ${i + 1}`,
          leadId: `lead-bulk-${i + 1}`,
          type: 'inquiry',
          priority: 'medium',
          status: 'unread',
          createdBy: USER_ID
        };
        
        const response = await page.request.post(`${BASE_URL}/api/messages`, {
          data: messageData
        });
        const data = await response.json();
        messageIds.push(data.data.id);
      }

      // Bulk update
      const bulkData = {
        ids: messageIds,
        updates: { status: 'replied', priority: 'high' }
      };

      const response = await page.request.put(`${BASE_URL}/api/messages/bulk-update?userId=${USER_ID}`, {
        data: bulkData
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.updated).toBe(3);

      // Clean up
      await page.request.delete(`${BASE_URL}/api/messages/bulk-delete?userId=${USER_ID}`, {
        data: { ids: messageIds }
      });
    });

    test('should handle bulk post operations', async ({ page }) => {
      // Create multiple posts first
      const postIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const postData = {
          title: `Bulk test post ${i + 1}`,
          content: 'Bulk test content',
          platforms: ['facebook'],
          status: 'draft',
          createdBy: USER_ID
        };
        
        const response = await page.request.post(`${BASE_URL}/api/posts`, {
          data: postData
        });
        const data = await response.json();
        postIds.push(data.data.id);
      }

      // Bulk publish
      const bulkPublishData = {
        postIds,
        platforms: ['facebook', 'instagram']
      };

      const response = await page.request.post(`${BASE_URL}/api/posts/bulk-publish?userId=${USER_ID}`, {
        data: bulkPublishData
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.published).toBe(3);

      // Clean up
      await page.request.delete(`${BASE_URL}/api/posts/bulk-delete?userId=${USER_ID}`, {
        data: { postIds }
      });
    });
  });
});
