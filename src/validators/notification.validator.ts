import { z } from "zod";

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().uuid().optional(),
    title: z.string().min(1).max(255),
    message: z.string().min(1),
    type: z.enum(["INFO", "WARNING", "ERROR", "SUCCESS", "REMINDER"]).default("INFO"),
  }),
});

export const markReadSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const notificationQuerySchema = z.object({
  query: z.object({
    read: z.string().transform(val => val === "true").optional(),
    type: z.enum(["INFO", "WARNING", "ERROR", "SUCCESS", "REMINDER"]).optional(),
    page: z.string().transform(Number).pipe(z.number().int().min(1)).default("1"),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default("20"),
  }),
});
