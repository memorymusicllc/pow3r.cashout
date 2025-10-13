# Workflow API Documentation

This document provides comprehensive documentation for all workflow API endpoints implemented in the pow3r.cashout application.

## Table of Contents

1. [Project Management APIs](#project-management-apis)
2. [Message Handling APIs](#message-handling-apis)
3. [Flow Modification APIs](#flow-modification-apis)
4. [Post Management APIs](#post-management-apis)
5. [Common Response Format](#common-response-format)
6. [Error Handling](#error-handling)

## Project Management APIs

### Get All Projects
**GET** `/api/projects`

Retrieve all projects with optional filtering.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')
- `status` (string, optional): Filter by status
- `priority` (string, optional): Filter by priority
- `category` (string, optional): Filter by category
- `assignedTo` (string, optional): Filter by assigned user
- `tags` (string, optional): Comma-separated tags
- `startDate` (string, optional): Filter by start date
- `endDate` (string, optional): Filter by end date
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "project-123",
      "name": "Project Name",
      "description": "Project description",
      "status": "active",
      "priority": "high",
      "progress": 75,
      "participants": ["user1", "user2"],
      "tags": ["tag1", "tag2"],
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Create New Project
**POST** `/api/projects`

Create a new project.

**Request Body:**
```json
{
  "name": "Project Name",
  "description": "Project description",
  "status": "draft",
  "priority": "medium",
  "progress": 0,
  "startDate": "2024-01-01",
  "dueDate": "2024-12-31",
  "participants": ["user1", "user2"],
  "tags": ["tag1", "tag2"],
  "category": "development",
  "estimatedHours": 100,
  "actualHours": 0,
  "budget": 10000,
  "spent": 0,
  "createdBy": "user-001",
  "metadata": {}
}
```

### Update Project
**PUT** `/api/projects/:projectId`

Update an existing project.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

**Request Body:** Same as create project (all fields optional)

### Delete Project
**DELETE** `/api/projects/:projectId`

Delete a project.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Get Project Steps
**GET** `/api/projects/:projectId/steps`

Get all steps for a project.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Create Project Step
**POST** `/api/project-steps`

Create a new project step.

**Request Body:**
```json
{
  "projectId": "project-123",
  "title": "Step Title",
  "description": "Step description",
  "status": "pending",
  "order": 1,
  "estimatedHours": 10,
  "actualHours": 0,
  "assignedTo": "user1",
  "dueDate": "2024-01-15",
  "dependencies": ["step1", "step2"],
  "deliverables": ["deliverable1"],
  "notes": "Step notes",
  "userId": "user-001"
}
```

### Update Project Step
**PUT** `/api/project-steps/:stepId`

Update a project step.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Delete Project Step
**DELETE** `/api/project-steps/:stepId`

Delete a project step.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Reorder Project Steps
**PUT** `/api/projects/:projectId/steps/reorder`

Reorder project steps.

**Request Body:**
```json
{
  "stepIds": ["step1", "step2", "step3"]
}
```

### Get Project Templates
**GET** `/api/project-templates`

Get all project templates.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Create Project Template
**POST** `/api/project-templates`

Create a new project template.

**Request Body:**
```json
{
  "name": "Template Name",
  "description": "Template description",
  "category": "development",
  "tags": ["tag1", "tag2"],
  "steps": [
    {
      "title": "Step 1",
      "description": "Step description",
      "estimatedHours": 10
    }
  ],
  "estimatedDuration": 100,
  "isPublic": false,
  "createdBy": "user-001"
}
```

## Message Handling APIs

### Get All Messages
**GET** `/api/messages`

Retrieve all messages with optional filtering.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')
- `status` (string, optional): Filter by status
- `priority` (string, optional): Filter by priority
- `platform` (string, optional): Filter by platform
- `type` (string, optional): Filter by type
- `sentiment` (string, optional): Filter by sentiment
- `tags` (string, optional): Comma-separated tags
- `assignedTo` (string, optional): Filter by assigned user
- `startDate` (string, optional): Filter by start date
- `endDate` (string, optional): Filter by end date
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

### Create New Message
**POST** `/api/messages`

Create a new message.

**Request Body:**
```json
{
  "leadId": "lead-123",
  "platform": "facebook",
  "sender": "customer@example.com",
  "content": "Message content",
  "status": "unread",
  "priority": "medium",
  "type": "inquiry",
  "autoResponse": "Auto response text",
  "manualResponse": "Manual response text",
  "responseTime": 300,
  "sentiment": "positive",
  "tags": ["tag1", "tag2"],
  "attachments": ["file1.jpg"],
  "metadata": {},
  "userId": "user-001"
}
```

### Update Message
**PUT** `/api/messages/:messageId`

Update a message.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Delete Message
**DELETE** `/api/messages/:messageId`

Delete a message.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Bulk Update Messages
**PUT** `/api/messages/bulk-update`

Update multiple messages at once.

**Request Body:**
```json
{
  "ids": ["msg1", "msg2", "msg3"],
  "updates": {
    "status": "replied",
    "priority": "high"
  }
}
```

### Bulk Delete Messages
**DELETE** `/api/messages/bulk-delete`

Delete multiple messages at once.

**Request Body:**
```json
{
  "ids": ["msg1", "msg2", "msg3"]
}
```

### Process Incoming Message
**POST** `/api/messages/process`

Process an incoming message with auto-analysis.

**Request Body:**
```json
{
  "leadId": "lead-123",
  "platform": "facebook",
  "sender": "customer@example.com",
  "content": "Message content",
  "metadata": {}
}
```

### Generate Auto Response
**POST** `/api/messages/:messageId/auto-response`

Generate an auto-response for a message.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Get Message Templates
**GET** `/api/message-templates`

Get all message templates.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Create Message Template
**POST** `/api/message-templates`

Create a new message template.

**Request Body:**
```json
{
  "name": "Template Name",
  "content": "Template content",
  "category": "inquiry",
  "platform": ["facebook", "instagram"],
  "triggers": ["price", "availability"],
  "isActive": true,
  "createdBy": "user-001"
}
```

### Update Message Template
**PUT** `/api/message-templates/:templateId`

Update a message template.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Delete Message Template
**DELETE** `/api/message-templates/:templateId`

Delete a message template.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Get Message Analytics
**GET** `/api/messages/analytics`

Get message analytics and statistics.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')
- `startDate` (string, optional): Filter by start date
- `endDate` (string, optional): Filter by end date

## Flow Modification APIs

### Get All Flows
**GET** `/api/flows`

Retrieve all flows with optional filtering.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')
- `status` (string, optional): Filter by status
- `category` (string, optional): Filter by category
- `tags` (string, optional): Comma-separated tags
- `createdBy` (string, optional): Filter by creator
- `startDate` (string, optional): Filter by start date
- `endDate` (string, optional): Filter by end date
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

### Create New Flow
**POST** `/api/flows`

Create a new flow.

**Request Body:**
```json
{
  "name": "Flow Name",
  "description": "Flow description",
  "status": "draft",
  "category": "automation",
  "tags": ["tag1", "tag2"],
  "nodes": [
    {
      "id": "node1",
      "type": "trigger",
      "data": {}
    }
  ],
  "connections": [
    {
      "id": "conn1",
      "source": "node1",
      "target": "node2"
    }
  ],
  "variables": {},
  "settings": {
    "autoStart": true,
    "maxExecutions": 100,
    "timeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000
  },
  "statistics": {},
  "createdBy": "user-001"
}
```

### Update Flow
**PUT** `/api/flows/:flowId`

Update an existing flow.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Delete Flow
**DELETE** `/api/flows/:flowId`

Delete a flow.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Execute Flow
**POST** `/api/flows/:flowId/execute`

Execute a flow with input data.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

**Request Body:**
```json
{
  "input": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

### Test Flow
**POST** `/api/flows/:flowId/test`

Test a flow without executing it.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

**Request Body:**
```json
{
  "input": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

### Get Flow Executions
**GET** `/api/flow-executions`

Get all flow executions.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')
- `flowId` (string, optional): Filter by flow ID
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

### Cancel Flow Execution
**POST** `/api/flow-executions/:executionId/cancel`

Cancel a running flow execution.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Get Flow Templates
**GET** `/api/flow-templates`

Get all flow templates.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Create Flow Template
**POST** `/api/flow-templates`

Create a new flow template.

**Request Body:**
```json
{
  "name": "Template Name",
  "description": "Template description",
  "category": "automation",
  "tags": ["tag1", "tag2"],
  "nodes": [
    {
      "id": "node1",
      "type": "trigger",
      "data": {}
    }
  ],
  "connections": [
    {
      "id": "conn1",
      "source": "node1",
      "target": "node2"
    }
  ],
  "variables": {},
  "isPublic": false,
  "createdBy": "user-001"
}
```

## Post Management APIs

### Get All Posts
**GET** `/api/posts`

Retrieve all posts with optional filtering.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')
- `status` (string, optional): Filter by status
- `priority` (string, optional): Filter by priority
- `category` (string, optional): Filter by category
- `platform` (string, optional): Filter by platform
- `tags` (string, optional): Comma-separated tags
- `author` (string, optional): Filter by author
- `startDate` (string, optional): Filter by start date
- `endDate` (string, optional): Filter by end date
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

### Create New Post
**POST** `/api/posts`

Create a new post.

**Request Body:**
```json
{
  "title": "Post Title",
  "description": "Post description",
  "content": "Post content",
  "platforms": ["facebook", "instagram", "twitter"],
  "status": "draft",
  "priority": "medium",
  "category": "marketing",
  "tags": ["tag1", "tag2"],
  "images": ["image1.jpg", "image2.jpg"],
  "author": "user-001",
  "createdBy": "user-001",
  "metadata": {}
}
```

### Update Post
**PUT** `/api/posts/:postId`

Update an existing post.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Delete Post
**DELETE** `/api/posts/:postId`

Delete a post.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Publish Post
**POST** `/api/posts/:postId/publish`

Publish a post to specified platforms.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

**Request Body:**
```json
{
  "platforms": ["facebook", "instagram"]
}
```

### Schedule Post
**POST** `/api/posts/:postId/schedule`

Schedule a post for later publishing.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

**Request Body:**
```json
{
  "scheduledAt": "2024-01-01T12:00:00.000Z",
  "platforms": ["facebook", "instagram"]
}
```

### Bulk Publish Posts
**POST** `/api/posts/bulk-publish`

Publish multiple posts at once.

**Request Body:**
```json
{
  "postIds": ["post1", "post2", "post3"],
  "platforms": ["facebook", "instagram"]
}
```

### Bulk Schedule Posts
**POST** `/api/posts/bulk-schedule`

Schedule multiple posts at once.

**Request Body:**
```json
{
  "postIds": ["post1", "post2", "post3"],
  "scheduledAt": "2024-01-01T12:00:00.000Z",
  "platforms": ["facebook", "instagram"]
}
```

### Bulk Archive Posts
**POST** `/api/posts/bulk-archive`

Archive multiple posts at once.

**Request Body:**
```json
{
  "postIds": ["post1", "post2", "post3"]
}
```

### Bulk Delete Posts
**DELETE** `/api/posts/bulk-delete`

Delete multiple posts at once.

**Request Body:**
```json
{
  "postIds": ["post1", "post2", "post3"]
}
```

### Get Post Analytics
**GET** `/api/posts/analytics`

Get post analytics and performance metrics.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')
- `postId` (string, optional): Filter by post ID

### Update Post Analytics
**PUT** `/api/posts/:postId/analytics/:platform`

Update analytics for a specific post and platform.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

**Request Body:**
```json
{
  "views": 1000,
  "likes": 50,
  "shares": 25,
  "comments": 10,
  "clicks": 100,
  "conversions": 5,
  "engagement": 8.5,
  "reach": 2000,
  "impressions": 3000
}
```

### Get Post Schedules
**GET** `/api/post-schedules`

Get all post schedules.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')
- `postId` (string, optional): Filter by post ID

### Cancel Post Schedule
**POST** `/api/post-schedules/:scheduleId/cancel`

Cancel a scheduled post.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Reschedule Post
**PUT** `/api/post-schedules/:scheduleId/reschedule`

Reschedule a post to a new time.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

**Request Body:**
```json
{
  "scheduledAt": "2024-01-01T15:00:00.000Z"
}
```

### Get Post Templates
**GET** `/api/post-templates`

Get all post templates.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Create Post Template
**POST** `/api/post-templates`

Create a new post template.

**Request Body:**
```json
{
  "name": "Template Name",
  "description": "Template description",
  "content": "Template content",
  "category": "marketing",
  "tags": ["tag1", "tag2"],
  "platforms": ["facebook", "instagram"],
  "isPublic": false,
  "createdBy": "user-001"
}
```

### Update Post Template
**PUT** `/api/post-templates/:templateId`

Update a post template.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

### Delete Post Template
**DELETE** `/api/post-templates/:templateId`

Delete a post template.

**Query Parameters:**
- `userId` (string, optional): User ID (default: 'user-001')

## Common Response Format

All API endpoints follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message description",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

The API uses standard HTTP status codes:

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

All error responses include:
- `success: false`
- `error`: Human-readable error message
- `timestamp`: ISO 8601 timestamp

## Authentication

All endpoints require a `userId` parameter (defaults to 'user-001' for development). In production, this should be replaced with proper authentication middleware.

## Rate Limiting

Consider implementing rate limiting for production use to prevent abuse and ensure fair usage.

## Database Schema

The APIs work with the following database tables:
- `projects` - Project management
- `project_steps` - Project step tracking
- `project_templates` - Project templates
- `messages` - Message handling
- `message_templates` - Message templates
- `flows` - Flow definitions
- `flow_executions` - Flow execution history
- `flow_templates` - Flow templates
- `posts` - Post management
- `post_analytics` - Post performance metrics
- `post_schedules` - Post scheduling
- `post_templates` - Post templates

## Testing

Use the provided test files to verify API functionality:
- `test-workflow-apis.js` - Comprehensive API testing
- Individual workflow test files for specific functionality

## Deployment

The APIs are deployed as part of the main backend server and are available at:
- Development: `http://localhost:3001`
- Production: `https://your-domain.com`

All endpoints are prefixed with `/api/` and follow RESTful conventions.



