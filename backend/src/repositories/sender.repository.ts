import prisma from "../config/database";
import { Prisma, Sender } from "@prisma/client";

export class SenderRepository {
  async create(data: Prisma.SenderUncheckedCreateInput): Promise<Sender> {
    return prisma.sender.create({ data });
  }

  async findByUserId(userId: string): Promise<Sender[]> {
    return prisma.sender.findMany({ where: { userId } });
  }

  async findById(id: string): Promise<Sender | null> {
    return prisma.sender.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.SenderUpdateInput): Promise<Sender> {
    return prisma.sender.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Sender> {
    return prisma.$transaction(async (tx) => {
      // Delete retry records for emails created by this sender
      await tx.emailRetry.deleteMany({
        where: { email: { senderId: id } }
      });
      // Delete outbox records for emails created by this sender
      await tx.emailOutbox.deleteMany({
        where: { email: { senderId: id } }
      });
      // Delete email schedules for this sender
      await tx.emailSchedule.deleteMany({
        where: { senderId: id }
      });
      // Delete the sender itself
      return tx.sender.delete({ where: { id } });
    });
  }
}

export const senderRepository = new SenderRepository();
