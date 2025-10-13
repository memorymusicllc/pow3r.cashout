/**
 * Comprehensive Workflow API Testing Suite
 * Tests all workflow endpoints: Projects, Messages, Flows, and Posts
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const USER_ID = 'user-001';

// Test data
const testData = {
  project: {
    name: 'Test Project',
    description: 'A test project for API testing',
    status: 'draft',
    priority: 'high',
    progress: 0,
    startDate: '2024-01-01',
    dueDate: '2024-12-31',
    participants: ['user1', 'user2'],
    tags: ['test', 'api'],
    category: 'development',
    estimatedHours: 100,
    actualHours: 0,
    budget: 10000,
    spent: 0,
    createdBy: USER_ID,
    metadata: { test: true }
  },
  
  projectStep: {
    projectId: '', // Will be set after project creation
    title: 'Test Step',
    description: 'A test project step',
    status: 'pending',
    order: 1,
    estimatedHours: 10,
    actualHours: 0,
    assignedTo: 'user1',
    dueDate: '2024-01-15',
    dependencies: [],
    deliverables: ['deliverable1'],
    notes: 'Test step notes',
    userId: USER_ID
  },
  
  message: {
    leadId: 'lead-123',
    platform: 'facebook',
    sender: 'test@example.com',
    content: 'This is a test message',
    status: 'unread',
    priority: 'medium',
    type: 'inquiry',
    autoResponse: 'Thank you for your message!',
    manualResponse: '',
    responseTime: 300,
    sentiment: 'positive',
    tags: ['test', 'inquiry'],
    attachments: [],
    metadata: { test: true },
    userId: USER_ID
  },
  
  flow: {
    name: 'Test Flow',
    description: 'A test flow for API testing',
    status: 'draft',
    category: 'automation',
    tags: ['test', 'automation'],
    nodes: [
      {
        id: 'node1',
        type: 'trigger',
        data: { event: 'message_received' }
      },
      {
        id: 'node2',
        type: 'action',
        data: { action: 'send_response' }
      }
    ],
    connections: [
      {
        id: 'conn1',
        source: 'node1',
        target: 'node2'
      }
    ],
    variables: { testVar: 'testValue' },
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
    title: 'Test Post',
    description: 'A test post for API testing',
    content: 'This is the content of the test post',
    platforms: ['facebook', 'instagram', 'twitter'],
    status: 'draft',
    priority: 'medium',
    category: 'marketing',
    tags: ['test', 'marketing'],
    images: ['test-image.jpg'],
    author: USER_ID,
    createdBy: USER_ID,
    metadata: { test: true }
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

// Utility functions
function logTest(testName, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error?.message || 'Unknown error' });
    console.log(`❌ ${testName}: ${error?.message || 'Unknown error'}`);
  }
}

async function makeRequest(method, url, data = null, params = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      params: { userId: USER_ID, ...params },
      data,
      timeout: 10000
    };
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Project Management API Tests
async function testProjectAPIs() {
  console.log('\n🧪 Testing Project Management APIs...');
  
  let projectId = '';
  let stepId = '';
  
  // Test 1: Create Project
  try {
    const result = await makeRequest('POST', '/api/projects', testData.project);
    if (result.success && result.data.success) {
      projectId = result.data.data.id;
      testData.projectStep.projectId = projectId;
      logTest('Create Project', true);
    } else {
      logTest('Create Project', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Create Project', false, error);
  }
  
  // Test 2: Get All Projects
  try {
    const result = await makeRequest('GET', '/api/projects');
    if (result.success && result.data.success) {
      logTest('Get All Projects', true);
    } else {
      logTest('Get All Projects', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get All Projects', false, error);
  }
  
  // Test 3: Get Project by ID
  if (projectId) {
    try {
      const result = await makeRequest('GET', `/api/projects/${projectId}`);
      if (result.success && result.data.success) {
        logTest('Get Project by ID', true);
      } else {
        logTest('Get Project by ID', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Get Project by ID', false, error);
    }
  }
  
  // Test 4: Update Project
  if (projectId) {
    try {
      const updateData = { name: 'Updated Test Project', progress: 25 };
      const result = await makeRequest('PUT', `/api/projects/${projectId}`, updateData);
      if (result.success && result.data.success) {
        logTest('Update Project', true);
      } else {
        logTest('Update Project', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Update Project', false, error);
    }
  }
  
  // Test 5: Create Project Step
  if (projectId) {
    try {
      const result = await makeRequest('POST', '/api/project-steps', testData.projectStep);
      if (result.success && result.data.success) {
        stepId = result.data.data.id;
        logTest('Create Project Step', true);
      } else {
        logTest('Create Project Step', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Create Project Step', false, error);
    }
  }
  
  // Test 6: Get Project Steps
  if (projectId) {
    try {
      const result = await makeRequest('GET', `/api/projects/${projectId}/steps`);
      if (result.success && result.data.success) {
        logTest('Get Project Steps', true);
      } else {
        logTest('Get Project Steps', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Get Project Steps', false, error);
    }
  }
  
  // Test 7: Update Project Step
  if (stepId) {
    try {
      const updateData = { status: 'in_progress', actualHours: 5 };
      const result = await makeRequest('PUT', `/api/project-steps/${stepId}`, updateData);
      if (result.success && result.data.success) {
        logTest('Update Project Step', true);
      } else {
        logTest('Update Project Step', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Update Project Step', false, error);
    }
  }
  
  // Test 8: Create Project Template
  try {
    const templateData = {
      name: 'Test Project Template',
      description: 'A test project template',
      category: 'development',
      tags: ['test', 'template'],
      steps: [
        {
          title: 'Template Step 1',
          description: 'First step in template',
          estimatedHours: 10
        }
      ],
      estimatedDuration: 100,
      isPublic: false,
      createdBy: USER_ID
    };
    
    const result = await makeRequest('POST', '/api/project-templates', templateData);
    if (result.success && result.data.success) {
      logTest('Create Project Template', true);
    } else {
      logTest('Create Project Template', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Create Project Template', false, error);
  }
  
  // Test 9: Get Project Templates
  try {
    const result = await makeRequest('GET', '/api/project-templates');
    if (result.success && result.data.success) {
      logTest('Get Project Templates', true);
    } else {
      logTest('Get Project Templates', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get Project Templates', false, error);
  }
  
  // Test 10: Delete Project Step
  if (stepId) {
    try {
      const result = await makeRequest('DELETE', `/api/project-steps/${stepId}`);
      if (result.success && result.data.success) {
        logTest('Delete Project Step', true);
      } else {
        logTest('Delete Project Step', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Delete Project Step', false, error);
    }
  }
  
  // Test 11: Delete Project
  if (projectId) {
    try {
      const result = await makeRequest('DELETE', `/api/projects/${projectId}`);
      if (result.success && result.data.success) {
        logTest('Delete Project', true);
      } else {
        logTest('Delete Project', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Delete Project', false, error);
    }
  }
  
  return { projectId, stepId };
}

// Message Handling API Tests
async function testMessageAPIs() {
  console.log('\n🧪 Testing Message Handling APIs...');
  
  let messageId = '';
  
  // Test 1: Create Message
  try {
    const result = await makeRequest('POST', '/api/messages', testData.message);
    if (result.success && result.data.success) {
      messageId = result.data.data.id;
      logTest('Create Message', true);
    } else {
      logTest('Create Message', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Create Message', false, error);
  }
  
  // Test 2: Get All Messages
  try {
    const result = await makeRequest('GET', '/api/messages');
    if (result.success && result.data.success) {
      logTest('Get All Messages', true);
    } else {
      logTest('Get All Messages', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get All Messages', false, error);
  }
  
  // Test 3: Update Message
  if (messageId) {
    try {
      const updateData = { status: 'replied', priority: 'high' };
      const result = await makeRequest('PUT', `/api/messages/${messageId}`, updateData);
      if (result.success && result.data.success) {
        logTest('Update Message', true);
      } else {
        logTest('Update Message', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Update Message', false, error);
    }
  }
  
  // Test 4: Process Incoming Message
  try {
    const processData = {
      leadId: 'lead-456',
      platform: 'instagram',
      sender: 'customer@example.com',
      content: 'Is this item still available?',
      metadata: { source: 'test' }
    };
    
    const result = await makeRequest('POST', '/api/messages/process', processData);
    if (result.success && result.data.success) {
      logTest('Process Incoming Message', true);
    } else {
      logTest('Process Incoming Message', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Process Incoming Message', false, error);
  }
  
  // Test 5: Generate Auto Response
  if (messageId) {
    try {
      const result = await makeRequest('POST', `/api/messages/${messageId}/auto-response`);
      if (result.success && result.data.success) {
        logTest('Generate Auto Response', true);
      } else {
        logTest('Generate Auto Response', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Generate Auto Response', false, error);
    }
  }
  
  // Test 6: Create Message Template
  try {
    const templateData = {
      name: 'Test Message Template',
      content: 'Thank you for your inquiry! We will get back to you soon.',
      category: 'inquiry',
      platform: ['facebook', 'instagram'],
      triggers: ['price', 'availability'],
      isActive: true,
      createdBy: USER_ID
    };
    
    const result = await makeRequest('POST', '/api/message-templates', templateData);
    if (result.success && result.data.success) {
      logTest('Create Message Template', true);
    } else {
      logTest('Create Message Template', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Create Message Template', false, error);
  }
  
  // Test 7: Get Message Templates
  try {
    const result = await makeRequest('GET', '/api/message-templates');
    if (result.success && result.data.success) {
      logTest('Get Message Templates', true);
    } else {
      logTest('Get Message Templates', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get Message Templates', false, error);
  }
  
  // Test 8: Get Message Analytics
  try {
    const result = await makeRequest('GET', '/api/messages/analytics');
    if (result.success && result.data.success) {
      logTest('Get Message Analytics', true);
    } else {
      logTest('Get Message Analytics', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get Message Analytics', false, error);
  }
  
  // Test 9: Bulk Update Messages
  if (messageId) {
    try {
      const bulkData = {
        ids: [messageId],
        updates: { status: 'archived', priority: 'low' }
      };
      
      const result = await makeRequest('PUT', '/api/messages/bulk-update', bulkData);
      if (result.success && result.data.success) {
        logTest('Bulk Update Messages', true);
      } else {
        logTest('Bulk Update Messages', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Bulk Update Messages', false, error);
    }
  }
  
  // Test 10: Delete Message
  if (messageId) {
    try {
      const result = await makeRequest('DELETE', `/api/messages/${messageId}`);
      if (result.success && result.data.success) {
        logTest('Delete Message', true);
      } else {
        logTest('Delete Message', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Delete Message', false, error);
    }
  }
  
  return { messageId };
}

// Flow Modification API Tests
async function testFlowAPIs() {
  console.log('\n🧪 Testing Flow Modification APIs...');
  
  let flowId = '';
  let executionId = '';
  
  // Test 1: Create Flow
  try {
    const result = await makeRequest('POST', '/api/flows', testData.flow);
    if (result.success && result.data.success) {
      flowId = result.data.data.id;
      logTest('Create Flow', true);
    } else {
      logTest('Create Flow', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Create Flow', false, error);
  }
  
  // Test 2: Get All Flows
  try {
    const result = await makeRequest('GET', '/api/flows');
    if (result.success && result.data.success) {
      logTest('Get All Flows', true);
    } else {
      logTest('Get All Flows', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get All Flows', false, error);
  }
  
  // Test 3: Update Flow
  if (flowId) {
    try {
      const updateData = { 
        name: 'Updated Test Flow', 
        status: 'active',
        settings: {
          autoStart: false,
          maxExecutions: 50,
          timeout: 60000,
          retryAttempts: 5,
          retryDelay: 2000
        }
      };
      const result = await makeRequest('PUT', `/api/flows/${flowId}`, updateData);
      if (result.success && result.data.success) {
        logTest('Update Flow', true);
      } else {
        logTest('Update Flow', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Update Flow', false, error);
    }
  }
  
  // Test 4: Test Flow
  if (flowId) {
    try {
      const testData = { input: { testParam: 'testValue' } };
      const result = await makeRequest('POST', `/api/flows/${flowId}/test`, testData);
      if (result.success && result.data.success) {
        logTest('Test Flow', true);
      } else {
        logTest('Test Flow', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Test Flow', false, error);
    }
  }
  
  // Test 5: Execute Flow
  if (flowId) {
    try {
      const executeData = { input: { testParam: 'testValue' } };
      const result = await makeRequest('POST', `/api/flows/${flowId}/execute`, executeData);
      if (result.success && result.data.success) {
        executionId = result.data.data.id;
        logTest('Execute Flow', true);
      } else {
        logTest('Execute Flow', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Execute Flow', false, error);
    }
  }
  
  // Test 6: Get Flow Executions
  try {
    const result = await makeRequest('GET', '/api/flow-executions');
    if (result.success && result.data.success) {
      logTest('Get Flow Executions', true);
    } else {
      logTest('Get Flow Executions', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get Flow Executions', false, error);
  }
  
  // Test 7: Cancel Flow Execution
  if (executionId) {
    try {
      const result = await makeRequest('POST', `/api/flow-executions/${executionId}/cancel`);
      if (result.success && result.data.success) {
        logTest('Cancel Flow Execution', true);
      } else {
        logTest('Cancel Flow Execution', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Cancel Flow Execution', false, error);
    }
  }
  
  // Test 8: Create Flow Template
  try {
    const templateData = {
      name: 'Test Flow Template',
      description: 'A test flow template',
      category: 'automation',
      tags: ['test', 'template'],
      nodes: [
        {
          id: 'node1',
          type: 'trigger',
          data: { event: 'template_trigger' }
        }
      ],
      connections: [],
      variables: { templateVar: 'templateValue' },
      isPublic: false,
      createdBy: USER_ID
    };
    
    const result = await makeRequest('POST', '/api/flow-templates', templateData);
    if (result.success && result.data.success) {
      logTest('Create Flow Template', true);
    } else {
      logTest('Create Flow Template', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Create Flow Template', false, error);
  }
  
  // Test 9: Get Flow Templates
  try {
    const result = await makeRequest('GET', '/api/flow-templates');
    if (result.success && result.data.success) {
      logTest('Get Flow Templates', true);
    } else {
      logTest('Get Flow Templates', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get Flow Templates', false, error);
  }
  
  // Test 10: Delete Flow
  if (flowId) {
    try {
      const result = await makeRequest('DELETE', `/api/flows/${flowId}`);
      if (result.success && result.data.success) {
        logTest('Delete Flow', true);
      } else {
        logTest('Delete Flow', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Delete Flow', false, error);
    }
  }
  
  return { flowId, executionId };
}

// Post Management API Tests
async function testPostAPIs() {
  console.log('\n🧪 Testing Post Management APIs...');
  
  let postId = '';
  let scheduleId = '';
  
  // Test 1: Create Post
  try {
    const result = await makeRequest('POST', '/api/posts', testData.post);
    if (result.success && result.data.success) {
      postId = result.data.data.id;
      logTest('Create Post', true);
    } else {
      logTest('Create Post', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Create Post', false, error);
  }
  
  // Test 2: Get All Posts
  try {
    const result = await makeRequest('GET', '/api/posts');
    if (result.success && result.data.success) {
      logTest('Get All Posts', true);
    } else {
      logTest('Get All Posts', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get All Posts', false, error);
  }
  
  // Test 3: Update Post
  if (postId) {
    try {
      const updateData = { 
        title: 'Updated Test Post', 
        status: 'scheduled',
        priority: 'high'
      };
      const result = await makeRequest('PUT', `/api/posts/${postId}`, updateData);
      if (result.success && result.data.success) {
        logTest('Update Post', true);
      } else {
        logTest('Update Post', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Update Post', false, error);
    }
  }
  
  // Test 4: Schedule Post
  if (postId) {
    try {
      const scheduleData = {
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        platforms: ['facebook', 'instagram']
      };
      const result = await makeRequest('POST', `/api/posts/${postId}/schedule`, scheduleData);
      if (result.success && result.data.success) {
        logTest('Schedule Post', true);
      } else {
        logTest('Schedule Post', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Schedule Post', false, error);
    }
  }
  
  // Test 5: Get Post Schedules
  try {
    const result = await makeRequest('GET', '/api/post-schedules');
    if (result.success && result.data.success) {
      logTest('Get Post Schedules', true);
    } else {
      logTest('Get Post Schedules', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get Post Schedules', false, error);
  }
  
  // Test 6: Publish Post
  if (postId) {
    try {
      const publishData = { platforms: ['facebook', 'instagram'] };
      const result = await makeRequest('POST', `/api/posts/${postId}/publish`, publishData);
      if (result.success && result.data.success) {
        logTest('Publish Post', true);
      } else {
        logTest('Publish Post', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Publish Post', false, error);
    }
  }
  
  // Test 7: Get Post Analytics
  try {
    const result = await makeRequest('GET', '/api/posts/analytics');
    if (result.success && result.data.success) {
      logTest('Get Post Analytics', true);
    } else {
      logTest('Get Post Analytics', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get Post Analytics', false, error);
  }
  
  // Test 8: Update Post Analytics
  if (postId) {
    try {
      const analyticsData = {
        views: 1000,
        likes: 50,
        shares: 25,
        comments: 10,
        clicks: 100,
        conversions: 5,
        engagement: 8.5,
        reach: 2000,
        impressions: 3000
      };
      const result = await makeRequest('PUT', `/api/posts/${postId}/analytics/facebook`, analyticsData);
      if (result.success && result.data.success) {
        logTest('Update Post Analytics', true);
      } else {
        logTest('Update Post Analytics', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Update Post Analytics', false, error);
    }
  }
  
  // Test 9: Create Post Template
  try {
    const templateData = {
      name: 'Test Post Template',
      description: 'A test post template',
      content: 'This is a template post content',
      category: 'marketing',
      tags: ['test', 'template'],
      platforms: ['facebook', 'instagram'],
      isPublic: false,
      createdBy: USER_ID
    };
    
    const result = await makeRequest('POST', '/api/post-templates', templateData);
    if (result.success && result.data.success) {
      logTest('Create Post Template', true);
    } else {
      logTest('Create Post Template', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Create Post Template', false, error);
  }
  
  // Test 10: Get Post Templates
  try {
    const result = await makeRequest('GET', '/api/post-templates');
    if (result.success && result.data.success) {
      logTest('Get Post Templates', true);
    } else {
      logTest('Get Post Templates', false, new Error(result.error));
    }
  } catch (error) {
    logTest('Get Post Templates', false, error);
  }
  
  // Test 11: Bulk Publish Posts
  if (postId) {
    try {
      const bulkData = {
        postIds: [postId],
        platforms: ['facebook', 'instagram']
      };
      const result = await makeRequest('POST', '/api/posts/bulk-publish', bulkData);
      if (result.success && result.data.success) {
        logTest('Bulk Publish Posts', true);
      } else {
        logTest('Bulk Publish Posts', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Bulk Publish Posts', false, error);
    }
  }
  
  // Test 12: Bulk Archive Posts
  if (postId) {
    try {
      const bulkData = { postIds: [postId] };
      const result = await makeRequest('POST', '/api/posts/bulk-archive', bulkData);
      if (result.success && result.data.success) {
        logTest('Bulk Archive Posts', true);
      } else {
        logTest('Bulk Archive Posts', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Bulk Archive Posts', false, error);
    }
  }
  
  // Test 13: Delete Post
  if (postId) {
    try {
      const result = await makeRequest('DELETE', `/api/posts/${postId}`);
      if (result.success && result.data.success) {
        logTest('Delete Post', true);
      } else {
        logTest('Delete Post', false, new Error(result.error));
      }
    } catch (error) {
      logTest('Delete Post', false, error);
    }
  }
  
  return { postId, scheduleId };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Workflow API Tests...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log(`👤 User ID: ${USER_ID}`);
  
  const startTime = Date.now();
  
  try {
    // Test all workflow APIs
    await testProjectAPIs();
    await testMessageAPIs();
    await testFlowAPIs();
    await testPostAPIs();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Print summary
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Total: ${testResults.total}`);
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.errors.forEach(error => {
        console.log(`  • ${error.test}: ${error.error}`);
      });
    }
    
    if (testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Workflow APIs are working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testProjectAPIs,
  testMessageAPIs,
  testFlowAPIs,
  testPostAPIs,
  testResults
};



