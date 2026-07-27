# ReachInbox Hiring Assignment

# Frontend Architecture Documentation

# Part 5 — API Layer, Axios Architecture & Backend Integration (Production Deep Dive)

> This document defines the complete communication architecture between the React frontend and the Express backend.
>
> The goal is to ensure **all backend communication is centralized, secure, maintainable, and scalable**.

---

# 1. Why an API Layer?

The UI should **never** know how the backend works.

❌ Bad

```text
Dashboard Component
        │
        ▼
axios.get(...)
```

Every component makes its own API requests.

Problems

* Duplicate code
* Difficult error handling
* Hard to test
* No centralized authentication
* Difficult to change backend URLs

---

## Good

```text
Dashboard Component

↓

useDashboard()

↓

DashboardService

↓

Axios Client

↓

Backend
```

Components only know about hooks.

---

# 2. API Architecture

```text
React Component

↓

Custom Hook

↓

API Service

↓

Axios Client

↓

Express Backend
```

Every request follows the same pipeline.

---

# 3. Folder Structure

```text
src/

api/

├── axios.ts

├── auth.api.ts

├── dashboard.api.ts

├── email.api.ts

├── sender.api.ts

├── user.api.ts

└── index.ts
```

---

# 4. Responsibilities

## axios.ts

Responsible for

* Base URL
* Headers
* Interceptors
* Timeout
* Authentication
* Error handling

---

## auth.api.ts

Only authentication requests.

Examples

```text
Login

Logout

Get Profile

Refresh Token
```

---

## email.api.ts

Email-related endpoints.

```text
Schedule Email

Cancel Email

Retry Email

Get Emails

Get Email Details
```

---

## sender.api.ts

```text
Create Sender

Update Sender

Delete Sender

List Senders
```

---

## dashboard.api.ts

```text
Dashboard Statistics

Recent Emails

Charts

Summary
```

---

# 5. Axios Client

Create exactly one Axios instance.

```text
App

↓

Axios Client

↓

All Services
```

Never create multiple Axios clients.

---

# 6. Base Configuration

Configure

* Base URL
* Timeout
* Default headers
* JSON
* Credentials (if required)

Example environment variable

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

---

# 7. Why One Axios Instance?

Benefits

* Consistent configuration
* Easy JWT injection
* Global error handling
* Easier maintenance

---

# 8. Request Flow

```text
Component

↓

Hook

↓

Service

↓

Axios

↓

Express
```

---

# 9. Response Flow

```text
Express

↓

Axios

↓

React Query

↓

Component

↓

User
```

---

# 10. Request Interceptor

Before every request

Axios executes

```text
Request Interceptor
```

Responsibilities

* Add JWT
* Add Content-Type
* Add Accept header
* Add request ID (optional)
* Log requests (development)

---

# 11. JWT Injection

Instead of every API call doing

```text
Authorization: Bearer ...
```

The interceptor automatically adds

```text
Authorization

↓

Bearer Token
```

Every request becomes authenticated.

---

# 12. Response Interceptor

Runs after backend responds.

Responsibilities

* Handle errors
* Normalize responses
* Redirect unauthorized users
* Log failures

---

# 13. Unauthorized Response

Suppose backend returns

```text
401 Unauthorized
```

Interceptor

↓

Clear session

↓

Redirect Login

No page needs to handle this individually.

---

# 14. Forbidden Response

Backend returns

```text
403 Forbidden
```

Show

```text
Permission Denied
```

page or toast.

---

# 15. Not Found

Backend

```text
404
```

Display

```text
Resource Not Found
```

---

# 16. Validation Error

Backend

```text
400
```

Returns

```text
Validation Errors
```

Frontend maps them into form errors.

---

# 17. Server Error

Backend

```text
500
```

Show

```text
Something went wrong.

Please try again.
```

Avoid exposing backend internals.

---

# 18. API Service Layer

Components never call Axios.

Instead

```text
Dashboard

↓

DashboardService

↓

Axios
```

---

# 19. Dashboard Flow

```text
Dashboard Page

↓

useDashboard()

↓

Dashboard API

↓

Axios

↓

Backend

↓

React Query Cache

↓

Dashboard UI
```

---

# 20. Email Scheduling Flow

```text
Schedule Form

↓

React Hook Form

↓

Mutation

↓

Email API

↓

Axios

↓

Backend

↓

Success

↓

Invalidate Cache
```

---

# 21. Sender Flow

```text
Sender Page

↓

Create Sender

↓

Sender Service

↓

Axios

↓

Backend
```

---

# 22. CSV Upload Flow

```text
Choose CSV

↓

Validate

↓

Parse

↓

Create FormData

↓

Axios

↓

Backend

↓

Queue Created

↓

Success Toast
```

---

# 23. File Upload

Axios automatically handles

```text
multipart/form-data
```

No manual fetch required.

---

# 24. Request Cancellation

Suppose

User leaves page.

Pending request

↓

Cancel automatically.

Prevents

* Memory leaks
* State updates after unmount
* Wasted requests

---

# 25. Duplicate Requests

React Query prevents unnecessary duplicate API calls.

Example

Two components request

```text
Dashboard Statistics
```

Only one network request is sent.

---

# 26. API Response Format

The backend should return a consistent structure.

Example

```text
Success

↓

status

message

data
```

Failure

↓

status

message

errors

This makes frontend handling predictable.

---

# 27. Error Mapping

Backend Error

↓

Axios

↓

React Query

↓

Toast / Form Error

↓

User

No component should parse raw backend errors.

---

# 28. Global Loading

Instead of every page creating its own loader,

React Query exposes loading states.

Examples

```text
Dashboard Loading

Sender Loading

Email Loading
```

---

# 29. Background Refresh

Dashboard data

↓

React Query

↓

Background Refetch

↓

Fresh UI

No manual polling logic.

---

# 30. Optimistic Updates

Example

Delete Sender

↓

Remove immediately from UI

↓

Backend confirms

↓

Done

If backend fails

↓

Restore previous state.

---

# 31. Retry Strategy

Temporary network issues

↓

Axios request fails

↓

React Query retries

↓

Success

Improves user experience.

---

# 32. Timeouts

Avoid requests hanging forever.

Recommended timeout

```text
15–30 seconds
```

If exceeded

↓

Show retry option.

---

# 33. Environment Variables

Frontend configuration

```text
VITE_API_BASE_URL

VITE_GOOGLE_CLIENT_ID

VITE_APP_NAME

VITE_ENABLE_LOGGING
```

Never hardcode URLs.

---

# 34. Logging

Development

Log

```text
Request

Response

Duration

Error
```

Production

Use structured logging only if required.

---

# 35. Security

Never expose

* JWT secrets
* SMTP credentials
* Internal endpoints
* Database URLs

Frontend only receives what it needs.

---

# 36. Authentication Flow

```text
Login

↓

Google OAuth

↓

Backend

↓

JWT

↓

Store Session

↓

Axios Interceptor

↓

Authenticated Requests
```

---

# 37. Email Scheduling Request

```text
Schedule Page

↓

Validation

↓

Mutation

↓

Email API

↓

Backend

↓

Queue Created

↓

Dashboard Refresh
```

---

# 38. Dashboard Request

```text
Dashboard

↓

useDashboard()

↓

Dashboard API

↓

Axios

↓

Backend

↓

Statistics

↓

Cards
```

---

# 39. Email List Request

```text
Email Page

↓

Filters

↓

React Query

↓

Email API

↓

Backend

↓

Email Table
```

---

# 40. Sender Management Request

```text
Sender Page

↓

Create Sender

↓

Mutation

↓

Backend

↓

Success

↓

Refresh Sender List
```

---

# 41. API Dependency Rules

Allowed

```text
Page

↓

Hook

↓

API Service

↓

Axios
```

Forbidden

```text
Page

↓

Axios
```

Forbidden

```text
Button

↓

Axios
```

UI components should never communicate directly with the backend.

---

# 42. Complete API Architecture

```text
React Component
        │
        ▼
Custom Hook
        │
        ▼
React Query
        │
        ▼
API Service
        │
        ▼
Axios Client
        │
        ▼
Request Interceptor
        │
        ▼
Express Backend
        │
        ▼
Response Interceptor
        │
        ▼
React Query Cache
        │
        ▼
Component Re-render
```

---

# 43. Production Folder Structure

```text
src/

api/
│
├── axios.ts
├── auth.api.ts
├── dashboard.api.ts
├── email.api.ts
├── sender.api.ts
├── user.api.ts
└── index.ts

hooks/
│
├── useDashboard.ts
├── useEmails.ts
├── useSenders.ts
├── useScheduleEmail.ts
└── useAuth.ts
```

---

# 44. Best Practices

✅ Use one Axios instance.

✅ Keep API calls inside service files.

✅ Let React Query manage fetching and caching.

✅ Use interceptors for authentication and error handling.

✅ Never call Axios directly from pages or components.

✅ Use environment variables for API configuration.

✅ Handle HTTP errors consistently.

✅ Cancel requests when appropriate.

✅ Invalidate relevant queries after successful mutations.

---

# 45. Complete Frontend ↔ Backend Communication Flow

```text
                    User
                      │
                      ▼
              React Component
                      │
                      ▼
               React Hook Form
                      │
                      ▼
               React Query Hook
                      │
                      ▼
                 API Service
                      │
                      ▼
                 Axios Client
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
 Request Interceptor      Response Interceptor
          │                       ▲
          ▼                       │
              Express Backend
                      │
                      ▼
          PostgreSQL + Redis
                      │
                      ▼
               JSON Response
                      │
                      ▼
             React Query Cache
                      │
                      ▼
              Automatic UI Update
```

---

# 46. Production Checklist

* ✅ Single Axios client
* ✅ Service-based API layer
* ✅ Request/response interceptors
* ✅ JWT automatically attached
* ✅ Centralized HTTP error handling
* ✅ React Query for all server state
* ✅ Consistent response structure
* ✅ File upload support
* ✅ Request cancellation
* ✅ Environment-based configuration
* ✅ No direct API calls from UI components

---

# End of Part 5
