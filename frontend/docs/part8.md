# ReachInbox Hiring Assignment

# Frontend Architecture Documentation

# Part 8 — Email Scheduling Module, CSV Upload, Forms & Validation (Production Deep Dive)

> The **Email Scheduling Module** is the most important feature of the frontend.
>
> This module is responsible only for collecting, validating, and submitting data.
>
> **The frontend never decides when an email is sent.** It only sends scheduling requests to the backend.

---

# 1. Module Goals

Allow users to

* Schedule one email
* Schedule multiple emails
* Upload CSV
* Select sender
* Choose date & time
* Configure delay between emails
* Configure hourly limit
* Validate inputs
* Submit request
* View success/error messages

---

# 2. Module Architecture

```text
Schedule Page

↓

React Hook Form

↓

Zod Validation

↓

Mutation

↓

Email API

↓

Backend

↓

Queue Created
```

---

# 3. Folder Structure

```text
features/

emails/

├── pages/

├── components/

├── hooks/

├── services/

├── schemas/

├── types/

└── utils/
```

---

# 4. Component Tree

```text
SchedulePage

│

├── ScheduleForm

│

├── CSVUploader

│

├── SenderSelector

│

├── RecipientSection

│

├── ScheduleOptions

│

├── PreviewSection

│

└── SubmitButton
```

Every section has one responsibility.

---

# 5. Schedule Page Layout

```text
┌────────────────────────────────────────────┐
│ Schedule Email                             │
├────────────────────────────────────────────┤
│ Sender                                     │
├────────────────────────────────────────────┤
│ Subject                                    │
├────────────────────────────────────────────┤
│ Email Body                                 │
├────────────────────────────────────────────┤
│ Recipients                                 │
├────────────────────────────────────────────┤
│ CSV Upload                                 │
├────────────────────────────────────────────┤
│ Schedule Date & Time                       │
├────────────────────────────────────────────┤
│ Delay & Hourly Limit                       │
├────────────────────────────────────────────┤
│ Preview                                    │
├────────────────────────────────────────────┤
│ Schedule Button                            │
└────────────────────────────────────────────┘
```

---

# 6. Form Architecture

Instead of many independent states

```text
Subject

Body

Recipients

↓

One Form
```

Managed by

```text
React Hook Form
```

---

# 7. Why React Hook Form?

Benefits

* Minimal re-renders
* Better performance
* Easy validation
* Simple reset
* TypeScript support

---

# 8. Validation

Validation happens before submission.

Use

```text
Zod

↓

React Hook Form
```

Never rely only on backend validation.

---

# 9. Validation Rules

Validate

* Sender selected
* Subject required
* Body required
* At least one recipient
* Valid emails
* Future schedule time
* Positive delay
* Positive hourly limit

---

# 10. Schedule Form Sections

```text
Sender

↓

Subject

↓

Body

↓

Recipients

↓

CSV Upload

↓

Options

↓

Submit
```

---

# 11. Sender Selector

Loads senders from

```text
useSenders()

↓

React Query

↓

Backend
```

Dropdown displays

* Sender Name
* Email

---

# 12. Recipient Input

Support

* Single recipient
* Multiple recipients

Display each email as a removable chip/tag.

---

# 13. Recipient Flow

```text
Type Email

↓

Validate

↓

Add Recipient

↓

Chip Appears
```

---

# 14. CSV Upload

Alternative to manual entry.

Supports

```text
.csv
```

only.

---

# 15. CSV Flow

```text
Choose File

↓

Validate Extension

↓

PapaParse

↓

Validate Rows

↓

Recipients Added
```

---

# 16. CSV Validation

Check

* File exists
* Correct format
* Valid email column
* Duplicate emails
* Empty rows

Reject invalid records gracefully.

---

# 17. Duplicate Recipients

Before submission

```text
Recipients

↓

Remove Duplicates

↓

Unique List
```

Avoid sending duplicate scheduling requests.

---

# 18. Subject Field

Single-line input.

Validation

```text
Required

Maximum Length
```

---

# 19. Email Body

Textarea or rich text editor (future).

Validation

```text
Required
```

---

# 20. Schedule Date & Time

Use a calendar + time picker.

Validation

```text
Future Date

Required
```

---

# 21. Date Selection Flow

```text
Calendar

↓

Time Picker

↓

ISO Date

↓

Backend
```

Always send timestamps in a consistent format.

---

# 22. Delay Between Emails

User configures

```text
Seconds

or

Minutes
```

Example

```text
30 seconds
```

The backend enforces this delay.

---

# 23. Hourly Limit

Allows user to specify

```text
Emails Per Hour
```

Example

```text
100
```

Backend validates and enforces the limit.

---

# 24. Preview Section

Before submission show

* Sender
* Number of recipients
* Schedule time
* Delay
* Hourly limit

Helps users verify their input.

---

# 25. Form Submission

```text
Click Schedule

↓

Validate

↓

Mutation

↓

Backend

↓

Success
```

---

# 26. Mutation Flow

```text
React Hook Form

↓

Mutation

↓

Email API

↓

Axios

↓

Backend
```

---

# 27. Loading State

While submitting

```text
Disable Button

↓

Spinner

↓

Prevent Duplicate Submission
```

---

# 28. Success Flow

Backend returns success.

```text
Success Toast

↓

Reset Form

↓

Navigate Emails

↓

Invalidate Queries
```

---

# 29. Failure Flow

Backend returns error.

```text
Toast

↓

Keep Form Values

↓

Allow Retry
```

Never clear user input on failure.

---

# 30. React Query Mutation

Mutation responsibilities

* Send request
* Loading state
* Error handling
* Success handling
* Cache invalidation

---

# 31. Cache Invalidation

After scheduling

Invalidate

```text
dashboard

emails
```

Dashboard updates automatically.

---

# 32. Form Reset

Only after successful scheduling.

Reset

* Subject
* Body
* Recipients
* CSV
* Schedule options

---

# 33. Draft Support (Future)

Optional enhancement

```text
Save Draft

↓

Local Storage
```

Restore later.

---

# 34. File Upload Component

Structure

```text
Dropzone

↓

Browse Button

↓

File Preview

↓

Remove Button
```

---

# 35. Upload Progress

Display

```text
Uploading...

Progress

Completed
```

Useful if large CSV files are supported later.

---

# 36. Recipient Preview

Display

```text
Total Recipients

↓

Recipient List

↓

Duplicate Count

↓

Invalid Count
```

Before submission.

---

# 37. Schedule Summary

Show summary card

```text
Sender

Recipients

Schedule Time

Delay

Hourly Limit
```

Allows final confirmation.

---

# 38. Confirmation Dialog

Optional

```text
Schedule 500 Emails?

↓

Confirm

↓

Cancel
```

Helpful for bulk operations.

---

# 39. Accessibility

All form fields should have

* Labels
* Error messages
* Keyboard navigation
* Focus indicators

CSV upload should be keyboard accessible.

---

# 40. Responsive Layout

Desktop

```text
Two-column layout

Form | Preview
```

Tablet

```text
Single column

Preview below form
```

Mobile

```text
Everything stacked
```

---

# 41. Dependency Rules

Allowed

```text
Schedule Page

↓

Schedule Form

↓

Mutation

↓

Backend
```

Forbidden

```text
Input Component

↓

Axios
```

Presentation components must never communicate directly with APIs.

---

# 42. Complete Submission Flow

```text
User

↓

Schedule Page

↓

React Hook Form

↓

Zod

↓

Mutation

↓

Email API

↓

Backend

↓

Queue Created

↓

Success Toast

↓

Dashboard Refresh
```

---

# 43. Component Responsibilities

| Component        | Responsibility            |
| ---------------- | ------------------------- |
| SchedulePage     | Assemble page             |
| ScheduleForm     | Form layout               |
| SenderSelector   | Select sender             |
| RecipientSection | Manage recipients         |
| CSVUploader      | Parse CSV                 |
| ScheduleOptions  | Delay, hourly limit, date |
| PreviewSection   | Display summary           |
| SubmitButton     | Trigger mutation          |

---

# 44. Best Practices

✅ Use React Hook Form for all form state.

✅ Use Zod for validation.

✅ Use PapaParse for CSV parsing.

✅ Remove duplicate recipients before submission.

✅ Keep backend responsible for scheduling logic.

✅ Disable submit while mutation is running.

✅ Invalidate relevant queries after success.

✅ Preserve user input on failure.

✅ Show preview before scheduling.

---

# 45. Complete Scheduling Module Architecture

```text
                              User
                                │
                                ▼
                         Schedule Page
                                │
         ┌──────────────┬───────────────┬──────────────┐
         ▼              ▼               ▼
  Schedule Form    CSV Uploader    Preview Panel
         │              │               │
         └──────┬───────┴───────────────┘
                ▼
         React Hook Form
                │
                ▼
          Zod Validation
                │
                ▼
       React Query Mutation
                │
                ▼
           Email API Service
                │
                ▼
            Axios Client
                │
                ▼
          Express Backend
                │
                ▼
     PostgreSQL + BullMQ + Redis
                │
                ▼
        Success / Error Response
                │
                ▼
      Toast + Cache Invalidation
                │
                ▼
         Updated Dashboard UI
```

---

# 46. Production Checklist

* ✅ React Hook Form for form management
* ✅ Zod validation
* ✅ Sender selection
* ✅ Manual recipients
* ✅ CSV upload with PapaParse
* ✅ Duplicate detection
* ✅ Date & time picker
* ✅ Delay configuration
* ✅ Hourly limit configuration
* ✅ Preview panel
* ✅ React Query mutation
* ✅ Loading and error states
* ✅ Cache invalidation
* ✅ Responsive layout
* ✅ Accessible form controls

---

# End of Part 8
