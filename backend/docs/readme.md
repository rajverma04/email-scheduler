# ReachInbox Email Scheduler Backend

This documentation describes the complete backend architecture for the ReachInbox hiring assignment.

## Documentation Order

Read the documents in the following order:

1. Project Overview
2. Database Architecture
3. BullMQ Architecture
4. Redis Architecture
5. Scheduling Workflow
6. Worker Architecture
7. SMTP Architecture
8. Concurrency & Rate Limiting
9. Reliability & Recovery
10. Implementation Guide

---

## Technology Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- Nodemailer
- Ethereal Email
- Docker
- Google OAuth
- JWT

---

## Architecture Principles

- PostgreSQL is the source of truth.
- BullMQ manages background jobs.
- Redis coordinates distributed workers.
- Workers are stateless.
- Every email has exactly one EmailSchedule record.
- Every email has one BullMQ job.
- Jobs contain only `emailId`.
- Business logic belongs in services.
- Controllers are thin.
- Repositories only access the database.
- SMTP is encapsulated behind `SMTPService`.
- Rate limiting uses Redis atomic operations.
- Worker processing is idempotent.

---

## Project Flow

Frontend

↓

Express API

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

PostgreSQL

↓

QueueService

↓

BullMQ

↓

Redis

↓

Worker

↓

SMTP

↓

Update PostgreSQL

↓

Dashboard

---

## Cursor Instructions

Use all documentation inside the `/docs` folder before generating code.

Follow the architecture exactly.

Important rules:

- Never send emails inside controllers.
- Never access BullMQ from controllers.
- Workers must remain stateless.
- Jobs should contain only `emailId`.
- PostgreSQL is the source of truth.
- Redis is only operational storage.
- Use layered architecture.
- Use Repository Pattern.
- Use Prisma ORM.
- Use BullMQ delayed jobs.
- Use Zod validation.
- Use dependency injection where appropriate.
- Use environment variables for configuration.
- Implement graceful shutdown for API and Worker.
- Follow the file structure defined in `10-Implementation-Guide.md`.