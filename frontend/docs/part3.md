# ReachInbox Hiring Assignment

# Frontend Architecture Documentation

# Part 3 — Routing, Navigation & Application Flow (Production Deep Dive)

> This document defines the complete routing architecture of the React application.
>
> The goal is to make navigation secure, scalable, lazy-loaded, and easy to maintain.

---

# 1. Why Routing Matters

The frontend is a **Single Page Application (SPA)**.

Instead of loading a new HTML page every time,

React changes the current component.

```text
Browser

↓

React Router

↓

Current Page Changes

↓

URL Updates
```

---

# 2. React Router Architecture

```text
Browser

↓

React Router

↓

Layout

↓

Current Route

↓

Page

↓

Feature Components
```

React Router becomes the entry point of every page.

---

# 3. Routing Goals

Our routing should support

* Public pages
* Protected pages
* Nested layouts
* Lazy loading
* Code splitting
* Authentication guards
* 404 page
* Error boundaries
* Future scalability

---

# 4. Route Categories

We divide routes into three categories.

## Public

```text
Login

OAuth Callback

404
```

---

## Protected

```text
Dashboard

Schedule Email

Emails

Senders

Settings
```

---

## System

```text
Loading

Error

Unauthorized
```

---

# 5. Folder Structure

```text
src/

routes/

├── index.tsx

├── AppRoutes.tsx

├── ProtectedRoute.tsx

├── PublicRoute.tsx

├── routeConfig.ts

└── lazyRoutes.ts
```

---

# 6. Route Configuration

Instead of writing routes everywhere,

maintain one configuration.

Example

```text
Dashboard

↓

/dashboard

↓

Protected

↓

DashboardLayout
```

Centralised route configuration is easier to maintain.

---

# 7. Application Layouts

Instead of repeating

Sidebar

Navbar

Footer

Create layouts.

```text
Auth Layout

Dashboard Layout
```

---

# 8. Auth Layout

Used for

```text
Login

OAuth

Unauthorized
```

Structure

```text
Logo

↓

Centered Card

↓

Login Form
```

---

# 9. Dashboard Layout

Used after login.

```text
Sidebar

↓

Navbar

↓

Content

↓

Footer
```

Every protected page shares this layout.

---

# 10. Route Tree

```text
/

↓

App

├── Login

├── OAuth Callback

├── Dashboard

│

├── Schedule

│

├── Emails

│

├── Senders

│

├── Settings

│

└── 404
```

---

# 11. Nested Routing

React Router allows

```text
Dashboard Layout

↓

Outlet

↓

Current Page
```

Instead of duplicating

Sidebar

Navbar

on every page.

---

# 12. Nested Structure

```text
DashboardLayout

│

├── Sidebar

├── Navbar

└── Outlet

      │

      ├── Dashboard

      ├── Emails

      ├── Schedule

      ├── Senders

      └── Settings
```

---

# 13. Public Routes

Anyone can access.

Example

```text
/

↓

Login
```

No authentication required.

---

# 14. Protected Routes

Require

```text
JWT

↓

Valid?

↓

Dashboard
```

Otherwise

↓

Redirect

↓

Login

---

# 15. Protected Route Flow

```text
Request

↓

JWT Exists?

↓

No

↓

Login

↓

Yes

↓

Verify

↓

Dashboard
```

---

# 16. ProtectedRoute Component

Responsibilities

```text
Check Authentication

↓

Loading?

↓

Authenticated?

↓

Render Page

↓

Else Redirect
```

No business logic.

---

# 17. PublicRoute Component

Example

Logged-in user visits

```text
/login
```

Instead

↓

Redirect

↓

Dashboard

No need to see login again.

---

# 18. Authentication Flow

```text
Google Login

↓

Backend

↓

JWT

↓

Frontend

↓

Store Token

↓

Navigate Dashboard
```

---

# 19. Application Startup

User opens website.

```text
Browser

↓

main.tsx

↓

App.tsx

↓

Router

↓

Check Session

↓

Load Route
```

---

# 20. Session Restoration

Suppose

User refreshes page.

Don't log them out.

Flow

```text
App Starts

↓

Load JWT

↓

Fetch Profile

↓

Restore Session

↓

Render Dashboard
```

---

# 21. Navigation Flow

Example

User

↓

Clicks

```text
Schedule Email
```

↓

Sidebar

↓

React Router

↓

Schedule Page

↓

URL

```text
/schedule
```

---

# 22. Sidebar Navigation

Sidebar contains

```text
Dashboard

Schedule

Emails

Senders

Settings
```

Active route highlighted automatically.

---

# 23. Breadcrumbs

Example

```text
Dashboard

>

Emails

>

Schedule
```

Helps user understand current location.

---

# 24. Programmatic Navigation

Example

User submits

Schedule Email

↓

Success

↓

Navigate

↓

Emails Page

Instead of refreshing browser.

---

# 25. Route Parameters

Example

```text
/emails/:id
```

Shows

Single Email Details.

---

# 26. Query Parameters

Example

```text
/emails?page=2

↓

Pagination
```

```text
/emails?status=FAILED

↓

Filtering
```

React Router handles this cleanly.

---

# 27. Lazy Loading

Instead of downloading

Entire Application

↓

Load only

Current Page.

---

# 28. Lazy Loading Flow

```text
Dashboard

↓

Dashboard Bundle
```

Later

```text
Schedule

↓

Schedule Bundle
```

Smaller initial load.

---

# 29. Code Splitting

Every page becomes

Independent bundle.

Example

```text
Dashboard

↓

dashboard.chunk.js
```

```text
Schedule

↓

schedule.chunk.js
```

Better performance.

---

# 30. Loading Fallback

While loading

Lazy page

↓

Show

```text
Skeleton

Spinner

Loading Screen
```

Never blank screen.

---

# 31. Error Boundary

Suppose

Dashboard crashes.

Instead of

Entire application crashing

↓

Show

Friendly Error Page.

---

# 32. Error Boundary Flow

```text
Component Error

↓

Catch

↓

Fallback UI

↓

Retry
```

Improves stability.

---

# 33. 404 Page

Unknown URL

```text
/random-page
```

↓

404

↓

Return Home Button.

---

# 34. Unauthorized Page

Example

Token expired.

↓

User tries

```text
/dashboard
```

↓

Unauthorized

↓

Redirect Login.

---

# 35. Navigation Guards

Before entering page

Check

```text
Authenticated?

↓

Allowed?

↓

Render
```

Future support

```text
Roles

Permissions
```

---

# 36. Dashboard Navigation Flow

```text
Sidebar

↓

Click Emails

↓

React Router

↓

Email Page

↓

React Query

↓

Backend

↓

Render Table
```

---

# 37. Complete Startup Lifecycle

```text
Browser

↓

main.tsx

↓

App.tsx

↓

Providers

↓

Router

↓

Session Check

↓

Protected Route

↓

Dashboard Layout

↓

Current Page

↓

Components

↓

API Calls
```

---

# 38. Deep Linking

Suppose

User opens

```text
/emails?page=5
```

Application should

↓

Open directly

↓

Page 5

No extra work required.

---

# 39. Scroll Restoration

When changing pages

Example

Dashboard

↓

Emails

↓

Scroll Top

Not middle of previous page.

---

# 40. Navigation History

React Router keeps

```text
Back

Forward

Refresh
```

Working naturally.

---

# 41. Future Scalability

Easy to add

```text
Templates

Campaigns

Analytics

Admin

Billing
```

Without modifying routing architecture.

---

# 42. Route Dependency

```text
App

↓

Router

↓

Layout

↓

Page

↓

Features

↓

Components
```

Pages never import Router directly.

---

# 43. Route Guards

Allowed

```text
ProtectedRoute

↓

Dashboard
```

Forbidden

```text
Dashboard

↓

Check JWT

↓

Redirect
```

Authentication belongs in the route guard.

---

# 44. Routing Architecture

```text
User
 │
 ▼
Browser URL
 │
 ▼
React Router
 │
 ▼
Route Guard
 │
 ▼
Layout
 │
 ▼
Page
 │
 ▼
Feature Components
 │
 ▼
Reusable Components
```

---

# 45. Folder Responsibility

| Folder         | Responsibility               |
| -------------- | ---------------------------- |
| routes         | Route definitions            |
| layouts        | Shared page layouts          |
| pages          | Screen-level components      |
| ProtectedRoute | Authentication guard         |
| PublicRoute    | Redirect authenticated users |
| routeConfig    | Central route metadata       |
| lazyRoutes     | Lazy imports                 |

---

# 46. Best Practices

✅ Use nested routing.

✅ Keep one Dashboard Layout.

✅ Protect routes using route guards.

✅ Lazy-load every page.

✅ Use Suspense fallback.

✅ Centralise route definitions.

✅ Support deep linking.

✅ Preserve browser history.

✅ Add Error Boundaries.

✅ Keep authentication outside pages.

---

# 47. Complete Application Flow

```text
User
 │
 ▼
Browser
 │
 ▼
React Router
 │
 ▼
ProtectedRoute
 │
 ▼
Dashboard Layout
 │
 ├── Sidebar
 │
 ├── Navbar
 │
 └── Outlet
      │
      ▼
Current Page
      │
      ▼
Feature Components
      │
      ▼
React Query Hooks
      │
      ▼
Backend API
```

---

# End of Part 3
