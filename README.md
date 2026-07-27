# ReachInbox Email Scheduler

Production-oriented, distributed full-stack email scheduling engine built with **React**, **Express**, **PostgreSQL**, **Redis**, **BullMQ**, and **Nodemailer SMTP**.

---

## 📌 Architecture Overview

```
[ React Dashboard ] 
        │ (REST API)
        ▼
[ Express API Server ] ──(DB Transaction)──► [ PostgreSQL (EmailSchedule + EmailOutbox) ]
        │                                                     │
        ▼ (Async Outbox Dispatcher)                            │ (Crash Recovery Lease)
[ Redis Cloud (BullMQ Delayed ZSET) ]                         │
        │                                                     │
        ▼                                                     │
[ Distributed Worker Instance ] ◄─────────────────────────────┘
   ├── 1. Atomic Redis Lua Rate Limiter (Check sender hourly limit & min delay)
   ├── 2. Nodemailer Transport (Gmail, Outlook, Ethereal, Custom SMTP)
   └── 3. Status Update (SENT / FAILED / DELAYED) in PostgreSQL
```

### 1. How Scheduling Works
- When a campaign is submitted, the API server calculates staggered execution timestamps for each recipient based on the configured delay (e.g. 2s between emails).
- Inside a **PostgreSQL Database Transaction**, records are created in both `EmailSchedule` and `EmailOutbox` tables atomically.
- An **Asynchronous Outbox Dispatcher** publishes the jobs into BullMQ's **Redis Delayed Sorted Set (ZSET)** indexed by scheduled timestamp.
- The API responds in **< 150ms** without blocking on SMTP or queue operations.

### 2. How Persistence on Restart is Handled
- **Transactional Outbox Pattern**: PostgreSQL is the durable source of truth. If Redis or worker instances crash before jobs are queued, no emails are lost.
- **Worker Recovery on Startup**: When the worker process boots, `outboxService.recoverAndPublish()` claims any unpublished outbox records and enqueues them into Redis.
- **Stale Lock Recovery**: If a worker process crashes mid-send, the job's `PROCESSING` lease expires after 60 seconds (`PROCESSING_STALE_MS`). The next worker atomically re-claims stale jobs with `claimForSending(staleBefore)`.

### 3. How Rate Limiting & Concurrency are Implemented
- **Concurrency**: `WORKER_CONCURRENCY` (default: `5`) controls the number of simultaneous BullMQ jobs processed per worker process.
- **Rate Limits & Delay Enforcement**: Enforced via an **Atomic Redis Lua Script** per sender email (`rate-limit:{sender}:{YYYY-MM-DDTHH}`).
- **No Dropped Jobs**: If a sender hits their hourly limit or minimum delay interval, the job is **never failed or dropped**. BullMQ automatically defers the job to the next available window using `job.moveToDelayed(nextAvailableAt)`.

---

## ⏱️ Minimum Delay & Rate Limiting Enforcement

### Chosen Minimum Delay
- **Default Delay**: **Minimum 2 seconds between individual email sends** (`delayBetweenEmails = 2s`) to mimic provider throttling and avoid triggering anti-spam flags.

### Enforcement Mechanism & Trade-offs
- **Redis Lua Script (`eval`)**: Checks two keys atomically before sending:
  1. `rate-limit:{senderEmail}:{hourKey}`: Hourly sending counter.
  2. `send-throttle:{senderEmail}`: Timestamp throttle for the minimum delay.
- **BullMQ Delayed Rescheduling**: If the script returns `{ allowed: false, nextAvailableAt }`, the worker reschedules the DB record timestamp and defers the BullMQ job to `nextAvailableAt`.
- **Trade-off Analysis**:
  - *Why Redis Lua over DB locks?* Redis Lua executes in **< 1ms** atomically in-memory without row-level DB locks, scaling seamlessly across multiple distributed API and worker nodes.

---

## 🔑 Ethereal & Environment Configuration

### Setting up Ethereal Email (Free Test SMTP)
1. Go to [https://ethereal.email](https://ethereal.email) and click **Create Ethereal Account**.
2. Copy your generated **SMTP Host** (`smtp.ethereal.email`), **SMTP Port** (`587`), **Username**, and **Password**.
3. In the ReachInbox Dashboard, navigate to **Senders** $\rightarrow$ **Add Sender** $\rightarrow$ Click **⚡ Ethereal** preset, paste your credentials, and click **Save Sender**.

### Backend Environment Variables (`backend/.env`)

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# PostgreSQL Database Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/reachinbox"
DIRECT_URL="postgresql://postgres:password@localhost:5432/reachinbox"

# Redis Cloud / Local Redis Connection
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Worker & Security Configuration
JWT_SECRET="super-secret-jwt-key"
ENCRYPTION_KEY="32-character-secret-key-12345"
WORKER_CONCURRENCY=5
MAX_EMAILS_PER_HOUR_PER_SENDER=200
```

### Frontend Environment Variables (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🚀 How to Run Locally

### 1. Run Backend API & Worker
```bash
cd backend
npm install

# Run database migrations
npx prisma db push

# Start API Server (Port 3000)
npm run dev

# (Optional) Run Standalone Worker in separate terminal
npm run worker
```

### 2. Run Frontend Dashboard
```bash
cd frontend
npm install

# Start Vite Development Server (Port 5173)
npm run dev
```

### 3. Run via Docker Compose (Single Command)
```bash
cd backend
docker compose up --build
```

---

## ✨ Implemented Features Matrix

### 🛠️ Backend Features
| Feature | Implementation Details |
| :--- | :--- |
| **Scheduler Engine** | Staggered schedule creation with transactional outbox pattern. |
| **Outbox Persistence** | PostgreSQL `EmailOutbox` table guarantees zero email loss across crashes/restarts. |
| **Distributed Rate Limiting** | Redis Lua script enforcing per-sender hourly limits and minimum delay throttles. |
| **Worker Concurrency** | Configurable BullMQ concurrent processing (`WORKER_CONCURRENCY`). |
| **Crash Recovery** | Automatic outbox republication on boot + stale processing lease recovery (`PROCESSING_STALE_MS`). |
| **Universal SMTP Transport** | Supports Gmail (App Passwords), Outlook, Yahoo, SendGrid, Ethereal, and custom SMTP servers. |
| **Authentication** | Dual-mode support: Google OAuth 2.0 and manual Email/Password with PBKDF2 salted hashing. |

### 🎨 Frontend Features
| Feature | Implementation Details |
| :--- | :--- |
| **Authentication UI** | Google OAuth & manual Email/Password sign-in with clean card layout. |
| **Analytics Dashboard** | Live stats (Total, Scheduled, Sent, Failed), recent campaign activity, and status badges. |
| **Sender Management** | Multi-sender configuration with Gmail, Outlook, and Ethereal 1-click presets. |
| **Email Composer** | Rich Text Formatting toolbar, contentEditable area, image/file attachments, and Send Later time picker. |
| **Batch Lead Import** | CSV and TXT file parser (`papaparse`) with automatic email validation and deduplication. |
| **Live Tracking & Actions** | Real-time polling, search filter, page pagination, manual retry for failed emails, and cancellation for pending emails. |

---

## 🧪 Verification & Testing

```bash
# Run Backend TypeScript Check & Tests
cd backend
npx tsc --noEmit
npm test

# Run Frontend Typecheck & Build
cd frontend
npx tsc --noEmit
npm run build
```
