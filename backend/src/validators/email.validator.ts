import { z } from "zod";

export const scheduleEmailSchema = z.object({
  body: z.object({
    senderId: z.string().min(1, "Sender ID is required"),
    subject: z.string().min(1, "Subject is required"),
    body: z.string().min(1, "Body is required"),
    scheduledAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
    delayBetweenEmails: z.number().int().min(1).max(3600).default(2),
    hourlyLimit: z.number().int().positive().max(10000).default(200),
    recipients: z.array(z.string().email("Invalid email address")).min(1, "At least one recipient is required"),
  }),
});
