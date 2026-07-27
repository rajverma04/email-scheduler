import { emailRepository } from "../repositories/email.repository";
import { outboxRepository } from "../repositories/outbox.repository";
import { queueService } from "./queue.service";

export class OutboxService {
  async publishPending(limit = 100): Promise<number> {
    const events = await outboxRepository.findDispatchable(limit);
    let published = 0;

    for (const event of events) {
      if (!(await outboxRepository.claim(event.id))) continue;

      try {
        if (event.email.status === "CANCELLED") {
          await outboxRepository.markPublished(event.id);
          continue;
        }
        const delayMs = Math.max(0, event.email.scheduledAt.getTime() - Date.now());
        const job = await queueService.addEmailJob(event.email.id, { emailId: event.email.id }, delayMs);

        await emailRepository.markQueuedForDelivery(event.email.id, job.id!);
        await outboxRepository.markPublished(event.id);
        published += 1;
      } catch (error) {
        await outboxRepository.release(event.id);
        throw error;
      }
    }

    return published;
  }

  async recoverAndPublish(): Promise<number> {
    await outboxRepository.recoverUnpublished();
    return this.publishPending();
  }
}

export const outboxService = new OutboxService();
