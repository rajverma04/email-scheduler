Yes. I'll make it exactly like the backend documentation—**production-grade, implementation-focused, and Cursor-friendly**.

Let's start with **Part 1**.

---

# ReachInbox Hiring Assignment

# Frontend Architecture Documentation

# Part 1 — Frontend Project Overview & High-Level Architecture

> This document explains the complete frontend architecture of the ReachInbox Email Scheduler Dashboard.

The frontend is **not just a collection of pages**.

It is a production-ready React application that communicates with the backend, manages authentication, schedules emails, displays analytics, and provides a responsive dashboard.

---

# 1. Project Goal

Build a modern dashboard that allows users to:

* Login using Google OAuth
* Manage multiple sender accounts
* Schedule emails
* Upload CSV files
* View scheduled emails
* View sent emails
* View failed emails
* Cancel scheduled emails
* Retry failed emails
* View dashboard statistics

The frontend should be:

* Fast
* Responsive
* Accessible
* Maintainable
* Scalable
* Production Ready

---

# 2. Functional Requirements

The frontend should provide the following features.

## Authentication

```text
Google Login

↓

Dashboard Access

↓

Logout
```

---

## Sender Management

```text
Create Sender

↓

Edit Sender

↓

Delete Sender

↓

List Senders
```

---

## Email Scheduling

```text
Single Email

↓

Bulk CSV Upload

↓

Schedule

↓

Confirmation
```

---

## Dashboard

```text
Statistics

↓

Recent Emails

↓

Scheduled Emails

↓

Failed Emails

↓

Sent Emails
```

---

## User Experience

```text
Loading

↓

Skeletons

↓

Success Toast

↓

Error Toast

↓

Retry
```

---

# 3. Non-Functional Requirements

The frontend should be

### Responsive

Works on

```text
Desktop

Laptop

Tablet

Mobile
```

---

### Fast

* Lazy loading
* Code splitting
* React Query caching
* Memoization

---

### Accessible

Support

* Keyboard navigation
* Screen readers
* Proper ARIA labels
* Focus management

---

### Maintainable

* Small reusable components
* Feature-based folders
* TypeScript
* Modular architecture

---

### Scalable

Easy to add

* Templates
* Campaigns
* Analytics
* Multiple organisations

without rewriting the application.

---

# 4. Technology Stack

## Core

```text
React 19

TypeScript

Vite
```

---

## Styling

```text
TailwindCSS

shadcn/ui
```

---

## Routing

```text
React Router
```

---

## API

```text
Axios
```

---

## Server State

```text
TanStack Query
```

---

## Forms

```text
React Hook Form

Zod
```

---

## Icons

```text
Lucide React
```

---

## Notifications

```text
React Hot Toast
```

---

## Animations

```text
Framer Motion
```

---

## CSV

```text
PapaParse
```

---

## Date Handling

```text
Day.js
```

---

# 5. Why React?

React provides

* Component architecture
* Huge ecosystem
* Reusable UI
* Virtual DOM
* Easy state management
* Excellent TypeScript support

Perfect for dashboard applications.

---

# 6. Why TypeScript?

Advantages

* Type safety
* Better autocomplete
* Refactoring support
* Compile-time error detection
* Better developer experience

---

# 7. Why Vite?

Compared to CRA

Advantages

* Extremely fast startup
* Faster HMR
* Smaller bundle
* Better DX

---

# 8. Why TailwindCSS?

Instead of writing CSS manually

Advantages

* Utility classes
* Faster development
* Responsive utilities
* Dark mode support
* Consistent spacing

---

# 9. Why shadcn/ui?

Instead of building every component

We get

```text
Buttons

Dialogs

Tables

Cards

Inputs

Dropdowns

Calendar

Popover

Toast
```

while still owning the source code.

---

# 10. Why React Query?

Server state is different from UI state.

Example

```text
Backend

↓

Scheduled Emails

↓

Frontend Cache
```

React Query manages

* Fetching
* Caching
* Refetching
* Background updates
* Loading state
* Error state

without manual code.

---

# 11. Why React Hook Form?

Forms like

```text
Schedule Email

↓

CSV Upload

↓

Create Sender
```

become much simpler.

Benefits

* High performance
* Minimal re-renders
* Easy validation
* Great TypeScript support

---

# 12. Why Zod?

Instead of

```text
if(name==="")

if(email==="")
```

Use

```text
Schema

↓

Validate

↓

Errors
```

Frontend and backend can share validation rules.

---

# 13. High-Level Architecture

```text
                     User

                       │

                React Application

                       │

               React Router

                       │

──────────────────────────────────────

                Feature Pages

                       │

                Reusable Components

                       │

             Custom Hooks / Services

                       │

                Axios API Client

                       │

                 Express Backend

                       │

               PostgreSQL + Redis
```

---

# 14. Frontend Layered Architecture

```text
Pages

↓

Feature Components

↓

Reusable UI Components

↓

Hooks

↓

API Services

↓

Axios Client

↓

Backend
```

Each layer has one responsibility.

---

# 15. Feature-Based Architecture

Instead of grouping by file type only,

group by features.

```text
Authentication

Email Scheduling

Dashboard

Senders

Settings
```

Every feature owns

* Components
* Hooks
* API
* Types

---

# 16. Complete Folder Structure

```text
frontend/

src/

├── app/

├── routes/

├── layouts/

├── pages/

├── features/

├── components/

├── hooks/

├── services/

├── api/

├── store/

├── contexts/

├── types/

├── schemas/

├── utils/

├── constants/

├── assets/

├── styles/

├── lib/

├── providers/

├── App.tsx

└── main.tsx
```

---

# 17. Folder Responsibilities

## app/

Application bootstrap.

---

## routes/

React Router configuration.

---

## layouts/

```text
Dashboard Layout

Auth Layout
```

---

## pages/

Actual pages.

Example

```text
Dashboard

Login

Schedule

Senders
```

---

## features/

Business modules.

Example

```text
dashboard/

emails/

senders/

auth/
```

---

## components/

Reusable UI

```text
Button

Input

Modal

Card

Table

Badge
```

---

## hooks/

Reusable logic

```text
useAuth

useDebounce

usePagination

useCSV
```

---

## services/

Business logic

```text
Email Service

Sender Service
```

---

## api/

Axios

Interceptors

Endpoints

---

## schemas/

Zod validation

---

## utils/

Date formatting

CSV helpers

Email helpers

---

# 18. Application Flow

```text
Browser

↓

React

↓

React Router

↓

Page

↓

Component

↓

Hook

↓

React Query

↓

Axios

↓

Backend

↓

Response

↓

Cache

↓

UI
```

---

# 19. Complete Request Flow

User clicks

```text
Schedule Email
```

↓

Form

↓

Validation

↓

React Hook Form

↓

React Query Mutation

↓

Axios

↓

Backend

↓

Success

↓

Toast

↓

Navigate

↓

Refresh Dashboard

---

# 20. Data Flow

```text
Backend

↓

Axios

↓

React Query Cache

↓

Hook

↓

Component

↓

User
```

No component should fetch directly using `fetch()`.

Always go through the API layer.

---

# 21. Design Principles

## Single Responsibility

Each component

does one job.

Example

```text
EmailCard

↓

Display Email
```

Not

Display

*

Fetch

*

Delete

*

Retry

---

## Reusability

Example

```text
Primary Button
```

Used

```text
Dashboard

Settings

Schedule

Senders
```

One component.

---

## Separation of Concerns

```text
UI

↓

Hooks

↓

API

↓

Backend
```

No mixing.

---

## Composition

Instead of

Huge Components

↓

Use

```text
Card

↓

Header

↓

Body

↓

Footer
```

Much easier to maintain.

---

# 22. Frontend Principles

✅ Components should be small.

✅ Pages should compose components.

✅ Hooks should contain reusable logic.

✅ Services should call APIs.

✅ React Query manages server state.

✅ Local state stays local.

✅ Forms use React Hook Form.

✅ Validation uses Zod.

✅ UI uses Tailwind + shadcn.

---

# 23. Production Architecture

```text
                        User

                          │

                   React Router

                          │

                    Dashboard Page

                          │

              Feature Components

                          │

               Reusable Components

                          │

                 React Query Hook

                          │

                   Axios Client

                          │

                    Express API

                          │

              PostgreSQL + Redis
```

---

# 24. Frontend Responsibilities

The frontend is responsible for:

* Rendering UI
* Managing navigation
* Client-side validation
* User interactions
* API communication
* Displaying loading/error states
* Caching server data
* Authentication state
* Responsive layouts

The frontend **is not responsible** for:

* Sending emails
* Rate limiting
* Queue management
* Scheduling logic
* SMTP communication
* Business rules
* Database operations

Those remain entirely in the backend.

---

# 25. Complete Frontend Overview

```text
User
 │
 ▼
React Application
 │
 ▼
React Router
 │
 ▼
Page
 │
 ▼
Feature Component
 │
 ▼
Reusable UI Component
 │
 ▼
Custom Hook
 │
 ▼
React Query
 │
 ▼
Axios
 │
 ▼
Backend API
 │
 ▼
PostgreSQL + Redis
```

---

# 26. Best Practices

✅ Feature-based architecture.

✅ TypeScript everywhere.

✅ Reusable components.

✅ Thin pages.

✅ Business logic in hooks/services.

✅ React Query for server state.

✅ TailwindCSS + shadcn/ui.

✅ Zod validation.

✅ Lazy-loaded routes.

✅ Responsive-first design.

---

# End of Part 1

