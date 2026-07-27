import { z } from "zod";

export const createSenderSchema = z.object({
  body: z.object({
    senderName: z.string().min(1, "Sender name is required"),
    senderEmail: z.string().email("Valid sender email is required"),
    smtpHost: z.string().min(1, "SMTP host is required"),
    smtpPort: z.number().int().positive(),
    smtpUser: z.string().min(1, "SMTP user is required"),
    smtpPassword: z.string().min(1, "SMTP password is required"),
    hourlyLimit: z.number().int().positive(),
    dailyLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateSenderSchema = z.object({
  body: z.object({
    senderName: z.string().optional(),
    senderEmail: z.string().email().optional(),
    smtpHost: z.string().min(1).optional(),
    smtpPort: z.number().int().positive().optional(),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    hourlyLimit: z.number().int().positive().optional(),
    dailyLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});
