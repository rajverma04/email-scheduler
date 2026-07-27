import { emailQueue } from "../queues/email.queue";

export class QueueService {
  async addEmailJob(jobId: string, data: { emailId: string }, delayMs: number) {
    return emailQueue.add("send-email", data, {
      jobId, // crucial for idempotency
      delay: delayMs,
    });
  }

  async removeJob(jobId: string): Promise<void> {
    const job = await emailQueue.getJob(jobId);
    if (job) await job.remove();
  }

  async retryFailedJob(jobId: string): Promise<void> {
    const job = await emailQueue.getJob(jobId);
    if (!job) {
      await this.addEmailJob(jobId, { emailId: jobId }, 0);
      return;
    }

    if ((await job.getState()) === "failed") {
      await job.retry("failed");
    }
  }
}

export const queueService = new QueueService();
