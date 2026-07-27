# ReachInbox Hiring Assignment

# Frontend Architecture Documentation

# Part 7 — Dashboard Architecture & UI Modules (Production Deep Dive)

> The Dashboard is the heart of the application.
>
> It should allow users to manage email scheduling efficiently while remaining fast, responsive, and scalable.

The dashboard should **not** be a single huge page.

Instead, it should be built from small reusable modules.

---

# 1. Dashboard Goals

The dashboard should enable users to:

* View overall statistics
* Schedule emails
* View recent emails
* Manage senders
* Search emails
* Filter emails
* Sort emails
* Retry failed emails
* Cancel scheduled emails
* View account information

---

# 2. Dashboard Layout

```text
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │                 Navbar                           │
├─────────┼───────────────────────────────────────────────────┤
│         │ Statistics Cards                                 │
│         ├───────────────────────────────────────────────────┤
│         │ Recent Emails                                    │
│         ├───────────────────────────────────────────────────┤
│         │ Email Table                                      │
│         ├───────────────────────────────────────────────────┤
│         │ Sender Management                                │
└─────────┴───────────────────────────────────────────────────┘
```

Everything inside the dashboard should be modular.

---

# 3. Dashboard Folder Structure

```text
src/

features/

dashboard/

├── components/

│   ├── stats/

│   ├── recent/

│   ├── charts/

│   ├── overview/

│   ├── quick-actions/

│   └── activity/

├── hooks/

├── services/

├── pages/

└── types/
```

---

# 4. Dashboard Component Tree

```text
DashboardPage

│

├── StatisticsSection

├── QuickActions

├── ActivityChart

├── RecentEmails

├── EmailTable

├── SenderOverview

└── Footer
```

Each section is independent.

---

# 5. Dashboard Data Flow

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

↓

Statistics

↓

Cards
```

---

# 6. Dashboard Statistics

Top cards display

```text
Scheduled

Sent

Failed

Pending
```

Each card receives only its own data.

---

# 7. Statistics Component

```text
StatisticsSection

│

├── StatCard

├── StatCard

├── StatCard

└── StatCard
```

Reusable component.

---

# 8. StatCard Structure

```text
Card

↓

Icon

↓

Title

↓

Value

↓

Trend

↓

Description
```

Props only.

No API logic.

---

# 9. Quick Actions

Provide shortcuts.

Example

```text
Schedule Email

Upload CSV

Create Sender

Refresh Dashboard
```

Improves workflow.

---

# 10. Dashboard Charts

Optional analytics.

Examples

```text
Emails Per Day

Success Rate

Failed Emails

Queue Activity
```

Chart components should only render data passed as props.

---

# 11. Recent Emails

Displays latest email activity.

```text
Recipient

Subject

Status

Scheduled Time
```

Limit to 5–10 records.

---

# 12. Recent Email Card

```text
Avatar

Recipient

Subject

Status Badge

Timestamp
```

Clickable to open details.

---

# 13. Email Table

The primary management interface.

Displays

* Recipient
* Subject
* Sender
* Status
* Scheduled Time
* Actions

---

# 14. Email Table Architecture

```text
EmailTable

│

├── TableHeader

├── SearchBar

├── Filters

├── Rows

├── Pagination

└── EmptyState
```

---

# 15. Table Row

Each row contains

```text
Recipient

Subject

Sender

Status

Date

Actions
```

Actions are isolated.

---

# 16. Row Actions

Examples

```text
View

Retry

Cancel

Delete
```

Each action opens a confirmation dialog when needed.

---

# 17. Status Badge

Reusable badge.

Possible values

```text
Pending

Queued

Processing

Sent

Failed

Cancelled
```

Use colours consistently.

---

# 18. Search

Search by

* Recipient
* Subject
* Sender

Search input updates query parameters.

---

# 19. Search Flow

```text
Search Input

↓

Debounce

↓

React Query

↓

Backend

↓

Updated Table
```

Avoid API requests on every keystroke.

---

# 20. Debouncing

Recommended delay

```text
300–500 ms
```

Improves performance.

---

# 21. Filtering

Possible filters

```text
Status

Sender

Date Range
```

Filters should update the URL.

Example

```text
/emails?status=FAILED
```

---

# 22. Sorting

Allow sorting by

* Date
* Recipient
* Status

Sorting should also be reflected in query parameters.

---

# 23. Pagination

Backend-driven pagination.

```text
Page

↓

React Query

↓

Backend

↓

Table
```

Never fetch thousands of rows.

---

# 24. Empty State

Instead of an empty table.

Display

```text
No Emails Found

↓

Illustration

↓

Schedule Email Button
```

---

# 25. Loading State

Show

```text
Skeleton Rows

↓

Skeleton Cards
```

Never flash empty content.

---

# 26. Error State

If dashboard request fails.

Display

```text
Error Illustration

↓

Retry Button
```

---

# 27. Sender Overview

Displays

* Sender Name
* Email
* Hourly Limit
* Status

Quick access to sender information.

---

# 28. Sender Card

```text
Sender Name

↓

Email

↓

Hourly Limit

↓

Status Badge
```

---

# 29. Dashboard Refresh

Refresh button

↓

Invalidate Queries

↓

Fetch Latest Data

No browser refresh required.

---

# 30. Responsive Layout

Desktop

```text
Stats Stats Stats Stats

Chart Chart Recent

Table Table Table
```

Tablet

```text
Stats Stats

Stats Stats

Chart

Recent

Table
```

Mobile

```text
Stats

Stats

Recent

Table
```

---

# 31. Sidebar Behaviour

Desktop

```text
Fixed Sidebar
```

Tablet

```text
Collapsible Sidebar
```

Mobile

```text
Drawer Navigation
```

---

# 32. Navbar

Contains

```text
Search

Theme Toggle

Notifications

Profile Menu
```

Always visible.

---

# 33. Dashboard State

Managed by

```text
React Query

↓

Dashboard Data
```

UI state

↓

Local State

---

# 34. Component Communication

```text
Dashboard

↓

StatisticsSection

↓

StatCard
```

Data flows downward.

No sibling communication.

---

# 35. React Query Usage

Dashboard data should come from

```text
useDashboard()

↓

React Query

↓

Cache
```

No direct Axios.

---

# 36. Dashboard Refresh Strategy

After

```text
Schedule Email
```

Invalidate

```text
dashboard

emails
```

Queries.

Cards update automatically.

---

# 37. Accessibility

Dashboard should support

* Keyboard navigation
* Focus indicators
* Screen readers
* Proper headings
* Semantic tables

---

# 38. Animations

Use subtle animations for

* Cards
* Table rows
* Dialogs
* Notifications

Avoid excessive motion.

---

# 39. Performance

Optimise by

* Memoised cards
* Lazy-loaded charts
* Virtualised tables (future)
* React Query caching
* Debounced search

---

# 40. Dashboard Dependency Rules

Allowed

```text
Dashboard

↓

Hooks

↓

React Query
```

Forbidden

```text
StatCard

↓

Axios
```

Presentation components should never fetch data.

---

# 41. Folder Structure

```text
dashboard/

components/

├── DashboardHeader

├── StatisticsSection

├── StatCard

├── QuickActions

├── RecentEmails

├── EmailTable

├── SenderOverview

├── Charts

└── EmptyState
```

---

# 42. Complete Dashboard Flow

```text
User
 │
 ▼
Dashboard Page
 │
 ▼
useDashboard()
 │
 ▼
React Query
 │
 ▼
Backend API
 │
 ▼
Dashboard Data
 │
 ▼
Statistics
Recent Emails
Email Table
Sender Cards
```

---

# 43. Dashboard Architecture

```text
DashboardLayout
 │
 ├── Sidebar
 │
 ├── Navbar
 │
 └── DashboardPage
      │
      ├── StatisticsSection
      │     └── StatCard ×4
      │
      ├── QuickActions
      │
      ├── ActivityChart
      │
      ├── RecentEmails
      │
      ├── EmailTable
      │
      └── SenderOverview
```

---

# 44. Best Practices

✅ Split the dashboard into independent modules.

✅ Keep components presentational.

✅ Use React Query for all dashboard data.

✅ Refresh data using cache invalidation.

✅ Debounce search.

✅ Backend handles pagination, filtering, and sorting.

✅ Keep URL in sync with filters.

✅ Use loading skeletons.

✅ Show meaningful empty and error states.

---

# 45. Complete Dashboard Module Architecture

```text
                           Dashboard
                               │
                               ▼
                      Dashboard Layout
                               │
        ┌──────────────┬───────────────┐
        ▼              ▼               ▼
     Sidebar        Navbar        Dashboard Page
                                        │
        ┌─────────────┼─────────────┬─────────────┐
        ▼             ▼             ▼             ▼
 Statistics      Quick Actions   Recent       Email Table
    │                              Emails          │
    ▼                                │             ▼
 StatCard ×4                   Email Cards   Search / Filter
                                                │
                                                ▼
                                          React Query
                                                │
                                                ▼
                                            Express API
                                                │
                                                ▼
                                         PostgreSQL Data
```

---

# End of Part 7
