import prisma from "../config/database";
import { Prisma, EmailSchedule, EmailStatus } from "@prisma/client";
import { redisConnection } from "../config/redis";

export class EmailRepository {
  async create(data: Prisma.EmailScheduleUncheckedCreateInput): Promise<EmailSchedule> {
    return prisma.emailSchedule.create({ data });
  }

  async createScheduledWithOutbox(
    data: Prisma.EmailScheduleUncheckedCreateInput[],
  ): Promise<EmailSchedule[]> {
    return prisma.$transaction(async (tx) => {
      const emails: EmailSchedule[] = [];

      for (const emailData of data) {
        const email = await tx.emailSchedule.create({ data: emailData });
        await tx.emailOutbox.create({ data: { emailId: email.id } });
        emails.push(email);
      }

      return emails;
    });
  }

  async findById(id: string): Promise<EmailSchedule | null> {
    return prisma.emailSchedule.findUnique({ where: { id } });
  }

  async findByIdForUser(id: string, userId: string) {
    return prisma.emailSchedule.findFirst({
      where: { id, sender: { userId } },
      include: {
        sender: { select: { senderName: true, senderEmail: true } },
      },
    });
  }

  async update(id: string, data: Prisma.EmailScheduleUpdateInput): Promise<EmailSchedule> {
    return prisma.emailSchedule.update({ where: { id }, data });
  }

  async claimForSending(id: string, staleBefore: Date): Promise<boolean> {
    const result = await prisma.emailSchedule.updateMany({
      where: {
        id,
        OR: [
          { status: EmailStatus.QUEUED },
          { status: EmailStatus.PROCESSING, updatedAt: { lt: staleBefore } },
        ],
      },
      data: { status: EmailStatus.PROCESSING },
    });
    return result.count > 0;
  }

  async reschedule(id: string, scheduledAt: Date): Promise<void> {
    await prisma.emailSchedule.update({
      where: { id },
      data: { status: EmailStatus.QUEUED, scheduledAt },
    });
  }

  async markQueuedForDelivery(id: string, bullJobId: string): Promise<void> {
    await prisma.emailSchedule.update({
      where: { id },
      data: { status: EmailStatus.QUEUED, bullJobId },
    });
  }

  async createRetryRecord(data: { emailId: string; attemptNumber: number; error: string; retryTime: Date }) {
    return prisma.emailRetry.create({ data });
  }

  async invalidateUserCache(userId: string) {
    try {
      const keys = await redisConnection.keys(`emails:user:${userId}:*`);
      if (keys.length > 0) {
        await redisConnection.del(...keys);
      }
      await redisConnection.del(`dashboard:stats:${userId}`);
    } catch {
      // Ignore cache clear error
    }
  }

  async findManyByUser(userId: string, params: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const statusStr = params.status || 'ALL';
    const searchStr = params.search || '';

    const cacheKey = `emails:user:${userId}:p:${page}:l:${limit}:st:${statusStr}:s:${searchStr}`;

    try {
      const cached = await redisConnection.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.data) && parsed.pagination) {
          return parsed;
        }
      }
    } catch {
      // Continue on cache miss
    }

    let statusFilter: any = undefined;
    const normalizedStatus = params.status ? params.status.toUpperCase() : undefined;

    if (normalizedStatus === 'SCHEDULED') {
      statusFilter = { in: [EmailStatus.PENDING, EmailStatus.QUEUED, EmailStatus.PROCESSING, EmailStatus.RETRYING] };
    } else if (normalizedStatus && Object.values(EmailStatus).includes(normalizedStatus as any)) {
      statusFilter = normalizedStatus as EmailStatus;
    }

    const where: Prisma.EmailScheduleWhereInput = {
      sender: {
        userId,
      },
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(params.search ? {
        OR: [
          { recipientEmail: { contains: params.search, mode: "insensitive" } },
          { subject: { contains: params.search, mode: "insensitive" } },
        ]
      } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.emailSchedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          sender: {
            select: {
              senderName: true,
              senderEmail: true,
            }
          }
        }
      }),
      prisma.emailSchedule.count({ where }),
    ]);

    const result = {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };

    try {
      await redisConnection.set(cacheKey, JSON.stringify(result), "EX", 60);
    } catch {
      // Ignore cache write error
    }

    return result;
  }

  async recoverStuckProcessing(staleMs = 60000): Promise<number> {
    const staleBefore = new Date(Date.now() - staleMs);
    const stuck = await prisma.emailSchedule.findMany({
      where: {
        status: EmailStatus.PROCESSING,
        updatedAt: { lt: staleBefore },
      },
    });

    for (const email of stuck) {
      await prisma.$transaction([
        prisma.emailSchedule.update({
          where: { id: email.id },
          data: { status: EmailStatus.PENDING },
        }),
        prisma.emailOutbox.upsert({
          where: { emailId: email.id },
          create: { emailId: email.id },
          update: {},
        }),
      ]);
    }

    return stuck.length;
  }
}

export const emailRepository = new EmailRepository();
