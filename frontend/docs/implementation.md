# ReachInbox Hiring Assignment

# Frontend Architecture Documentation

# Part 10 — Frontend Implementation Guide & Complete Project Structure (Cursor AI Ready)

> This document combines Parts **1–9** into a practical implementation roadmap. By following this guide, a developer (or Cursor AI) can build the frontend in a clean, scalable, production-ready manner.

---

# 1. Technology Stack

## Core

* React 19
* TypeScript
* Vite

## Styling

* Tailwind CSS
* shadcn/ui
* Lucide React
* Framer Motion

## State Management

* React Query (Server State)
* Zustand (Global UI/Auth State)
* React Hook Form (Forms)

## Validation

* Zod

## Networking

* Axios

## Routing

* React Router v7

## Utilities

* PapaParse
* Day.js
* clsx
* tailwind-merge

---

# 2. Final Project Structure

```text
frontend/

public/

src/

├── app/
│   ├── App.tsx
│   ├── providers.tsx
│   └── index.ts

├── api/
│   ├── axios.ts
│   ├── auth.api.ts
│   ├── dashboard.api.ts
│   ├── email.api.ts
│   ├── sender.api.ts
│   └── index.ts

├── assets/
│   ├── icons/
│   ├── images/
│   └── logo/

├── components/
│   ├── ui/
│   ├── common/
│   ├── layout/
│   ├── forms/
│   ├── feedback/
│   └── charts/

├── config/
│   ├── env.ts
│   ├── queryClient.ts
│   └── constants.ts

├── features/

│   ├── auth/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── types/

│   ├── dashboard/

│   ├── emails/

│   ├── senders/

│   └── settings/

├── hooks/

├── providers/

├── routes/

├── schemas/

├── services/

├── store/

├── styles/

├── types/

├── utils/

├── lib/

├── constants/

└── main.tsx
```

---

# 3. Layered Architecture

```text
UI Components

↓

Feature Components

↓

Custom Hooks

↓

API Services

↓

Axios Client

↓

Backend
```

Each layer has one responsibility.

---

# 4. Implementation Order

Never build randomly.

Follow this sequence.

---

## Phase 1

Project Setup

* Create Vite project
* Configure TypeScript
* Install Tailwind
* Install shadcn/ui
* Configure aliases
* Configure ESLint
* Configure Prettier

---

## Phase 2

Core Infrastructure

Implement

```text
Providers

React Query

Axios

Theme

Routing

Toasts
```

Nothing feature-specific yet.

---

## Phase 3

Authentication

Build

* Login Page
* Google Login
* Auth Store
* Session Restoration
* Protected Routes
* Logout

After authentication works,

continue.

---

## Phase 4

Dashboard Layout

Build

* Sidebar
* Navbar
* Dashboard Layout
* Responsive Navigation
* Footer

No dashboard data yet.

---

## Phase 5

Dashboard

Implement

```text
Statistics

Recent Emails

Charts

Activity

Quick Actions
```

---

## Phase 6

Sender Management

Implement

* Sender Table
* Create Sender
* Update Sender
* Delete Sender
* Sender Details

---

## Phase 7

Email Scheduling

Implement

* Schedule Form
* Sender Dropdown
* Recipient Management
* CSV Upload
* Validation
* Mutation

---

## Phase 8

Email Management

Build

* Table
* Search
* Pagination
* Filters
* Sorting
* Retry
* Cancel

---

## Phase 9

Settings

Build

* Theme
* Profile
* Account
* Preferences

---

## Phase 10

Performance

Optimize

* Lazy loading
* Memoization
* Bundle size
* Accessibility
* Skeletons

---

# 5. Environment Variables

```text
VITE_API_BASE_URL

VITE_GOOGLE_CLIENT_ID

VITE_APP_NAME

VITE_ENABLE_LOGGING
```

Never hardcode values.

---

# 6. Application Startup

```text
main.tsx

↓

Providers

↓

Router

↓

Session Restore

↓

Dashboard
```

---

# 7. Providers Order

```text
QueryClientProvider

↓

ThemeProvider

↓

RouterProvider

↓

Toaster

↓

Application
```

---

# 8. Feature Folder Pattern

Every feature follows the same structure.

```text
feature/

pages/

components/

hooks/

services/

schemas/

types/
```

Consistency reduces complexity.

---

# 9. Component Rules

Components should

* Receive props
* Render UI
* Emit events

Components should **not**

* Fetch data
* Call Axios
* Store business logic

---

# 10. Hooks Rules

Hooks should

* Fetch server data
* Wrap React Query
* Handle mutations
* Expose loading and error states

Hooks should not render UI.

---

# 11. API Rules

API services should

* Call Axios
* Build request payloads
* Return typed responses

They should not manipulate UI.

---

# 12. Store Rules

Store only

* JWT
* User
* Theme
* Sidebar state

Never store server data like emails or statistics.

---

# 13. React Query Rules

Use React Query for

* Dashboard
* Emails
* Senders
* Profile

Every API response should be cached.

---

# 14. Form Rules

Every form

↓

React Hook Form

↓

Zod

↓

Mutation

↓

Backend

Never use uncontrolled validation logic.

---

# 15. Folder Responsibilities

| Folder     | Responsibility        |
| ---------- | --------------------- |
| app        | Application bootstrap |
| api        | Backend communication |
| components | Reusable UI           |
| features   | Business modules      |
| hooks      | Shared hooks          |
| providers  | Global providers      |
| routes     | Routing               |
| store      | Zustand stores        |
| schemas    | Zod schemas           |
| services   | Business services     |
| utils      | Helper functions      |
| constants  | Shared constants      |
| styles     | Global styles         |

---

# 16. Dependency Rules

Allowed

```text
Page

↓

Feature

↓

Hook

↓

API

↓

Axios
```

Forbidden

```text
Page

↓

Axios
```

---

Forbidden

```text
Button

↓

Backend
```

---

# 17. Error Handling

Every request should support

* Loading
* Success
* Error
* Retry

No silent failures.

---

# 18. Loading Strategy

Use

* Skeletons
* Button loading
* Table loading
* Spinner

Avoid blank pages.

---

# 19. Accessibility

Every page should support

* Keyboard navigation
* Focus management
* Semantic HTML
* Screen readers
* Colour contrast

---

# 20. Responsive Strategy

Desktop

↓

Tablet

↓

Mobile

Design mobile-first where practical.

---

# 21. API Integration Flow

```text
Component

↓

Hook

↓

API Service

↓

Axios

↓

Backend
```

Single communication path.

---

# 22. Dashboard Flow

```text
Dashboard

↓

useDashboard()

↓

React Query

↓

Dashboard API

↓

Backend
```

---

# 23. Scheduling Flow

```text
Form

↓

React Hook Form

↓

Zod

↓

Mutation

↓

Backend
```

---

# 24. Authentication Flow

```text
Google Login

↓

Backend

↓

JWT

↓

Protected Route

↓

Dashboard
```

---

# 25. State Ownership

| State       | Owner                        |
| ----------- | ---------------------------- |
| User        | Zustand                      |
| JWT         | Zustand / Cookie abstraction |
| Theme       | Zustand                      |
| Sidebar     | Zustand                      |
| Dashboard   | React Query                  |
| Emails      | React Query                  |
| Senders     | React Query                  |
| Profile     | React Query                  |
| Form Inputs | React Hook Form              |
| Modal State | Local State                  |

---

# 26. Naming Conventions

### Components

```text
DashboardPage

EmailTable

SenderCard
```

---

### Hooks

```text
useDashboard

useEmails

useAuth
```

---

### APIs

```text
dashboard.api.ts

email.api.ts
```

---

### Types

```text
DashboardStats

Email

Sender
```

---

# 27. Coding Standards

* Enable TypeScript strict mode.
* Avoid `any`.
* Prefer composition over inheritance.
* Keep functions focused.
* Use descriptive names.
* Keep components under ~200 lines when practical by extracting child components or hooks.

---

# 28. Error Boundary Strategy

Wrap

```text
Application

↓

Route

↓

Feature
```

Critical sections remain isolated.

---

# 29. Performance Checklist

* Route-based code splitting
* Lazy loading
* React Query cache
* Debounced search
* Memoized heavy components
* Backend pagination
* Request cancellation

---

# 30. Security Checklist

* Never expose secrets.
* Sanitize user input before rendering untrusted HTML.
* Use HTTPS in production.
* Validate on both frontend and backend.
* Clear session on logout.

---

# 31. Testing Strategy

## Unit Tests

Test

* Utility functions
* Zod schemas
* Custom hooks
* Store logic

---

## Component Tests

Test

* Forms
* Tables
* Cards
* Dialogs
* Navigation

---

## Integration Tests

Verify

* Authentication flow
* Email scheduling
* Sender management
* Dashboard loading
* CSV upload

---

## End-to-End Tests

Cover the complete user journey:

1. Login
2. Create sender
3. Schedule email
4. Verify dashboard updates
5. Logout

---

# 32. Git Workflow

```text
main

↓

develop

↓

feature/auth

↓

feature/dashboard

↓

feature/schedule-email
```

Small pull requests are easier to review and debug.

---

# 33. Deployment Checklist

Before deployment:

* ✅ Environment variables configured
* ✅ Production build succeeds
* ✅ No TypeScript errors
* ✅ No ESLint errors
* ✅ API URLs verified
* ✅ Google OAuth redirect URIs configured
* ✅ Accessibility checked
* ✅ Responsive layout verified
* ✅ Bundle size reviewed

---

# 34. Cursor AI Implementation Prompt

Use the following prompt as your implementation guide:

```text
Implement the ReachInbox frontend using React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, React Query, Zustand, Axios, React Hook Form, and Zod.

Follow a feature-based architecture with strict separation of concerns.

Rules:
- UI components must never call Axios directly.
- All server communication must go through API service files.
- Use React Query for all server state.
- Use Zustand only for authentication and UI state.
- Use React Hook Form + Zod for every form.
- Keep components presentational.
- Implement responsive layouts for desktop, tablet, and mobile.
- Use route-based code splitting and lazy loading.
- Show skeleton loaders and friendly error states.
- Follow the folder structure and dependency rules defined in the architecture documentation.
- Use reusable components, typed APIs, and consistent naming throughout the project.
```

---

# 35. Complete Frontend Architecture

```text
                              Browser
                                 │
                                 ▼
                           React Router
                                 │
                                 ▼
                       Dashboard Layout
                                 │
      ┌───────────────┬───────────────┬────────────────┐
      ▼               ▼               ▼
 Authentication   Dashboard      Email Scheduling
      │               │               │
      ▼               ▼               ▼
   Auth Store     React Query     React Hook Form
      │               │               │
      └───────────────┼───────────────┘
                      ▼
                 API Services
                      │
                      ▼
                 Axios Client
                      │
                      ▼
               Express Backend
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   PostgreSQL      Redis         BullMQ
```

---

# 36. Development Roadmap

```text
Project Setup
      │
      ▼
Core Infrastructure
      │
      ▼
Authentication
      │
      ▼
Dashboard Layout
      │
      ▼
Dashboard Features
      │
      ▼
Sender Management
      │
      ▼
Email Scheduling
      │
      ▼
Email Management
      │
      ▼
Settings
      │
      ▼
Performance Optimisation
      │
      ▼
Testing
      │
      ▼
Deployment
```

---

# 37. Production Readiness Checklist

### Architecture

* ✅ Feature-based structure
* ✅ Layered architecture
* ✅ Single Axios client
* ✅ React Query for server state
* ✅ Zustand for UI/auth state

### Code Quality

* ✅ Strict TypeScript
* ✅ Reusable components
* ✅ Shared hooks
* ✅ Consistent naming
* ✅ Clear dependency boundaries

### User Experience

* ✅ Responsive UI
* ✅ Accessible components
* ✅ Loading skeletons
* ✅ Error boundaries
* ✅ Friendly error messages

### Performance

* ✅ Code splitting
* ✅ Lazy loading
* ✅ Optimised bundles
* ✅ Intelligent caching
* ✅ Backend pagination

### Security

* ✅ Protected routes
* ✅ Secure authentication flow
* ✅ Input validation
* ✅ Session cleanup
* ✅ No exposed secrets

### Testing

* ✅ Unit tests
* ✅ Component tests
* ✅ Integration tests
* ✅ End-to-end tests

---

# Frontend Documentation Complete ✅

This completes the **10-part frontend architecture series**:

1. Project Overview & High-Level Architecture
2. UI Architecture & Component Design
3. Routing & Navigation
4. State Management & Data Flow
5. API Layer & Backend Integration
6. Authentication Architecture
7. Dashboard Architecture
8. Email Scheduling, CSV Upload & Forms
9. Performance, UX & Production Best Practices
10. Implementation Guide & Complete Project Structure

Together with your backend documentation, this provides a complete, production-oriented blueprint that can be used to implement the entire ReachInbox application in a structured and maintainable way.
