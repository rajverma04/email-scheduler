# ReachInbox Hiring Assignment

# Frontend Architecture Documentation

# Part 2 — UI Architecture, Component Design System & Folder Structure (Production Deep Dive)

> This document defines the complete UI architecture for the ReachInbox Email Scheduler Dashboard.
>
> The goal is to build a **reusable, scalable, responsive, and production-ready design system** rather than a collection of isolated pages.

---

# 1. UI Design Philosophy

The frontend should follow these principles:

* Consistent
* Reusable
* Responsive
* Accessible
* Minimal
* Fast
* Easy to maintain

Every screen should look like part of the same application.

---

# 2. Design Goals

The dashboard should feel similar to modern SaaS products like

```text
GitHub

Vercel

Linear

Notion

Supabase
```

Characteristics

* Clean layout
* Plenty of whitespace
* Consistent spacing
* Minimal colours
* Modern typography
* Soft shadows
* Rounded corners
* Smooth animations

---

# 3. UI Architecture

Instead of

```text
Pages

↓

Random Components
```

Use

```text
Pages

↓

Feature Components

↓

Reusable Components

↓

Primitive Components
```

Everything becomes reusable.

---

# 4. Atomic Design

We'll follow **Atomic Design**.

```text
Atoms

↓

Molecules

↓

Organisms

↓

Templates

↓

Pages
```

---

# 5. Atoms

Smallest UI elements.

Examples

```text
Button

Input

Label

Badge

Avatar

Icon

Spinner

Checkbox

Radio

Separator
```

Atoms never contain business logic.

---

# 6. Molecules

Combination of atoms.

Examples

```text
Search Bar

Date Picker

Email Row

Stat Card

File Upload

Dropdown

Pagination

Toast
```

---

# 7. Organisms

Large reusable sections.

Examples

```text
Sidebar

Navbar

Email Table

Schedule Form

Sender List

Dashboard Statistics

CSV Upload Section
```

---

# 8. Templates

Templates define page layouts.

Example

```text
Dashboard Layout

↓

Sidebar

↓

Navbar

↓

Content Area
```

---

# 9. Pages

Pages assemble everything.

Example

```text
Dashboard

↓

Statistics

↓

Recent Emails

↓

Charts

↓

Tables
```

---

# 10. Component Hierarchy

```text
App

↓

Router

↓

Dashboard Layout

↓

Dashboard Page

↓

Dashboard Section

↓

Stat Cards

↓

Card

↓

Typography

↓

Icon
```

Every level has one responsibility.

---

# 11. Folder Structure

```text
src/

components/

├── ui/

├── common/

├── forms/

├── feedback/

├── layout/

├── tables/

├── charts/

└── upload/
```

---

# 12. ui/

Contains primitive reusable components.

```text
Button

Input

Card

Badge

Dialog

Popover

Tooltip

Avatar

Checkbox

Textarea

Table

Calendar
```

Mostly generated from **shadcn/ui** and customised.

---

# 13. common/

Reusable business-independent components.

Examples

```text
Page Header

Loading

Empty State

Error State

Confirm Dialog

Search Input

Page Title

Logo

User Avatar
```

---

# 14. forms/

Contains reusable form components.

```text
Form Input

Form Select

Form Calendar

Email Input

CSV Upload

Password Input

Form Error

Submit Button
```

Every page uses these.

---

# 15. layout/

```text
Sidebar

Navbar

Footer

Container

Page Layout

Dashboard Layout
```

Responsible only for layout.

---

# 16. tables/

Reusable table system.

```text
Email Table

Sender Table

Pagination

Column Header

Empty Table

Table Actions
```

---

# 17. upload/

```text
CSV Upload

Dropzone

Upload Progress

File Preview
```

---

# 18. Dashboard Layout

```text
────────────────────────────────────────

Sidebar

│

│

│

├──────────────────────────────────────

Navbar

────────────────────────────────────────

Content

────────────────────────────────────────
```

Layout stays constant.

Only content changes.

---

# 19. Sidebar

Contains navigation.

Example

```text
Dashboard

Schedule

Emails

Senders

Settings

Logout
```

Never contains business logic.

---

# 20. Navbar

Contains

```text
User Avatar

Notification

Theme Toggle

Search

Profile Menu
```

Persistent across all pages.

---

# 21. Content Area

Pages render inside

```text
Dashboard Layout

↓

Outlet

↓

Current Page
```

React Router handles this.

---

# 22. Card System

Almost everything is displayed inside cards.

Examples

```text
Statistics

Recent Emails

Schedule Form

Sender Details

Charts
```

One reusable

```text
<Card>
```

component.

---

# 23. Statistics Card

Structure

```text
Card

↓

Icon

↓

Title

↓

Value

↓

Growth
```

Reusable for

* Scheduled
* Sent
* Failed
* Pending

---

# 24. Tables

Large datasets

↓

Table Component

Features

* Sorting
* Pagination
* Search
* Loading
* Empty State
* Row Actions

---

# 25. Forms

Every form follows

```text
Label

↓

Input

↓

Validation

↓

Error Message
```

Consistent everywhere.

---

# 26. Buttons

Instead of many button implementations

One

```text
<Button>
```

Variants

```text
Primary

Secondary

Outline

Ghost

Danger

Link
```

---

# 27. Inputs

Reusable

```text
Text

Email

Password

Textarea

Number

Date

Select
```

Every form uses them.

---

# 28. Dialogs

Use one reusable dialog.

Examples

```text
Delete Sender

Cancel Email

Retry Email

Logout
```

No custom modal each time.

---

# 29. Empty States

Example

```text
No Scheduled Emails

↓

Illustration

↓

Description

↓

Schedule Button
```

Never show empty tables.

---

# 30. Loading States

Instead of

```text
Loading...
```

Use

```text
Skeleton Cards

Skeleton Table

Skeleton Form
```

Better UX.

---

# 31. Error States

Every page handles errors consistently.

```text
Illustration

↓

Message

↓

Retry Button
```

---

# 32. Toast Notifications

Success

```text
Email Scheduled Successfully
```

Failure

```text
Failed to Upload CSV
```

Info

```text
Processing Started
```

---

# 33. Icons

Use

```text
Lucide React
```

Examples

```text
Mail

Calendar

Clock

User

Trash

Upload

Settings
```

Maintain consistency.

---

# 34. Colour Palette

Use semantic colours instead of hardcoded values.

```text
Primary

Secondary

Success

Warning

Danger

Muted

Background

Border
```

Allows easy theme changes.

---

# 35. Typography

Hierarchy

```text
Heading 1

Heading 2

Heading 3

Body

Caption

Small Text
```

Use consistent font sizes.

---

# 36. Spacing System

Use an 8px spacing scale.

```text
4

8

12

16

24

32

48

64
```

Avoid arbitrary spacing.

---

# 37. Border Radius

Consistent radius.

Example

```text
Small

Medium

Large
```

Every card should feel related.

---

# 38. Shadows

Only a few shadow levels.

```text
Small

Medium

Large
```

No random shadows.

---

# 39. Responsive Design

Breakpoints

```text
Mobile

Tablet

Laptop

Desktop
```

Sidebar

```text
Desktop

↓

Fixed
```

```text
Mobile

↓

Drawer
```

---

# 40. Mobile Navigation

Instead of permanent sidebar

```text
Hamburger

↓

Drawer

↓

Navigation
```

---

# 41. Dashboard Grid

Desktop

```text
Stats Stats Stats Stats

Chart Chart Recent

Table Table Table
```

Mobile

```text
Stats

Stats

Chart

Recent

Table
```

---

# 42. Component Communication

Parent

↓

Props

↓

Child

Avoid deep prop drilling.

Shared state goes through hooks or context.

---

# 43. Theme Support

Support

```text
Light

Dark

System
```

Tailwind makes this simple.

Store preference in local storage.

---

# 44. Accessibility

Every component should support

* Keyboard navigation
* Focus rings
* Screen readers
* ARIA labels
* Semantic HTML

Never rely on colour alone.

---

# 45. Animation Strategy

Use

```text
Framer Motion
```

Animations

* Page transitions
* Dialogs
* Dropdowns
* Toasts
* Cards

Keep them subtle.

---

# 46. Reusable Component Rules

A reusable component should:

* Have one responsibility
* Accept props
* Avoid API calls
* Avoid business logic
* Be easily testable

Example

```text
StatCard

↓

Receives

Title

Value

Icon

Trend

Only displays them.
```

---

# 47. Dashboard Component Tree

```text
App
│
├── DashboardLayout
│   ├── Sidebar
│   ├── Navbar
│   └── Outlet
│
└── DashboardPage
    ├── StatsSection
    │   ├── StatCard
    │   ├── StatCard
    │   ├── StatCard
    │   └── StatCard
    │
    ├── RecentEmails
    │   └── EmailTable
    │
    ├── ActivityChart
    │
    └── QuickActions
```

---

# 48. Component Dependency Rules

Allowed

```text
Page

↓

Feature Component

↓

Common Component

↓

UI Component
```

Forbidden

```text
UI Component

↓

API Call
```

Forbidden

```text
Button

↓

React Query
```

Primitive components should never know about business logic.

---

# 49. Complete UI Architecture

```text
User
 │
 ▼
React Router
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
 │
 ▼
Primitive UI Components
 │
 ▼
HTML
```

---

# 50. Best Practices

✅ Follow Atomic Design.

✅ Keep UI components business-agnostic.

✅ Use feature-based folders.

✅ Build one reusable component instead of many similar ones.

✅ Keep layouts separate from pages.

✅ Use semantic colours and spacing.

✅ Make every page responsive.

✅ Prefer composition over duplication.

✅ Keep animations subtle and purposeful.

✅ Ensure accessibility from the beginning.

---

# End of Part 2