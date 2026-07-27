# ReachInbox Email Scheduler

Production-oriented full-stack email scheduling assignment built with React, Express, PostgreSQL, Redis, BullMQ, and Ethereal SMTP.

## Architecture

`React dashboard → Express API → PostgreSQL transaction (EmailSchedule + EmailOutbox) → BullMQ delayed job in Redis → worker → Ethereal SMTP → PostgreSQL status update`

PostgreSQL is the source of truth. A transactional outbox makes the database write durable before queue publication. On worker startup, unpublished outbox records are published again. BullMQ uses a stable job ID (`emailId`) to prevent duplicate jobs.

## Scheduling and rate limits

- Every recipient receives a dedicated delayed BullMQ job.
- The compose form sets a start time, delay between emails, and hourly limit. The delay is expressed in seconds, defaults to **2 seconds**, and is enforced per sender in Redis across worker instances.
- A Redis Lua script atomically applies the sender's hourly limit and minimum-send interval. A throttled job is moved back to BullMQ's delayed state; it is never dropped.
- `WORKER_CONCURRENCY` configures the number of simultaneous BullMQ jobs per worker (default: `5`).
- The worker atomically claims `QUEUED → PROCESSING`, uses a stale-processing lease for crash recovery, retries transient SMTP failures with exponential BullMQ backoff, and marks an email `FAILED` only on the final attempt.

SMTP has an unavoidable at-least-once boundary: if an SMTP server accepts a message and the process crashes before the database update, no SMTP protocol can prove delivery without provider-side idempotency. The app uses an atomic database claim and a deterministic `Message-ID` to minimise this window.

## Run locally

1. Copy `backend/.env.example` to `backend/.env`, then configure Google OAuth credentials. Add `http://localhost:3000/api/auth/google/callback` as an authorised Google redirect URI.
2. Run Postgres, Redis, migrations, API, and worker:

   ```bash
   cd backend
   docker compose up --build
   ```

3. In another terminal, start the dashboard:

   ```bash
   cd frontend
   cp .env.example .env
   npm ci
   npm run dev
   ```

4. Sign in with Google. Create one or more sender identities using credentials from [Ethereal Email](https://ethereal.email/); the required SMTP host is `smtp.ethereal.email`.

## Verification

```bash
cd backend && npm run build && npm test
cd frontend && npm run build && npm run lint
```

The dashboard supports CSV and text lead files, reports the detected email count, and exposes scheduled, sent, failed, retry, and cancellation states.
