import { z } from "zod";

export const googleAuthSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
  }),
});

export const emailAuthSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email address is required"),
    password: z.string().min(4, "Password must be at least 4 characters"),
  }),
});
