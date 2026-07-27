# ReachInbox Hiring Assignment

# Frontend Architecture Documentation

# Part 6 — Authentication Architecture (Google OAuth, JWT, Session Management & Protected Application Flow)

> Authentication is the gateway to the application. It ensures that only authorized users can access protected resources while providing a seamless login experience.

The frontend should **never implement authentication logic itself**. It should only coordinate the login flow with the backend.

---

# 1. Authentication Goals

The authentication system should provide:

* Google OAuth Login
* Secure JWT-based authentication
* Session restoration
* Protected routes
* Automatic logout
* Secure API requests
* Smooth user experience

---

# 2. Authentication Flow Overview

```text
User

↓

Click "Continue with Google"

↓

Google OAuth

↓

Backend

↓

JWT Generated

↓

Frontend Stores Session

↓

Dashboard
```

The frontend never verifies Google credentials itself.

---

# 3. Authentication Components

```text
Browser

↓

Login Page

↓

Google OAuth

↓

Backend

↓

JWT

↓

Auth Store

↓

Protected Routes
```

---

# 4. Authentication Folder Structure

```text
src/

features/

└── auth/
    ├── components/
    ├── hooks/
    ├── services/
    ├── types/
    └── pages/

store/

└── auth.store.ts

api/

└── auth.api.ts

routes/

└── ProtectedRoute.tsx
```

---

# 5. Authentication State

Authentication state should contain only essential information.

```text
Current User

JWT Token

isAuthenticated

isLoading
```

Do **not** store dashboard data or emails here.

---

# 6. Auth Store Responsibilities

The authentication store should manage:

* Current user
* Login status
* Logout
* Session restoration
* Token removal

It should **not** perform API requests directly.

---

# 7. Login Page

Responsibilities:

* Show Google Login button
* Handle loading state
* Display authentication errors
* Redirect authenticated users

It should not contain business logic.

---

# 8. Login Flow

```text
User

↓

Click Login

↓

Google OAuth

↓

Backend

↓

JWT

↓

Save Session

↓

Navigate Dashboard
```

---

# 9. Google OAuth Flow

```text
Frontend

↓

Google Login

↓

Google Consent Screen

↓

Authorization Code

↓

Backend

↓

Google Verification

↓

JWT

↓

Frontend
```

The backend verifies the Google user.

---

# 10. Why Backend Verification?

Never trust the browser.

The backend should

* Verify Google identity
* Create user if necessary
* Generate JWT
* Return authenticated user

---

# 11. JWT

JWT represents the authenticated session.

The frontend only

* Stores it
* Sends it
* Removes it

It never creates or validates JWTs.

---

# 12. Where to Store JWT?

Possible options:

* HttpOnly Cookie (recommended)
* Secure Cookie
* Local Storage (acceptable for assignments)
* Session Storage

For this assignment:

```text
JWT

↓

Local Storage
```

For production:

```text
JWT

↓

HttpOnly Cookie
```

---

# 13. Authentication Lifecycle

```text
Login

↓

Receive JWT

↓

Store JWT

↓

Authenticated Requests

↓

Logout

↓

Remove JWT
```

---

# 14. Session Restoration

Suppose the user refreshes the page.

The app should restore the session.

```text
App Starts

↓

JWT Exists?

↓

Yes

↓

Fetch Profile

↓

Restore User

↓

Dashboard
```

---

# 15. Startup Authentication Flow

```text
main.tsx

↓

Providers

↓

Router

↓

Check Session

↓

Protected Route

↓

Dashboard
```

---

# 16. Fetch Current User

Instead of trusting stored user data,

always request

```text
GET /auth/me
```

The backend returns the latest profile.

---

# 17. Authentication Check

```text
JWT Exists?

↓

No

↓

Login

↓

Yes

↓

Fetch User

↓

Authenticated
```

---

# 18. Protected Routes

Protected pages:

```text
Dashboard

Schedule

Emails

Senders

Settings
```

Public users cannot access them.

---

# 19. Protected Route Flow

```text
User

↓

Protected Route

↓

Authenticated?

↓

Yes

↓

Render Page

↓

No

↓

Redirect Login
```

---

# 20. Public Routes

Public pages:

```text
Login

OAuth Callback

404
```

Authenticated users should automatically redirect to the dashboard.

---

# 21. Logout Flow

```text
User

↓

Logout

↓

Clear Auth Store

↓

Remove JWT

↓

Navigate Login
```

---

# 22. Automatic Logout

If backend returns

```text
401 Unauthorized
```

The application should

```text
Clear Session

↓

Redirect Login
```

Automatically.

---

# 23. Authentication During API Calls

Every API request follows:

```text
Axios

↓

Request Interceptor

↓

Attach JWT

↓

Backend
```

Components never attach tokens manually.

---

# 24. Request Interceptor

Responsibilities:

* Read JWT
* Add Authorization header
* Continue request

Example flow:

```text
Axios

↓

Authorization

↓

Bearer JWT
```

---

# 25. Response Interceptor

Responsibilities:

* Handle 401
* Handle 403
* Clear session
* Redirect login if necessary

---

# 26. Token Expiration

Suppose JWT expires.

Flow:

```text
Backend

↓

401

↓

Interceptor

↓

Logout

↓

Login
```

Simple and predictable.

---

# 27. User Profile Flow

```text
Dashboard

↓

useProfile()

↓

Backend

↓

User

↓

Navbar
```

Navbar displays

* Name
* Email
* Avatar

---

# 28. Navbar Authentication

Navbar should show

```text
Avatar

↓

User Name

↓

Dropdown

↓

Logout
```

Profile information comes from the authenticated user.

---

# 29. Authentication Hook

Create

```text
useAuth()
```

Responsibilities:

* Login
* Logout
* Current user
* Authentication status

Pages use this hook instead of accessing the store directly.

---

# 30. Login Loading State

While authentication is happening:

```text
Login Button

↓

Loading Spinner

↓

Disable Multiple Clicks
```

---

# 31. Error Handling

Authentication failures should display friendly messages.

Examples:

```text
Login Failed

Network Error

Access Denied
```

Never expose backend error details.

---

# 32. Session Persistence

Session should survive:

* Refresh
* Browser restart (if token is valid)
* Navigation

Until logout or token expiration.

---

# 33. User Object

Frontend stores minimal user information.

Example:

```text
User

↓

id

name

email

avatar
```

No sensitive backend fields.

---

# 34. Authentication Architecture

```text
Browser

↓

Login Page

↓

Google OAuth

↓

Backend

↓

JWT

↓

Auth Store

↓

Protected Route

↓

Dashboard
```

---

# 35. Dependency Rules

Allowed

```text
Page

↓

useAuth()

↓

Auth Store
```

Forbidden

```text
Page

↓

Local Storage
```

Only the authentication layer should interact with token storage.

---

# 36. Authentication State Ownership

| Data           | Owner       |
| -------------- | ----------- |
| JWT            | Auth Store  |
| Current User   | Auth Store  |
| Dashboard Data | React Query |
| Emails         | React Query |
| Senders        | React Query |
| Theme          | UI Store    |

---

# 37. Security Best Practices

* Never hardcode tokens.
* Never expose backend secrets.
* Never trust client-side authentication alone.
* Always let the backend validate the JWT.
* Remove session immediately after logout.

---

# 38. Frontend Authentication Sequence

```text
User

↓

Google Login

↓

Backend

↓

JWT

↓

Store Session

↓

Protected Route

↓

Dashboard

↓

Authenticated API Requests
```

---

# 39. Complete Session Restoration Flow

```text
Browser Refresh

↓

App Starts

↓

JWT Found

↓

GET /auth/me

↓

Valid?

↓

Yes

↓

Restore User

↓

Dashboard

↓

No

↓

Clear Session

↓

Login
```

---

# 40. Logout Sequence

```text
Logout Click

↓

Remove JWT

↓

Clear Auth Store

↓

Clear React Query Cache

↓

Navigate Login
```

Clearing the React Query cache prevents stale user-specific data from remaining in memory.

---

# 41. Interaction with React Query

Authentication and server state should work together.

Example:

```text
Login Success

↓

Store User

↓

Enable Dashboard Queries

↓

Fetch Dashboard Data
```

After logout:

```text
Logout

↓

Clear Auth

↓

Clear Query Cache

↓

Redirect Login
```

---

# 42. Complete Authentication Architecture

```text
User
 │
 ▼
Login Page
 │
 ▼
Google OAuth
 │
 ▼
Express Backend
 │
 ▼
JWT + User
 │
 ▼
Auth Store
 │
 ├── JWT
 │
 ├── User
 │
 └── isAuthenticated
 │
 ▼
Protected Route
 │
 ▼
Dashboard Layout
 │
 ▼
React Query
 │
 ▼
Authenticated API Requests
```

---

# 43. Authentication Checklist

* ✅ Google OAuth login
* ✅ JWT-based authentication
* ✅ Session restoration
* ✅ Protected routes
* ✅ Automatic logout on 401
* ✅ Current user endpoint
* ✅ Global auth store
* ✅ Request interceptor
* ✅ Response interceptor
* ✅ Query cache cleared on logout
* ✅ Friendly authentication errors
* ✅ Backend remains the source of truth

---

# 44. Common Mistakes to Avoid

❌ Validating JWTs in the frontend.

❌ Storing dashboard or email data inside the auth store.

❌ Reading tokens directly from `localStorage` in every component.

❌ Allowing protected pages to render before authentication is checked.

❌ Forgetting to clear React Query cache on logout.

❌ Duplicating authentication logic across multiple pages.

---

# 45. Production Authentication Flow

```text
                     User
                       │
                       ▼
                 Login Page
                       │
                       ▼
             Google OAuth Login
                       │
                       ▼
               Express Backend
                       │
             Verify Google User
                       │
                       ▼
               JWT + User Profile
                       │
                       ▼
                  Auth Store
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      Protected Routes     Axios Interceptor
             │                   │
             ▼                   ▼
      Dashboard Pages    Authenticated APIs
             │                   │
             └─────────┬─────────┘
                       ▼
                 React Query
                       │
                       ▼
                 Render UI
```

---

# End of Part 6
