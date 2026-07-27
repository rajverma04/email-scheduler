import { OutboxStatus, Prisma } from "@prisma/client";
import prisma from "../config/database";

type DispatchableOutbox = Prisma.EmailOutboxGetPayload<{
  include: { email: true };
}>;

export class OutboxRepository {
  async findDispatchable(limit: number): Promise<DispatchableOutbox[]> {
    return prisma.emailOutbox.findMany({
      where: { status: OutboxStatus.PENDING },
      include: { email: true },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async claim(id: string): Promise<boolean> {
    const result = await prisma.emailOutbox.updateMany({
      where: { id, status: OutboxStatus.PENDING },
      data: { status: OutboxStatus.PROCESSING, claimedAt: new Date() },
    });
    return result.count === 1;
  }

  async markPublished(id: string): Promise<void> {
    await prisma.emailOutbox.update({
      where: { id },
      data: { status: OutboxStatus.PUBLISHED, publishedAt: new Date() },
    });
  }

  async release(id: string): Promise<void> {
    await prisma.emailOutbox.update({
      where: { id },
      data: { status: OutboxStatus.PENDING, claimedAt: null },
    });
  }

  async recoverUnpublished(): Promise<void> {
    await prisma.emailOutbox.updateMany({
      where: { status: OutboxStatus.PROCESSING },
      data: { status: OutboxStatus.PENDING, claimedAt: null },
    });
  }
}

export const outboxRepository = new OutboxRepository();
