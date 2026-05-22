# Ethara API Documentation

Base URL: `http://localhost:5000/api` (development)

## Authentication

All protected routes require header:

```
Authorization: Bearer <token>
```

---

## Auth

### Register
`POST /auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
`POST /auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": { "_id", "name", "email", "role", "avatar" }
}
```

### Get Current User
`GET /auth/me` 🔒

### Logout
`POST /auth/logout` 🔒

### Update Profile
`PUT /auth/profile` 🔒

### Update Password
`PUT /auth/password` 🔒

```json
{
  "currentPassword": "old",
  "newPassword": "new"
}
```

---

## Projects

### List Projects
`GET /projects` 🔒

Query: `search`, `status`, `page`, `limit`

### Get Project
`GET /projects/:id` 🔒

### Create Project
`POST /projects` 🔒 (Admin only)

```json
{
  "title": "New Project",
  "description": "Description",
  "status": "active",
  "dueDate": "2026-12-31",
  "color": "#8b5cf6",
  "members": [{ "user": "userId", "role": "member" }]
}
```

### Update Project
`PUT /projects/:id` 🔒 (Project admin)

### Delete Project
`DELETE /projects/:id` 🔒 (Admin)

### Add Member
`POST /projects/:id/members` 🔒

```json
{ "userId": "userId", "role": "member" }
```

### Remove Member
`DELETE /projects/:id/members/:userId` 🔒

### Search Users
`GET /projects/users/search?search=john` 🔒

---

## Tasks

### List Tasks
`GET /tasks` 🔒

Query: `project`, `status`, `priority`, `assignedTo`, `search`, `overdue`, `page`, `limit`

### Get Task
`GET /tasks/:id` 🔒

### Create Task
`POST /tasks` 🔒 (Project admin)

```json
{
  "title": "Task title",
  "description": "Details",
  "priority": "high",
  "status": "todo",
  "assignedTo": "userId",
  "project": "projectId",
  "dueDate": "2026-06-01"
}
```

### Update Task
`PUT /tasks/:id` 🔒

### Delete Task
`DELETE /tasks/:id` 🔒 (Project admin)

### Add Comment
`POST /tasks/:id/comment` 🔒

```json
{ "text": "Comment text" }
```

### Reorder Tasks (Kanban)
`POST /tasks/reorder` 🔒

```json
{
  "tasks": [
    { "id": "taskId", "status": "in-progress", "order": 0, "projectId": "projectId" }
  ]
}
```

### Upload Attachment
`POST /tasks/:id/upload` 🔒 (multipart/form-data, field: `file`)

---

## Dashboard

### Get Stats
`GET /dashboard/stats` 🔒

Returns: project/task counts, charts data, recent projects, team activity.

---

## Notifications

### List Notifications
`GET /notifications` 🔒

### Mark All Read
`PUT /notifications/read-all` 🔒

### Mark One Read
`PUT /notifications/:id/read` 🔒

---

## Chat

### Get Messages
`GET /chat/:projectId` 🔒

### Send Message
`POST /chat/:projectId` 🔒

```json
{ "content": "Hello team!" }
```

---

## WebSocket Events

Connect with `auth: { token }` in handshake.

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:project` | Client → Server | Join project room |
| `notification` | Server → Client | New notification |
| `task:created` | Server → Client | Task created |
| `task:updated` | Server → Client | Task updated |
| `task:deleted` | Server → Client | Task deleted |
| `chat:message` | Server → Client | New chat message |

---

## Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

## Health Check

`GET /api/health`
