# API Reference

Complete reference for Flor.io API endpoints.

## Overview

Flor.io uses RESTful API routes built with React Router. All requests require authentication (except auth endpoints).

- **Base URL**: `http://localhost:5173` (development) or production domain
- **Authentication**: Session cookie (httpOnly)
- **Response Format**: JSON

## Response Format

Response formats vary by endpoint. Most endpoints return JSON, but some may redirect or return different structures:

### Standard Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "count": 10 /* optional: for list endpoints */
}
```

### Standard Error Response

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

### Form-Based Endpoints

Some endpoints (like rooms operations) accept form data with `_method` tunneling:

```json
{
  "room": {
    /* updated room data */
  }
}
```

Or `{ "success": true }` for delete operations.

### Authentication Endpoints

Auth endpoints redirect rather than return JSON:

- On success: Redirects to `/dashboard`
- On error: Returns to login/register page with error message

### HTTP Status Codes

- `200` - OK (successful GET/POST/PATCH/DELETE)
- `201` - Created (successful POST creating resource)
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but no permission)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (constraint violation, e.g., non-empty room delete)
- `500` - Internal Server Error

## Authentication

### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Errors:**

- 400 - Invalid email or password
- 400 - User does not exist

### Register

```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Errors:**

- 400 - Email already exists
- 400 - Password too weak
- 400 - Invalid email format

### Logout

```
POST /auth/logout
```

**Response:**

```json
{ "success": true }
```

## Plants

### List Plants

```
GET /dashboard
```

**Query Parameters:**

- `room` - Filter by room ID (optional)

**Response:**

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Monstera",
    "photo_url": "https://...",
    "watering_frequency_days": 7,
    "room_id": "uuid",
    "room_name": "Living Room",
    "light_requirements": "Bright indirect light",
    "fertilizing_tips": "Monthly during growing season",
    "pruning_tips": "Trim dead leaves",
    "troubleshooting": "Watch for brown leaf tips",
    "created_with_ai": true,
    "last_watered": "2024-01-28T10:30:00Z",
    "days_until_watering": 2,
    "watering_status": "due-soon",
    "created_at": "2024-01-20T09:00:00Z",
    "updated_at": "2024-01-28T10:30:00Z"
  }
]
```

**Authentication:** Required

**Errors:**

- 401 - Not authenticated

### Get Plant Details

```
GET /dashboard/plants/:plantId
```

**Response:**

```json
{
  "id": "uuid",
  "name": "Monstera",
  "photo_url": "https://...",
  "watering_frequency_days": 7,
  "room_id": "uuid",
  "room_name": "Living Room",
  "light_requirements": "Bright indirect light",
  "fertilizing_tips": "Monthly during growing season",
  "pruning_tips": "Trim dead leaves",
  "troubleshooting": "Watch for brown leaf tips",
  "created_with_ai": true,
  "last_watered": "2024-01-28T10:30:00Z",
  "days_until_watering": 2,
  "watering_status": "due-soon",
  "created_at": "2024-01-20T09:00:00Z",
  "updated_at": "2024-01-28T10:30:00Z",
  "watering_history": [
    {
      "id": "uuid",
      "watered_at": "2024-01-28T10:30:00Z"
    }
  ]
}
```

**Authentication:** Required (must own plant)

**Errors:**

- 401 - Not authenticated
- 403 - Plant not owned by user
- 404 - Plant not found

### Create Plant (Manual)

```
POST /dashboard/plants/new
Content-Type: multipart/form-data

form data:
- name: string (required, 1-100 chars)
- watering_frequency_days: number (required, 1-365)
- room_id: uuid (optional)
- photo: file (optional, max 10MB)
```

**Response:** Redirect to plant detail page on success

**Errors:**

- 400 - Invalid input
- 401 - Not authenticated
- 413 - File too large

### Create Plant (AI Wizard)

```
POST /dashboard/plants/new-ai
Content-Type: multipart/form-data

form data:
- _action: "save-plant" (required)
- name: string (required)
- watering_frequency_days: number (required)
- light_requirements: string (required)
- fertilizing_tips: string (JSON array as string)
- pruning_tips: string (JSON array as string)
- troubleshooting: string (JSON array as string)
- room_id: uuid (optional)
- photoFile: file (optional)
```

**OR**

```
POST /dashboard/plants/new-ai
Content-Type: multipart/form-data

form data:
- _action: "save-feedback"
- plantId: uuid (required)
- feedbackType: "thumbs_up" | "thumbs_down" (required)
- comment: string (optional)
- aiResponseSnapshot: string (JSON as string)
```

**Response:** Redirect to plant detail page on success

**Errors:**

- 400 - Invalid input
- 401 - Not authenticated
- 402 - AI generation limit reached (20 per month)
- 403 - Plant limit reached (100 plants max)

### Update Plant

```
POST /dashboard/plants/:plantId/edit
Content-Type: multipart/form-data

form data:
- name: string (optional)
- watering_frequency_days: number (optional)
- room_id: uuid (optional)
- photo: file (optional, replaces existing)
```

**Response:** Redirect to plant detail page on success

**Authentication:** Required (must own plant)

**Errors:**

- 400 - Invalid input
- 401 - Not authenticated
- 403 - Plant not owned by user
- 404 - Plant not found

### Delete Plant

```
POST /dashboard/plants/:plantId
Content-Type: multipart/form-data

form data:
- _action: "delete"
```

**Alternative:**

```
GET /dashboard/plants/:plantId?_action=delete
```

**Response:** Redirect to dashboard on success

**Authentication:** Required (must own plant)

**Errors:**

- 401 - Not authenticated
- 403 - Plant not owned by user
- 404 - Plant not found

## Watering

### Get Notifications

```
GET /api/notifications
```

**Response:**

```json
{
  "notifications": [
    {
      "plant_id": "uuid",
      "plant_name": "Monstera",
      "photo_url": "https://...",
      "room_name": "Living Room",
      "last_watered": "2024-01-20T10:30:00Z",
      "next_watering": "2024-01-27T10:30:00Z",
      "days_overdue": 5,
      "watering_frequency_days": 7
    }
  ],
  "count": 3
}
```

**Query Parameters:**

- None

**Authentication:** Required

**Response includes:** Plants that need watering (days_overdue >= 0), sorted by most overdue first

**Errors:**

- 401 - Not authenticated

### Record Watering

```
POST /api/water/:plantId
Content-Type: application/json

{}
```

**Alternative using plant detail page:**

```
POST /dashboard/plants/:plantId
Content-Type: multipart/form-data

form data:
- _action: "water"
```

**Response:**

```json
{
  "success": true,
  "plantId": "uuid"
}
```

**Authentication:** Required (must own plant)

**Updates:**

- Records watering_history entry
- Timestamp set to current time
- Updates plant's last_watered calculation

**Errors:**

- 401 - Not authenticated
- 403 - Plant not owned by user
- 404 - Plant not found
- 500 - Database error

## Rooms

### List Rooms

```
GET /api/rooms
```

**Response:**

```json
{
  "rooms": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Living Room",
      "plant_count": 5,
      "created_at": "2024-01-15T08:00:00Z"
    }
  ]
}
```

**Authentication:** Required

**Errors:**

- 401 - Not authenticated

### Create Room

```
POST /api/rooms
Content-Type: multipart/form-data

form data:
- _method: "POST"
- name: string (required, 1-100 chars)
```

**Response:**

```json
{
  "room": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Bedroom",
    "created_at": "2024-01-30T12:00:00Z"
  }
}
```

**Errors:**

- 400 - Invalid input
- 401 - Not authenticated

### Update Room

```
POST /api/rooms
Content-Type: multipart/form-data

form data:
- _method: "PATCH"
- roomId: uuid (required)
- name: string (required, 1-100 chars)
```

**Response:** Same as create

**Authentication:** Required (must own room)

**Errors:**

- 400 - Invalid input
- 401 - Not authenticated
- 403 - Room not owned by user
- 404 - Room not found

### Delete Room

```
POST /api/rooms
Content-Type: multipart/form-data

form data:
- _method: "DELETE"
- roomId: uuid (required)
```

**Response:**

```json
{ "success": true }
```

**Authentication:** Required (must own room)

**Constraints:**

- Room must be empty (0 plants assigned)

**Errors:**

- 401 - Not authenticated
- 403 - Room not owned by user
- 404 - Room not found
- 400 - Room is not empty (has plants assigned)

## Form-Based Architecture

Flor.io uses a **form-based architecture** where mutations (create, update, delete) are sent as form data rather than JSON. This approach:

1. **Simplifies file uploads** - Photos, forms, and metadata in one request
2. **Reduces complexity** - No need for separate file upload endpoints
3. **Integrates with React Router** - Form actions handle both data and files

### \_method Tunneling

For endpoints that need multiple HTTP methods on the same route, use `_method`:

```html
<form action="/api/rooms" method="post">
  <input type="hidden" name="_method" value="PATCH" />
  <input type="hidden" name="roomId" value="..." />
  <input type="text" name="name" />
</form>
```

The `_method` field overrides `POST` to act like `PATCH`, `DELETE`, etc.

### \_action Routing

For endpoints with multiple operations, use `_action`:

```html
<form action="/dashboard/plants/new-ai" method="post">
  <input type="hidden" name="_action" value="save-plant" />
  <!-- form fields -->
</form>
```

The `_action` value determines which handler processes the form.

### Request Format

All form-based mutations use:

```
Content-Type: multipart/form-data
```

This allows mixing text fields and files in a single request.

## Error Codes

Common error codes returned in responses:

| Code               | Status | Description             |
| ------------------ | ------ | ----------------------- |
| `UNAUTHORIZED`     | 401    | User not authenticated  |
| `FORBIDDEN`        | 403    | User lacks permission   |
| `NOT_FOUND`        | 404    | Resource not found      |
| `VALIDATION_ERROR` | 400    | Invalid input data      |
| `CONFLICT`         | 409    | Constraint violation    |
| `SERVER_ERROR`     | 500    | Unexpected server error |

## Rate Limiting

Currently no rate limiting. May be added in future versions.

## CORS

CORS headers configured for:

- Development: `http://localhost:*`
- Production: Application domain only

## WebSocket (Future)

Real-time updates planned for:

- Watering notifications
- Plant updates from other devices
- Collaborative features

## Pagination

List endpoints support pagination (future):

- `?page=1&limit=20`
- Returns: `data`, `count`, `total`, `pages`

## Filtering & Sorting

List endpoints support filtering (future):

- `?status=overdue&sort=-created_at`
- Full-text search on plant names

## Versioning

No API versioning currently. Schema changes will be documented in MIGRATION_GUIDE.md.

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:5173/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Get plants (requires session cookie)
curl http://localhost:5173/dashboard/plants \
  -H "Cookie: session=..."
```

### Using REST Client (VS Code)

Create `requests.http`:

```http
@baseUrl = http://localhost:5173
@sessionCookie = session=abc123...

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

### Get plants
GET {{baseUrl}}/dashboard/plants
Cookie: {{sessionCookie}}
```
