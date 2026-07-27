# ReachInbox Hiring Assignment

# Frontend Architecture Documentation

# Part 4 — State Management, React Query & Application Data Flow (Production Deep Dive)

> This is the **most important frontend architecture chapter**.
>
> A well-designed state management architecture prevents unnecessary re-renders, duplicate API calls, inconsistent UI, and difficult-to-maintain code.

---

# 1. Understanding State

Everything that changes in a React application is called **State**.

Examples

```text id="rnzt9x"
Current User

↓

Scheduled Emails

↓

Sidebar Open

↓

Dark Mode

↓

Search Query

↓

Current Page
```

Not all state should be stored in the same place.

---

# 2. Types of State

The application contains **four** types of state.

```text id="a7onlz"
Local State

↓

Global State

↓

Server State

↓

URL State
```

Each has a different responsibility.

---

# 3. Local State

Local state belongs to **one component only**.

Examples

```text id="x64l4k"
Modal Open

Input Value

Dropdown Open

Accordion Expanded

Selected Tab
```

Use

```text id="gcvjhd"
useState()
```

Never store local UI state globally.

---

# 4. Example

Schedule Form

```text id="6fvsk6"
Recipient Email

↓

Subject

↓

Body
```

Until submission,

this belongs inside the component.

---

# 5. Global State

Global state is shared across multiple pages.

Examples

```text id="pvnlck"
Current User

Theme

JWT Token

Sidebar State

Notifications
```

Use

```text id="cvu55d"
Zustand
```

(or Context API for very small apps)

---

# 6. Server State

Server state belongs to the backend.

Examples

```text id="ax08k0"
Emails

Dashboard Stats

Senders

Profile

Failed Emails
```

Never copy this into Zustand.

Instead use

```text id="yix58z"
React Query
```

---

# 7. URL State

Example

```text id="2k7go8"
/emails?page=2

/status=FAILED

/search=raj
```

URL becomes part of the application state.

Benefits

* Refresh safe
* Shareable links
* Browser history support

---

# 8. State Architecture

```text id="nrt7yo"
React

│

├── Local State

├── Global State

├── React Query

└── URL
```

Each type manages only its own responsibility.

---

# 9. Why React Query?

Without React Query

```text id="7hkfx9"
Component

↓

useEffect()

↓

Axios

↓

Loading

↓

Error

↓

Cache

↓

Retry

↓

Refetch
```

Lots of repeated code.

---

React Query

```text id="s4k4ez"
useQuery()

↓

Everything Managed
```

---

# 10. Responsibilities of React Query

React Query handles

* Fetching
* Caching
* Background updates
* Retry
* Loading state
* Error state
* Cache invalidation
* Refetch

Automatically.

---

# 11. React Query Architecture

```text id="ovdkys"
Component

↓

Custom Hook

↓

React Query

↓

Axios

↓

Backend
```

Components never call Axios directly.

---

# 12. API Layer

Instead of

```text id="u4s9zi"
Dashboard

↓

Axios
```

Use

```text id="b7k1yy"
Dashboard

↓

useDashboard()

↓

Dashboard Service

↓

Axios
```

Clean architecture.

---

# 13. Folder Structure

```text id="tjlwmn"
api/

├── axios.ts

├── auth.api.ts

├── email.api.ts

├── sender.api.ts

└── dashboard.api.ts
```

---

# 14. Hooks Folder

```text id="f5jlud"
hooks/

├── useDashboard.ts

├── useEmails.ts

├── useScheduleEmail.ts

├── useSenders.ts

└── useAuth.ts
```

Each hook wraps React Query.

---

# 15. Data Flow

```text id="jlwmz9"
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

Cache

↓

Component
```

---

# 16. Query Keys

Every cached request needs a unique key.

Examples

```text id="kg8t8y"
dashboard

emails

senders

profile
```

Dynamic

```text id="8x4mct"
emails

↓

page

↓

status
```

React Query identifies cache using these keys.

---

# 17. Cache

Suppose

Dashboard requests

```text id="3b6l0s"
GET /dashboard
```

React Query stores

```text id="7vy2l5"
Dashboard Data
```

Second component

↓

Uses cache

↓

No extra API call.

---

# 18. Background Refetch

User opens Dashboard.

React Query

↓

Uses cache

↓

Refreshes in background

↓

Updates UI automatically.

Great UX.

---

# 19. Mutations

Fetching

↓

Query

Changing data

↓

Mutation

Examples

```text id="4c3n1l"
Schedule Email

Create Sender

Delete Sender

Retry Email

Cancel Email
```

---

# 20. Mutation Flow

```text id="wz2csp"
Button Click

↓

Mutation

↓

Axios

↓

Backend

↓

Success

↓

Invalidate Cache

↓

Refetch
```

---

# 21. Cache Invalidation

Suppose

User schedules email.

Old cache

```text id="h8rg4o"
Emails
```

is outdated.

React Query

↓

Invalidate

↓

Refetch

↓

Updated table.

---

# 22. Dashboard Refresh

After

Schedule Email

Need

```text id="otw89w"
Dashboard Stats

Emails List
```

to update.

Invalidate both.

---

# 23. Optimistic Updates

Example

User deletes sender.

Instead of waiting

Backend

↓

Immediately remove from UI.

If backend fails

↓

Rollback.

Feels instant.

---

# 24. Retry

Temporary network failure

↓

React Query retries automatically.

Better than manual retry code.

---

# 25. Loading State

Instead of

```text id="8q5kfd"
Loading...
```

Use

```text id="0itxqz"
Skeleton Cards

Skeleton Table

Spinner
```

Loading state comes from React Query.

---

# 26. Error State

If API fails

```text id="1mcv78"
Error Component

↓

Retry Button
```

Consistent everywhere.

---

# 27. Global Authentication State

Store

```text id="ehnn34"
User

JWT

isAuthenticated
```

Not

Emails

Statistics

Senders

Those belong to React Query.

---

# 28. Theme State

Store globally

```text id="w02rgs"
Light

Dark

System
```

Simple UI preference.

---

# 29. Sidebar State

Example

```text id="88y0n4"
Expanded

Collapsed
```

Global UI state.

Not server state.

---

# 30. Search State

Search

```text id="0ldkvn"
Emails
```

belongs

Inside Email Page.

Unless multiple pages need it.

---

# 31. Pagination State

Current page

```text id="qvxftn"
1

2

3
```

should stay in URL.

Not global store.

---

# 32. React Query Lifecycle

```text id="7krjlwm"
Mount

↓

Cache?

↓

Yes

↓

Render

↓

Background Fetch

↓

Update UI
```

No manual handling.

---

# 33. Query Dependency

Dashboard

↓

Needs User

↓

User Loaded

↓

Dashboard Query Runs

React Query supports dependent queries.

---

# 34. Polling

Dashboard

Needs latest statistics.

React Query

↓

Refetch

Every

```text id="7chbl6"
30 sec
```

if required.

No custom interval.

---

# 35. Infinite Scroll

Future support

React Query

↓

Load Next Page

↓

Append

↓

Render

No redesign needed.

---

# 36. Complete State Architecture

```text id="3ts71p"
React

│

├── useState

│

├── Zustand

│

├── React Query

│

└── URL
```

---

# 37. Store Folder

```text id="p5mxz7"
store/

auth.store.ts

theme.store.ts

ui.store.ts
```

No server data.

---

# 38. Context Folder

Only use Context for

```text id="jvjlwm"
Theme

Providers

Configuration
```

Avoid putting all application state in Context.

---

# 39. Providers

```text id="vjlwm7"
QueryClientProvider

↓

ThemeProvider

↓

RouterProvider

↓

Toaster

↓

App
```

One place.

---

# 40. Dependency Rules

Allowed

```text id="5w5p2h"
Component

↓

Hook

↓

Service

↓

Axios
```

Forbidden

```text id="i0jkjm"
Component

↓

Axios
```

---

# 41. Complete Data Flow

```text id="2mjlwm"
Backend

↓

Axios

↓

React Query

↓

Cache

↓

Hook

↓

Component

↓

User
```

Single direction.

---

# 42. Scheduling Flow

```text id="twjlwm"
Form

↓

React Hook Form

↓

Zod

↓

Mutation

↓

Backend

↓

Success

↓

Toast

↓

Invalidate Queries

↓

Dashboard Updates
```

---

# 43. Dashboard Flow

```text id="jlwmv9"
Dashboard

↓

useDashboard()

↓

React Query

↓

Axios

↓

Backend

↓

Cache

↓

Cards
```

---

# 44. Authentication Flow

```text id="bjlwm8"
Login

↓

Google OAuth

↓

JWT

↓

Store Auth

↓

Fetch Profile

↓

Dashboard
```

---

# 45. Best Practices

✅ Local UI state → `useState`

✅ Authentication/UI preferences → Zustand

✅ Server data → React Query

✅ URL state → React Router

✅ Never duplicate server state in Zustand.

✅ Never call Axios directly from components.

✅ Always use custom hooks.

✅ Use cache invalidation after mutations.

✅ Use optimistic updates where appropriate.

---

# 46. Recommended Folder Structure

```text id="jlwm92"
src/

api/

hooks/

store/

providers/

contexts/

services/

utils/

types/
```

Clean separation.

---

# 47. Production Architecture

```text id="jlwm93"
User
 │
 ▼
Component
 │
 ▼
Custom Hook
 │
 ▼
React Query
 │
 ▼
Axios Service
 │
 ▼
Backend API
 │
 ▼
PostgreSQL
```

---

# 48. State Ownership Summary

| State                | Owner                                   |
| -------------------- | --------------------------------------- |
| Input field          | `useState` / React Hook Form            |
| Modal open           | `useState`                              |
| Current user         | Zustand                                 |
| JWT                  | Zustand (or secure storage abstraction) |
| Theme                | Zustand                                 |
| Sidebar collapsed    | Zustand                                 |
| Emails               | React Query                             |
| Dashboard statistics | React Query                             |
| Senders              | React Query                             |
| Profile              | React Query                             |
| Current page         | URL                                     |
| Search filters       | URL (when shareable) or local state     |

---

# 49. Common Mistakes to Avoid

❌ Storing API responses in Zustand.

❌ Calling Axios directly from components.

❌ Using `useEffect` for every API request instead of React Query.

❌ Duplicating the same request in multiple components.

❌ Keeping pagination only in component state when it belongs in the URL.

❌ Mixing UI state with server state.

---

# 50. Complete Frontend Data Architecture

```text id="state-final"
                     User
                       │
                       ▼
                 React Component
                       │
              ┌────────┴────────┐
              ▼                 ▼
         Local UI State    Custom Hook
         (useState/RHF)         │
                                ▼
                         React Query
                                │
                                ▼
                          Axios Client
                                │
                                ▼
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
                          UI Re-renders
```

---

# End of Part 4
