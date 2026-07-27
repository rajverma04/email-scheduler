import { emailRepository } from "../repositories/email.repository";
import { senderRepository } from "../repositories/sender.repository";
import { queueService } from "./queue.service";
import { EmailStatus } from "@prisma/client";
import { outboxService } from "./outbox.service";

export class EmailService {
  async scheduleEmails(userId: string, data: any) {
    const { senderId, subject, body, scheduledAt, delayBetweenEmails, hourlyLimit, recipients } = data;

    // Validate Sender
    const sender = await senderRepository.findById(senderId);
    if (!sender || sender.userId !== userId) {
      throw new Error("Sender not found");
    }

    const requestedStart = new Date(scheduledAt);
    const startAt = requestedStart.getTime() > Date.now() ? requestedStart : new Date();
    const minimumDelaySeconds = Math.max(1, delayBetweenEmails ?? 2);
    const envDefaultLimit = Number(process.env.MAX_EMAILS_PER_HOUR_PER_SENDER || process.env.MAX_EMAILS_PER_HOUR || 200);
    const effectiveHourlyLimit = Math.max(1, hourlyLimit ?? sender.hourlyLimit ?? envDefaultLimit);
    const uniqueRecipients: string[] = Array.from(
      new Set((recipients as string[]).map((recipient: string) => String(recipient).trim().toLowerCase()))
    );

    const emailRecords = uniqueRecipients.map((recipient: string, index: number) => {
      const recipientScheduledAt = new Date(startAt.getTime() + index * minimumDelaySeconds * 1000);
      return {
        senderId,
        recipientEmail: recipient,
        subject,
        body,
        scheduledAt: recipientScheduledAt,
        status: EmailStatus.PENDING,
        delayBetweenEmails: minimumDelaySeconds,
        hourlyLimit: effectiveHourlyLimit,
      };
    });

    const createdEmails = await emailRepository.createScheduledWithOutbox(emailRecords);
    await outboxService.publishPending();

    await emailRepository.invalidateUserCache(userId);

    return { success: true, scheduledEmails: createdEmails.length };
  }

  async getEmails(userId: string, params: any) {
    return emailRepository.findManyByUser(userId, params);
  }

  async getEmailById(userId: string, emailId: string) {
    const email = await emailRepository.findByIdForUser(emailId, userId);
    if (!email) throw new Error("Email not found");
    return email;
  }

  async retryEmail(userId: string, emailId: string) {
    const email = await emailRepository.findByIdForUser(emailId, userId);
    if (!email) throw new Error("Email not found");
    if (email.status !== EmailStatus.FAILED) throw new Error("Only failed emails can be retried");
    
    await emailRepository.update(emailId, {
      status: EmailStatus.QUEUED,
      failureReason: null,
    });

    await queueService.retryFailedJob(emailId);
    return { success: true };
  }

  async cancelEmail(userId: string, emailId: string) {
    const email = await emailRepository.findByIdForUser(emailId, userId);
    if (!email) throw new Error("Email not found");
    if (!([EmailStatus.PENDING, EmailStatus.QUEUED, EmailStatus.RETRYING] as EmailStatus[]).includes(email.status)) {
      throw new Error("Only pending emails can be cancelled");
    }
    
    await emailRepository.update(emailId, {
      status: EmailStatus.CANCELLED,
    });
    await queueService.removeJob(emailId).catch(() => undefined);
    return { success: true };
  }
}

export const emailService = new EmailService();
