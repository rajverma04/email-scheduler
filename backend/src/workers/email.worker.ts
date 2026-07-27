import { DelayedError, Job, Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { QUEUE_NAMES } from "../queues/queue.constants";
import { emailRepository } from "../repositories/email.repository";
import { senderRepository } from "../repositories/sender.repository";
import { smtpService } from "../services/smtp.service";
import { rateLimiterService } from "../services/rateLimiter.service";
import { EmailStatus } from "@prisma/client";

const processingStaleMs = Number(process.env.PROCESSING_STALE_MS || 60_000);

export const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL_QUEUE,
  async (job: Job<{ emailId: string }>) => {
    const { emailId } = job.data;
    const email = await emailRepository.findById(emailId);

    if (!email) throw new Error(`Email ${emailId} not found in DB`);
    if (([EmailStatus.SENT, EmailStatus.CANCELLED] as EmailStatus[]).includes(email.status)) return;

    const claimed = await emailRepository.claimForSending(
      emailId,
      new Date(Date.now() - processingStaleMs),
    );
    if (!claimed) return;

    const sender = await senderRepository.findById(email.senderId);
    if (!sender || !sender.isActive) {
      await emailRepository.update(emailId, {
        status: EmailStatus.FAILED,
        failureReason: "Sender is unavailable or inactive",
      });
      throw new Error(`Sender unavailable for email ${emailId}`);
    }

    const permission = await rateLimiterService.reserveSendPermission(
      sender.senderEmail,
      email.hourlyLimit,
      email.delayBetweenEmails,
    );
    if (!permission.allowed) {
      const nextAttemptAt = new Date(permission.nextAvailableAt);
      await emailRepository.reschedule(emailId, nextAttemptAt);
      await job.moveToDelayed(permission.nextAvailableAt, job.token);
      throw new DelayedError(`Email ${emailId} deferred by sender rate limits`);
    }

    try {
      const result = await smtpService.sendEmail(sender, email.recipientEmail, email.subject, email.body, email.id);
      await emailRepository.update(emailId, {
        status: EmailStatus.SENT,
        sentAt: new Date(),
        providerMessageId: result.messageId,
        failureReason: null,
      });
      await emailRepository.invalidateUserCache(sender.userId);
      console.log(`Email sent: ${result.messageId} | Preview: ${result.previewUrl}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown SMTP error";
      const nextAttempt = email.retryCount + 1;
      const attempts = Number(job.opts.attempts || 1);
      const isFinalAttempt = job.attemptsMade >= attempts - 1;

      await emailRepository.update(emailId, {
        status: isFinalAttempt ? EmailStatus.FAILED : EmailStatus.QUEUED,
        failureReason: message,
        retryCount: nextAttempt,
      });
      await emailRepository.createRetryRecord({
        emailId,
        attemptNumber: nextAttempt,
        error: message,
        retryTime: new Date(),
      });
      await emailRepository.invalidateUserCache(sender.userId);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: Number(process.env.WORKER_CONCURRENCY || 5),
    lockDuration: Number(process.env.WORKER_LOCK_DURATION || 30_000),
  },
);

emailWorker.on("completed", (job) => console.log(`Job ${job.id} completed`));
emailWorker.on("failed", (job, error) => console.error(`Job ${job?.id} failed: ${error.message}`));
