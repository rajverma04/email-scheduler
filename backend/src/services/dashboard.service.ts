import prisma from "../config/database";
import { EmailStatus } from "@prisma/client";
import { redisConnection } from "../config/redis";

export class DashboardService {
  async getStats(userId: string) {
    const cacheKey = `dashboard:stats:${userId}`;

    try {
      const cached = await redisConnection.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error("Redis dashboard stats cache read error:", err);
    }

    const userSenders = await prisma.sender.findMany({ where: { userId }, select: { id: true } });
    const senderIds = userSenders.map(s => s.id);

    const [totalScheduled, totalSent, totalFailed] = await Promise.all([
      prisma.emailSchedule.count({
        where: { senderId: { in: senderIds }, status: { in: [EmailStatus.PENDING, EmailStatus.QUEUED, EmailStatus.PROCESSING, EmailStatus.RETRYING] } }
      }),
      prisma.emailSchedule.count({
        where: { senderId: { in: senderIds }, status: EmailStatus.SENT }
      }),
      prisma.emailSchedule.count({
        where: { senderId: { in: senderIds }, status: EmailStatus.FAILED }
      }),
    ]);

    const stats = {
      scheduled: totalScheduled,
      sent: totalSent,
      failed: totalFailed
    };

    try {
      await redisConnection.set(cacheKey, JSON.stringify(stats), "EX", 30);
    } catch (err) {
      console.error("Redis dashboard stats cache write error:", err);
    }

    return stats;
  }

  async getRecent(userId: string) {
    const userSenders = await prisma.sender.findMany({ where: { userId }, select: { id: true } });
    const senderIds = userSenders.map(s => s.id);

    return prisma.emailSchedule.findMany({
      where: { senderId: { in: senderIds } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }

  async getScheduled(userId: string) {
    const userSenders = await prisma.sender.findMany({ where: { userId }, select: { id: true } });
    const senderIds = userSenders.map(s => s.id);

    return prisma.emailSchedule.findMany({
      where: { senderId: { in: senderIds }, status: { in: [EmailStatus.PENDING, EmailStatus.QUEUED] } },
      orderBy: { scheduledAt: "asc" },
      take: 50,
    });
  }

  async getFailed(userId: string) {
    const userSenders = await prisma.sender.findMany({ where: { userId }, select: { id: true } });
    const senderIds = userSenders.map(s => s.id);

    return prisma.emailSchedule.findMany({
      where: { senderId: { in: senderIds }, status: EmailStatus.FAILED },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
  }
}

export const dashboardService = new DashboardService();
