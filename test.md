# ReachInbox Backend API - Testing Guide

This guide provides step-by-step instructions to verify the entire project and test every API endpoint using `curl`.

Before you start, make sure you have:
1. **The API Server running**: You already have `npm run dev` running in your terminal.
2. **The Worker running**: Open a new terminal tab, navigate to the `backend` folder, and run:
   ```bash
   npm run worker
   ```
   *The worker is necessary to actually process the email queue and send the emails.*

---

## 1. Authentication API

Since we mocked Google OAuth, you can pass any fake Google JWT token, or generate a simple payload to authenticate. The backend decodes it and issues a `sessionToken`.

**Command:**
```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGRvZS5jb20ifQ.fake-signature"
  }'
```
*Note: The mock token above decodes to User ID "1234567890" and email "john@doe.com".*

**Expected Output:**
You will receive a JSON response containing the `user` object and a `sessionToken`.
```json
{
  "user": { ... },
  "sessionToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

> ⚠️ **IMPORTANT:** Copy the `sessionToken` from the output above. You will need to replace `<YOUR_SESSION_TOKEN>` in all subsequent requests below!

---

## 2. Sender API

This API is used to configure the SMTP credentials that the system will use to send emails. You can use Ethereal Email (https://ethereal.email/) to generate test SMTP credentials safely.

### Create a Sender
**Command:**
```bash
curl -X POST http://localhost:3000/api/senders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_SESSION_TOKEN>" \
  -d '{
    "senderName": "John Doe",
    "senderEmail": "john@doe.com",
    "smtpHost": "smtp.ethereal.email",
    "smtpPort": 587,
    "smtpUser": "your_ethereal_user",
    "smtpPassword": "your_ethereal_password",
    "hourlyLimit": 50,
    "dailyLimit": 500
  }'
```

**Expected Output:**
You will receive the created `Sender` object, including its unique `id`.
> ⚠️ **IMPORTANT:** Copy the `id` from the output. You will need to replace `<YOUR_SENDER_ID>` in the email scheduling request.

### List Your Senders
**Command:**
```bash
curl -X GET http://localhost:3000/api/senders \
  -H "Authorization: Bearer <YOUR_SESSION_TOKEN>"
```

---

## 3. Email Scheduling API

This is the core functionality. It takes an array of recipients, creates email schedules in PostgreSQL, and queues them in Redis via BullMQ.

### Schedule an Email Blast
**Command:**
```bash
curl -X POST http://localhost:3000/api/emails/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_SESSION_TOKEN>" \
  -d '{
    "senderId": "<YOUR_SENDER_ID>",
    "subject": "Hello from ReachInbox",
    "body": "This is a test email sent using Node.js, BullMQ, and Redis!",
    "scheduledAt": "'$(date -u -v+1M +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "+1 minute" +%Y-%m-%dT%H:%M:%SZ)'", 
    "delayBetweenEmails": 2000,
    "hourlyLimit": 200,
    "recipients": [
      "test1@example.com",
      "test2@example.com"
    ]
  }'
```
*(The command above uses a bash trick to dynamically set `scheduledAt` to 1 minute in the future. You can also manually type a future UTC timestamp like `"2026-07-25T18:00:00Z"`).*

**Expected Output:**
```json
{
  "success": true,
  "scheduledEmails": 2
}
```

---

## 4. Dashboard APIs

Once emails are scheduled or sent, you can verify their statuses in your dashboard.

### Get Overall Stats
**Command:**
```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer <YOUR_SESSION_TOKEN>"
```
**Expected Output:**
```json
{
  "scheduled": 0,
  "sent": 2,
  "failed": 0
}
```

### View Recent Emails
**Command:**
```bash
curl -X GET http://localhost:3000/api/dashboard/recent \
  -H "Authorization: Bearer <YOUR_SESSION_TOKEN>"
```

---

## 5. Health API

Use this to ensure the API is running and responsive.

**Command:**
```bash
curl -X GET http://localhost:3000/api/health
```

**Expected Output:**
```json
{
  "status": "OK",
  "service": "api",
  "timestamp": "2026-07-25T16:50:00.000Z"
}
```

---

## 6. Verifying the Worker 

If you have `npm run worker` running in a separate terminal tab, keep an eye on its logs. 
When the scheduled time is reached, the worker will:
1. Pick up the job from Redis.
2. Check the PostgreSQL database to ensure idempotency.
3. Check the Rate Limiter (Redis atomic counter).
4. Send the email using the SMTP settings.
5. Print: `Email sent successfully: <MESSAGE_ID> | Preview: <URL>`

Because we are using Nodemailer, if you used Ethereal Email credentials, it will literally print a `Preview` URL in your terminal. You can click that link to see exactly what the email looks like in the browser!
