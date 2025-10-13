# Workflow API Documentation

Complete documentation for workflow management API endpoints.

**Version:** 1.0.0  
**Last Updated:** 2024-12-20  
**Test Coverage:** Comprehensive E2E tests in `e2e/workflow-apis.spec.ts`

---

## Overview

The Workflow API provides comprehensive endpoints for managing projects, messages, flows, and posts within the pow3r.cashout application. All endpoints are implemented as Cloudflare Pages Functions with full CRUD operations.

## Base URL

- **Local Development:** `http://localhost:3001/api`
- **Production:** `https://cashruleseverythingaroundme.pages.dev/api`

## Authentication

All API endpoints use user-based authentication:
- **Header:** `x-user-id: <user-id>`
- **Required:** Yes for all endpoints

---

## API Endpoints

### Project Management

#### 1. Get All Projects
```
GET /api/projects?userId={userId}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "proj-001",
      "name": "Project Name",
      "description": "Project description",
      "status": "active",
      "priority": "high",
      "progress": 75,
      "startDate": "2024-01-01",
      "dueDate": "2024-12-31",
      "participants": ["user1", "user2"],
      "tags": ["tag1", "tag2"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### 2. Create Project
```
POST /api/projects
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-001",
  "name": "New Project",
  "description": "Project description",
  "status": "draft",
  "priority": "high",
  "progress": 0,
  "startDate": "2024-01-01",
  "dueDate": "2024-12-31",
  "participants": ["user1"],
  "tags": ["new"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "proj-generated-id",
    "name": "New Project",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. Get Project by ID
```
GET /api/projects/{projectId}?userId={userId}
```

#### 4. Update Project
```
PUT /api/projects/{projectId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-001",
  "name": "Updated Project Name",
  "status": "active",
  "progress": 50
}
```

#### 5. Delete Project
```
DELETE /api/projects/{projectId}?userId={userId}
```

---

### Message Management

#### 1. Get All Messages
```
GET /api/messages?userId={userId}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg-001",
      "threadId": "thread-001",
      "content": "Message content",
      "sender": "user-001",
      "recipient": "user-002",
      "platform": "facebook",
      "status": "pending",
      "aiGenerated": false,
      "template": null,
      "priority": "high",
      "tags": ["urgent"],
      "readAt": null,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### 2. Create Message
```
POST /api/messages
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-001",
  "threadId": "thread-001",
  "content": "Message text",
  "sender": "user-001",
  "recipient": "user-002",
  "platform": "facebook",
  "status": "pending",
  "aiGenerated": false,
  "priority": "high",
  "tags": ["important"]
}
```

#### 3. Update Message Status
```
PUT /api/messages/{messageId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-001",
  "status": "approved",
  "readAt": "2024-01-01T00:00:00Z"
}
```

#### 4. Delete Message
```
DELETE /api/messages/{messageId}?userId={userId}
```

---

### Flow Modification

#### 1. Get All Flows
```
GET /api/flows?userId={userId}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "flow-001",
      "name": "Flow Name",
      "description": "Flow description",
      "type": "automation",
      "status": "active",
      "trigger": {
        "type": "schedule",
        "config": {}
      },
      "actions": [
        {
          "type": "send_message",
          "config": {}
        }
      ],
      "conditions": [],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### 2. Create Flow
```
POST /api/flows
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-001",
  "name": "New Flow",
  "description": "Flow description",
  "type": "automation",
  "trigger": {
    "type": "schedule",
    "config": {
      "schedule": "0 9 * * *"
    }
  },
  "actions": [
    {
      "type": "send_message",
      "config": {
        "template": "greeting"
      }
    }
  ],
  "conditions": [],
  "isActive": true
}
```

#### 3. Update Flow
```
PUT /api/flows/{flowId}
Content-Type: application/json
```

#### 4. Delete Flow
```
DELETE /api/flows/{flowId}?userId={userId}
```

---

### Post Management

#### 1. Get All Posts
```
GET /api/posts?userId={userId}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "post-001",
      "title": "Post Title",
      "content": "Post content",
      "platforms": ["facebook", "offerup"],
      "status": "draft",
      "scheduledAt": null,
      "publishedAt": null,
      "images": ["url1", "url2"],
      "tags": ["tag1"],
      "visibility": "public",
      "engagement": {
        "views": 0,
        "likes": 0,
        "comments": 0
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### 2. Create Post
```
POST /api/posts
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-001",
  "title": "New Post",
  "content": "Post content",
  "platforms": ["facebook", "offerup"],
  "status": "draft",
  "images": [],
  "tags": ["new"],
  "visibility": "public"
}
```

#### 3. Update Post
```
PUT /api/posts/{postId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-001",
  "status": "published",
  "publishedAt": "2024-01-01T00:00:00Z"
}
```

#### 4. Delete Post
```
DELETE /api/posts/{postId}?userId={userId}
```

---

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Missing user ID |
| 404 | Not Found |
| 500 | Internal Server Error |

## Error Response Format

```json
{
  "success": false,
  "error": "Error message description"
}
```

---

## Testing

### E2E Tests

Comprehensive E2E tests are available in:
```
e2e/workflow-apis.spec.ts
```

**Run Tests:**
```bash
npm run test
```

### Test Coverage

- ✅ Project Management (CRUD)
- ✅ Message Management (CRUD)
- ✅ Flow Modification (CRUD)
- ✅ Post Management (CRUD)
- ✅ Error handling
- ✅ Authentication validation
- ✅ Data validation

### Manual Testing

Use the included test script:
```bash
node test-workflow-apis.js
```

---

## Rate Limiting

- **Limit:** 100 requests per minute per user
- **Header:** `X-RateLimit-Remaining`
- **Reset:** Rolling window

---

## Data Models

### Project
```typescript
interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  progress: number; // 0-100
  startDate?: string;
  dueDate?: string;
  participants: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Message
```typescript
interface Message {
  id: string;
  userId: string;
  threadId: string;
  content: string;
  sender: string;
  recipient: string;
  platform: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  aiGenerated: boolean;
  template?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Flow
```typescript
interface Flow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'automation' | 'workflow' | 'trigger';
  status: 'active' | 'paused' | 'error';
  trigger: {
    type: string;
    config: Record<string, any>;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Post
```typescript
interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduledAt?: string;
  publishedAt?: string;
  images: string[];
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## Best Practices

1. **Always include userId** in requests
2. **Validate data** before sending
3. **Handle errors** gracefully
4. **Use appropriate status codes**
5. **Implement retry logic** for failed requests
6. **Cache responses** when appropriate
7. **Monitor rate limits**

---

## Related Documentation

- [API Integration Guide](API_INTEGRATION_GUIDE.md)
- [E2E Testing Guide](e2e/README.md)
- [Component Library Documentation](COMPONENT_LIBRARY_DOCUMENTATION.md)

---

**Support:** For issues and questions, see the main [README.md](README.md)

